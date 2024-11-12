/**
 * Provide API implementations for Trip related functions.
 * 
 * The following trip related actions are not supported on the rider api.
 * A rider must contact the admin and have the admin perform the following
 * actions if required:
 * 1. Cancel Trip
 * 2. Destroy Package / Mark Accident / Package collected, but unable to deliver
 * 3. Initiate a return to pickup as drop location is not serviceable / reachable / customer request
 * 
 * @author Sanket Sarang <sanket@blobcity.com>
 */

import { createHash } from 'crypto';
import { makeid } from '../../utils.js';
import { post, fetchOne } from '../../api.js';
import { SCM_DB_DELETE, SCM_DB_FETCH, SCM_DB_INSERT, SCM_DB_UPDATE } from '../../urls.js';
import { validateSt } from '../../utils.js';
import { response } from 'express';
import { sendExotelOtp, sendSlackOtp, sendTripOtpOverSlack } from '../../controllers/otpController.js';
// const moment = require('moment');
import moment from 'moment'

export const getActiveTrips = async (req, res) => {
    let rid = await validateSt(req.headers['authorization'])
    if (rid == null) return res.status(401).send('ER401');

    let riderActiveTrips = await post(SCM_DB_FETCH, {
        db: 'mongo',
        table: 'Trips',
        condition: {
            "$or": [
                { status: 'way-to-pickup' },
                { status: 'way-to-drop' },
                { status: 'way-to-return' },
                { status: 'way-to-pickup' }
            ],
            rid: rid
        }
    })

    if (riderActiveTrips == null) res.send([]);
    else res.send(riderActiveTrips.map(t => {
        delete t._id;
        return t;
    }));
}

export const getAllTrips = async (req, res) => {
    let rid = await validateSt(req.headers['authorization'])
    if (rid == null) return res.status(401).send('ER401');

    let count = req.query.count;
    let offset = req.query.offset;

    res.status(500).send('Not yet implemented');
}

export const getTrip = async (req, res) => {
    try {
        let rid = await validateSt(req.headers['authorization'])
        if (rid == null) return res.status(401).send('ER401');

        let tid = req.params.tid;
        if (tid == null || tid == '') return res.status(400).send('ER704,tid');

        let trip = await fetchOne({
            db: 'mongo',
            table: 'Trips',
            condition: {
                tid: tid
            }
        });
        delete trip._id;
        res.send(trip);
    } catch (err) {
        console.log(err);
        res.status(500).send('ER500');
    }
}

export const setStatus = async (req, res) => {
    let rid = await validateSt(req.headers['authorization'])
    if (rid == null) return res.status(401).send('ER401');

    const tid = req.params.tid;
    const status = req.params.status;
    const substatus = req.params.substatus;

    const lat = req.body.lat;
    const lng = req.body.lng;
    const otp = req.body.otp;

    try {
        //load the trip object, and return error if a trip is not found
        let trips = await post(SCM_DB_FETCH, {
            db: 'mongo',
            table: 'Trips',
            condition: {
                tid: tid
            }
        })

        if (trips == null || trips.length == 0) return res.status(400).send('ER704,tid');
        const trip = trips[0];

        let validationError = validateNewStatus(status, substatus);
        if (validationError != null) return res.status(400).send(validationError);

        validationError = validateStatusCombination(trip, status, substatus);
        if (validationError != null) return res.status(400).send(validationError);

        if (status == 'way-to-drop' && substatus == 'routing') {
            if (otp == null) return res.status(400).send('ER223');
            await validateAndConsumeOtp(tid, 'way-to-pickup', otp);
        } else if (status == 'delivered') {
            if (otp == null) return res.status(400).send('ER223');
            await validateAndConsumeOtp(tid, 'way-to-drop', otp);
        } else if (status == 'returned') {
            if (otp == null) return res.status(400).send('ER223');
            await validateAndConsumeOtp(tid, 'way-to-return', otp);
        }

        if (status == 'way-to-pickup' && substatus == 'arrived-at-pickup') {
            generateAndSendOtp(trip, 'way-to-pickup');
        } else if (status == 'way-to-drop' && substatus == 'arrived-at-drop') {
            generateAndSendOtp(trip, 'way-to-drop');
        } else if (status == 'way-to-return' && substatus == 'arrived-at-return') {
            generateAndSendOtp(trip, 'way-to-return');
        }

        //if trip status is final, then complete the trip and record a rider payment
        

        trip.status = status;
        trip.substatus = substatus;

        delete trip._id;
        await post(SCM_DB_UPDATE, {
            db: 'mongo',
            table: 'Trips',
            condition: {
                tid: tid
            },
            row: trip
        })

        let response = {
            status: status,
            substatus: substatus
        }

        res.json(response);
    } catch (err) {
        console.error(err);
        if (err == 'ER223') res.status(400).send('ER223');
        else res.status(500).send('ER500');
    }
};

