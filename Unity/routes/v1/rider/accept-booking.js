var express = require('express');
var router = express.Router();
var api = require('../../../api');
const URLS = require('../../../urls');
const bookingService = require('../../../services/bookingService');

router.post('/', async (req, res) => {
    let bid = req.body.bid;
    let riderLoc = req.body.riderLoc;
    let rid = req.body.rid;

    try {
        //Check if rider currently has an active booking, if so the rider cannot accept a new booking
        let riderActiveTrips = await api.post(URLS.SCM_DB_FETCH, {
            db: 'mongo',
            table: 'Trips',
            condition: {
                "$or": [
                    {status: 'way-to-pickup'},
                    {status: 'way-to-drop'},
                    {status: 'way-to-return'},
                    {status: 'way-to-pickup'}
                ],
                rid: rid
            }
        })

        if(riderActiveTrips.length > 0) return res.status(400).send('ER213');

        let result = await bookingService.processUnity({
            cmd: 'accept-booking',
            p: {
                bid: bid,
                rid: rid,
                riderLoc: riderLoc
            }
        });

        result != null ? res.json(result) : res.send();
    } catch (err) {
        if(err == 'ER212') res.status(400).send(err);
        else res.status(500).send(err);
    }
})

const fetchBooking = (bid) => new Promise(resolve => {
    var options = {
        'method': 'POST',
        'url': process.env.SCM_URL + '/v1/unity/get-booking',
        formData: {
            'bid': bid
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
    });

})

module.exports = router;