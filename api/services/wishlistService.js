const UserModel = require("../models/userModel");
const expressAsyncHandler = require("express-async-handler");

//@desc Add product of user wishlist
//@route POST /api/v1/wishlist
//@access Private/protected/user

exports.addProductToWishlist = expressAsyncHandler(async (req, res, next) => {
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: {wishlist: req.body.productId},
    },
    {new: true}
  );

  res.status(200).json({
    status: "success",
    message: "Product added to wishlist successfully",
    data: user.wishlist,
  });
});

//@desc Remove product from user wishlist
//@route DELETE /api/v1/wishlist
//@access Private/protected/user

exports.removeProductToWishlist = expressAsyncHandler(
  async (req, res, next) => {
    const user = await UserModel.findByIdAndUpdate(
      // bull =>> remove productId from wishlist array if productId exists

      req.user._id,
      {
        $pull: {wishlist: req.params.productId},
      },
      {new: true}
    );

    res.status(200).json({
      status: "success",
      message: "Product removed from your wishlist successfully",
      data: user.wishlist,
    });
  }
);

//@desc Get Logged user wishlist
//@route Get /api/v1/wishlist
//@access Private/protected/user

exports.getLoggedUserWishlist = expressAsyncHandler(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id).populate("wishlist");

  res.status(200).json({
    status: "success",
    results: user.wishlist.length,
    data: user.wishlist,
  });
});
