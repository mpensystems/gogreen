var express = require('express');
var router = express.Router();

router.post('/', (req, res) => {
    let bid = req.body.bid;

    //TODO: Select booking from Redis.Bookings
    let booking = {
        bid: '',
        status: ''
        // additional fields
    }
    
    //no booking was found with bid
    if(booking == null) res.status(400).send('ER211');

    res.json(booking);
})

module.exports = router;