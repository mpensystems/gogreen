const mongoose = require("mongoose");
const config = require("../config/config.js");

// Determine environment
const env =  "development";

// Get MongoDB URI from config
const dbconfig = config[env].mongoURI;

const connectDB = async () => {
  try {
    await mongoose.connect(dbconfig);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error: ", err);
    process.exit(1); 
  }
};

module.exports = connectDB;
