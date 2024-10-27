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

    let validationError = validateStatusCombination(trip, status, substatus);
    if (validationError != null) res.status(400).send(validationError);

    res.send();
}

export const reachedPickup = async (req, res) => {
    res.status(500).send('Not yet implemented');
}

export const pickup = async (req, res) => {
    res.status(500).send('Not yet implemented');
}

export const reachedDrop = async (req, res) => {
    res.status(500).send('Not yet implemented');
}

export const dropped = async (req, res) => {
    res.status(500).send('Not yet implemented');
}

export const reachedOriginDrop = async (req, res) => {
    res.status(500).send('Not yet implemented');
}

export const droppedAtOrigin = async (req, res) => {
    res.status(500).send('Not yet implemented');
}

const validateStatusCombination = (trip, status, substatus) => {
    const cs = trip.status; //current status
    const css = trip.substatus; //current sub-status

    switch (status) {
        case 'pickup-canceled':
        case 'drop-canceled':
            //restricted status change. Do not allow on rider api. Only admin can update to this status
            return `ER215,${cs}/${css},${status}/${substatus}`;
        case 'way-to-pickup':
            if (cs != 'way-to-pickup' || css != 'routing') return `ER215,${cs}/${css},${status}/${substatus}`;
            switch (substatus) {
                case 'routing':
                    //rider had accidentally marked reached pickup location, and wishes to undo the action.
                    break;
                case 'arrived-at-pickup':
                    if (css != 'routing') return `ER215,${cs}/${css},${status}/${substatus}`;
                default:
                    return 'ER704,substatus';
            }
            break;
        case 'way-to-drop':
            break;
        case 'way-to-return':
        case 'delivered':
            if (cs != 'way-to-drop' || css != 'arrived-at-drop') return `ER215,${cs}/${css},${status}/${substatus}`;
        case 'returned':
            if (cs != 'way-to-return' || css != 'arrived-at-return') return `ER215,${cs}/${css},${status}/${substatus}`;
        default:
            return `ER704,status`;
    }

    return null; //no error to report. Validation is successful
}