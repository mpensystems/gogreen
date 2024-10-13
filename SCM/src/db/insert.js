/**
 * This file offers generic functions to perform insert operations
 * on Redis and MongoDB.
 *
 * @author Sanket Sarang <sanket@blobcity.com>
 */

const { json } = require("express");
const redisClient = require("../config/redisClient");
const { connectToMongo } = require("./db");

/**
 * Function to insert single or several rows of data into MongoDb or Redis
 * in the table specified.
 *
 * @param {*} query the query parameter
 * @returns true or false confirming status of insert. Is an array with a true / false status
 * for corresponding to each row of insert.
 */

const insert = (query) => new Promise(async (resolve, reject) => {
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
        const table = query.table; 
        const rows = query.rows;    

        let insertStatus = [];

        try {
            for (const row of rows) {
                let key = `${table}:${row.key}`;
                if((row.key == null || key == null) 
                || row.value == null) {
                  insertStatus.push(false);
                  continue;
                }
                await redisClient.hset(key, row.value);
                insertStatus.push(true); 
            }
            resolve({status: insertStatus}); 
        } catch (error) {
            console.error("Error during Redis insert:", error);
            reject(error); 
        }
    });



const processMongoQuery = async (query) =>

  new Promise(async (resolve, reject) => {
    const db = await connectToMongo(); 

    const rows = query.rows; 
    const table = query.table;
    const replace = query.replace; 

    try {
      const collection = db.collection(table); 
      const insertResults = [];
      for (const row of rows) {
        let result;
        if(replace != null && replace && row._id != null) {
          result = await collection.replaceOne(row);
        } else {
          result = await collection.insertOne(row);
        }
        
        insertResults.push({
          insertedId: result.insertedId,
          ...row, 
        });
      }
      resolve(insertResults); 
    } catch (error) {
      reject(error); 
    } 
  });

module.exports = { insert };

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
