var express = require('express');
var router = express.Router();
var Mutex = require('async-mutex').Mutex;
var request = require('request');
var api = require('../../../api');
const mutex = new Mutex();

router.post('/', (req, res) => {
    let booking = req.body.booking;
    let riderLoc = req.body.riderLoc;

    mutex.acquire().then((release) => {
        //TODO: fetch latest status of the booking and ensure the status is active.

        api.post(process.env.SCM_URL + '/v1/unity/get-booking', {bid: booking.bid}).then(currentBookingState => {
            if (currentBookingState.status != 'active') res.status(400).send('ER212');

            /**
             * TODO: CONVERT BOOKING TO TRIP HERE. THIS FUNCTION IS EXECUTED ONE A TIME AND IS THREAD SAFE
             * 
             * 1. Fetch Redis.BookingBids for the specified bid
             * 2. 
             */

            release();
        }).catch(err => {
            res.status(403).send('ER'); //must send back correct status and error code
            release();
        })

        
    })

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