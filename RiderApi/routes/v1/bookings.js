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

export const acceptBooking = async (req, res) => {
    let rid = await validateSt(req.headers['authorization'])
    if(rid == null) return res.status(401).send('ER401');
    let bid = req.params.rid;
    if(rid == null) return res.status(400).send('ER704,rid')
    
        //check if there is an active BookingBid for the bid
    let result = await post(SCM_DB_FETCH, {
        db: 'mongo',
        table: 'BookingBids',
        condition: {
            bid: bid
        }
    })

    if(result == null || result.length == 0) return res.status(400).send('ER212');
    
    //TODO: Pass on the request to Unity module for conversion to trip

    res.status(500).send('Not yet implemented');
}