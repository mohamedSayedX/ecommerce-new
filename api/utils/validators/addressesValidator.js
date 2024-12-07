const {check, body, param} = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const PorductModel = require("../../models/productModel");

exports.createAddressValidator = [
  check("alias")
    .notEmpty()
    .withMessage("Address Alias must be provided")
    .isLength({min: 3})
    .withMessage("Too short address alias"),
  check("details").notEmpty().withMessage("Please enter address details"),
  check("phone")
    .notEmpty()
    .withMessage("Please enter a valid phone number")
    .isMobilePhone(["ar-EG", " ar-SA"])
    .withMessage("Phone number only accepts EG or SA numbers"),
  check("city").optional(),
  check("postalCode").optional(),
  validatorMiddleware,
];

exports.removeAddressValidator = [
  param("addressId")
    .notEmpty()
    .withMessage("address ID must be provided")
    .isMongoId()
    .withMessage("Please enter a valid address ID"),
  validatorMiddleware,
];
