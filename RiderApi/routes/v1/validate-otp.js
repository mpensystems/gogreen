var express = require('express');
var router = express.Router();
var request = require('request');
var crypto = require('crypto');
const api = require('../../api');
const URLS = require('../../urls');

router.post('/', async (req, res) => {
    let token = req.token;
    let otp = req.otp;

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

    let st = makeid(64);
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
        vehicle_no: rider.vehicle_no
    }});
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