const jwt = require("jsonwebtoken");
const expressAsyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const UserModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const createToken = require("../utils/createToken");

//@desc  signup
//@route POST /api/v1/auth/signup
//@access Public
exports.signup = expressAsyncHandler(async (req, res, next) => {
  // 1- create user
  const user = await UserModel.create({
    name: req.body.name,
    email: req.body.email,
    slug: req.body.slug,
    password: req.body.password,
  });

  // 2 - generate token
  const token = createToken(user._id);

  res.status(201).json({data: user, token});
});

exports.login = expressAsyncHandler(async (req, res, next) => {
  // 1) check if password is correct
  // 2) check if user exist & check if password is correct
  const user = await UserModel.findOne({email: req.body.email});
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401)); // 401 =>> unauthorized
  }
  // 3) generate token
  const token = createToken(user._id);

  // 4) send response to client side
  res.status(200).json({data: user, token});
});

//@desc make sure that user is logged in
exports.protect = expressAsyncHandler(async (req, res, next) => {
  // 1) check token exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    next(
      new ApiError(
        "You are not login ,Please login to get access this route",
        401
      ) //401 =>> UNAUTHORIZED
    );
  }

  // 2) verify token (no change happens , expired token)
  const decotded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  // 3) check if user exist or not
  const currentUser = await UserModel.findById(decotded.userId);
  if (!currentUser) {
    return next(new ApiError("The user does not exist", 401)); // 401 =>> UNAUTHORIZED
  }
  // 4) check if usr change his password after token created
  if (currentUser.passwordChangedAt) {
    const passwordChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000
    ); //ms;

    //Password changed after token created (Error)
    if (passwordChangedTimestamp > decotded.iat) {
      return next(
        new ApiError("Password changed after token created ,Login again", 401)
      ); // 401 =>> UNAUTHORIZED
    }
  }
  req.user = currentUser;
  next();
});

// ["admin" , "manager"]
exports.allowedTo = (...roles) =>
  expressAsyncHandler(async (req, res, next) => {
    // 1) access roles
    // 2) access registered user (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not authorized to access this route", 403)
      ); //403 =>> FORBIDDEN
    }

    next();
  });

//@desc  forgetting password
//@route POST /api/v1/auth/forgetPassword
//@access Public
exports.forgetPassword = expressAsyncHandler(async (req, res, next) => {
  // 1) Get User by email
  const user = await UserModel.findOne({email: req.body.email});
  if (!user) {
    return next(new ApiError("Tehre is no user with that email", 404)); // 404 =>> not found
  }
  // 2) if user exists, Generate hash reset random 6 digits and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");
  user.passwordResetCode = hashedResetCode;
  //Add expiration time for passswrod reset code (10 minutes)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // expires after 10 minutes
  user.passowrdResetVerified = false;
  await user.save();

  //Save incrypted password into db

  // 3) Send the reset code via email

  const message = `
    Hi ${user?.name}, \n\n We recived a request to reset the password on your E-Shop account .\n ${resetCode} \n\n Enter this code to complete the reset. \n\n Thanks for helping us keep your account secure. \n\n E-shop Team.
  `;

  try {
    const emailOptions = {
      email: user.email,
      subject: `Hello, \n\nTo reset your password, please use the following code: ${resetCode} \n\nIts valid for 10 minutes.`,
      message,
    };
    await sendEmail(emailOptions);
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passowrdResetVerified = undefined;
    await user.save();
    return next(
      new ApiError("Failed to send email, please try again later", 500)
    ); // 500 =>> server error
  }

  res.status(200).json({
    status: "success",
    message: "Reset password email sent successfully",
  });
});

//@desc  verify password reset code
//@route POST /api/v1/auth/verifyResetCode
//@access Public
exports.verifyPasswordResetCode = expressAsyncHandler(
  async (req, res, next) => {
    const hashedResetCode = crypto
      .createHash("sha256")
      .update(req.body.resetCode)
      .digest("hex");

    const user = await UserModel.findOne({
      passwordResetCode: hashedResetCode,
      passwordResetExpires: {$gt: Date.now()},
    });

    if (!user) {
      return next(new ApiError("Invalid or expired reset code", 400)); // 400 =>> bad request
    }

    // 2) Reset code valid
    user.passowrdResetVerified = true;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password reset code verified successfully",
    });
  }
);

//@desc Reset password
//@route POST /api/v1/auth/resetPassword
//@access Public

exports.resetPassword = expressAsyncHandler(async (req, res, next) => {
  //1) get user based on email
  const user = await UserModel.findOne({email: req.body.email});
  if (!user) {
    return next(
      new ApiError(`There is no user with this email ${req.body.email}`, 400)
    ); // 400 =>> bad request
  }

  // Check if reset code verified
  if (!user.passowrdResetVerified) {
    return next(new ApiError(`Password reset code is not verified`, 400)); // 400 =>> bad request
  }

  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passowrdResetVerified = undefined;
  await user.save();

  // if everything is ok, generate token

  // 2) Generate token
  const token = createToken(user._id);
  res.status(200).json({
    status: "success",
    message: "updateds successfully",
    token,
  });
});
