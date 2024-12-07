const mongoose = require("mongoose");

const orederSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Order must belong to user"],
    },
    ////////////////////////////////

    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "products",
        },
        quantity: {
          type: Number,
        },
        color: String,
        price: Number,
      },
    ],
    ////////////////////////////////

    taxPrice: {
      type: Number,
    },
    ////////////////////////////////

    shippingAddress: {
      details: String,
      phone: String,
      zipCode: String,
      city: String,
    },

    ////////////////////////////////

    shippingPrice: {
      type: Number,
      default: 0,
    },
    ////////////////////////////////

    totalOrderPrice: {
      type: Number,
    },
    ////////////////////////////////
    paymentMethod: {
      type: String,
      enum: ["cash", "online"],
      required: [true, "Payment method required"],
      default: "cash",
    },

    ////////////////////////////////

    isPaid: {
      type: Boolean,
      default: false,
    },
    ////////////////////////////////
    
    paidAt: Date,
    ////////////////////////////////
    isDelivered: {
      type: Boolean,
      default: false,
    },
    ////////////////////////////////
    deliveredAt: Date,
  },
  {timestamps: true}
);

orederSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name email phone profileImg ",
  }).populate({
    path: "cartItems.product",
    select: "name imageCover price ratingsAverage",
  });
  next();
});

module.exports = mongoose.model("Order", orederSchema);
