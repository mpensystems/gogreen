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
import { post } from '../../api.js';
import { SCM_DB_DELETE, SCM_DB_FETCH, SCM_DB_INSERT, SCM_DB_UPDATE } from '../../urls.js';
import { validateSt } from '../../utils.js';
import { response } from 'express';
// const moment = require('moment');
import moment from 'moment'

export const getActiveTrips = async(req, res) => {
    let rid = await validateSt(req.headers['authorization'])
    if(rid == null) return res.status(401).send('ER401');

    res.status(500).send('Not yet implemented');
}

export const getAllTrips = async(req, res) => {
    let rid = await validateSt(req.headers['authorization'])
    if(rid == null) return res.status(401).send('ER401');

    let count = req.query.count;
    let offset = req.query.offset;

    res.status(500).send('Not yet implemented');
}

export const getTrip = async(req, res) => {
    let rid = await validateSt(req.headers['authorization'])
    if(rid == null) return res.status(401).send('ER401');

    let tid = req.params.tid;
    if(tid == null || tid == '') return res.status(400).send('ER704,tid');

    res.status(500).send('Not yet implemented');
}

export const setStatus = async(req, res) => {
    let rid = await validateSt(req.headers['authorization'])
    if(rid == null) return res.status(401).send('ER401');

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

    if(trips == null || trips.length == 0) return res.status(400).send('ER704,tid');
    const trip = trips[0];

    let validationError = validateStatusCombination(trip, status, substatus);
    if(validationError != null) res.status(400).send(validationError);

    res.send();
}

export const reachedPickup = async(req, res) => {
    res.status(500).send('Not yet implemented');
}

export const pickup = async (req, res) => {
    res.status(500).send('Not yet implemented');
}

export const reachedDrop = async(req, res) => {
    res.status(500).send('Not yet implemented');
}

export const dropped = async(req, res) => {
    res.status(500).send('Not yet implemented');
}

export const reachedOriginDrop = async(req, res) => {
    res.status(500).send('Not yet implemented');
}

export const droppedAtOrigin = async(req, res) => {
    res.status(500).send('Not yet implemented');
}

const validateStatusCombination = (trip, status, substatus) => {
    const curentStatus = trip.status;
    const currentSubstatus = trip.substatus;

    
}