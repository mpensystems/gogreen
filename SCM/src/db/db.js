// const mongoose = require("mongoose");
// const config = require("../config/config.js");

// // Determine environment
// const env =  "development";

// // Get MongoDB URI from config
// const dbconfig = config[env].mongoURI;

// const connectDB = async () => {
//   try {
//     await mongoose.connect(dbconfig);
//     console.log("MongoDB connected successfully");
//   } catch (err) {
//     console.error("MongoDB connection error: ", err);
//     process.exit(1); 
//   }
// };

// module.exports = connectDB;





















// // dbConnection.js for insert function
const { MongoClient } = require('mongodb');

// MongoDB connection settings
const url = 'mongodb+srv://muthus:MXA9zQsUdVaAZzz7@efbs.nwp3m7o.mongodb.net/?retryWrites=true&w=majority&appName=eFBS';
const dbName = 'eFBS'; 
const client = new MongoClient(url);

// Function to connect to MongoDB and return the database instance
function connectToMongo() {
  try {
    // Connect to MongoDB
    // await client.connect();
    // console.log('Connected successfully to MongoDB Atlas');
    
    // Return the database instance
    return client.db(dbName);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    throw err; // Propagate the error to handle it in the calling function
  }
}

module.exports = { connectToMongo };
