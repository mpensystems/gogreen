const { convertLatLngToH3, getH3IndicesInRadius } = require('../h3Utils');
const { connectKafka, disconnectKafka, createKafkaTopic, produceMessage } = require('../config/kafkaConfig');

/**
 * Process a booking by creating Kafka topics based on H3 index of the pickup location.
 * @param {number} lat - Latitude of the pickup location
 * @param {number} lng - Longitude of the pickup location
 * @param {object} bookingData - Data related to the booking to send to Kafka topics
 * @param {number} steps - Number of steps, with each step representing a radius increment (in meters)
 * @param {number} stepSize - Size of each step (in meters)
 */



// const processBookingForKafka = async (lat, lng, bookingData, steps, stepSize) => {

//   try {
//     await connectKafka();
//     // console.log("after connected to kafka");

//     const h3Index = convertLatLngToH3(lat, lng, 9);

//     console.log("after convertLatLngToH3 : ", h3Index);
//     const processedIndices = new Set();
// let msg;
//     for (let i = 0; i < steps; i++) {
//       const radius = stepSize * (i + 1);
//       console.log("radius ", radius);

//       const k = Math.round(radius / 1000 * 1.4);
//       console.log("k here :", k);

//       const h3Indices = getH3IndicesInRadius(h3Index, k);
//       console.log("h3Indices : ",h3Indices)

//       for (const index of h3Indices) {
//         await createKafkaTopic(index);
//         await produceMessage(`booking-area-${index}`, bookingData);
//       }


//       for (const index of h3Indices) {
//         if (!processedIndices.has(index)) {
//           processedIndices.add(index);
//           await createKafkaTopic(index);
//         }
//         msg = await produceMessage(`booking-area-${index}`, bookingData);
//       }
      
//       console.log(`Topics created and booking data sent for radius step ${i + 1} (${radius} meters).`);
//     }
    
//     console.log('Booking processed and topics created successfully.',msg);
//   } catch (error) {
//     console.error('Error processing booking:', error);
//   } finally {
//     await disconnectKafka();
//   }
// };


const h3 = require("h3-js");


const processBookingForKafka = async (lat, lng, bookingData, steps, stepSize) => {
  try {
    await connectKafka();
    const h3Index = convertLatLngToH3(lat, lng, 9);
    
const hexagonsAround = h3.gridDisk(h3Index, 2);
console.log(`H3 Index at resolution 9: ${h3Index}`);
console.log(`All H3 indexes within approximately 200 meters: ${hexagonsAround}`);

    console.log("Initial H3 Index: ", h3Index);

    const processedIndices = new Set();

    for (let i = 0; i < steps; i++) {
      const radius = stepSize * (i + 1);
      console.log(`Processing radius step ${i + 1} (${radius} meters)`);

      // const k = Math.round(radius / 1000 * 1.4);
      // console.log("Calculated k: ", k);

      // const h3Indices = getH3IndicesInRadius(h3Index, k);
      const h3Indices = h3.gridDisk(h3Index, i);

      console.log(`H3 Indices for step ${i + 1} within ${radius} meters: `, h3Indices);

      for (const index of h3Indices) {
        if (!processedIndices.has(index)) {
          processedIndices.add(index);
          await createKafkaTopic(index);
        }
        await produceMessage(`booking-area-${index}`, bookingData);
      }
      
      console.log(`Topics created and booking data sent for radius step ${i + 1}.`);
    }

    console.log('Booking processed and topics created successfully.');
  } catch (error) {
    console.error('Error processing booking:', error);
  } finally {
    await disconnectKafka();
  }
};
const Redis = require('ioredis');
// const h3 = require('h3-js');
const redis = require('../config/redisClient'); 
const redisClient = require('../config/redisClient');



// Function to process booking and handle Redis Pub/Sub
// const processBookingForRedis = async (lat, lng, bookingData, steps, stepSize) => {
//   try {
//     const h3Index = convertLatLngToH3(lat, lng, 9);
//     const hexagonsAround = h3.gridDisk(h3Index, 2);
//     console.log(`H3 Index at resolution 9: ${h3Index}`);
//     console.log(`All H3 indexes within approximately 200 meters: ${hexagonsAround}`);

//     console.log("Initial H3 Index: ", h3Index);

//     const processedIndices = new Set();

//     for (let i = 0; i < steps; i++) {
//       const radius = stepSize * (i + 1);
//       console.log(`Processing radius step ${i + 1} (${radius} meters)`);

//       const h3Indices = h3.gridDisk(h3Index, i);

//       console.log(`H3 Indices for step ${i + 1} within ${radius} meters: `, h3Indices);

