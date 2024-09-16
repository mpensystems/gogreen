const axios = require('axios');

// Base URL for the convert API
const API_BASE_URL = 'http://localhost:8001/v1'; 

// Function to call the convert API
const convertLatLngToH3 = async (lat, lng, resolution = 9) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/h3IndexRoutes/convertLatLngToH3`, {
      lat,
      lng,
      resolution
    });
    return response.data; // Return the H3 index from the backend
  } catch (error) {
    console.error("Error converting lat/lng to H3:", error);
    throw error; // Rethrow the error to handle it in the controller
  }
};

// const initializeBidding = async (bookingId, bidConfig) => {
//   try {
//     const response = await axios.post(`${API_BASE_URL}/`, {
//       lat,
//       lng,
//       resolution
//     });
//     return response.data; // Return the H3 index from the backend
//   } catch (error) {
//     console.error("Error converting lat/lng to H3:", error);
//     throw error; // Rethrow the error to handle it in the controller
//   }
// };

const updateBiddingSteps = async(bookingId, steps, min_bid, max_bid)=>{
  try {
      const response = await axios.post(`${API_BASE_URL}/biddingRoutes/updateBidding`, {
          currentStep: 0,  
          steps,
          minBid: min_bid,
          maxBid: max_bid
      });

      console.log('Updated bidding:', response.data);


  } catch (error) {
      console.error('Error updating bidding:', error);
  }
}





module.exports = { convertLatLngToH3 ,updateBiddingSteps };
