const CategoryModel = require("../models/categoryModel");
const factory = require("./handlersFactory");
const {v4: uuidv4} = require("uuid");
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const {uploadSingleImage} = require("../middlewares/uploadImageMiddleware");

exports.uploadCategoryImage = uploadSingleImage("image");


// Image processing middleware
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `category-${uuidv4()}-${Date.now()}.${"jpeg"}`;

  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({quality: 90})
    .toFile(`uploads/categories/${filename}`);

  //Save image into our db
  req.body.image = filename;

  next();
});

//@desc Get list of categories
//route GET /api/v1/categories
//@access Public
exports.getCategories = factory.getAll(CategoryModel);
//@desc Get category by _id
//route GET api/v1/categories/:id
//access Public
exports.getCategory = factory.getOne(CategoryModel);

//@desc Create category
//route POST api/v1/categories
//access Private
exports.createCategory = factory.createOne(CategoryModel);

//@desc Update category
//route PUT api/v1/categories/:id
//access Private
exports.updateCategory = factory.updateOne(CategoryModel);

//@desc Delete category
//route DELETE api/v1/categories/:id
//access Private
exports.deleteCategory = factory.deleteOne(CategoryModel);
