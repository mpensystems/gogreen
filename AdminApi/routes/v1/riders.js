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
import moment from 'moment';

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

export const getEarningsLedger = async(req, res) => {
    let adminUser = await validateAdminRole(req.headers['authorization']);
    if(adminUser == null) return res.status(401).send('ER401');

    const rid = req.params.rid;
    if(rid == null || rid == '') return res.status(400).send('ER704,rid');

    const start_date = req.body.start_date;
    const end_date = req.body.end_date;

    let startMoment = moment(start_date, 'DD-MM-YYYY');
    let endMoment = moment(end_date, 'DD-MM-YYYY');

    if(!startMoment.isValid()) return res.status(400).send('ER704,start_date');
    if(!endMoment.isValid()) return res.status(400).send('ER704,end_date');

    let balance = getRandomInt(1000);
    let transactions = [];

    transactions.push({
        date: start_date,
        text: "Opening Balance",
        debit: 0,
        credit: 0,
        balance: balance
    });

    for(var m = moment(start_date, 'DD-MM-YYYY'); m.diff(endMoment,'days') <= 0; m.add(1, 'days')) {
        let debit = 0.0;
        let credit = 0.0;
        let text = '';
        let tid = null;
        let utr = null;

        getRandomInt(10) > 7 ? debit = getRandomInt(1000) : credit = getRandomInt(150); 
        if(debit > 0) {
            utr = makeid(12);
            text = `Settlement to A/c XXX094. UTR: ${utr}`;
        }
        else {
            tid = makeid(24);
            text = `Trip earnings for ${tid}`;
        }

        balance += credit;
        balance -= debit;

        let transaction = {
            date: m.format('DD-MM-YYYY'),
            text: text,
            debit: debit,
            credit: credit,
            balance: balance
        };

        if(tid != null) transaction.tid = tid;
        if(utr != null) transaction.utr = utr;

        transactions.push(transaction);
    }

    
    res.json(transactions);
}

const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
}

const sanitizeRider = (rider) => {
    return {
        rid: rider.rid,
        first_name: rider.first_name,
        last_name: rider.last_name,
        country_code: rider.country_code,
        mobile: rider.mobile,
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
