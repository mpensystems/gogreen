/**
 * This file offers generic functions to perform select operations on MongoDB 
 * and Redis databases depending on the query. 
 * 
 * @author Sanket Sarang <sanket@blobcity.com>
 */

const redisClient = require("../config/redisClient");
const { connectToMongo } = require("./db");
const mongoDb = connectToMongo();

/**
 * Function to fire a generic select query on either Mongo or Redis. 
 * It is capable of running the following conditions:
 * 1. select * from table
 * 2. select * from table where col1 = ''
 * 3. select * from table where col1 = '' and col2 = ''
 * 
 * Currently other operators such as > < <> are not supported in the query. Only = is supported.
 * 
 * @param {*} query the query parameter
 * @returns the result of the select query if the select operation was successful
 */

const fetch = async (query) => new Promise(async (resolve, reject) => {
    switch (query.db) {
        case 'redis':
            resolve(await processRedisQuery(query));
            break;
        case 'mongo':
            resolve(await processMongoQuery(query));
            break;
    }
})

const processRedisQuery = async (query) =>
    new Promise(async (resolve, reject) => {
        if(query.id == '*') {
            //need to pull data corresponding to all keys starting with table:* pattern
            redisClient.keys(`${query.table}:*`, async (err, keys) => {
                let promises = keys.map(key => new Promise(async (resolve) => {
                    let data = await redisClient.hgetall(key);
                    if(Object.keys(data).length == 0) resolve(null);
                    else resolve(data);
                }));
                
                let data = await Promise.all(promises);
                data = data.filter(x => x != null);
                resolve(data);
            })
        } else if(query.id != null) {
            let key = `${query.table}:${query.id}`;
            let data = await redisClient.hgetall(key);
            if(Object.keys(data).length == 0) resolve([]);
            else resolve([data]);
        } else if(query.q != null) {
            //TODO: Run a seach query on an redis column index
            reject('ER500');
        } else {
            reject('ER500');
        }
    });


const processMongoQuery = async (query) => new Promise(async (resolve, reject) => {
    try {
        const collection = mongoDb.collection(query.table);
        const data = await collection.find(query.condition || {}).toArray();
        resolve(data);
    } catch (error) {
        console.log(error);
        reject('ER500');
    }
}) 


module.exports = { fetch }


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