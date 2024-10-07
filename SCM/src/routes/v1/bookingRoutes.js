const express = require('express');
const router = express.Router();


// const {createBooking} = require("../../controllers/bookingControllers/createBooking");
const {createBooking} = require('../../controllers/bookingController');
const {getAllBookings} = require("../../controllers/bookingControllers/getAllBookings");
const { UpdateBidData } = require('../../controllers/bookingControllers/updateLastBid');

router.post('/create',createBooking);
router.post('/UpdateBidData',UpdateBidData);
router.get('/getAllBookings' , getAllBookings);

module.exports = router;