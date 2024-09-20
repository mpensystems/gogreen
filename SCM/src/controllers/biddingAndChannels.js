// const redisClient = require("../config/redisClient");
// const axios = require('axios');
// const h3 = require("h3-js");

// const { initializeBidding, checkBiddingData } = require("./bookingControllers/biddingService");
// const { convertLatLngToH3 } = require("../h3Utils");

// const biddingAndChannels = async (bookingData,lat, lng,bidConfig,bookingId)=>{
// console.log("bookingData",bookingData);
// console.log("lat, lng",lat, lng);
// console.log("bidConfig",bidConfig);
// console.log("bookingId",bookingId);
// try{
//     initializeBiddingTest(bookingData,bookingId,bidConfig,lat, lng);
//     checkBiddingData(bookingId);
// }catch(err){
//     console.log(err);
// }

// };

// const initializeBiddingTest = async(bookingData,bookingId,bidConfig,lat, lng)=>{
// try{
//     console.log("bookingId : ",bookingId);
//     console.log("bidConfig : ",bidConfig);
//     console.log("lat, lng : ",lat, lng);
    
//     const { min_bid, max_bid, steps, step_period } = bidConfig;
//     console.log("response from body : ", min_bid, max_bid, steps, step_period);
    
//     await redisClient.hset(`bidding:${bookingId}`,{
//         min_bid: min_bid.toString(),
//         max_bid: max_bid.toString(),
//         current_bid: min_bid.toString(),
//         steps: steps.toString(),
//         step_period: step_period.toString(),
//         current_step: '0',
//         status: 'active',
//         started_at: new Date().toISOString()
//     });

//     setTimeout(() => updateBiddingStepstest(bookingData,bookingId,lat,lng), step_period * 1000);
// // create channel
// }catch(err){
//     console.log("error in initializeBiddingTest",err)
// }
// }

// const updateBiddingStepstest = async (bookingData,bookingId,lat, lng) => {
//     try {

//         console.log("lat lng in uodate",lat,lng)
//         const biddingKey = `bidding:${bookingId}`;
//         const biddingData = await redisClient.hgetall(biddingKey);

//         if (!biddingData || biddingData.status !== 'active') {
//             console.log('Bidding data not found or not active');
//             return;
//         }

//         const currentStep = parseInt(biddingData.current_step, 10);
//         const steps = parseInt(biddingData.steps, 10);
//         const minBid = parseFloat(biddingData.min_bid);
//         const maxBid = parseFloat(biddingData.max_bid);
//         const stepPeriod = parseInt(biddingData.step_period, 10);

        
//         if (currentStep < steps) {
//             console.log("current step : ", currentStep + 1);

//             // Call the external API to get the new bid and step
//             const response = await axios.post('http://localhost:8001/v1/biddingRoutes/updateBidding', {
//                 currentStep: currentStep,
//                 steps: steps,
//                 minBid: minBid,
//                 maxBid: maxBid
//             });

//             // call redis channels creation according to the current step.
//             const { current_step: newStep, current_bid: newBid } = response.data;
//             console.log("current_step: newStep, current_bid: newBid ",currentStep+1);

//                        // Update the bidding data in Redis
//             await redisClient.hset(biddingKey, {
//                 current_step: newStep.toString(),
//                 current_bid: newBid.toString()
//             });
//             // update new channel

//             processBookingForRedisTest(bookingData,lat, lng, steps,1 ,currentStep+1);


//             // 
//             console.log(`Updated bid for booking ${bookingId} to ${newBid}`);

//             // Schedule the next update
//             setTimeout(() => updateBiddingStepstest(bookingId), stepPeriod * 1000);
//         } else {
//             // End the bidding process
//             await redisClient.hset(biddingKey, 'status', 'canceled');
//             console.log(`Bidding ended for booking ${bookingId}`);
            
//         }
//     } catch (error) {
//         console.error('Error updating bidding steps:', error);
//     }
// };


// const processBookingForRedisTest = async (bookingData,lat, lng, steps, stepSize,currentStep) => {
//     try {
//       // Convert lat/lng to H3 index (resolution 9 is common for neighborhood-level accuracy)
//       console.log("lat, lng, steps, stepSize,currentStep",lat, lng, steps, stepSize,currentStep)
//       const h3Index = convertLatLngToH3(lat, lng, 9);
//       console.log(`Initial H3 Index at resolution 9: ${h3Index}`);
  
