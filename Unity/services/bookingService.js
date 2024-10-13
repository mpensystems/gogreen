var Mutex = require('async-mutex').Mutex;
var api = require('../api.js');
const URLS = require('../urls.js');
const mutex = new Mutex();
const kafka = require('../services/kafkaService.js');
const h3 = require('h3-js');

const processUnity = (command) => {
    mutex.acquire().then(async (release) => {
        switch (command.cmd) {
            case 'bid-step':
                await bidNextStep(command.p);
                break;
            case 'accept-booking':
                await bookingToTrip(command.p);
                break;
        }
        release();
    })
}

const bookingToTrip = (bid, rid) => new Promise((resolve, reject) => {
    console.log('Yet to implement booking to trip');
    resolve();
})

const bidNextStep = (x) => new Promise(async (resolve, reject) => {
    try {
        x.updated_at = Date.now();

        //end the bidding process, as all steps have been completed.
        if(x.current_step == x.steps) {
            x.status = 'ended';
            x.ended_at = Date.now();
            await saveBidConfig(x);
            await removeBookingFromGrid(x.bid, x.h3is.split(','));
            return;
        }

        let {max_bid, min_bid, steps, current_dist, current_step,dist_increment, current_bid} = x;
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
        if(x.current_bid > max_bid) x.current_bid = max_bid;
        x.current_dist = current_dist + dist_increment;
        let oldH3is = x.h3is.split(',');
        let lat = parseFloat(x.lat);
        let lng = parseFloat(x.lng);
        console.log(`${lat} | ${lng}`);
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
    } catch(err) {
        console.error(err);
    }finally {
        kafka.broadcastBidChange(x);
        resolve();
    }
})

const saveBidConfig = (bidConfig) => new Promise(async (resolve, reject) => {
    try {
        let bookings = await api.post(URLS.SCM_DB_FETCH, {
            db: 'mongo',
            table: 'Bookings',
            q: {
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

        if(results == null || results.length == 0) return resolve();

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

module.exports = { processUnity }