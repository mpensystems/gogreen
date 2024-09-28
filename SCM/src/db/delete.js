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
 * Function to a single record as identified by the id parameter or multile repords as identified
 * by the ids paramter from either mongo or redis*
 * @param {*} query the query parameter
 * @returns true or false confirming status of delete. Is an array with a true / false status
 * for corresponding to each id that was to be deleted.
 */

const deleteIds = (query) => new Promise(async (resolve, reject) => {
    switch (query.db) {
      case "redis":
        resolve(await processRedisQuery(query));
        break;
      case "mongo":
        resolve(await processMongoQuery(query));
        break;
    }
  });

const processRedisQuery = async (query) => 
    new Promise(async (resolve, reject) => {
        const key = `${query.table}:${query.id}`
        let deleteStatus = [];

        if(query.id == null && query.ids == null) {
          reject('ER500');
          return;
        }

        if(query.ids == null && query.id != null) {
          query.ids = [query.id];
        }
        
        try {
            for (const id of query.ids) {
                let key = `${table}:${id}`;
                await redisClient.del(key);
                deleteStatus.push(true); 
            }
            resolve({status: deleteStatus}); 
        } catch (error) {
            console.error("Error during Redis delete:", error);
            reject(error); 
        }
    });



const processMongoQuery = async (query) =>

  new Promise(async (resolve, reject) => {

    console.log("insert query in mongodb : ", query);

    const db = await connectToMongo(); 

    const rows = query.rows; 
    const table = query.table; 

    try {

      const collection = db.collection(table); 

      const insertResults = [];
      for (const row of rows) {

        const result = await collection.insertOne(row);
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

module.exports = { deleteIds };

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
