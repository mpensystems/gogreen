/**
 * Provide API implementations for Trip related functions
 * 
 * @author Sanket Sarang <sanket@blobcity.com>
 */

import { createHash } from 'crypto';
import { makeid } from '../../utils.js';
import { post } from '../../api.js';
import { SCM_DB_DELETE, SCM_DB_FETCH, SCM_DB_INSERT, SCM_DB_UPDATE, UNITY_ACCEPT_BOOKING } from '../../urls.js';
import { validateSt } from '../../utils.js';
import { response } from 'express';
// const moment = require('moment');
import moment from 'moment'

export const acceptBooking = async (req, res) => {
    let rid = await validateSt(req.headers['authorization'])
    if (rid == null) return res.status(401).send('ER401');
    let bid = req.params.bid;
    if (bid == null) return res.status(400).send('ER704,bid')

    try {
        let acceptBooking = await post(UNITY_ACCEPT_BOOKING, {
            bid: bid,
            rid: rid,
            riderLoc: {
                lat: 0.00,
                lng: 0.00
            }
        })
        res.json(acceptBooking);
    } catch (err) {
        console.log(err);
        if(err == 'ER212') res.status(400).send('ER212');
        else res.status(500).send('ER500');
    }
}