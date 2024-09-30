/**
 * Generic API to update data int Redis or Mongo depending on the specified query. 
 * Supports bulk update, wherein records matching a condition are updated.
 * 
 * @author Sanket Sarang <sanket@blobcity.com>
 */

var express = require('express');
var router = express.Router();
const dbUpdate = require('../../../src/db/update');

router.post('/', (req, res) => {
    let query = req.body;     

    /*const query = {
    db:mongo / redis
    table: booking / rider 
    rows:[{name:'mukesh' , roll:'Stack} , {name:'mukesh' , roll:'Stack}]
    
}*/
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

    dbUpdate.update(query)
    .then(result => res.json(result))
    .catch(err => res.status(500).send('ER500 - DB query failed'));

})

module.exports = router;