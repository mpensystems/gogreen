
const { sendBookingSelection } = require('../../kafka/producer');
const Booking = require('../../models/Booking');
const Rider = require('../../models/Rider');


exports.selectBooking = async (req, res) => {
  try {

    // need to interchange if needed

    const { bookingId } = req.params;
    const { riderId } = req.body;

    console.log("bookingId : ",bookingId);
    console.log("riderId : ",riderId);

    
    // kafka 
    await sendBookingSelection(riderId, bookingId);

    // Check if the rider exists
    const rider = await Rider.findById(riderId);
    if (!rider) {
      return res.status(404).json({ message: 'Rider not found' });
    }

    // Update the booking with the selected riderId and stop the bidding
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { 
        rid: rider._id, 
        status: 'trip_started' 
      },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json(updatedBooking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

