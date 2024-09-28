import { createHash } from 'crypto';
import { makeid } from '../../utils.js';
import { post } from '../../api.js';
import { SCM_DB_FETCH, SCM_DB_INSERT } from '../../urls.js';
import { sendExotelOtp, sendSlackOtp } from '../../controllers/otpController.js';

export const initiateLogin = async (req, res) => {
    let country_code = req.body.country_code;
    let mobile = req.body.mobile;

    if (country_code == null || country_code == '') {
        res.status(400).send('ER701');
        return;
    }

    if (mobile == null || mobile == '') {
        res.status(400).send('ER702');
        return;
    }

    try {
        let otp = '' + (Math.floor(100000 + Math.random() * 900000));
        let otpHash = createHash('md5').update(otp).digest('hex');
        let mobHash = createHash('md5').update(country_code + '-' + mobile).digest('hex');
        let token = makeid(36);

        //Insert otpHash and token in Redis.RiderOtp
        await post(SCM_DB_INSERT, {
            db: 'redis',
            table: 'RiderOtp',
            rows: [
                {
                    key: token,
                    value: {
                        otpHash: otpHash,
                        mobHash: mobHash,
                        createdAt: Date.now()
                    }
                }
            ]
        })

        //Message OTP to customer via a configured messaging channel
        sendSlackOtp(country_code + mobile, otp);

        res.json({ token: token });
    } catch (err) {
        console.log(err);
        res.status(500).send('ER500');
    }
}

export const validateOtp = async (req, res) => {
    let token = req.body.token;
    let otp = req.body.otp;

    if (token == null || token == '' || otp == null || otp == '') {
        res.status(500).send('ER500');
        return;
    }

    try {
        let otpHash = createHash('md5').update(otp).digest('hex');

        let riderOtpRecords = await post(SCM_DB_FETCH, {
            db: 'redis',
            table: 'RiderOtp',
            id: token
        })

        //if length is 0, then token + otp combination is invalid
        if (riderOtpRecords.length == 0) {
            res.status(401).send('ER402');
            return;
        }

        let st = makeid(64);
        let mobHash = riderOtpRecords[0].mobHash;

        /**
         * TODO: Add entry in Redis.RiderSession
         */

        //Load rider details
        let riderArr = await post(SCM_DB_FETCH, {
            db: 'mongo',
            table: 'Riders',
            q: {
                mobHash: mobHash
            }
        })

        /**
         * Register a new rider and create an rid if no rider found corresponding to the login session.
         */
        if (riderArr.length == 0) {
            res.status(500).send('ER500');
            return;
        }

        let rider = riderArr[0];

        //return session token, along with key information of the rider that just did a successful login
        res.json({
            st: st, rider: {
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
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('ER500');
    }
}

export const validateSession = async(req, res) => {
    let st = req.body.st;

} 