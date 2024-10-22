/**
 * Provide API implementations for Trip related functions
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

export const uploadPhoto = async(req, res) => {

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

export const initiateReturnToPickup = async(req, res) => {
    res.status(500).send('Not yet implemented');
}

export const reachedOriginDrop = async(req, res) => {
    res.status(500).send('Not yet implemented');
}

export const droppedAtOrigin = async(req, res) => {
    res.status(500).send('Not yet implemented');
}

export const packageDestroyed = async(req, res) => {
    res.status(500).send('Not yet implemented');
}  

