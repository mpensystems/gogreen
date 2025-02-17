// const Redis = require('ioredis');
const redisClient = require('../../config/redisClient'); 
const axios = require('axios');


// const initializeBidding = async (bookingId, bidConfig) => {
//     try {
//         console.log("bidConfig : ",bidConfig);
//         const { min_bid, max_bid, steps, step_period } = bidConfig;
//         console.log("response from body : ",min_bid, max_bid, steps, step_period)

//         await redisClient.hset(`bidding:${bookingId}`, {
//             min_bid: min_bid.toString(),
//             max_bid: max_bid.toString(),
//             current_bid: min_bid.toString(),
//             steps: steps.toString(),
//             step_period: step_period.toString(),
//             current_step: '0',
//             status: 'active',
//             started_at: new Date().toISOString()
//         });

//         // Schedule the first bidding update
//         setTimeout(() => updateBiddingSteps(bookingId), step_period * 1000);

//     } catch (error) {
//         console.error('Error initializing bidding:', error);
//     }
// };



// Initialize Redis Client
const Redis = require('ioredis');
const { processBookingForRedis } = require('../../kafka/kafkaService');
const { insert } = require('../../db/insert');
const { fetch } = require('../../db/fetch');
// const redisClient = new Redis(process.env.REDIS_URL);

const initializeBidding = async (bookingId, bidConfig) => {
    console.log("inside initilize bidding");

    try {
        console.log("bidConfig : ", bidConfig);
        const { min_bid, max_bid, steps, step_period } = bidConfig;
        console.log("response from body : ", min_bid, max_bid, steps, step_period);

       
        // Using hmset for older versions
        // await redisClient.hset(`bidding:${bookingId}`, {
        //     min_bid: min_bid.toString(),
        //     max_bid: max_bid.toString(),
        //     current_bid: min_bid.toString(),
        //     steps: steps.toString(),
        //     step_period: step_period.toString(),
        //     current_step: '0',
        //     status: 'active',
        //     started_at: new Date().toISOString()
        // });



        // using direct query

        const dataToAdd = {
            id: bookingId, // Use bookingId as the unique identifier
            min_bid: min_bid.toString(),
            max_bid: max_bid.toString(),
            current_bid: min_bid.toString(),
            steps: steps.toString(),
            step_period: step_period.toString(),
            current_step: '0',
            status: 'active',
            started_at: new Date().toISOString()
        };

        // Create the query object for inserting into Redis
        const query = {
            db: "redis",
            table: "bidding", 
            rows: [dataToAdd] 
        };


        console.log("Query to Insert:", query);

        // Call the insert function
        const insertStatus = await insert(query);
        console.log("Insert Status:", insertStatus);

        const fetchedData = await fetch({
            db: "redis",
            table: "bidding", 
            conditions: { id: bookingId } // Ensure this matches the type used in dataToAdd
        });
        console.log("Fetched Data:", fetchedData);
        // Schedule the first bidding update
        // setTimeout(() => updateBiddingSteps(bookingId), step_period * 1000,lat,lng);

    } catch (error) {
        console.error('Error initializing bidding:', error);
    }
};





const updateBiddingSteps = async (bookingId) => {
    try {
        const biddingKey = `bidding:${bookingId}`;
        const biddingData = await redisClient.hgetall(biddingKey);

        if (!biddingData || biddingData.status !== 'active') {
            console.log('Bidding data not found or not active');
            return;
        }

        const currentStep = parseInt(biddingData.current_step, 10);
        const steps = parseInt(biddingData.steps, 10);
        const minBid = parseFloat(biddingData.min_bid);
        const maxBid = parseFloat(biddingData.max_bid);
        const stepPeriod = parseInt(biddingData.step_period, 10);

        
        if (currentStep < steps) {
            console.log("current step : ", currentStep + 1);

            // Call the external API to get the new bid and step
            const response = await axios.post('http://localhost:8001/v1/biddingRoutes/updateBidding', {
                currentStep: currentStep,
                steps: steps,
                minBid: minBid,
                maxBid: maxBid
            });

            // call redis channels creation according to the current step.
            const { current_step: newStep, current_bid: newBid } = response.data;

            // Update the bidding data in Redis
            await redisClient.hset(biddingKey, {
                current_step: newStep.toString(),
                current_bid: newBid.toString()
            });
            
            console.log(`Updated bid for booking ${bookingId} to ${newBid}`);

            // Schedule the next update
            setTimeout(() => updateBiddingSteps(bookingId), stepPeriod * 1000);
        } else {
            // End the bidding process
            await redisClient.hset(biddingKey, 'status', 'canceled');
            console.log(`Bidding ended for booking ${bookingId}`);
            
        }
    } catch (error) {
        console.error('Error updating bidding steps:', error);
    }
};



