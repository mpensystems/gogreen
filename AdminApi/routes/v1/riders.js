/**
 * API functions to fetch and update rider details
 * 
 * @author Sanket Sarang <sanket@blobcity.com>
 */

import { createHash } from 'crypto';
import { makeid } from '../../utils.js';
import { post } from '../../api.js';
import { SCM_DB_DELETE, SCM_DB_FETCH, SCM_DB_INSERT, SCM_DB_UPDATE } from '../../urls.js';
import { getAdminUserFromSt, validateSuperadminRole, validateAdminRole, validateUserRole } from '../../utils.js';
import { response } from 'express';

export const getAllRiders = async(req, res) => {
    let adminUser = await validateUserRole(req.headers['authorization']);
    if(adminUser == null) return res.status(401).send('ER401');

    let riderArr = await post(SCM_DB_FETCH, {
        db: 'mongo',
        table: 'Riders'
    });

    if(riderArr == null) return res.json([]);
    res.json(riderArr.map(x => sanitizeRider(x)));
}

export const getRider = async(req, res) => {
    let adminUser = await validateUserRole(req.headers['authorization']);
    if(adminUser == null) return res.status(401).send('ER401');

    const rid = req.params.rid;
    if(rid == null || rid == '') return res.status(400).send('ER704,rid');

    let riderArr = await post(SCM_DB_FETCH, {
        db: 'mongo',
        table: 'Riders',
        condition: {
            rid: rid
        }
    });

    if(riderArr == null || riderArr.length == 0) return res.json([]);
    res.json(sanitizeRider(riderArr[0]));    
}

const sanitizeRider = (rider) => {
    return {
        rid: rider.rid,
        first_name: rider.first_name,
        last_name: rider.last_name,
        gender: rider.gender,
        city: rider.city,
        state: rider.state,
        district: rider.district,
        vehicle_no: rider.vehicle_no,
        is_electric: rider.is_electric,
        fueled_propulsion: rider.fueled_propulsion,
        kyc_approved: rider.kyc_approved,
        kyc_approvedAt: rider.kyc_approvedAt,
        kyc_error_message: rider.kyc_error_message,
        kyc_approvedBy: rider.kyc_approvedBy,
        createdAt: rider.createdAt,
        updatedAt: rider.updatedAt
    }
}
