const Rider = require("../../models/Rider");

exports.createRider = async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
      console.error("Mobile number is missing");
      return res.status(400).json({ message: "Mobile number is required" });
  }

  try {
      console.log("Attempting to create new rider with mobile:", mobile);
      
      const newRider = new Rider({ mobile });
      await newRider.save();
      
      console.log("New rider created:", newRider);
      return res.status(201).json(newRider);
  } catch (error) {
      console.error("Error creating rider:", error);
      return res.status(500).json({
          message: "Something went wrong while creating the rider",
          error: error.message,
      });
  }
};
