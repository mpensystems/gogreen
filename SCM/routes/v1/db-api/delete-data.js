/**
 * Generic API to insert data into Redis or Mongo depending on the specified query. 
 * Supports inserting records in bulk.
 * 
 * @author Sanket Sarang <sanket@blobcity.com>
 */

var express = require('express');
var router = express.Router();
const dbDelete = require('../../../src/db/delete');

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

    dbDelete.deleteIds(query)
    .then(result => res.json(result))
    .catch(err => res.status(500).send('ER500 - DB query failed'));

})

module.exports = router;