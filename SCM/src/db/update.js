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
    reject('ER500 - Yet to implement');
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
 * SAMPLE REQUEST TO update Mongo.Bookings
 *
 * {
 *      db: 'mongo',
 *      table: 'Bookings',
 *      condition: {
 *        col1: 'value to compare'
 *      }
 *      row: {
 *        //new values to update to
 *      }
 * }
 */
