const express = require('express');
const router = express.Router();


const { updateBidding} = require('../controllers/biddingController');

console.log("before routes")
router.post('/updateBidding',updateBidding);


module.exports = router;