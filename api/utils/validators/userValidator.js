const {check, body} = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const {default: slugify} = require("slugify");
const UserModel = require("../../models/userModel");
const bcrypt = require("bcryptjs");

exports.getUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id format"),
  validatorMiddleware,
];

exports.createUserValidator = [
  check("name")
    .custom((val, {req}) => {
      req.body.slug = slugify(val);
      return true;
    })
    .notEmpty()
    .withMessage("User rquired")
    .isLength({min: 3})
    .withMessage("Too short user name"),
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
  check("profileImg").optional(),
  check("role").optional(),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", " ar-SA"])
    .withMessage("Phone number only accepts EG or SA numbers"),
  validatorMiddleware,
];

exports.updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id format"),
  check("name")
    .optional()
    .custom((val, {req}) => {
      req.body.slug = slugify(val);
      return true;
    })
    .notEmpty()
    .withMessage("User rquired")
    .isLength({min: 3})
    .withMessage("Too short user name")
    .isLength({max: 32})
    .withMessage("Too long user name"),
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
  check("profileImg").optional(),
  check("role").optional(),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", " ar-SA"])
    .withMessage("Phone number only accepts EG or SA numbers"),
  validatorMiddleware,
];

exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id format"),
  validatorMiddleware,
];

exports.changePasswordValidator = [
  check("id").isMongoId().withMessage("Invalid user id format"),
  body("currentPassword")
    .notEmpty()
    .withMessage("You must enter your current password"),
  body("passwordConfirm")
    .notEmpty()
    .withMessage("Please enter the password confirmation"),
  body("password")
    .notEmpty()
    .withMessage("Please enter your new password")
    .custom(async (val, {req}) => {
      //1) verify the current password
      const user = await UserModel.findById(req.params.id);
      if (!user) {
        throw new Error("User not found");
      }

      //2) compare the new password with the current password
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );

      if (!isCorrectPassword) {
        throw new Error("Incorrect current password");
      }
      //3) compare the new password with the confirm password
      if (val !== req.body.passwordConfirm) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  validatorMiddleware,
];

exports.updateLoggedUserValidator = [
  check("name")
    .optional()
    .custom((val, {req}) => {
      req.body.slug = slugify(val);
      return true;
    })
    .notEmpty()
    .withMessage("User rquired")
    .isLength({min: 3})
    .withMessage("Too short user name")
    .isLength({max: 32})
    .withMessage("Too long user name"),
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
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", " ar-SA"])
    .withMessage("Phone number only accepts EG or SA numbers"),
  validatorMiddleware,
];
