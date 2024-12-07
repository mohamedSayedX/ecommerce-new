const express = require("express");

const {protect, allowedTo} = require("../services/authService");
const {
  addAddress,
  removeAddress,
  getLoggedUserAddresses,
} = require("../services/addressService");
const { createAddressValidator } = require("../utils/validators/addressesValidator");

// const {
//   removeFromWishlistValidator,
//   createWishlistValidator,
// } = require("../utils/validators/wishlistValidator");

const router = express.Router();

router.use(protect, allowedTo("user"));

router
  .route("/")
  .post( createAddressValidator ,addAddress)
  .get(getLoggedUserAddresses);

router.delete(
  "/:addressId",
  removeAddress
);

module.exports = router;
