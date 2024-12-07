const {check, body, param} = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const PorductModel = require("../../models/productModel");

exports.createWishlistValidator = [
  body("productId")
    .notEmpty()
    .withMessage("Product ID must be provided")
    .custom((productId) => {
      return PorductModel.findById(productId).then((prod) => {
        if (!prod) {
          return Promise.reject(new Error("No product for this id"));
        }
      });
    }),
  validatorMiddleware,
];

exports.deleteWishListValidator = [
  param("productId")
    .notEmpty()
    .withMessage("Product ID must be provided")
    .custom((productId) => {
      return PorductModel.findById(productId).then((prod) => {
        if (!prod) {
          return Promise.reject(new Error("No product for this id"));
        }
      });
    }),
  validatorMiddleware,
];
