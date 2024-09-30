/**
 * This file offers generic functions to perform update operations
 * on Redis and MongoDB.
 *
 * @author Sanket Sarang <sanket@blobcity.com>
 */

const { json } = require("express");
const redisClient = require("../config/redisClient");
const { connectToMongo } = require("./db");


/**
 * Function to update single record of data in MongoDb or Redis
 * in the table specified.
 *
 * @param {*} query the query parameter
 * @returns true or false confirming status of update
 */

const update = (query) => new Promise(async (resolve, reject) => {
  /*const query = {
  db:mongo / redis
  table: booking / rider 
  rows:[{name:'mukesh' , roll:'Stack} , {name:'mukesh' , roll:'Stack}]
  
}*/

  switch (query.db) {
    case "redis":
      resolve(await processRedisQuery(query));
      break;
    case "mongo":
      resolve(await processMongoQuery(query));
      break;
  }
});

// const processRedisQuery = async (query) =>
//   new Promise((resolve, reject) => {
//     let table = query.table;
//     let rows = query.rows;

//     let insertStatus = [];
//     // rows.forEach((row) => {
//     //   //TODO: perform insert and add status in sequence.

//     //   insertStatus.push(true);
//     // });



//     // //perform an insert operation.

//     // resolve(insertStatus); //rows of records. Must always be an array in response.


//     try {
//       for (const row of rows) {
//         const key = `${table}:${row.id}`; // Create a unique key for each record using an ID
//         await redisClient.set(key, JSON.stringify(row)); // Store the row as a JSON string
//         insertStatus.push({ key, ...row }); // Keep track of inserted records
//       }
//       resolve(insertStatus); // Resolve with the inserted records
//     } catch (error) {
//       reject(error); // Reject the promise if there's an error
//     }
//   });

// const processMongoQuery = async (query) =>
//   new Promise((resolve, reject) => {
//     let table = query.table;   
//     let rows = query.rows;


//      /*const query = {
//     db:mongo / redis
//     table: booking / rider 
//     rows:[{name:'mukesh' , roll:'Stack} , {name:'mukesh' , roll:'Stack}]

// }*/



//     let insertStatus = [];
//     rows.forEach((row) => {
//       //TODO: perform insert and add status in sequence.
//       const newDocument = new table(row);
//       newDocument.save()

//       insertStatus.push(true);
//     });

//     //perform an insert operation.

//     resolve(insertStatus); //rows of records. Must always be an array in response.
//   });


const processRedisQuery = async (query) =>
  new Promise(async (resolve, reject) => {
    reject('ER500 - Yet to implement');
    // const table = query.table;
    // const rows = query.rows;

    // let insertStatus = [];

    // try {
    //   for (const row of rows) {
    //     let key = `${table}:${row.key}`;
    //     if ((row.key == null || key == null)
    //       || row.value == null) {
    //       insertStatus.push(false);
    //       continue;
    //     }
    //     await redisClient.hset(key, row.value);
    //     insertStatus.push(true);
    //   }
    //   resolve({ status: insertStatus });
    // } catch (error) {
    //   console.error("Error during Redis insert:", error);
    //   reject(error);
    // }
  });



const processMongoQuery = async (query) => new Promise(async (resolve, reject) => {
  try {
    const mongoDb = connectToMongo();
    const collection = mongoDb.collection(query.table);
    let result = await collection.updateOne(query.condition, {'$set': query.row}, {upsert: false});
    resolve({updated: true})
  } catch (error) {
    console.log(error);
    reject('ER500');
  }
});

module.exports = { update };

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
