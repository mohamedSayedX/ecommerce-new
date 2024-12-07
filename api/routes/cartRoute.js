const express = require("express");
const {
  addProductToCart,
  getLoggedUserCart,
  removeItemFromCart,
  clearCart,
  updateCartItemQuantity,
  applyCoupon,
} = require("../services/cartService");

const router = express.Router();

const {protect, allowedTo} = require("../services/authService");

router.use(protect, allowedTo("user"));

router
  .route("/")
  .post(addProductToCart)
  .get(getLoggedUserCart)
  .delete(clearCart);

router.put("/applyCoupon", applyCoupon);

router
  .route("/:item_id")
  .delete(removeItemFromCart)
  .put(updateCartItemQuantity);

module.exports = router;
