/**
 * Used to record a transaction in the riders ledger.
 * 
 * @author Sanket Sarang <sanket@blobcity.com>
 */

var express = require('express');
var router = express.Router();
var api = require('../../../api');
const URLS = require('../../../urls');
const bookingService = require('../../../services/bookingService');
const utils = require('../../../utils');
const earningsService = require('../../../services/trip-and-earnings');

router.post('/', async (req, res) => {
    try {
        let {rid, description, debit, credit, tid} = req.body;
        let txid = utils.makeid(36);

        if(rid == null || rid == '') return res.status(400).send('ER704,rid');
        if(debit == 0 && credit == 0) return res.status(400).send('ER704,debit/credit - both cannot be 0');
        if(debit != 0 && credit != 0) return res.status(400).send('ER704,debit/credit - atleast one must be 0');
    
        let command = {
            cmd: 'record-transaction',
            p: {
                txid: txid,
                rid: rid,
                description: description,
                debit: debit,
                credit: credit
            }
        }
    
        if(tid != null) command.p.tid = tid;

        earningsService.processUnity(command);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
})

module.exports = router;