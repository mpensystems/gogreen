// const Redis = require('ioredis');
const redisClient = require('../../config/redisClient'); 


const initializeBidding = async (bookingId, bidConfig) => {
    try {
        console.log("bidConfig : ",bidConfig);
        const { min_bid, max_bid, steps, step_period } = bidConfig;
        console.log("response from body : ",min_bid, max_bid, steps, step_period)

        await redisClient.hmset(`bidding:${bookingId}`, {
            min_bid: min_bid.toString(),
            max_bid: max_bid.toString(),
            current_bid: min_bid.toString(),
            steps: steps.toString(),
            step_period: step_period.toString(),
            current_step: '0',
            status: 'active',
            started_at: new Date().toISOString()
        });

        // Schedule the first bidding update
        setTimeout(() => updateBiddingSteps(bookingId), step_period * 1000);

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

        if (currentStep < steps && biddingData.status == 'active') {
            console.log("biddingData.status inside : ",biddingData.status);
            const newStep = currentStep + 1;
            const incrementPerStep = (maxBid - minBid) / steps;
            const newBid = minBid + (incrementPerStep * newStep);

            // update the distance to search the rider
            

            await redisClient.hset(biddingKey, {
                current_step: newStep.toString(),
                current_bid: newBid.toString()
            });

            console.log(`Updated bid for booking ${bookingId} to ${newBid}`);


            // if selected by user then change the status and call rider api
            

            // Schedule the next update 
            setTimeout(() => updateBiddingSteps(bookingId), parseInt(biddingData.step_period) * 1000);

        

        } else {
            
            await redisClient.hset(biddingKey, 'status', 'canceled');


            // inside if add mongodb update code
            // chnage the status to trip_started is selected by the rider

           

            console.log(`Bidding ended for booking ${bookingId}`);
        }
    } catch (error) {
        console.error('Error updating bidding steps:', error);
    }
};



const stopBiddingProcess = async (bookingId) => {
    
    const biddingKey = `bidding:${bookingId}`;

    const biddingData = await redisClient.hgetall(biddingKey);
    
    // console.log("biddingData here  : ",biddingData);
    // console.log("biddingData.status before change : ",biddingData.status );


      await redisClient.hset(biddingKey, 'status', 'canceled');
    //   update final bidding in mongodb

    

    //   console.log("biddingData.status after change : ",biddingData.status );

    console.log(`Stopping bidding process for booking ${bookingId}`);
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

