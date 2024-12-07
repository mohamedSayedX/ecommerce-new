const express = require("express");

const {protect, allowedTo} = require("../services/authService");
const {
  addProductToWishlist,
  removeProductToWishlist,
  getLoggedUserWishlist,
} = require("../services/wishlistService");
const {
  createWishlistValidator,
  deleteWishListValidator,
} = require("../utils/validators/wishlistValidator");

const router = express.Router();

router.use(protect, allowedTo("user"));

router
  .route("/")
  .post(createWishlistValidator, addProductToWishlist)
  .get(getLoggedUserWishlist);

router.delete(
  "/:productId",
  deleteWishListValidator,
  removeProductToWishlist
);

module.exports = router;