const validateAndConsumeOtp = (tid, status, otp) => new Promise(async (resolve, reject) => {
    let tripOtps = await post(SCM_DB_FETCH, {
        db: 'redis',
        table: 'TripOtps',
        id: `${tid}_${status}`
    })

    if (tripOtps == null || tripOtps.length == 0) return reject('ER223');
    let tripOtp = tripOtps[0];
    let otpHash = createHash('md5').update(otp).digest('hex');

    if (otpHash != tripOtp.otpHash) return reject('ER223');

    await post(SCM_DB_DELETE, {
        db: 'redis',
        table: 'TripOtps',
        id: `${tid}_${status}`
    })

    resolve();
});

/**
 * Generates and sends an OTP to the either the pickup or drop location
 * depending on the value of status passed. If an OTP for a particular
 * status has already been generated, then the same will get resplaced
 * with a newly generated OTP.
 * @param {*} tid 
 * @param {*} status 
 */
const generateAndSendOtp = async (trip, status) => {
    try {
        let otp = '' + (Math.floor(100000 + Math.random() * 900000));
        let otpHash = createHash('md5').update(otp).digest('hex');
        let tripOtp = {
            tid: trip.tid,
            status: status,
            otpHash: otpHash,
            createdAt: Date.now()
        }

        await post(SCM_DB_INSERT, {
            db: 'redis',
            table: 'TripOtps',
            rows: [
                {
                    key: `${trip.tid}_${status}`,
                    value: tripOtp
                }
            ]
        })

        switch (status) {
            case 'way-to-pickup':
            case 'way-to-return':
                sendTripOtpOverSlack(trip.pickup_mobile, trip.tid, status, otp);
                break;
            case 'way-to-drop':
                sendTripOtpOverSlack(trip.drop_mobile, trip.tid, status, otp);
                break;
        }
    } catch (err) {
        console.log(err);
    }
}