// const updateBiddingSteps = async (bookingId,lat,lng) => {
//     console.log("inside update bidding");
//     try {
//       const biddingKey = `bidding:${bookingId}`;
//       const biddingData = await redisClient.hgetall(biddingKey);
  
//       if (!biddingData || biddingData.status !== 'active') {
//         console.log('Bidding data not found or not active');
//         return;
//       }
  
//       // Ensure all necessary variables are defined
//       const currentStep = parseInt(biddingData.current_step, 10);
//       const steps = parseInt(biddingData.steps, 10);
//       const minBid = parseFloat(biddingData.min_bid);
//       const maxBid = parseFloat(biddingData.max_bid);
//       const stepPeriod = parseInt(biddingData.step_period, 10);
  
//       if (currentStep < steps) {
//         // Call the external API to get the new bid and step
//         const response = await axios.post('http://localhost:8001/v1/biddingRoutes/updateBidding', {
//           currentStep: currentStep,
//           steps: steps,
//           minBid: minBid,
//           maxBid: maxBid
//         });
  
//         const { current_step: newStep, current_bid: newBid } = response.data;
  
//         // Update the bidding data in Redis
//         await redisClient.hset(biddingKey, {
//           current_step: newStep.toString(),
//           current_bid: newBid.toString()
//         });
  
//         console.log(`Updated bid for booking ${bookingId} to ${newBid}`);
  
//         // Ensure processBookingForRedis is called with currentStep and totalSteps
//         await processBookingForRedis( 19.0870, 72.8291, bookingId, newStep, 200,steps);
  
//         // Schedule the next update
//         setTimeout(() => updateBiddingSteps(bookingId), stepPeriod * 1000);
//       } else {
//         // End the bidding process
//         await redisClient.hset(biddingKey, 'status', 'canceled');
//         console.log(`Bidding ended for booking ${bookingId}`);
//       }
//     } catch (error) {
//       console.error('Error updating bidding steps:', error);
//     }
//   };
  
  



const stopBiddingProcess = async (bookingId) => {
    try {
        const biddingKey = `bidding:${bookingId}`;
        await redisClient.hset(biddingKey, 'status', 'canceled');
        
        // Add logic to update MongoDB and handle final bidding data

        console.log(`Stopping bidding process for booking ${bookingId}`);
    } catch (error) {
        console.error('Error stopping bidding process:', error);
    }
};




const checkBiddingData = async (bookingId) => {
    try {
        const biddingKey = `bidding:${bookingId}`;
        const biddingData = await redisClient.hgetall(biddingKey);
        console.log('Bidding Data:', biddingData);
    } catch (error) {
        console.error('Error fetching bidding data:', error);
    }
};




module.exports = {
    initializeBidding,
    updateBiddingSteps,
    stopBiddingProcess,
    checkBiddingData
};
















// const redisClient = require("../../config/redisClient");
// const axios = require("axios");


// const initializeBidding = async (bookingId, bidConfig) => {
//     try {
//         const { min_bid, max_bid, steps, step_period } = bidConfig;

//         await redisClient.hset(`bidding:${bookingId}`, {
//             min_bid: min_bid.toString(),
//             max_bid: max_bid.toString(),
//             current_bid: min_bid.toString(),
//             steps: steps.toString(),
//             step_period: step_period.toString(),
//             current_step: '0',
//             status: 'active',
//             started_at: new Date().toISOString()
//         });

//         // Schedule the first bidding update
//         setTimeout(() => updateBiddingSteps(bookingId), 30 * 1000); // 30 seconds

//     } catch (error) {
//         console.error('Error initializing bidding:', error);
//     }
// };

// const updateBiddingSteps = async (bookingId) => {
//     try {
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
//             const response = await axios.post('http://localhost:8001/v1/biddingRoutes/updateBidding', {
//                 currentStep: currentStep,
//                 steps: steps,
//                 minBid: minBid,
//                 maxBid: maxBid
//             });

//             const { current_step: newStep, current_bid: newBid } = response.data;

//             await redisClient.hset(biddingKey, {
//                 current_step: newStep.toString(),
//                 current_bid: newBid.toString()
//             });

//             console.log(`Updated bid for booking ${bookingId} to ${newBid}`);

//             // Schedule the next update
//             setTimeout(() => updateBiddingSteps(bookingId), stepPeriod * 1000);
//         } else {
//             await redisClient.hset(biddingKey, 'status', 'canceled');
//             console.log(`Bidding ended for booking ${bookingId}`);
//         }
//     } catch (error) {
//         console.error('Error updating bidding steps:', error);
//     }
// };

// module.exports = {
//     initializeBidding,
//     updateBiddingSteps
// };
