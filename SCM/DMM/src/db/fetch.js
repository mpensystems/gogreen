/**
 * Function to fire a generic select query on either Mongo or Redis. 
 * It is capable of running the following conditions:
 * 1. select * from table
 * 2. select * from table where col1 = ''
 * 3. select * from table where col1 = '' and col2 = ''
 * 
 * Currently other operators such as > < <> are not supported in the query. Only = is supported.
 * 
 * @param {*} query 
 * @returns 
 */

const fetch = async (query) => new Promise(async (resolve, reject) => {

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

    //run the query on Redis resolve or reject depending on outcome
})

const processMongoQuery = async (query) => new Promise((resolve, reject) => {
    let table = query.table;

    //run the query on Mongo and resolve or reject depending on outcome
})

module.exports = {fetch}


/**
 * ---------------------------------------------------------
 * SAMPLE REQUEST TO FETCH Redis.BookingBids for bid = 1000
 * 
 * {
 *      db: 'redis',
 *      table: 'BookingBids',
 *      q: {
 *          bid: '1000'
 *      }
 * }
 * 
 * ---------------------------------------------------------
 * SAMPLE REQUEST TO FETCH Mongo.Bookings for bid = 10000
 * 
 * {
 *      db: 'mongo',
 *      table: 'Bookings',
 *      q: {
 *          bid: '1000'
 *      }
 * }
 * 
 * Equivalent to SELECT * from Bookings where bid = '1000'
 * 
 * ---------------------------------------------------------
 *  Multi-parameter search. "AND equals"
 * 
 * {
 *      db: 'redis',
 *      table: 'RiderOtp',
 *      q: {
 *          mobHash: 'XXXX',
 *          otpHash: 'YYYY'
 *      }
 * }
 * 
 * Equivalent to SELECT * from RiderOtp where mobHash = 'XXXX' and otpHash = 'YYYY' 
 *
 */