const validateNewStatus = (status, substatus) => {
    switch (status) {
        case 'pickup-canceled':
            switch (substatus) {
                case 'too-big':
                case 'restricted-item':
                case 'insufficient-packaging':
                case 'pickup-to-far':
                case 'insufficient-fuel':
                case 'drop-to-far':
                case 'pickup-location-embargo':
                case 'rider-change-of-heart':
                case 'customer-change-of-heart':
                case 'rider-not-reachable':
                case 'pickup-person-not-reachable':
                case 'other':
                    return null;
                default:
                    return `ER704,substatus`;
            }
        case 'drop-canceled':
            switch (substatus) {
                case 'package-lost-in-transit':
                case 'rider-accident':
                case 'physical-damage':
                case 'contents-spilled':
                case 'water-damage':
                case 'customer-change-of-heart':
                case 'rider-not-reachable':
                case 'other':
                    return null;
                default:
                    return `ER704,substatus`;
            }
        case 'way-to-pickup':
            switch (substatus) {
                case 'routing':
                case 'arrived-at-pickup':
                case 'moved-away-from-pickup':
                    return null;
                default:
                    return `ER704,substatus`;
            }
        case 'way-to-drop':
            switch (substatus) {
                case 'routing':
                case 'arrived-at-drop':
                case 'moved-away-from-drop':
                    return null;
                default:
                    return `ER704,substatus`;
            }
        case 'way-to-return':
            switch (substatus) {
                case 'routing':
                    return null;
                default:
                    return `ER704,substatus`;
            }
        case 'delivered':
            switch (substatus) {
                case 'all-good':
                case 'physical-damage':
                case 'contents-spilled':
                case 'water-damage':
                case 'other':
                    return null;
                default:
                    return `ER704,substatus`;
            }
        case 'returned':
            switch (substatus) {
                case 'rider-change-of-heart':
                case 'customer-change-of-heart':
                case 'too-big':
                case 'restricted-item':
                case 'insufficient-packaging':
                case 'drop-to-far':
                case 'insufficient-fuel':
                case 'recipient-not-available':
                case 'recipient-location-embargo':
                case 'other':
                    return null;
                default:
                    return `ER704,substatus`;
            }
        default:
            return `ER704,status`;
    }
}

const validateStatusCombination = (trip, status, substatus) => {
    const cs = trip.status; //current status
    const css = trip.substatus; //current sub-status

    switch (cs) {
        case 'pickup-canceled':
            switch (status) {
                case 'pickup-canceled':
                    return null;
                case 'way-to-pickup':
                case 'way-to-drop':
                case 'drop-canceled':
                case 'way-to-return':
                case 'delivered':
                case 'returned':
                    return `ER215,${cs}/${css},${status}/${substatus}`;
                default:
                    return 'ER704,status';
            }
        case 'drop-canceled':
            switch (status) {
                case 'drop-canceled':
                    return null;
                case 'pickup-canceled':
                case 'way-to-pickup':
                case 'way-to-drop':
                case 'way-to-return':
                case 'delivered':
                case 'returned':
                    return `ER215,${cs}/${css},${status}/${substatus}`;
                default:
                    return 'ER704,status';
            }
        case 'way-to-pickup':
            switch (status) {
                case 'pickup-canceled':
                case 'way-to-pickup':
                case 'way-to-drop':
                    return null;
                case 'drop-canceled':
                case 'way-to-return':
                case 'delivered':
                case 'returned':
                    return `ER215,${cs}/${css},${status}/${substatus}`;
                default:
                    return 'ER704,status';
            }
        case 'way-to-drop':
            switch (status) {
                case 'way-to-drop':
                case 'way-to-pickup':
                case 'way-to-return':
                case 'drop-canceled':
                case 'delivered':
                    return null;
                case 'pickup-canceled':
                case 'returned':
                    return `ER215,${cs}/${css},${status}/${substatus}`;
                default:
                    return 'ER704,status';
            }
        case 'way-to-return':
            switch (status) {
                case 'way-to-drop':
                case 'way-to-return':
                case 'returned':
                    return null;
                case 'delivered':
                case 'drop-canceled':
                case 'pickup-canceled':
                    return `ER215,${cs}/${css},${status}/${substatus}`;
                default:
                    return 'ER704,status';
            }
        case 'delivered':
            switch (status) {
                case 'delivered':
                    return null;
                case 'way-to-drop':
                case 'way-to-return':
                case 'drop-canceled':
                case 'pickup-canceled':
                case 'returned':
                    return `ER215,${cs}/${css},${status}/${substatus}`;
                default:
                    return 'ER704,status';
            }
        case 'returned':
            switch (status) {
                case 'returned':
                    return null;
                case 'way-to-return':
                case 'way-to-drop':
                case 'delivered':
                case 'drop-canceled':
                case 'pickup-canceled':
                    return `ER215,${cs}/${css},${status}/${substatus}`;
                default:
                    return 'ER704,status';
            }
        default:
            return `ER704,status`;
    }
}