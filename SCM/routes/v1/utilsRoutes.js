const express = require('express');
const router = express.Router();


const { calculateTripDistance } = require("../../utils/h3Utils");
const {latLngToH3} = require("../../utils/h3Utils");
// router.post('/convert', latLngToH3 );
console.log("latLngToH3 : ",latLngToH3);
console.log("calculateTripDistance : ",calculateTripDistance);

router.post('/convert', latLngToH3);

router.post('/distance',calculateTripDistance);


module.exports = router;
