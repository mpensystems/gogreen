var express = require('express');
var router = express.Router();
var request = require('request');
var crypto = require('crypto');
const utils = require('../../utils');

router.get('/', async (req, res) => {
    let bearer = req.headers.Authorization;
    if(bearer == null) {
        res.status(401).send('ER403');
        return;
    }

    let rid = await utils.validateSt(bearer);
    if(rid == null) {
        res.status(401).send('ER401');
        return;
    }

    let auth = utils.makeid(36);

    let riderWsAuth = {
        rid:rid,
        auth: crypto.createHash('md5').update(auth).digest('hex'),
        created_at: Date.now()
    }

    //TODO: Insert riderWsAuth in Redis.RiderWsAuth table

    res.json({auth: auth});
})

module.exports = router;