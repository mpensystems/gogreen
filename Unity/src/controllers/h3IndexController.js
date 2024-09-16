// h3Utils.js
const h3 = require('h3-js');

/**
 * Convert latitude and longitude to an H3 index with a given resolution.
 * @param {number} lat - Latitude of the location
 * @param {number} lng - Longitude of the location
 * @param {number} resolution - H3 resolution 
 * @returns {string} H3 index
 */



// const convertLatLngToH3 = (lat, lng, resolution = 9) => {
//   return h3.geoToH3(lat, lng, resolution);
// };

const validateAndProcessInput = (input) => {
    const { pickup_geo, drop_geo } = input;
    
    if (typeof pickup_geo !== 'object' || typeof drop_geo !== 'object') {
        throw new Error('Invalid input format');
    }
    
    
};



// Controller function to handle the request
exports.convertLatLngToH3 = (req, res) => {
    try {
        console.log("check here : ",req.body);
      const { lat, lng, resolution = 9 } = req.body; 
  
      if (!lat || !lng) {
        return res.status(400).json({ message: 'Latitude and Longitude are required.' });
      }
  
      // Log the incoming data for debugging
      console.log("Received lat:", lat, "lng:", lng);
  
      // Convert lat/lng to H3 index
      const h3Index = h3.latLngToCell(lat, lng, resolution);
  
      // Return the H3 index
      return res.status(200).json({ h3Index });
      
    } catch (error) {
      console.error("Error converting lat/lng to H3:", error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  };

/**
 * Get all H3 indices within the given k-ring distance (area around the central H3).
 * @param {string} h3Index - H3 index of the central location
 * @param {number} distance - The k-ring distance (1 gives approx 400m radius)
 * @returns {string[]} Array of H3 indices within the k-ring distance
 */


// const getH3IndicesInRadius = (h3Index, radius) => {
//     // Convert radius from meters to kilometers
//     const radiusKilometers = radius / 1000;
  
//     // Approximate the radius in k-ring units
//     const k = Math.round(radiusKilometers * 1.4); // Approximation factor for k-ring
  
//     // Get H3 indices within the disk
//     return h3.gridDisk(h3Index, k);
//   };


/**
 * Get H3 indexes within a specified radius from a central H3 index.
 * @param {string} h3Index - Central H3 index.
 * @param {number} radiusInMeters - Radius in meters.
 * @returns {Array<string>} - Array of H3 indexes within the radius.
 */
exports.getH3IndicesInRadius = (h3Index, radiusInMeters) => {
  // Convert radius from meters to the number of hexagons
  const hexagonEdgeLengthKm = 0.7; // Edge length of a hexagon in kilometers at resolution 9
  const correctionFactor = 1.2; // Factor to account for edge effects

  // Calculate the approximate number of hexagons needed
  const radiusInHexagons = Math.ceil(radiusInMeters / (hexagonEdgeLengthKm * 1000 * correctionFactor));

  // Get H3 indices within the disk
  return h3.gridDisk(h3Index, radiusInHexagons);
};



