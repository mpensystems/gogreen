var express = require('express');
var router = express.Router();

router.post('/', (req, res) => {
    let bid = req.body.bid;
    let rid = req.body.rid;

    //TODO: fetch booking from Redis
    let booking = {
        bid: '1',
        status: 'active',
        h3is: ['xxxx']
    }

    //TODO: Fetch latest rider location from Redis.RiderLoc
    let riderLoc = {
        rid: 1,
        lat: 0.00,
        lng: 0.00,
        h3i: 'xxxx',
        timestamp: 0
    }

    //no booking was found with bid
    if(booking == null) res.status(400).send('ER211');

    //the booking is currently not in active status. Only an active status booking can be converted to trip.
    if(booking.status != 'active') res.status(400).send('ER212');

    //if no rider location found or rider location is more than 1 minute old
    if(riderLoc == null || riderLoc.timestamp < Date.now() - 60 * 1000) res.status(403).send('ER221');
    
    //if current h3i index of rider is not a valid h3i in which the booking is shown
    if(!booking.h3is.includes(riderLoc.h3i)) res.status(403).send('ER222');

    //if all of the above conditions are satisfied, then pass on the request to the unity module for initiating the conversion.
    //TODO: Invoke corresponding API in unity module

})