//       // Set to track already processed H3 indices
//       const processedIndices = new Set();
  
//       // Recursive function to process each step
//       const processStep = async (currentStep) => {
//         if (currentStep > steps) {
//           console.log('All steps processed successfully.');
//           return;
//         }
  
//         const radius = stepSize * currentStep; // Calculate the radius for this step
//         console.log(`Processing radius step ${currentStep} (${radius} meters)`);
  
//         // Get the H3 indices in the current radius
//         // Assuming `h3.gridDisk` is the correct function; verify the parameters
//         const h3Indices = h3.gridDisk(h3Index, radius);
  
//         console.log(`H3 Indices for step ${currentStep} within ${radius} meters: `, h3Indices);
  
//         // Publish to Redis channels for the H3 indices
//         for (const index of h3Indices) {
//           if (!processedIndices.has(index)) {
//             processedIndices.add(index); // Mark this index as processed
//             const channel = `booking-area-${index}`;
  
//             // Publish booking data to the Redis channel
//             await redisClient.publish(channel, JSON.stringify(bookingData));
//             console.log(`Published to channel: ${channel}`);
//           }
//         }
  
//         console.log(`Messages sent for radius step ${currentStep}.`);
  
//         // Process the next step
//         await processStep(currentStep + 1);
//       };
  
//       // Start processing from step 1
//       await processStep(1);
//     } catch (error) {
//       console.error('Error processing booking:', error);
//     }
//   };
  
// module.exports ={biddingAndChannels}
















// const redisClient = require("../config/redisClient");
// const axios = require('axios');
// const h3 = require("h3-js");

// const { initializeBidding, checkBiddingData } = require("./bookingControllers/biddingService");
// const { convertLatLngToH3 } = require("../h3Utils");

// const biddingAndChannels = async (bookingData, lat, lng, bidConfig, bookingId) => {
//   console.log("bookingData", bookingData);
//   console.log("lat, lng", lat, lng);
//   console.log("bidConfig", bidConfig);
//   console.log("bookingId", bookingId);
//   try {
//     await initializeBiddingTest(bookingData,bookingId, bidConfig, lat, lng);
//     await checkBiddingData(bookingId);
//   } catch (err) {
//     console.error("Error in biddingAndChannels:", err);
//   }
// };

// const initializeBiddingTest = async (bookingData,bookingId, bidConfig, lat, lng) => {
//   try {
//     console.log("bookingId:", bookingId);
//     console.log("bidConfig:", bidConfig);
//     console.log("lat, lng:", lat, lng);
    
//     const { min_bid, max_bid, steps, step_period } = bidConfig;
//     console.log("Bid config:", min_bid, max_bid, steps, step_period);
    
//     await redisClient.hset(`bidding:${bookingId}`, {
//       min_bid: min_bid.toString(),
//       max_bid: max_bid.toString(),
//       current_bid: min_bid.toString(),
//       steps: steps.toString(),
//       step_period: step_period.toString(),
//       current_step: '0',
//       status: 'active',
//       started_at: new Date().toISOString()
//     });

//     // Start the update process after the initial step period
//     setTimeout(() => updateBiddingStepstest(bookingId,bookingData, lat, lng), step_period * 1000);
//   } catch (err) {
//     console.error("Error in initializeBiddingTest:", err);
//   }
// };

// const updateBiddingStepstest = async (bookingId,bookingData, lat, lng) => {
//   try {
//     console.log("lat lng in update", lat, lng);
//     console.log("lat lng in update bookingData", bookingData);
//     const biddingKey = `bidding:${bookingId}`;
//     const biddingData = await redisClient.hgetall(biddingKey);

//     if (!biddingData || biddingData.status !== 'active') {
//       console.log('Bidding data not found or not active');
//       return;
//     }

//     const currentStep = parseInt(biddingData.current_step, 10);
//     const steps = parseInt(biddingData.steps, 10);
//     const minBid = parseFloat(biddingData.min_bid);
//     const maxBid = parseFloat(biddingData.max_bid);
//     const stepPeriod = parseInt(biddingData.step_period, 10);

