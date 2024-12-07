const {check} = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const RevModel = require("../../models/reviewModel");

exports.getReviewValidator = [
  check("id").isMongoId().withMessage("Invalid review id format"),
  validatorMiddleware,
];

exports.createReviewValidator = [
  check("title").optional(),
  check("ratings")
    .notEmpty()
    .withMessage("ratings value required")
    .isFloat({min: 1, max: 5})
    .withMessage("rating value must between 1 and 5"),
  check("user").isMongoId().withMessage("Invalid user id format"),
  check("product")
    .isMongoId()
    .withMessage("Invalid product id format")
    .custom((val, {req}) => {
      // check if logged user create review before
      return RevModel.findOne({
        user: req.user._id,
        product: req.body.product,
      }).then((rev) => {
        if (rev) {
          return Promise.reject(
            new Error("You already created  a review on this product before.")
          );
        }
      });
    }),

  validatorMiddleware,
];

exports.updateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid review id format")
    .custom((val, {req}) => {
      //check if logged user created this revies or not
      return RevModel.findById(val).then((rev) => {
        if (!rev) {
          return Promise.reject(
            new Error(`there is no review for this id ${val}.`)
          );
        }

        if (rev.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error("You are not authorized to update this review.")
          );
        }
      });
    }),
  validatorMiddleware,
];

exports.deleteReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid review id format")
    .custom((val, {req}) => {
      //check if logged user created this revies or not
      if (req.user.role === "user") {
        return RevModel.findById(val).then((rev) => {
          if (!rev) {
            return Promise.reject(
              new Error(`there is no review for this id ${val}.`)
            );
          }

          if (rev.user._id.toString() !== req.user._id.toString()) {
            return Promise.reject(
              new Error("You are not authorized to delete this review.")
            );
          }
        });
      } else {
        return RevModel.findByIdAndDelete(val).then((rev) => {
          if (!rev) {
            return Promise.reject(
              new Error(`there is no review for this id ${val}.`)
            );
          }
        });
      }
    }),
  validatorMiddleware,
];
