// Controller for updating bidding data
exports.updateBidding = async (req, res) => {
    

    try {
        const { currentStep, steps, minBid, maxBid } = req.body;

        // Calculate the increment per step
        const incrementPerStep = (maxBid - minBid) / (steps - 1);

        // Calculate the new bid based on the current step
        let newBid;
        if (currentStep < steps) {
            // Calculate the bid for the current step
            newBid = minBid + (incrementPerStep * currentStep);

            // Ensure bid does not exceed maxBid
            newBid = Math.min(newBid, maxBid);

            // Prepare the response
            res.json({
                current_step: currentStep + 1,
                current_bid: newBid,
                status: 'active'
            });
        } else {
            // End the bidding
            res.json({
                current_step: currentStep,
                current_bid: maxBid, // Ensure last bid is the max bid
                status: 'finished'
            });
        }
    } catch (error) {
        console.error('Error in bidding logic:', error);
        res.status(500).json({ message: 'Error in bidding logic' });
    }
    
    
};
