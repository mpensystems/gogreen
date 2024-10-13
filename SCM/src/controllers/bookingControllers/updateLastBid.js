
// const Booking = require('../../models/Booking');


// exports.UpdateBidData = async (req, res) => {
//   try {

//     const { bookingId } = req.body;

//     console.log("bookingId : ",bookingId);

    

//     // Check if the rider exists
//     const booking = await Booking.findById(bookingId);
//     if (!booking) {
//       return res.status(404).json({ message: 'Booking not found' });
//     }

//     console.log("booking o update bidding data frommredis : ",booking);

//     // Update the booking with the selected riderId and stop the bidding
//     // const updatedBooking = await Booking.findByIdAndUpdate(
//     //   bookingId,
//     //   { 
//     //     rid: rider._id, 
//     //     status: 'trip_started' 
//     //   },
//     //   { new: true }
//     // );

//     // if (!updatedBooking) {
//     //   return res.status(404).json({ message: 'Booking not found' });
//     // }

//     res.status(200).json(updatedBooking);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

