// const Booking = require("../../models/Booking");

// exports.getAllBookings = async (req, res) => {
//     try {
  
//     console.log("inside the get all booking")
//       const bookings = await Booking.find();
  
//       console.log("All riders found:", bookings);
  
//       return res.status(200).json({
//         message: "All booking details",
//         bookings,
//       });
  
  
//     } catch (error) {
//       console.error("Error fetching all booking:", error);
  
//       return res.status(500).json({
//         message: "Something went wrong",
//         error: error.message,
//       });
//     }
//   };
  