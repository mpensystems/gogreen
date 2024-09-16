// const Redis = require('ioredis');

// const redisClient = new Redis();

// redisClient.on('connect', () => {
//     console.log('Connected to Redis');
// });

// redisClient.on('error', (err) => {
//     console.error('Redis connection error:', err);
// });

// module.exports = redisClient ;








// const Redis = require('ioredis');
// const serviceUri = "rediss://default:AVNS_DlrC98G6NlTHzkjlx6E@redis-go-green-caching-blobcity-go-green.c.aivencloud.com:12202"

// const redisClient = new Redis(serviceUri);

// redisClient.on('connect', () => {
//     console.log('Connected to Redis');
// });

// redisClient.on('error', (err) => {
//     console.error('Redis connection error:', err);
// });





// redisClient.js
require('dotenv').config();

const Redis = require("ioredis");
const serviceUri = process.env.REDIS_URL;

const redisClient = new Redis(serviceUri);

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
});

module.exports = redisClient; 
