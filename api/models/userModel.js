const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required!"],
      minlength: [3, " Name must have at least 3 characters!"],
      maxlength: [50, " Name must have at most 50 characters!"],
      trim: true,
    },

    slug: {
      type: String,
      lowercase: true,
    },

    email: {
      type: String,
      required: [true, "Email is required!"],
      unique: true,
      lowercase: true,
      // validate: {
      //   validator: (value) => /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(value),
      //   message: 'Please enter a valid email address'
      // }
    },

    phone: String,
    profileImg: String,

    password: {
      type: String,
      required: true,
      minlength: [8, "Password must be at least 8 characters!"],
      // select: false,
    },

    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passowrdResetVerified: Boolean,

    role: {
      type: String,
      enum: ["user", "manager", "admin"],
      default: "user",
    },

    active: {
      type: Boolean,
      default: true,
    },

    // child references
    wishlist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "products",
      },
    ],
    addresses: [
      {
        id: {
          type: mongoose.Schema.ObjectId,
        },
        alias: String,
        details: String,
        phone: String,
        city: String,
        postalCode: String,
      },
    ],
  },

  {timestamps: true}
);

userSchema.pre("save", async function (next) {
  //Hashing user password
  if (!this.isModified("password")) {
    return next(); // If password is not modified, move to the next middleware or operation.
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
