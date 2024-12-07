const express = require("express");
const {
  getCoupon,
  createCoupon,
  getCoupons,
  deleteCoupon,
  updateCoupon,
} = require("../services/couponService");

// const {
//   getBrandValidator,
//   createBrandValidator,
//   updateBrandValidator,
//   deleteBrandValidator,
// } = require("../utils/validators/brandValidator");
const router = express.Router();
const {protect, allowedTo} = require("../services/authService");

router.use(protect, allowedTo("admin", "manager"));

router.route("/").get(getCoupons).post(createCoupon);

router.route("/:id").get(getCoupon).put(updateCoupon).delete(deleteCoupon);

module.exports = router;
