const UserModel = require("../models/userModel");
const expressAsyncHandler = require("express-async-handler");

//@desc Add address for user
//@route POST /api/v1/addresses
//@access Private/protected/user

exports.addAddress = expressAsyncHandler(async (req, res, next) => {
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,

    {
      $addToSet: {addresses: req.body},
    },
    {new: true}
  );

  res.status(200).json({
    status: "success",
    message: "Address added successfully",
    data: user.addresses,
  });
});

//@desc Remove adderss from user addresses list
//@route DELETE /api/v1/addresses/addressId
//@access Private/protected/user

exports.removeAddress = expressAsyncHandler(async (req, res, next) => {
  const user = await UserModel.findByIdAndUpdate(
    // bull =>> remove addresss from user addresses array if address id exists

    req.user._id,
    {
      $pull: { addresses: {_id: req.params.addressId } },

    },
    {new: true}
  );

  res.status(200).json({
    status: "success",
    message: "Address removed successfully",
    data: user.addresses,
  });
});

//@desc Get Logged user addresses
//@route Get /api/v1/addresses
//@access Private/protected/user

exports.getLoggedUserAddresses = expressAsyncHandler(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id).populate("addresses");

  res.status(200).json({
    status: "success",
    results: user.addresses.length,
    data: user.addresses,
  });
});