//       for (const index of h3Indices) {
//         if (!processedIndices.has(index)) {
//           processedIndices.add(index);
//           const channel = `booking-area-${index}`;
//           // console.log(`Publishing to channel: ${channel}`);
//           await redis.publish(channel, JSON.stringify(bookingData));
//         }
//       }

//       console.log(`Messages sent for radius step ${i + 1}.`);
//     }

//     console.log('Booking processed and messages sent successfully.');
//   } catch (error) {
//     console.error('Error processing booking:', error);
//   } 
// };





const processBookingForRedis = async (lat, lng, bookingData, steps, stepSize) => {
  try {
    // Convert lat/lng to H3 index (resolution 9 is common for neighborhood-level accuracy)
    const h3Index = convertLatLngToH3(lat, lng, 9);
    console.log(`Initial H3 Index at resolution 9: ${h3Index}`);

    // Set to track already processed H3 indices
    const processedIndices = new Set();

    // Process each step to increase the radius and publish booking data
    for (let i = 0; i < steps; i++) {
      const radius = stepSize * (i + 1); // Calculate the radius for this step
      console.log(`Processing radius step ${i + 1} (${radius} meters)`);

      // Get the H3 indices in the current radius
      const h3Indices = h3.gridDisk(h3Index, i);

      console.log(`H3 Indices for step ${i + 1} within ${radius} meters: `, h3Indices);

      // Publish to Redis channels for the H3 indices
      for (const index of h3Indices) {
        if (!processedIndices.has(index)) {
          processedIndices.add(index); // Mark this index as processed
          const channel = `booking-area-${index}`;
          
          // Publish booking data to the Redis channel
          await redis.publish(channel, JSON.stringify(bookingData));
          console.log(`Published to channel: ${channel}`);
        }
      }

      console.log(`Messages sent for radius step ${i + 1}.`);
    }

    console.log('Booking processed and messages sent successfully.');
  } catch (error) {
    console.error('Error processing booking:', error);
  }
};
const riderSubscriptions = {};


//without socket testing rider as subscriber 
// const subscribeToRiderChannels = async (riderLat, riderLng) => {
//   // const riderH3Index = convertLatLngToH3(riderLat, riderLng, 9);
//   console.log("rider location lat lon ",riderLat, riderLng);

//   const riderH3Index =  convertLatLngToH3(
//     riderLat, riderLng, 9
//   );

//   const surroundingH3Indices = h3.gridDisk(riderH3Index, 1); // Get H3 indices within 200m


//   riderSubscriptions[riderId] = riderSubscriptions[riderId] || [];
  
//   surroundingH3Indices.forEach(index => {
//     const channel = `booking-area-${index}`;
//     redisClient.subscribe(channel);
//   });

//   if (!riderSubscriptions[riderId].includes(channel)) {
//     riderSubscriptions[riderId].push(channel); // Track the subscription
//     redisClient.subscribe(channel); // Subscribe to the channel
//   }
//   redisClient.on('message', (channel, message) => {
//     const booking = JSON.parse(message);
//     console.log(`New booking received on channel ${channel}:`, booking);
//   });
// }; 





const subscribeToRiderChannels = async (riderId, riderLat, riderLng) => {
  try {
    console.log("Rider Latitude:", riderLat);
    console.log("Rider Longitude:", riderLng);

    // Check if lat/lng are valid
    if (!riderLat || !riderLng || riderLat < -90 || riderLat > 90 || riderLng < -180 || riderLng > 180) {
      console.error('Invalid latitude or longitude provided');
      return;
    }

    // Convert lat/lng to H3 index
    const riderH3Index = convertLatLngToH3(riderLat, riderLng, 9);
    const surroundingH3Indices = h3.gridDisk(riderH3Index, 1); // Get H3 indices within a small radius

    // Initialize subscriptions for rider
    riderSubscriptions[riderId] = riderSubscriptions[riderId] || [];

    // Subscribe to channels
    surroundingH3Indices.forEach(index => {
      const channel = `booking-area-${index}`;
      
      if (!riderSubscriptions[riderId].includes(channel)) {
        riderSubscriptions[riderId].push(channel); // Track the subscription
        redisClient.subscribe(channel); // Subscribe to the channel
        console.log(`Subscribed to channel: ${channel}`);
      }
    });

    // Handle incoming messages
    redisClient.on('message', (channel, message) => {
      const booking = JSON.parse(message);
      console.log(`New booking received on channel ${channel}:`, booking);
    });

  } catch (error) {
    console.error('Error in subscribing to channels:', error);
  }
};

module.exports = { processBookingForKafka ,processBookingForRedis ,subscribeToRiderChannels};
