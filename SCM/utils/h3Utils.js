// // /utils/h3Utils.js
// const h3 = require("h3-js");

// const H3_RESOLUTION = 9;

// exports.latLngToH3 = async(req,res)=> {

//     const { lat, lng } = req.body;
//     try{

//         console.log("inside calculate to check route :",lat , lng);

//         return h3.latLngToCell(lat, lng, H3_RESOLUTION);
        
//     }catch(err){
//         console.log("error with this api")
//     }
    
// }








// controllers/utilsController.js
const h3 = require('h3-js');
const H3_RESOLUTION = 9;

// Function to convert lat/lng to H3 index
const latLngToH3 = async (req, res) => {
    const { lat, lng } = req.body;  // Destructure lat and lng from the request body
    try {
        const h3Index = h3.latLngToCell(lat, lng, H3_RESOLUTION);  // Convert to H3 index
        res.status(200).json({ h3Index });  // Return the H3 index as JSON
    } catch (err) {
        res.status(500).json({ error: 'Error calculating H3 index', details: err.message });
    }
};



// const calculateTripDistance= async(req, res) => {
//     const {pickupH3, dropH3} = req.body;
//     console.log("inside calculate to check route  req.body", req.body);
//     console.log("inside calculate to check route ",pickupH3);
//     const hexagonEdgeLengthKm = 0.7;
//     const correctionFactor = 0.5;
//     let trip_distance;
    

//     if (pickupH3 === dropH3) {
//         trip_distance = 200;
//     } else {
//         const path = h3.gridPathCells(pickupH3, dropH3);
//         // console.log("path here : ", path);

//         trip_distance = path.length * hexagonEdgeLengthKm * correctionFactor;
//         console.log("trip distance : ", trip_distance);
//     }
//     console.log("trip distance parseFloat(trip_distance) : ", parseFloat(trip_distance));

//     // return parseFloat(trip_distance);
//     return trip_distance;
// }



const calculateTripDistance = async (req, res) => {
    try {
        const { pickupH3, dropH3 } = req.body;

        // Validate that the required parameters are provided
        if (!pickupH3 || !dropH3) {
            throw new Error("Missing required parameters: 'pickupH3' and/or 'dropH3'");
        }

        console.log("inside calculate to check route req.body", req.body);
        console.log("inside calculate to check route pickupH3:", pickupH3);
        console.log("inside calculate to check route dropH3:", dropH3);

        const hexagonEdgeLengthKm = 0.7;
        const correctionFactor = 0.5;
        let trip_distance;

        // Calculate the trip distance
        if (pickupH3 === dropH3) {
            trip_distance = 200;
        } else {
            const path = h3.gridPathCells(pickupH3, dropH3);

            // Check if path calculation was successful
            if (!path || !Array.isArray(path) || path.length === 0) {
                throw new Error("Failed to calculate path between pickup and drop locations");
            }

            trip_distance = path.length * hexagonEdgeLengthKm * correctionFactor;
            console.log("Calculated trip distance:", trip_distance);
        }

        // Ensure trip distance is a valid number
        trip_distance = parseFloat(trip_distance);
        if (isNaN(trip_distance)) {
            throw new Error("Calculated trip distance is not a valid number");
        }

        console.log("Final trip distance:", trip_distance);

        // Return the trip distance as a response
        return res.status(200).json({ trip_distance });
    } catch (error) {
        console.error("Error calculating trip distance:", error);

        // Send an error response to the client
        return res.status(500).json({
            message: "Failed to calculate trip distance",
            error: error.message
        });
    }
};



module.exports = {
    latLngToH3,
    calculateTripDistance
};
