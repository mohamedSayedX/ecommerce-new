const express = require("express");
const {
  createCashOrder,
  findAllOrders,
  filterOrdersForLoggedUser,
  findSpecificOrder,
  updateOrderToDelivered,
  updateOrderToPaid,
  getCheckoutSession,
} = require("../services/orderService");

const router = express.Router();
const {protect, allowedTo} = require("../services/authService");

router.use(protect);

router.get("/checkout-session/:cartId", allowedTo("user"), getCheckoutSession);

router.route("/:cartId").post(allowedTo("user"), createCashOrder);
router.get(
  "/",
  allowedTo("admin", "manager", "user"),
  filterOrdersForLoggedUser,
  findAllOrders
);
router.get("/:id", findSpecificOrder);

router.put("/:id/paid", allowedTo("admin", "manager"), updateOrderToPaid);
router.put(
  "/:id/delivered",
  allowedTo("admin", "manager"),
  updateOrderToDelivered
);

module.exports = router;
