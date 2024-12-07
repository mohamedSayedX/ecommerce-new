const {check} = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const {default: slugify} = require("slugify");

exports.getCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),
  validatorMiddleware,
];

exports.createCategoryValidator = [
  check("name")
    .custom((val, {req}) => {
      req.body.slug = slugify(val);
      return true;
    })
    .notEmpty()
    .withMessage("Category rquired")
    .isLength({min: 3})
    .withMessage("Too short category name")
    .isLength({max: 32})
    .withMessage("Too long category name"),
  validatorMiddleware,
];

exports.updateCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),
  check("name")
  .optional()
    .custom((val, {req}) => {
      req.body.slug = slugify(val);
      return true;
    })
    .notEmpty()
    .withMessage("Category rquired")
    .isLength({min: 3})
    .withMessage("Too short category name")
    .isLength({max: 32})
    .withMessage("Too long category name"),
  validatorMiddleware,
];

exports.deleteCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),
  validatorMiddleware,
];
