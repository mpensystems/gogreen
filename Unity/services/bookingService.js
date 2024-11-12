/**
 * Used to provide a single threaded synchronous execution of key commands. 
 * All ops related to bookings and trips must be passed onto this single function to 
 * manage so as to prevent thread locking and deadlock scenarios. 
 * 
 * @author Sanket Sarang <sanket@blobcity.com>
 */

var Mutex = require('async-mutex').Mutex;
var api = require('../api.js');
const URLS = require('../urls.js');
const mutex = new Mutex();
const kafka = require('../services/kafkaService.js');
const h3 = require('h3-js');
const utils = require('../utils.js');

const processUnity = (command) => new Promise(async (resolve, reject) => {
    console.log('Entering lock');
    // mutex.acquire().then(async (release) => {
        try {
            switch (command.cmd) {
                case 'bid-step':
                    return resolve(await bidNextStep(command.p));
                case 'accept-booking':
                    // return resolve({ack: 1})
                    let result = await bookingToTrip(command.p.bid, command.p.rid, command.p.riderLoc);
                    console.log(result);
                    return resolve(result);
            }
        } catch (err) {
            console.error(err)
            reject(err);
        } finally {
            // release();
            console.log('Lock released');
        }
    // })
})

const bookingToTrip = (bid, rid, riderLoc) => new Promise(async (resolve, reject) => {
    try {
        //Fetch the booking object from Mongo
        let booking = await api.fetchOne({
            db: 'mongo',
            table: 'Bookings',
            condition: {
                bid: bid
            }
        });
        if (booking.status != 'active') return reject('ER212');

        //Fetch the latest BookingBid object from Redis
        let bookingBid = await api.fetchOne({
            db: 'redis',
            table: 'BookingBids',
            id: bid
        })
        if (bookingBid.status != 'active') return reject('ER212');

        //Fetch the Rider object from Mongo
        let rider = await api.fetchOne({
            db: 'mongo',
            table: 'Riders',
            condition: {
                rid: rid
            }
        })

        const trip = createTripObject(booking, bookingBid, rider, riderLoc);
        console.log(JSON.stringify(trip));

        await api.post(URLS.SCM_DB_INSERT, {
            db: 'mongo',
            table: 'Trips',
            rows: [trip]
        })

        if (booking.tids == null) booking.tids = [];
        booking.tids.push(trip.tid);
        booking.status = 'trip_started';

        delete booking._id;
        await api.post(URLS.SCM_DB_UPDATE, {
            db: 'mongo',
            table: 'Bookings',
            row: booking,
            condition: {
                bid: booking.bid
            }
        })

        bookingBid.status = 'trip_started';
        kafka.broadcastBidChange(bookingBid);

        await api.post(URLS.SCM_DB_DELETE, {
            db: 'redis',
            table: 'BookingBids',
            id: booking.bid
        })

        resolve(trip);

        /**
         * TODO: CONVERT BOOKING TO TRIP HERE. THIS FUNCTION IS EXECUTED ONE AT A TIME AND IS THREAD SAFE
         *
         * 1. Create a new trip object
         * 2. Insert the trip object inside Mongo.Trips
         * 3. Update Booking status to trip_started
         * 4. Update BookingBid status to trip_started
         * 5. Send update on all BookingBids.h3is redis pub/sub channels
         */

    } catch (err) {
        console.error(err);
        reject('ER500'); //must send back correct status and error code
    }
})

const bidNextStep = (x) => new Promise(async (resolve, reject) => {
    try {
        x.updated_at = Date.now();

        //end the bidding process, as all steps have been completed.
        if (x.current_step == x.steps) {
            x.status = 'ended';
            x.ended_at = Date.now();
            await saveBidConfig(x);
            await removeBookingFromGrid(x.bid, x.h3is.split(','));
            await setBookingStatusEnded(x.bid);
            return;
        }

        let { max_bid, min_bid, steps, current_dist, current_step, dist_increment, current_bid } = x;
        max_bid = parseInt(max_bid);
        min_bid = parseInt(min_bid);
        steps = parseInt(steps);
        current_dist = parseInt(current_dist);
        current_step = parseInt(current_step);
        dist_increment = parseInt(dist_increment);
        current_bid = parseInt(current_bid);
        let bidIncrease = Math.round((x.max_bid = x.min_bid) / x.steps);
        x.current_step = current_step + 1;
        x.current_bid = current_bid + bidIncrease;
        if (x.current_bid > max_bid) x.current_bid = max_bid;
        x.current_dist = current_dist + dist_increment;
        let oldH3is = x.h3is.split(',');
        let lat = parseFloat(x.lat);
        let lng = parseFloat(x.lng);
        let pickupH3i = h3.latLngToCell(parseFloat(x.lat), parseFloat(x.lng), 9);
        let newH3is = h3.gridDisk(pickupH3i, x.current_dist);

        //add booking to grid for each of these added h3is
        let addedH3is = newH3is.filter(h => !oldH3is.includes(h));
        await api.post(URLS.ADD_BOOKING_TO_GRID, {
            bid: x.bid,
            grid: addedH3is
        })

        x.h3is = newH3is;
        await saveBidConfig(x);
    } catch (err) {
        console.error(err);
    } finally {
        resolve();
        try {
            kafka.broadcastBidChange(x);
        } catch (err) {
            console.log(err);
        }
    }
})

