const factory = require("./handlersFactory");

const CouponModel = require("../models/couponModel");


//@desc Get list of coupons
//@route GET /api/v1/coupons
//@access Private / Admin - Manager
exports.getCoupons = factory.getAll(CouponModel);

//@desc Get coupon by _id
//route GET api/v1/coupons/:id
//access Private / Admin - Manager
exports.getCoupon = factory.getOne(CouponModel);

//@desc Create coupon
//route POST api/v1/coupons
//access Private
exports.createCoupon = factory.createOne(CouponModel);

//@desc Update coupon
//@route PUT api/v1/coupons/:id
//access Private
exports.updateCoupon = factory.updateOne(CouponModel);

//@desc Delete coupon
//route DELETE api/v1/coupons/:id
//access Private
exports.deleteCoupon = factory.deleteOne(CouponModel);
