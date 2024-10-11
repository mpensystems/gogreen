/**
 * This file offers generic functions to perform select operations on MongoDB 
 * and Redis databases depending on the query. 
 * 
 * @author Sanket Sarang <sanket@blobcity.com>
 */

import { createHash } from 'crypto';
import { makeid } from '../../utils.js';
import { post } from '../../api.js';
import { SCM_DB_DELETE, SCM_DB_FETCH, SCM_DB_INSERT } from '../../urls.js';
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
                        country_code: country_code,
                        mobile: mobile,
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

        let riderOtp = riderOtpRecords[0];

        //validate OTP to be correct.
        if(riderOtp.otpHash != otpHash) {
            res.status(401).send('ER402');
            return;
        }

        let st = makeid(64);
        let stHash = createHash('md5').update(st).digest('hex');
        
        let mobHash = riderOtp.mobHash;


        //Load rider details
        let riderArr = await post(SCM_DB_FETCH, {
            db: 'mongo',
            table: 'Riders',
            condition: {
                mobHash: mobHash
            }
        })

        let rider;

        /**
         * Register a new rider and create an rid if no rider found corresponding to the login session.
         */
        if (riderArr.length == 0) {
            rider = createNewRiderObject();
            rider.mobHash = mobHash;
            rider.country_code = riderOtp.country_code;
            rider.mobile = riderOtp.mobile;
            await post(SCM_DB_INSERT, {
                db: 'mongo',
                table: 'Riders',
                rows: [
                    rider
                ]
            })
        } else rider = riderArr[0];

        // Add entry in Redis.RiderSession
        await post(SCM_DB_INSERT, {
            db: 'redis',
            table: 'RiderSession',
            rows: [
                {
                    key: stHash,
                    value: {
                        stHash: stHash,
                        rid: rider.rid,
                        createdAt: Date.now(),
                        expiresAt: Date.now() + 24 * 60 * 60 * 1000 //24 hrs
                    }
                }
            ]
        })

        //return session token, along with key information of the rider that just did a successful login
        res.json({
            st: st,
            rider: {
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
                createdAt: rider.createdAt // use for displaying "Members Since" on the app. 
            }
        });

        //TODO: Drop the RiderOtp record
        post(SCM_DB_DELETE, {
            db: 'redis',
            table: 'RiderOtp',
            id: token
        })
    } catch (err) {
        console.log(err);
        res.status(500).send('ER500');
    }
}

const createNewRiderObject = () => {
    return {
        rid: makeid(16),
        first_name: '',
        last_name: '',
        country_code: '',
        mobile: '',
        mobHash: '',
        gender: '',
        dob: '',
        address_line1: '',
        address_line2: '',
        flat_no: '',
        zipcode: '',
        city: '',
        district: '',
        state: '',
        aadhar_no: '',
        photo_id_type: '',
        photo_id_front: '',
        photo_id_back: '',
        utility_bill: '',
        photo: '',
        drivers_license_front: '',
        driver_license_back: '',
        drivers_license_expiry: '',
        pan_no: '',
        pan_copy: '',
        vehicle_no: '',
        rc_copy_front: '',
        rc_copy_back: '',
        vehicle_type: '',
        is_electric: '',
        fueled_propulsion: '',
        bank_ac: '',
        bank_ifsc: '',
        bank_ac_name: '',
        cancelled_cheque: '',
        kyc_approved: '',
        kyc_error_message: '',
        kyc_approvedAt: 0,
        kyc_approvedBy: '',
        createdAt: Date.now(),
        updatedAt: Date.now()
    }
}