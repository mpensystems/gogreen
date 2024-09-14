/**
 * Generic data fetch API handler. This can be invoked from other modules to perform
 * select operations on both Mongo and Redis. Only selects with simple where clause
 * are currently supported. 
 * 
 * @author Sanket Sarang <sanket@blobcity.com>
 */

var express = require('express');
var router = express.Router();
const dbFetch = require('../../../DMM/src/db/fetch');

router.post('/', (req, res) => {
    let query = req.body;

    // validate basic format of the query object
    if(query == null
        || !('db' in query)
        || query.db == ''
        || !('table' in query)
        || query.table == ''
    ) {
        res.status(500).send('ER500 - Query parameter incorrect or missing');
        return;
    }

    dbFetch.fetch(query)
    .then(result => res.json(result))
    .catch(err => res.status(500),send('ER500 - DB query failed'));

})

module.exports = router;