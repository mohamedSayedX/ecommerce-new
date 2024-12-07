const sharp = require("sharp");
const {uploadSingleImage} = require("../middlewares/uploadImageMiddleware");
const factory = require("./handlersFactory");
const expressAsyncHandler = require("express-async-handler");
const {v4: uuidv4} = require("uuid");
const UserModel = require("../models/userModel");
const ApiError = require("../utils/apiError");
const bcrypt = require("bcryptjs");
const createToken = require("../utils/createToken");
//Upload single image
exports.uploadUserImage = uploadSingleImage("profileImg");

// Image processing middleware
exports.resizeImage = expressAsyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.${"jpeg"}`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({quality: 90})
      .toFile(`uploads/users/${filename}`);

    //Save image into our db
    req.body.image = filename;
  }

  next();
});

//@desc Get list of users
//@route GET /api/v1/users
//@access Private/Admin
exports.getUsers = factory.getAll(UserModel);

//@desc Get user by _id
//route GET api/v1/users/:id
//access Private/Admin
exports.getUser = factory.getOne(UserModel);

//@desc Create user
//route POST api/v1/users
//access Private/Admin
exports.createUser = factory.createOne(UserModel);

//@desc Update user
//@route PUT api/v1/users/:id
//access Private
// exports.updateUser = factory.updateOne(UserModel);
exports.updateUser = expressAsyncHandler(async (req, res, next) => {
  const document = await UserModel.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      slug: req?.body?.slug,
      profileImg: req.body.profileImg,
      role: req?.body?.role,
    },
    {
      new: true,
    }
  );

  if (!document) {
    // res.status(404).json({message: `No brand for this id ${id}`});
    next(new ApiError(`No document for this id ${req.params.id}`, 404));
    return;
  }
  res.status(200).json({data: document});
});

exports.changeUserPassword = expressAsyncHandler(async (req, res, next) => {
  const document = await UserModel.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: new Date(),
    },
    {
      new: true,
    }
  );

  if (!document) {
    // res.status(404).json({message: `No brand for this id ${id}`});
    next(new ApiError(`No document for this id ${req.params.id}`, 404));
    return;
  }
  res.status(200).json({data: document});
});

//@desc Delete user
//route DELETE api/v1/users/:id
//access Private
exports.deleteUser = factory.deleteOne(UserModel);

//@desc Get logged user data
//route GET api/v1/users/getMe
//access Private/Protected

exports.getLoggedUserData = expressAsyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

//@desc Update logged user Password
//route Put api/v1/users/updateMyPassword
//access Private/Protected

exports.updateLoggedUserPassword = expressAsyncHandler(
  // 1) Update user password based on user payload.
  async (req, res, next) => {
    const user = await UserModel.findByIdAndUpdate(
      req.user._id,
      {
        password: await bcrypt.hash(req.body.password, 12),
        passwordChangedAt: new Date(),
      },
      {
        new: true,
      }
    );

    // 2) Generate new token
    const token = createToken(user._id);
    res.status(200).json({
      status: "success",
      message: "Password updated successfully",
      token,
    });
  }
);

//@desc Update logged user data
//@route POST /api/v1/users/updateMe/
//@access Private/Protected

exports.updateLoggedUserData = expressAsyncHandler(async (req, res, next) => {
  const updatedUser = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    },
    {new: true}
  );

  res.status(200).json({
    status: "success",
    message: "User data updated successfully",
    data: updatedUser,
  });
});

//@desc Deactivate logged user
//@route DELETE /api/v1/users/delete me
//@access Private/Protected
exports.deleteLoggedUser = expressAsyncHandler(async (req, res, next) => {
  await UserModel.findByIdAndUpdate(req.user._id, {active: false});

  res.status(204).json({
    status: "success",
    message: "User deactivated successfully",
  });
});
