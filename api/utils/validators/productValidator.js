const {check, body} = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const CategoryModel = require("../../models/categoryModel");
const SubcategoryModel = require("../../models/subCategoryModel");
const {default: slugify} = require("slugify");

exports.createProdcutValidator = [
  check("title")
    .custom((val, {req}) => {
      req.body.slug = slugify(val);
      return true;
    })
    .isLength({min: 3})
    .withMessage("must be at least 3 chars")
    .notEmpty()
    .withMessage("product required"),
  check("description")
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({max: 2000})
    .withMessage("Too long description"),
  check("quantity")
    .notEmpty()
    .withMessage("Product quantity is required")
    .isNumeric()
    .withMessage("Product quantity must be a number"),
  check("sold")
    .optional()
    .isNumeric()
    .withMessage("Product sold quantity must be a number"),
  check("price")
    .notEmpty()
    .withMessage("Product price is required")
    .isNumeric()
    .withMessage("Product price must be a number")
    .isLength({max: 32})
    .withMessage("Too long price"),
  check("priceAfterDiscount")
    .optional()
    .isFloat()
    .isNumeric()
    .withMessage("Product price after discount must be a number")
    .custom((value, {req}) => {
      if (+req.body.price <= +value) {
        throw new Error("Price after descount must be lower than price");
      }
      return true;
    }),

  check("colors")
    .optional()
    .isArray()
    .withMessage("colors should be array of strings"),
  check("imageCover").notEmpty().withMessage("Product image cover is required"),
  check("images")
    .optional()
    .isArray()
    .withMessage("Product images should be an array of strings"),
  check("category")
    .notEmpty()
    .withMessage("Product must be belong to a category")
    .isMongoId()
    .withMessage("Invalid Id formate")
    .custom((categoryId) => {
      return CategoryModel.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(new Error("No category for this id"));
        }
      });
    }),

  check("subcategories")
    .optional()
    .isMongoId()
    .withMessage("Invalid id format")
    .custom((subcateogriesIds) => {
      return SubcategoryModel.find({
        _id: {$exists: true, $in: subcateogriesIds},
      }).then((result) => {
        //length result === length subcategories in body
        if (result.length < 1 || result.length != subcateogriesIds.length) {
          return Promise.reject(new Error("Invalid subcategories ids"));
        }
      });
    })
    .custom((value, {req}) => {
      return SubcategoryModel.find({category: req.body.category}).then(
        (subcategoriesInCateogry) => {
          //length result === length subcategories in body
          const subcategorriesIdsInDB = [];
          subcategoriesInCateogry.forEach((subcategory) => {
            subcategorriesIdsInDB.push(subcategory._id.toString());
          });
          // const checker = value.every((value) =>
          //   subcategorriesIdsInDB.includes(value)
          // );

          //check if subcategories ids are in db include subcategories in req.body (treu / false)
          const checker = (target, arr) => {
            return target.every((value) => arr.includes(value));
          };

          if (!checker(value, subcategorriesIdsInDB)) {
            throw new Error("All subcategories must be in the category");
          }
        }
      );
    }),

  check("brand").isMongoId().withMessage("Invalid brand id format"),
  check("ratingsAverage")
    .optional()
    .isNumeric()
    .withMessage("ratingsAverage must be a number")
    .isLength({min: 1})
    .withMessage("Rating must be greater than or equal to 1.0")
    .isLength({max: 5})
    .withMessage("Rating must be Less than or equal to 5.0"),
  check("ratingsQuantity")
    .optional()
    .isNumeric()
    .withMessage("ratingsQuantity must be a number"),

  validatorMiddleware,
];

exports.getProductValidator = [
  check("id").isMongoId().withMessage("Invalid id format"),
  validatorMiddleware,
];

exports.updateProductValidator = [
  check("id").isMongoId().withMessage("Invalid id format"),
  validatorMiddleware,
  body("title").custom((val, {req}) => {
    req.body.slug = slugify(val);
    return true;
  }),
];

exports.deleteProductValidator = [
  check("id").isMongoId().withMessage("Invalid id fromat"),
  validatorMiddleware,
];
