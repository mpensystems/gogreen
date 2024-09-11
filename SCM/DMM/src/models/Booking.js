const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Rider = require('../models/Rider');
const { v4: uuidv4 } = require('uuid'); // For generating UUIDs



const BookingSchema = new Schema({
    bid: {
        type: String,
        default: uuidv4,  
        unique: true,
        required: true,
      },
    pickup_location : {
        pickup_address1: {
            type: String,
          },
        pickup_address2: {
            type: String,
          },
          pickup_house: {
            type: String,
          },
          pickup_landmark: {
            type: String,
          },
          pickup_zip: {
            type: String,
          },
          pickup_city: {
            type: String,
          },
          pickup_state: {
            type: String,
          },
          pickup_district: {
            type: String,
          },
          pickup_mobile: {
            type: String,
          },
          pickup_name: {
            type: String,
          },
          pickup_h3i: {
            type: String,
          },
          pickup_geo: {
            type: {
              type: String, 
              enum: ['Point'],  
              required: true
            },
            coordinates: {
              type: [Number],  
              required: true,
            }
          }
    },

    drop_location : {
        drop_address1: {
            type: String,
          },
          drop_address2: {
            type: String,
          },
          drop_house: {
            type: String,
          },
          drop_landmark: {
            type: String,
          },
          drop_zip: {
            type: String,
          },
          drop_state: {
            type: String,
          },
          drop_district: {
            type: String,
          },
          drop_mobile: {
            type: String,
          },
          drop_name: {
            type: String,
          },
          
          drop_h3i: {
            type: String,
          },
          drop_geo: {
            type: {
              type: String, 
              enum: ['Point'],  
              required: true
            },
            coordinates: {
              type: [Number],  
              required: true,
            }
          }
    },
    trip_distance:{
        type: Number,
        },
    rid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rider',  
      },
      status:{
        type : String,
        default:'active'
        // active , trip_started ,ended , canceled

    },
    tids: {
        type: [String],  
        required: true,
      },
      created_at: {
        type: Date,
        default: Date.now 
      },
      channel:{
        type : String,
      },
      orderId:{
        type:String,
      },
    //   bidConfig: {
    //     type: mongoose.Schema.Types.Mixed,  
    //     default: {}  
    //   },
    bidConfig: {
      type: [
          {
              step: Number, 
              bidAmount: Number, 
              distance: Number, 
              timestamp: { type: Date, default: Date.now } // When this step occurred,
              
          }
      ],
      default: []
  }
  
})


module.exports = mongoose.model("Booking", BookingSchema);
