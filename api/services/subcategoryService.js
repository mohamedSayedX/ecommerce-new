const SubCategoryModel = require("../models/subCategoryModel");
const factory = require("./handlersFactory");

// for Nested routes
// middleware executed berfore validation middlewares
exports.setCategoryIdToBody = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

exports.createFilterObject = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) {
    filterObject = {category: req.params.categoryId};
  }
  req.filterObj = filterObject;
  next();
};

//@desc Get list of subcategories
//route GET /api/v1/subcategories
//@access Public
exports.getSubCategories = factory.getAll(SubCategoryModel);
//@desc Get subcategory by _id
//route GET api/v1/subcategories/:id
//access Public
exports.getSubCategory = factory.getOne(SubCategoryModel);

//@desc Create Subcategory
//route POST api/v1/subcategories
//access Private
exports.createSubCategory = factory.createOne(SubCategoryModel);

//@desc Update subcategory
//route PUT api/v1/subcategories/:id
//access Private
exports.updateSubCategory = factory.updateOne(SubCategoryModel);

//@desc Delete subcategory
//route DELETE api/v1/subcategories/:id
//access Private
exports.deleteSubCategory = factory.deleteOne(SubCategoryModel);
