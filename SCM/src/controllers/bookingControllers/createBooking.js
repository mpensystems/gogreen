const Booking = require("../../models/Booking");
const h3 = require("h3-js");
const axios = require("axios");
const { processBookingForKafka, processBookingForRedis } = require("../../kafka/kafkaService");

const {
  initializeBidding,
  checkBiddingData,
} = require("../../controllers/bookingControllers/biddingService");
const { convertLatLngToH3 } = require("../../utility");

const H3_RESOLUTION = 9;

exports.createBooking = async (req, res) => {
  try {
    const {
      pickup_location,
      drop_location,
      // rid,
      status,
      tids,
      channel,
      orderId,
      bidConfig,
    } = req.body;

    console.log("bidconfig to check  : ", bidConfig);

    // const pickupH3 = h3.latLngToCell(
    //   pickup_location.pickup_geo.coordinates[1],
    //   pickup_location.pickup_geo.coordinates[0],
    //   H3_RESOLUTION
    // );

    const pickupH3Result = await convertLatLngToH3(
      pickup_location.pickup_geo.coordinates[1],
      pickup_location.pickup_geo.coordinates[0],
      H3_RESOLUTION
    );


    // Convert drop latitude and longitude to H3 index
    // const dropH3 = h3.latLngToCell(
    //   drop_location.drop_geo.coordinates[1],
    //   drop_location.drop_geo.coordinates[0],
    //   H3_RESOLUTION
    // );


    const dropH3Result = await convertLatLngToH3(
      drop_location.drop_geo.coordinates[1],
      drop_location.drop_geo.coordinates[0],
      H3_RESOLUTION
    );

    const pickupH3i = pickupH3Result.h3Index;
    const dropH3i = dropH3Result.h3Index;


    console.log(
      "here to check before long",
      pickup_location.pickup_geo.coordinates[1]
    );
    console.log(
      "here to check before lat",
      pickup_location.pickup_geo.coordinates[0]
    );

    // Call SCM API to convert pickup and drop lat/lng to H3

    // const pickupH3Response = await axios.post(
    //   "http://localhost:8002/v1/utils/convert",
    //   {
    //     lat: pickup_location.pickup_geo.coordinates[1],
    //     lng: pickup_location.pickup_geo.coordinates[0],
    //   }
    // );

    console.log(
      "here to check drop_location.drop_geo.coordinates[1]",
      drop_location.drop_geo.coordinates[0]
    );
    console.log(
      "here to check drop_location.drop_geo.coordinates[1]",
      drop_location.drop_geo.coordinates[1]
    );

    // const dropH3Response = await axios.post(
    //   "http://localhost:8002/v1/utils/convert",
    //   {
    //     lat: drop_location.drop_geo.coordinates[1],
    //     lng: drop_location.drop_geo.coordinates[0],
    //   }
    // );

    // const pickupH3 = pickupH3Response.data.h3Index;
    // console.log("pickupH3 : ", pickupH3);

    // const dropH3 = dropH3Response.data.h3Index;
    // console.log("dropH3: ", dropH3);

    // Call SCM API to calculate trip distance

    // const distanceResponse = await axios.post(
    //   "http://localhost:8002/v1/utils/distance",
    //   {
    //     pickupH3,
    //     dropH3,
    //   }
    // );

    // if (distanceResponse.status !== 200) {
    //   throw new Error("Failed to calculate trip distance");
    // }

    // console.log(" trip distance in booking ",distanceResponse);

    // let trip_distance = distanceResponse.data.trip_distance;

    // Calculate trip_distance
    let trip_distance;
    const hexagonEdgeLengthKm = 0.7;
    const correctionFactor = 0.5;

    if (pickupH3i === dropH3i) {
      trip_distance = 200;
    } else {
      const path = h3.gridPathCells(pickupH3i, dropH3i);
      
      trip_distance = path.length * hexagonEdgeLengthKm * correctionFactor;

      console.log("Estimated Trip Distance:", trip_distance);
    }

    // Ensure tripDistance is a number
    trip_distance = parseFloat(trip_distance);
    if (isNaN(trip_distance)) {
      throw new Error("Calculated trip distance is not a number");
    }

    // Create a new booking with the provided details
    const newBooking = new Booking({
      pickup_location: {
        ...pickup_location,
        pickup_h3i: pickupH3i,
        pickup_geo: {
          type: "Point",
          coordinates: [
            pickup_location.pickup_geo.coordinates[0], // longitude
            pickup_location.pickup_geo.coordinates[1], // latitude
          ],
        },
      },
      drop_location: {
        ...drop_location,
        drop_h3i: dropH3i, // Add H3 index to drop_location
        drop_geo: {
          type: "Point",
          coordinates: [
            drop_location.drop_geo.coordinates[0], // longitude
            drop_location.drop_geo.coordinates[1], // latitude
          ],
        },
      },
      trip_distance,
      // rid,
      status,
      tids,
      channel,
      orderId,
      bidConfig,
    });

    // Save the booking to the database
    const savedBooking = await newBooking.save();

    // Initialize bidding in Redis using the booking._id as bookingId

    await initializeBidding(savedBooking._id.toString(), bidConfig);

    //   check bidding data --> console
    
    await checkBiddingData(savedBooking._id.toString());


    // Process booking and create Kafka topics

    const radius = 1; // Default radius in km
    const steps = 5; // Number of steps
    const stepSize = 200; // Step size in meters

  //  change to radis pub-sub
   
    // await processBookingForKafka(
    //   pickup_location.pickup_geo.coordinates[1], // Latitude
    //   pickup_location.pickup_geo.coordinates[0], // Longitude
    //   { ...newBooking.toObject() }, // Booking data to send
    //   steps,
    //   stepSize
    // );


   await processBookingForRedis(
    pickup_location.pickup_geo.coordinates[1], // Latitude
      pickup_location.pickup_geo.coordinates[0], // Longitude
      { ...newBooking.toObject() }, // Booking data to send
      steps,
      stepSize
   )


  //  const processBookingForRedis = async (lat, lng, bookingData, steps, stepSize) => {
  //   const h3Index = convertLatLngToH3(lat, lng, 9);
  //   for (let i = 0; i < steps; i++) {
  //     const h3Indices = h3.gridDisk(h3Index, i); // Get H3 indices for each step size (radius)
  //     for (const index of h3Indices) {
  //       const channel = `booking-area-${index}`;
  //       await redis.publish(channel, JSON.stringify(bookingData)); // Publish booking to channel
  //     }
  //   }
  // };
  
    res.status(201).json({
      message: "Booking created and bidding initialized successfully",
      data: savedBooking,
    });
  } catch (error) {
    console.error("Error creating booking:");
    res.status(500).json({
      message: "Error creating booking",
      error: error.message,
    });
  }
};
