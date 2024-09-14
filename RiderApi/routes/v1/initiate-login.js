var express = require('express');
var router = express.Router();
var request = require('request');
var crypto = require('crypto');

router.post('/', (req, res) => {
    let country_code = req.country_code;
    let mobile = req.mobile;

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
    let token = makeid(36);

    /**
     * TODO:
     * 1. Insert otpHash value in Redis.RiderOtp along with the corresponding token
     * 2. Send OTP via Exotel to the mobile number
     */

    res.json({token: token});
})

const makeid = (length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

module.exports = router;