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