// const Rider = require("../../models/Rider");

// exports.deleteRider = async (req, res) => {
//   const { riderId } = req.params;

//   if (!riderId) {
//     console.error("Rider ID is missing");
//     return res.status(400).json({ message: "Rider ID is required" });
//   }

//   try {
//     const rider = await Rider.findById(riderId);

//     if (!rider) {
//       console.error(`No rider found with ID: ${riderId}`);
//       return res.status(404).json({ message: "Rider not found" });
//     }

//     await Rider.findByIdAndDelete(riderId);
//     console.log(`Rider with ID ${riderId} deleted successfully`);

//     return res.status(200).json({ message: "Rider deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting rider:", error);
//     return res.status(500).json({
//       message: "Something went wrong, rider could not be deleted",
//       error: error.message,
//     });
//   }
// };
