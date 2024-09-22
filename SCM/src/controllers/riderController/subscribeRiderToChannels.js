const redisClient = require("../../config/redisClient");
const { convertLatLngToH3 } = require("../../utility");
const h3 = require("h3-js");

const subscribedChannels = {}; // Stored subscribed channels for each rider by their riderId

// Function to unsubscribe a rider from their old channels before subscribing to new 

const unsubscribeRiderFromOldChannels = (riderId) => {
    const channels = subscribedChannels[riderId] || [];
    channels.forEach(channel => {
        redisClient.unsubscribe(channel, (err, count) => {
            if (err) {
                console.error(`Error unsubscribing rider ${riderId} from channel ${channel}:`, err);
            } else {
                console.log(`Rider ${riderId} unsubscribed from channel ${channel}`);
            }
        });
    });
    // Clear old subscriptions
    subscribedChannels[riderId] = [];
};

// Update the subscribeRiderToChannels function to track subscriptions
const subscribeRiderToChannels = async (riderId, lat, lng) => {
    try {
        // Convert latitude and longitude to H3 index
        const riderH3 = await convertLatLngToH3(lat, lng, 9);
        const riderH3Index = riderH3.h3Index;

        const radiusSteps = 2; // Define the subscription radius
        const riderH3Indices = h3.gridDisk(riderH3Index, radiusSteps);
        
        console.log(`Rider H3 indices within radius: ${riderH3Indices}`);

        // Unsubscribe rider from old channels before subscribing to new ones
        unsubscribeRiderFromOldChannels(riderId);

        // Subscribe to new channels and store the channels in the subscribedChannels map
        subscribedChannels[riderId] = [];
        riderH3Indices.forEach(index => {
            const channel = `booking-area-${index}`;
            redisClient.subscribe(channel, (err, count) => {
                if (err) {
                    console.error(`Error subscribing rider ${riderId} to channel ${channel}:`, err);
                } else {
                    console.log(`Rider ${riderId} subscribed to channel ${channel} (${count} total subscriptions)`);
                    subscribedChannels[riderId].push(channel); // Track the subscription
                }
            });
        });

        // Listen for messages from the subscribed channels
        redisClient.on('message', (channel, message) => {
            console.log(`Rider ${riderId} received message from channel ${channel}:`, message);
            handleNewBooking(riderId, message);
        });
    } catch (error) {
        console.error(`Error subscribing rider ${riderId} to channels:`, error);
    }
};



module.exports = {subscribeRiderToChannels}