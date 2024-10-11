/**
 * Offers functions related to KYC module that are rider specific
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

export const fetchKyc = async (req, res) => {
    let rid = await validateSt(req.headers['authorization'])
    if(rid == null) {
        res.status(401).send('ER401');
        return;
    }

    let riderArr = await post(SCM_DB_FETCH, {
        db: 'mongo',
        table: 'Riders',
        condition: {
            rid: rid
        }
    })

    if(riderArr.length == 0) {
        res.status(500).send('ER500');
        return;
    }

    res.json(riderArr[0]);
}

export const updateKyc = async(req, res) => {
    let rid = await validateSt(req.headers['authorization'])
    if(rid == null) {
        res.status(401).send('ER401');
        return;
    }

    let formData = req.body;

    //validate relevant fields
    if(formData.first_name == null || formData.first_name == '') {
        res.status(400).send('ER703,first_name');
        return;
    }
    if(formData.mobile == null || formData.mobile == '') {
        res.status(400).send('ER703,mobile');
        return;
    }
    if(formData.country_code == null || formData.country_code == '') {
        res.status(400).send('ER703,country_code');
        return;
    }
    if(formData.dob != '' && !moment(formData.dob, 'DD-MM-YYYY').isValid()) return res.status(400).send('ER704,dob');
    
    //fetch current rider object
    let riderArr = await post(SCM_DB_FETCH, {
        db: 'mongo',
        table: 'Riders',
        condition: {
            rid: rid
        }
    })

    if(riderArr.length == 0) {
        res.status(500).send('ER500');
        return;
    }

    let updatedRow = riderArr[0];

    delete updatedRow._id;

    updatedRow.first_name = formData.first_name;
    updatedRow.last_name = formData.last_name;
    updatedRow.gender = formData.gender;
    updatedRow.dob = formData.dob;
    updatedRow.address_line1 = formData.address_line1;
    updatedRow.address_line2 = formData.address_line2;
    updatedRow.flat_no = formData.flat_no;
    updatedRow.zipcode = formData.zipcode;
    updatedRow.city = formData.city;
    updatedRow.district = formData.district;
    updatedRow.state = formData.state;
    updatedRow.aadhar_no = formData.aadhar_no;
    updatedRow.drivers_license_expiry = formData.drivers_license_expiry;
    updatedRow.pan_no = formData.pan_no;
    updatedRow.vehicle_no = formData.vehicle_no;
    updatedRow.vehicle_type = formData.vehicle_type;
    updatedRow.bank_ac = formData.bank_ac;
    updatedRow.bank_ifsc = formData.bank_ifsc;
    updatedRow.bank_ac_name = formData.bank_ac_name;


    updatedRow.updatedAt = Date.now();

    //invalidate any previous KYC
    updatedRow.kyc_approved = false;
    updatedRow.kyc_error_message = '';
    updatedRow.kyc_approvedAt = 0;
    updatedRow.kyc_approvedBy = '';

    await post(SCM_DB_UPDATE, {
        db: 'mongo',
        table: 'Riders',
        condition: {
            rid: rid
        },
        row: updatedRow
    })

    //TODO: Validate and Update the record in mongodb

    res.send();
}