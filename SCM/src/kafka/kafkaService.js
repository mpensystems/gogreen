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





module.exports = { processBookingForKafka };
