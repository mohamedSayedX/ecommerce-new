const {check} = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const {default: slugify} = require("slugify");

exports.getBrandValidator = [
  check("id").isMongoId().withMessage("Invalid brand id format"),
  validatorMiddleware,
];

exports.createBrandValidator = [
  check("name")
    .custom((val, {req}) => {
      req.body.slug = slugify(val);
      return true;
    })
    .notEmpty()
    .withMessage("Brand rquired")
    .isLength({min: 3})
    .withMessage("Too short brand name")
    .isLength({max: 32})
    .withMessage("Too long brand name"),
  validatorMiddleware,
];

exports.updateBrandValidator = [
  check("id").isMongoId().withMessage("Invalid brand id format"),
  check("name").optional()
    .custom((val, {req}) => {
      req.body.slug = slugify(val);
      return true;
    })
    .notEmpty()
    .withMessage("Brand rquired")
    .isLength({min: 3})
    .withMessage("Too short brand name")
    .isLength({max: 32})
    .withMessage("Too long brand name"),
  validatorMiddleware,
];

exports.deleteBrandValidator = [
  check("id").isMongoId().withMessage("Invalid brand id format"),
  validatorMiddleware,
];
