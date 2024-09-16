/**
 * This file offers generic functions to perform insert operations
 * on Redis and MongoDB.
 * 
 * @author Sanket Sarang <sanket@blobcity.com>
 */

/**
 * Function to insert single or several rows of data into MongoDb or Redis 
 * in the table specified.
 * 
 * @param {*} query the query parameter
 * @returns true or false confirming status of insert. Is an array with a true / false status
 * for corresponding to each row of insert.
 */

const insert = async (query) => new Promise(async (resolve, reject) => {

    switch(query.db) {
        case 'redis':
            resolve(await processRedisQuery(query));
            break;
        case 'mongo':
            resolve(await processMongoQuery(query));
            break;
    }   
})

const processRedisQuery = async (query) => new Promise((resolve, reject) => {
    let table = query.table;
    let rows = query.rows;

    let insertStatus = [];
    rows.forEach(row => {
        
        //TODO: perform insert and add status in sequence.

        insertStatus.push(true);
    })

    //perform an insert operation. 

    resolve(insertStatus); //rows of records. Must always be an array in response.
})

const processMongoQuery = async (query) => new Promise((resolve, reject) => {
    let table = query.table;
    let rows = query.rows;

    let insertStatus = [];
    rows.forEach(row => {
        
        //TODO: perform insert and add status in sequence.

        insertStatus.push(true);
    })

    //perform an insert operation. 

    resolve(insertStatus); //rows of records. Must always be an array in response.    
})

module.exports = {insert}


/**
 * ---------------------------------------------------------
 * SAMPLE REQUEST TO insert Redis.BookingBids
 * 
 * {
 *      db: 'redis',
 *      table: 'BookingBids',
 *      rows: [
 *          {},
 *          {}
 *      ]
 * }
 * 
 * ---------------------------------------------------------
 * SAMPLE REQUEST TO insert Mongo.Bookings
 * 
 * {
 *      db: 'mongo',
 *      table: 'Bookings',
 *      rows: [
 *          {},
 *          {}
 *      ]
 * }
 */