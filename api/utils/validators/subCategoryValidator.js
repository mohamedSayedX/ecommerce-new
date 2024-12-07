const {check} = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const {default: slugify} = require("slugify");

exports.getSubcategoryValidator = [
  check("id").isMongoId().withMessage("Invalid subcategory id format"),
  validatorMiddleware,
];

exports.createSubCategoryValidator = [
  check("name")
    .custom((val, {req}) => {
      req.body.slug = slugify(val);
      return true;
    })
    .notEmpty()
    .withMessage("Subcategory rquired")
    .isLength({min: 2})
    .withMessage("Too short subcategory name")
    .isLength({max: 32})
    .withMessage("Too long subcategory name"),
  check("category")
    .notEmpty()
    .withMessage("SubCategory must be belong to category.")
    .isMongoId()
    .withMessage("Invalid Category id format"),
  validatorMiddleware,
];

exports.updateSubCategoryValidator = [
  check("name")
    .custom((val, {req}) => {
      req.body.slug = slugify(val);
      return true;
    })
    .notEmpty()
    .withMessage("Subcategory rquired")
    .isLength({min: 2})
    .withMessage("Too short subcategory name")
    .isLength({max: 32})
    .withMessage("Too long subcategory name"),
  check("category")
    .notEmpty()
    .withMessage("SubCategory must be belong to category.")
    .isMongoId()
    .withMessage("Invalid Category id format"),
  validatorMiddleware,
];

exports.deleteSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid subcategory id format"),
  validatorMiddleware,
];
