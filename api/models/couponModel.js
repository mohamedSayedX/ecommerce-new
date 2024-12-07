const {default: mongoose} = require("mongoose");

const couponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Coupon name required"],
    trim: true,
    unique:true,
  },
  expire: {
    type: Date,
    required: [true, "Coupon expiration date required"],
  },
  discount:{
    type: Number,
    required: [true, "Coupon discount percentage required"],
    min: [0, "Coupon discount percentage must be greater than or equal to 0"],
    max: [100, "Coupon discount percentage must be less than or equal to 100"],
  }
} , {timestamps:true});

module.exports = mongoose.model("Coupon", couponSchema);