//     if (currentStep < steps) {
//       console.log("current step:", currentStep + 1);

//       // Call the external API to get the new bid and step
//       const response = await axios.post('http://localhost:8001/v1/biddingRoutes/updateBidding', {
//         currentStep: currentStep,
//         steps: steps,
//         minBid: minBid,
//         maxBid: maxBid
//       });

//       const { current_step: newStep, current_bid: newBid } = response.data;
//       console.log("current_step:", newStep, "current_bid:", newBid);

//       // Update the bidding data in Redis
//       await redisClient.hset(biddingKey, {
//         current_step: newStep.toString(),
//         current_bid: newBid.toString()
//       });

//       // Process the booking for Redis with the new step
//       await processBookingForRedisTest(bookingData,lat, lng, steps, 200, currentStep + 1);

//       console.log(`Updated bid for booking ${bookingId} to ${newBid}`);

//       // Schedule the next update
//       setTimeout(() => updateBiddingStepstest(bookingId,bookingData, lat, lng), stepPeriod * 1000);
//     } else {
//       // End the bidding process
//       await redisClient.hset(biddingKey, 'status', 'canceled');
//       console.log(`Bidding ended for booking ${bookingId}`);
//     }
//   } catch (error) {
//     console.error('Error updating bidding steps:', error);
//   }
// };

// const processBookingForRedisTest = async (bookingData,lat, lng, steps, stepSize, currentStep) => {
//   try {
//     // Convert lat/lng to H3 index (resolution 9 is common for neighborhood-level accuracy)
//     console.log("lat, lng, steps, stepSize, currentStep", lat, lng, steps, stepSize, currentStep);
//     const h3Index = convertLatLngToH3(lat, lng, 9);
//     console.log(`Initial H3 Index at resolution 9: ${h3Index}`);

//     // Set to track already processed H3 indices
//     const processedIndices = new Set();

//     // Recursive function to process each step
//     const processStep = async (step) => {
//       if (step > steps) {
//         console.log('All steps processed successfully.');
//         return;
//       }

//       const radius = stepSize * step; // Calculate the radius for this step
//       console.log(`Processing radius step ${step} (${radius} meters)`);

//       // Get the H3 indices in the current radius
//       const h3Indices = h3.gridDisk(h3Index, radius);

//       console.log(`H3 Indices for step ${step} within ${radius} meters:`, h3Indices);

//       // Publish to Redis channels for the H3 indices
//       for (const index of h3Indices) {
//         if (!processedIndices.has(index)) {
//           processedIndices.add(index); // Mark this index as processed
//           const channel = `booking-area-${index}`;

//           // Publish booking data to the Redis channel
//           await redisClient.publish(channel, JSON.stringify(bookingData));
//           console.log(`Published to channel: ${channel}`);
//         }
//       }

//       console.log(`Messages sent for radius step ${step}.`);

//       // Process the next step
//       await processStep(step + 1);
//     };

//     // Start processing from the current step
//     await processStep(currentStep);
//   } catch (error) {
//     console.error('Error processing booking:', error);
//   }
// };

// module.exports = { biddingAndChannels };
























const redisClient = require("../config/redisClient");
const axios = require('axios');
const h3 = require("h3-js");
const { convertLatLngToH3 } = require("../h3Utils");

// Main function to handle bidding and channels
const biddingAndChannels = async (bookingData, lat, lng, bidConfig, bookingId) => {
    console.log("bookingData:", bookingData);
    console.log("lat, lng:", lat, lng);
    console.log("bidConfig:", bidConfig);
    console.log("bookingId:", bookingId);

    try {
        // Initialize the bidding process and then start updating bids in steps
        await startBiddingProcess(bookingId, bidConfig, lat, lng, bookingData);
    } catch (err) {
        console.log(err);
    }
};

