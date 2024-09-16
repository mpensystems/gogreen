const mongoose = require("mongoose");
const Schema = mongoose.Schema;



const VehicleSchema = new Schema({
  vehicle_no: {
    type: String,
    // unique: true
    default:1
  },
  rc_copy: {
    type: String,
    default:''
  },
  vehicle_type: {
    type: String,
    enum: ["Petrol Bike", "Electric Bike","Cycle" ,"Horse","Seagway","Hoverboard","Other"],
    default: "Electric Bike"
  },
  is_electric:{
    type: Boolean,
    default: true
  },

  fueled_propulsion:{
    type:Boolean,
    default:true
  },

  
  chargePercentage: {
    type: Number,
    default:0
  }
});



const AddressSchema = new Schema({
    address_line1: {
        type: String,
        default: '' 
      },
      address_line2: {
        type: String,
        default: '' 
      },
      flat_no: {
        type: String,
        default: '' 
      },
      zipcode: {
        type: String,
        default: '' 
      },
      city: {
        type: String,
        default: '' 
      },
      district: {
        type: String,
        default: '' 
      },
})


const BankSchema = new Schema({
    bank_ac: {
        type: String,
        default: '' ,
        // unique:true
      },
      bank_ifsc: {
        type: String,
        default: '' ,
        // unique:true
      },
      bank_ac_name: {
        type: String,
        default: '' ,
        // unique:true
      },
      cancelled_cheque:{
        type : String,
        default:'',
      }
})

const RiderSchema = new Schema({

  mobile: {
    type: String,
    required: true,
    unique: true
  },
  first_name: {
    type: String,
    default: '' 
  },
  last_name: {
    type: String,
    default: '' 
  },
  
  photo_id_type: {
    type: String,
    enum: ["aadhar", "passport", "voters_id"],
    default: "aadhar"
    
   
  },
  photo_id: {
    type: String,
    default: '' 
  },
  photo: {
    type: String,
    default: '' 
  },
  utility_bill: {
    type: String,
    default: '' 
  },

  drivers_license: {
    type: String,
    default: '',
   
  },
  drivers_license_expiry: {
    type: Date,
    default: '',
  },


  pan: {
    type: String,
    // unique:true
    default:""
  },
 
  status: {
    type: String,
    enum: ["available", "ontrip", "offline"],
    default: "offline"
  },
  
  licenseImageLink: {
    type: String,
    default:''
  },
  kyc_approved: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  kyc_error_message:{
    type:String,
    default:''
  },
  created_at: {
    type: Date,
    default: Date.now 
  },
  last_updated_at: {
    type: Date,
    default: Date.now 
  },

  vehicle: {
    type: VehicleSchema,
    default: () => ({})
  },
  address: {
    type: AddressSchema,
    default: () => ({})
  },  
  bank: {
    type: BankSchema,
    default: () => ({})
  },
 
});

RiderSchema.pre("save", function(next) {
  if (this.status === '') this.status = undefined;
//   if (this.kycVerified === '') this.kycVerified = undefined;
  if (this.kyc_approved === '') this.kyc_approved = undefined;
//   if (this.vehicle.vehicle_type === '') this.vehicle.vehicle_type = undefined;
  next();
});

module.exports = mongoose.model("Rider", RiderSchema);
