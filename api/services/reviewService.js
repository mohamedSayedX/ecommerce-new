const factory = require("./handlersFactory");
const RevModel = require("../models/reviewModel");

exports.setProductIdAndUserIdToBody = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};
// nested route
exports.createFilterObject = (req, res, next) => {
  let filterObject = {};
  if (req.params.productId) {
    filterObject = {product: req.params.productId};
  }
  req.filterObj = filterObject;
  next();
};

//@desc Get list of reviews
//@route GET /api/v1/reviews
//@access Public
exports.getReviews = factory.getAll(RevModel);

//@desc Get review by _id
//route GET api/v1/reviews/:id
//access Public
exports.getReview = factory.getOne(RevModel);

//@desc Create review
//route POST api/v1/reviews
//access Private/Protected =>> User
exports.createReview = factory.createOne(RevModel);

//@desc Update review
//@route PUT api/v1/reviews/:id
//access Private/Protected =>> User
exports.updateReview = factory.updateOne(RevModel);

//@desc Delete review
//route DELETE api/v1/reviews/:id
//access Private/Protected =>> User/Admin/Manager
exports.deleteReview = factory.deleteOne(RevModel);
