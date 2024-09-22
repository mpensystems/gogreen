// Notify riders about new bidding step and updated radius
const notifyRidersAboutBiddingStep = async (bookingId, currentStep, stepRadius, channel) => {
    try {
        // Construct the message to notify the riders
        const message = {
            bookingId: bookingId,
            currentStep: currentStep,
            stepRadius: stepRadius,
            message: `New bidding step ${currentStep} with radius ${stepRadius}m`
        };

        // Publish the message to the channel where riders are subscribed
        await redisClient.publish(channel, JSON.stringify(message));
        console.log(`Notified riders in channel ${channel} about step ${currentStep}`);
    } catch (error) {
        console.error('Error notifying riders about bidding step:', error);
    }
};

module.exports = {notifyRidersAboutBiddingStep}