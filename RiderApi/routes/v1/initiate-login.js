var express = require('express');
var router = express.Router();
var request = require('request');
var crypto = require('crypto');
const utils = require('../../utils');

router.post('/', async (req, res) => {
    let country_code = req.body.country_code;
    let mobile = req.body.mobile;

    if(country_code == null || country_code == '') {
        res.status(400).send('ER701');
        return;
    }

    if(mobile == null || mobile == '') {
        res.status(400).send('ER702');
        return;
    }

    let otp = '' + (Math.floor(100000 + Math.random() * 900000));
    let otpHash = crypto.createHash('md5').update(otp).digest('hex');
    let token = utils.makeid(36);

    /**
     * TODO:
     * 1. Insert otpHash value in Redis.RiderOtp along with the corresponding token
     * 2. Send OTP via Exotel to the mobile number
     */

    res.json({token: token});
})

module.exports = router;