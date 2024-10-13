
// const redisClient = require('../../config/redisClient');
// const { sendBookingSelection } = require('../../kafka/producer');
// const Booking = require('../../models/Booking');
// const Rider = require('../../models/Rider');


// exports.selectBooking = async (req, res) => {
//   try {

//     // need to interchange if needed

//     const { bookingId } = req.params;
//     const { riderId } = req.body;

//     console.log("bookingId : ",bookingId);
//     console.log("riderId : ",riderId);


//      // Redis: Fetch the current bidding data
//      const biddingKey = `bidding:${bookingId}`;
//      const biddingData = await redisClient.hgetall(biddingKey);
 
//      if (!biddingData || Object.keys(biddingData).length === 0) {
//        return res.status(404).json({ message: 'Bidding data not found in Redis' });
//      }
 
//      if (biddingData.status !== 'active') {
//        return res.status(400).json({ message: 'Bidding process is not active' });
//      }
 
//      // Redis: Update the bidding status to 'trip_started' to stop further bidding
//      await redisClient.hset(biddingKey, 'status', 'trip_started');
//      console.log(`Bidding status updated to 'trip_started' for booking ${bookingId} in Redis`);
 
// //  update the current bid to final bid


    
//     // kafka 
//     // await sendBookingSelection(riderId, bookingId);

//     // Check if the rider exists
//     const rider = await Rider.findById(riderId);
//     if (!rider) {
//       return res.status(404).json({ message: 'Rider not found' });
//     }

//     // Update the booking with the selected riderId and stop the bidding
//     const updatedBooking = await Booking.findByIdAndUpdate(
//       bookingId,
//       { 
//         rid: rider._id, 
//         status: 'trip_started' 
//       },
//       { new: true }
//     );

//     // convert to trip 

    
//     if (!updatedBooking) {
//       return res.status(404).json({ message: 'Booking not found' });
//     }

//     res.status(200).json(updatedBooking);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

