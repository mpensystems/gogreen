const express = require('express');
const router = express.Router();

const {createBooking} = require('../../controllers/bookingService');

router.post('/create',createBooking);

module.exports = router;