// Initialize the bidding process and store data in Redis
const startBiddingProcess = async (bookingId, bidConfig, lat, lng, bookingData) => {
    try {
        const { min_bid, max_bid, steps, step_period } = bidConfig;
        const biddingKey = `bidding:${bookingId}`;

        // Initialize bidding data in Redis
        await redisClient.hset(biddingKey, {
            min_bid: min_bid.toString(),
            max_bid: max_bid.toString(),
            current_bid: min_bid.toString(),
            steps: steps.toString(),
            step_period: step_period.toString(),
            current_step: '0',
            status: 'active',
            started_at: new Date().toISOString()
        });

        console.log(`Bidding process started for booking ${bookingId}`);

        // Start updating the bidding process at regular intervals
        setTimeout(() => updateBiddingStep(bookingId, lat, lng, bookingData), step_period * 1000);
    } catch (error) {
        console.error('Error starting the bidding process:', error);
    }
};

// Update the bidding step, create Redis channels, and increment the bid
const updateBiddingStep = async (bookingId, lat, lng, bookingData) => {
    try {
        const biddingKey = `bidding:${bookingId}`;
        const biddingData = await redisClient.hgetall(biddingKey);

        if (!biddingData || Object.keys(biddingData).length === 0) {
            console.log(`Bidding data not found for booking ${bookingId}`);
            return;
        }

        if (biddingData.status !== 'active') {
            console.log('Bidding process is not active');
            return;
        }

        const currentStep = parseInt(biddingData.current_step, 10);
        const steps = parseInt(biddingData.steps, 10);
        const minBid = parseFloat(biddingData.min_bid);
        const maxBid = parseFloat(biddingData.max_bid);
        const stepPeriod = parseInt(biddingData.step_period, 10);

        if (currentStep < steps) {
            console.log("Current step:", currentStep + 1);

            // Call the external API to get the new bid for this step
            const response = await axios.post('http://localhost:8001/v1/biddingRoutes/updateBidding', {
                currentStep: currentStep,
                steps: steps,
                minBid: minBid,
                maxBid: maxBid
            });

            const { current_step: newStep, current_bid: newBid } = response.data;
            console.log(`New Step: ${newStep}, New Bid: ${newBid}`);

            // Update the bidding data in Redis
            await redisClient.hset(biddingKey, {
                current_step: newStep.toString(),
                current_bid: newBid.toString()
            });

            // Process H3 channels according to the current step
            await processBookingForRedis(lat, lng, steps, 200, newStep, bookingData);

            console.log(`Updated bid for booking ${bookingId} to ${newBid}`);

            // Schedule the next update
            setTimeout(() => updateBiddingStep(bookingId, lat, lng, bookingData), stepPeriod * 1000);
        } else {
            // End the bidding process
            await redisClient.hset(biddingKey, 'status', 'canceled');
            console.log(`Bidding ended for booking ${bookingId}`);
        }
    } catch (error) {
        console.error('Error updating bidding steps:', error);
    }
};

// Process booking for Redis by creating channels based on H3 indices
const processBookingForRedis = async (lat, lng, steps, stepSize, currentStep, bookingData) => {
    try {
        // Convert lat/lng to H3 index (resolution 9)
        const h3Index = convertLatLngToH3(lat, lng, 9);
        console.log(`Initial H3 Index at resolution 9: ${h3Index}`);

        // Set to track processed H3 indices
        const processedIndices = new Set();

        // Calculate the radius for the current step
        const radius = stepSize * currentStep;
        console.log(`Processing radius step ${currentStep} (${radius} meters)`);

        // Get the H3 indices for the current radius
        const h3Indices = h3.gridDisk(h3Index, currentStep);  // Use currentStep as the radius multiplier

        console.log(`H3 Indices for step ${currentStep} within ${radius} meters: `, h3Indices);

        // Publish booking data to Redis channels for the H3 indices
        for (const index of h3Indices) {
            if (!processedIndices.has(index)) {
                processedIndices.add(index); // Mark this index as processed
                const channel = `booking-area-${index}`;

                // Publish booking data to the Redis channel
                await redisClient.publish(channel, JSON.stringify(bookingData));
                console.log(`Published to channel: ${channel}`);
            }
        }

        console.log(`Messages sent for radius step ${currentStep}.`);
    } catch (error) {
        console.error('Error processing booking:', error);
    }
};

module.exports = { biddingAndChannels };
















