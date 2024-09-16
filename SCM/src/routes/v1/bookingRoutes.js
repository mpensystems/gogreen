const express = require('express');
const router = express.Router();


const {createBooking} = require("../../controllers/bookingControllers/createBooking");
const {getAllBookings} = require("../../controllers/bookingControllers/getAllBookings");
const { UpdateBidData } = require('../../controllers/bookingControllers/updateLastBid');

router.post('/createBooking',createBooking);
router.post('/UpdateBidData',UpdateBidData);
router.get('/getAllBookings' , getAllBookings);

module.exports = router;