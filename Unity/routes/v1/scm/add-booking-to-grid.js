var express = require('express');
var router = express.Router();
var Mutex = require('async-mutex').Mutex;
var api = require('../../../api');
const URLS = require('../../../urls');
const mutex = new Mutex();

router.post('/', async (req, res) => {
    const bid = req.body.bid;
    const grid = req.body.grid;

    if (bid == null || grid == null || grid.length == 0) return res.status(500).send('ER500');
    try {
        let promises = grid.map(h3i => new Promise(async (resolve) => {
            let h3iRecords = await api.post(URLS.SCM_DB_FETCH, {
                db: 'redis',
                table: 'Grid',
                id: h3i
            });

            let h3iRecord = h3iRecords.length == 0 ? { bids: '' } : h3iRecords[0];
            let bids = h3iRecord.bids.split(',');
            if (!bids.includes(bid)) {
                bids.push(bid);
            }

            await api.post(URLS.SCM_DB_UPDATE, {
                db: 'redis',
                table: 'Grid',
                rows: [
                    {
                        key: h3i,
                        value: { bids: bids.join() }
                    }
                ]
            })

            resolve(h3i);
        }))

        let results = await Promise.all(promises);

        res.json({
            updated: results
        })
    } catch (err) {
        res.status(500).send('ER500'); //must send back correct status and error code
    }
})

module.exports = router;