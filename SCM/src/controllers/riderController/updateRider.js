// const Rider = require("../../models/Rider");

// exports.UpdateRider = async (req, res) => {
//   try {
//     const { riderId } = req.params;
//     console.log("rider id : ", riderId);

//     const findRider = await Rider.findById(riderId);

//     if (!findRider) {
//       return res.status(404).json({
//         message: "Rider not found",
//       });
//     }
//     const updatedData = req.body;
//     console.log("updatedData here from body : ", updatedData);

//     const updateRider = await Rider.findByIdAndUpdate(riderId, updatedData, {
//       new: true,
//     });

//     console.log("Updated Rider: ", updateRider);
//     res.status(200).json(updateRider);
//   } catch (error) {
//     res.status(500).json({
//       message: "Something went wrong",
//       error: error.message,
//     });
//   }
// };
