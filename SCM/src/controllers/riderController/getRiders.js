const Rider = require("../../models/Rider");

exports.getRider = async (req, res) => {
  const { riderId } = req.params;

  if (!riderId) {
    console.error("Rider ID is missing");
    return res.status(404).json({ message: "Rider not found" });
  }

  try {
    const rider = await Rider.findById(riderId);

    if (!rider) {
      console.error(`No rider found with ID: ${riderId}`);
      return res.status(404).json({ message: "Rider not found" });
    }

    console.log("Rider found:", rider);
    return res.status(200).json({ message: "Rider found", rider });

  } catch (error) {

    console.error("Error fetching rider:", error);
    
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};






exports.getAllRiders = async (req, res) => {
  try {

    const riders = await Rider.find();

    console.log("All riders found:", riders);

    return res.status(200).json({
      message: "All riders details",
      riders,
    });


  } catch (error) {
    console.error("Error fetching all riders:", error);

    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};
