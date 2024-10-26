var express = require('express');
var router = express.Router();
var Mutex = require('async-mutex').Mutex;
var api = require('../../../api');
const URLS = require('../../../urls');
const bookingService = require('../../../services/bookingService');
const mutex = new Mutex();

router.post('/', async (req, res) => {
    let bid = req.body.bid;
    let riderLoc = req.body.riderLoc;
    let rid = req.body.rid;

    try {
        let result = await bookingService.processUnity({
            cmd: 'accept-booking',
            p: {
                bid: bid,
                rid: rid,
                riderLoc, riderLoc
            }
        });

        result != null ? res.json(result) : res.send();
    } catch (err) {
        if(err == 'ER212') res.status(400).send(err);
        else res.status(500).send(err);
    }

    // mutex.acquire().then(async (release) => {
    //     try {
    //         //Fetch the booking object from Mongo
    //         let booking = await api.post(URLS.SCM_DB_FETCH, {
    //             db: 'mongo',
    //             table: 'Bookings',
    //             q: {
    //                 bid: bid
    //             }
    //         });
    //         if (booking == null || booking.status != 'active') {
    //             res.status(400).send('ER212');
    //             return;
    //         }

    //         //Fetch the latest BookingBid object from Redis
    //         let bookingBid = await api.post(URLS.SCM_DB_FETCH, {
    //             db: 'redis',
    //             table: 'BookingBids',
    //             q: {
    //                 bid: bid
    //             }
    //         })
    //         if(bookingBid == null || bookingBid.status != 'active') {
    //             res.status(400).send('ER212');
    //             return;
    //         }



    //         /**
    //          * TODO: CONVERT BOOKING TO TRIP HERE. THIS FUNCTION IS EXECUTED ONE AT A TIME AND IS THREAD SAFE
    //          *
    //          * 1. Create a new trip object
    //          * 2. Insert the trip object inside Mongo.Trips
    //          * 3. Update Booking status to trip_started
    //          * 4. Update BookingBid status to trip_started
    //          * 5. Send update on all BookingBids.h3is redis pub/sub channels
    //          */

    //     } catch(err) {
    //         res.status(500).send('ER500'); //must send back correct status and error code
    //     }
    // }).finally(() => {
    //     release();
    // })

})

const fetchBooking = (bid) => new Promise(resolve => {
    var options = {
        'method': 'POST',
        'url': process.env.SCM_URL + '/v1/unity/get-booking',
        formData: {
            'bid': bid
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
    });

})

module.exports = router;