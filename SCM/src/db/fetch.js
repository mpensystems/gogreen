/**
 * This file offers generic functions to perform select operations on MongoDB 
 * and Redis databases depending on the query. 
 * 
 * @author Sanket Sarang <sanket@blobcity.com>
 */

const redisClient = require("../config/redisClient");
const { connectToMongo } = require("./db");

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
     console.log('query in fetch',query);

    switch(query.db) {
        case 'redis':
            resolve(await processRedisQuery(query));
            break;
        case 'mongo':
            resolve(await processMongoQuery(query));
            break;
    }   
})

// const processRedisQuery = async (query) => new Promise((resolve, reject) => {
//     let table = query.table;

//     //run the query on Redis resolve or reject depending on outcome

//     resolve([]); //rows of records. Must always be an array in response.
// })



// for conditions 

// const processRedisQuery = async (query) => 
//     new Promise(async (resolve, reject) => {
//         console.log(" query in redis : ",query);
//       const table = query.table; // The collection/table name (e.g., 'bidding')
//       const conditions = query.conditions; // Conditions for fetching records (e.g., { id: '12345' })
  
//       let fetchedData = [];
      
//       try {
//         // Create a unique key for the record based on the provided conditions
//         const key = `${table}:${conditions.id}`; 
  
//         // Fetch the data from Redis
//         const data = await redisClient.hgetall(key); // Fetch the hash associated with the key
  
//         if (data) {
//           // If data exists, convert it to the appropriate format
//           fetchedData.push({
//             id: conditions.id, // Add the ID
//             ...data // Spread the fetched data
//           });
//         }
//         console.log("Fetched Data: ", fetchedData);
//         resolve(fetchedData); // Resolve with the fetched records
//       } catch (error) {
//         reject(error); // Reject the promise if there's an error
//       }
//     });





const processRedisQuery = async (query) => 
    new Promise(async (resolve, reject) => {
        console.log("Processing Redis Query:", query);
        const table = query.table; 
        const conditions = query.conditions; 

        let fetchedData = [];

        try {
            if (conditions && conditions.id) {
                const key = `${table}:${conditions.id}`; 
                const data = await redisClient.hgetall(key); 
                if (data) {
                    fetchedData.push({
                        id: conditions.id,
                        ...data
                    });
                }
            } else {
                const keys = await redisClient.keys(`${table}:*`); 
                for (const key of keys) {
                    const data = await redisClient.hgetall(key); 
                    if (data) {
                        fetchedData.push({
                            id: key.split(":")[1], 
                            ...data
                        });
                    }
                }
            }

            console.log("Fetched Data:", fetchedData);
            resolve(fetchedData); 
        } catch (error) {
            console.error("Error fetching data from Redis:", error);
            reject(error); 
        }
    });

  

// const processMongoQuery = async (query) => new Promise((resolve, reject) => {
//     let table = query.table;

//     //run the query on Mongo and resolve or reject depending on outcome

//     resolve([]); //rows of records. Must always be an array in response.
// })




const processMongoQuery = async (query) => {

    try {
      const db = await connectToMongo(); 

      const collection = db.collection(query.table); 
      const data = await collection.find(query.conditions || {}).toArray(); 
      return data; 
    } catch (error) {
      throw error;
    }
  };

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