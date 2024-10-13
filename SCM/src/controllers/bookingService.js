
const h3 = require("h3-js");
const api = require("../../api.js");
const urls = require('../../urls.js');
const insert = require('../db/insert.js');
const kafka = require('../kafkaService.js');

exports.createBooking = async (req, res) => {
    let booking = req.body;
    const grid = h3.gridDisk(booking.pickup_h3i, booking.bidConfig.start_dist);
    booking.bidConfig.h3is = grid;
    
    try {
        //Add booking entry in Mongo.Bookings
        await insert.insert({
            db: 'mongo',
            table: 'Bookings',
            rows: [booking]
        })

        //Add entry in Redis.BookingBids to start the bidding process
        await insert.insert({
            db: 'redis',
            table: 'BookingBids',
            rows: [
                {
                    key: booking.bid,
                    value: booking.bidConfig
                }
            ]  
        })

        kafka.broadcastNewBooking(booking);

        //Invoke unity api to add bid to grid
        await api.post(urls.ADD_BOOKING_TO_GRID, {
            bid: booking.bid,
            grid: grid
        })

        res.json(booking);
    } catch (err) {
        console.log(err);
        res.status(500).send('ER500');
    }
}