const saveBidConfig = (bidConfig) => new Promise(async (resolve, reject) => {
    try {
        let bookings = await api.post(URLS.SCM_DB_FETCH, {
            db: 'mongo',
            table: 'Bookings',
            condition: {
                bid: bidConfig.bid
            }
        })

        let booking;
        if (bookings == null || bookings.length == 0) {
            booking = null;
            bidConfig.status = 'ended'; //force end of bid if there is a data mismatch
        }

        if (bidConfig.status == 'ended' || bidConfig.status == 'canceled') {
            await api.post(URLS.SCM_DB_DELETE, {
                db: 'redis',
                table: 'BookingBids',
                id: bidConfig.bid
            })
        } else {
            await api.post(URLS.SCM_DB_INSERT, {
                db: 'redis',
                table: 'BookingBids',
                rows: [
                    {
                        key: bidConfig.bid,
                        value: bidConfig
                    }
                ]
            })
        }

        if (booking != null) {
            booking.bidConfig = bidConfig;
            await api.post(URLS.SCM_DB_INSERT, {
                db: 'mongo',
                table: 'Bookings',
                replace: true,
                rows: [booking]
            })
        }
    } catch (err) {
        console.error(err)
    } finally {
        resolve();
    }
})

const removeBookingFromGrid = (bid, grid) => new Promise(async resolve => {
    console.log(`${bid} => ${grid}`);
    let promises = grid.map(h3i => new Promise(async resolve => {
        let results = await api.post(URLS.SCM_DB_FETCH, {
            db: 'redis',
            table: 'Grid',
            id: h3i
        })

        if (results == null || results.length == 0) return resolve();

        let record = results[0];
        console.log(JSON.stringify(record));

        let bids = record.bids.split(',');
        bids = bids.filter(x => x != null && x != '' && x != bid);
        await api.post(URLS.SCM_DB_INSERT, {
            db: 'redis',
            table: 'Grid',
            rows: [
                {
                    key: h3i,
                    value: {
                        bids: bids
                    }
                }
            ]
        })
    }))

    await Promise.all(promises);
    resolve();
})

const setBookingStatusEnded = (bid) => new Promise(async (resolve, reject) => {
    try {
        let booking = await api.fetchOne({
            db: 'mongo',
            table: 'Bookings',
            condition: {
                bid: bid
            }
        })

        booking.status = status;
        await api.post(URLS.SCM_DB_UPDATE, {
            db: 'mongo',
            table: 'Bookings',
            row: booking,
            condition: {
                bid: bid
            }
        })

        resolve();
    } catch (err) {
        console.error(err);
        reject(err);
    }
})

const createTripObject = (booking, bookingBid, rider, riderLoc) => {
    let trip = {
        tid: utils.makeid(36),
        bid: booking.bid,
        rid: rider.rid,
        status: 'way-to-pickup',
        substatus: 'routing',

        pickup_address1: booking.pickup_address1 || '',
        pickup_address2: booking.pickup_address2 || '',
        pickup_house: booking.pickup_house || '',
        pickup_landmark: booking.pickup_landmark || '',
        pickup_zip: booking.pickup_zip || '',
        pickup_city: booking.pickup_city || '',
        pickup_state: booking.pickup_state || '',
        pickup_district: booking.pickup_district || '',
        pickup_mobile: booking.pickup_mobile || '',
        pickup_name: booking.pickup_name || '',
        pickup_geo: booking.pickup_geo,
        pickup_h3i: booking.pickup_h3i,

        drop_address1: booking.drop_address1 || '',
        drop_address2: booking.drop_address2 || '',
        drop_house: booking.drop_house || '',
        drop_landmark: booking.drop_landmark || '',
        drop_zip: booking.drop_zip || '',
        drop_city: booking.drop_city || '',
        drop_state: booking.drop_state || '',
        drop_district: booking.drop_district || '',
        drop_mobile: booking.drop_mobile || '',
        drop_name: booking.drop_name || '',
        drop_geo: booking.drop_geo,
        drop_h3i: booking.drop_h3i,

        trip_distance: booking.trip_distance,
        start_geo: {
            lat: riderLoc.lat,
            lng: riderLoc.lng
        },
        end_geo: {
            lat: 0.00,
            lng: 0.00
        },

        channel: booking.channel || 'admin-created',
        orderId: booking.orderId || '',
        lineitems: booking.linetimes || [],
        declaredValue: booking.declaredValue || 0.0,

        fare: bookingBid.current_bid,
        riderPaid: 0.0, //saves final value after trip completion. 
        customerPays: 0.0, //saves final value after trip completion. 

        created_at: Date.now(),
        startTime: Date.now(),
        endTime: 0
    }

    return trip;
}

module.exports = { processUnity }