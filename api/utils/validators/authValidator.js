const {check, body} = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const {default: slugify} = require("slugify");
const UserModel = require("../../models/userModel");
const bcrypt = require("bcryptjs");

exports.signupValidator = [
  check("name")
    .notEmpty()
    .withMessage("User required")
    .isLength({min: 3})
    .withMessage("Too short User name")
    .custom((val, {req}) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("Email required!")
    .isEmail()
    .withMessage("Please enter a valid email address!")
    .custom((val) =>
      UserModel.findOne({email: val}).then((user) => {
        if (user) {
          return Promise.reject(new Error("Email already in use"));
        }
      })
    ),
  check("password")
    .notEmpty()
    .withMessage("Password required!")
    .isLength({min: 8})
    .withMessage("Please enter password at least 8 characters")
    .custom((password, {req}) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  check("passwordConfirm")
    .notEmpty()
    .withMessage("password confirmation required"),
  validatorMiddleware,
];

exports.loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email required!")
    .isEmail()
    .withMessage("Please enter a valid email address!"),

  check("password")
    .notEmpty()
    .withMessage("Password required!")
    .isLength({min: 8})
    .withMessage("Please enter password at least 8 characters"),
  validatorMiddleware,

];
