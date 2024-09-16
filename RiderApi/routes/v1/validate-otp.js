var express = require('express');
var router = express.Router();
var request = require('request');
var crypto = require('crypto');
const api = require('../../api');
const URLS = require('../../urls');
const utils = require('../../utils');

router.post('/', async (req, res) => {
    let token = req.body.token;
    let otp = req.body.otp;

    if(token == null || token == '' || otp == null || otp == '') {
        res.status(500).send('ER500');
        return;
    }

    let otpHash = crypto.createHash('md5').update(otp).digest('hex');
    
    let riderOtpRecords = await api.post(URLS.SCM_DB_FETCH, {
        db: 'redis',
        table: 'RiderOtp',
        q: {
            token: token,
            otpHash: otpHash
        }
    })

    //if length is 0, then token + otp combination is invalid
    if(riderOtpRecords.length == 0) {
        res.status(401).send('ER402');
        return;
    }

    let st = utils.makeid(64);
    let rid = riderOtpRecords[0].rid;

    /**
     * TODO: Add entry in Redis.RiderSession
     */

    //Load rider details
    let riderArr = await api.post(URLS.SCM_DB_FETCH, {
        db: 'mongo',
        table: 'Riders',
        q: {
            rid: rid
        }
    })

    if(riderArr.length == 0) {
        res.status(500).send('ER500');
        return;
    }

    let rider = riderArr[0];

    //return session token, along with key information of the rider that just did a successful login
    res.json({st: st, rider: {
        mobile: rider.mobile,
        first_name: rider.first_name,
        last_name: rider.last_name,
        photo: rider.photo,
        vehicle_type: rider.vehicle_type,
        is_electric: rider.is_electric,
        fueled_propulsion: rider.fueled_propulsion,
        vehicle_no: rider.vehicle_no,
        kyc_approved: rider.kyc_approved,
        kyc_error_message: rider.kyc_error_message,
        created_at: rider.created_at // use for displaying "Members Since" on the app. 
    }});
})

module.exports = router;