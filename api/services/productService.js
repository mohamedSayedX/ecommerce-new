const multer = require("multer");
const ProductModel = require("../models/productModel");
require("colors");
const factory = require("./handlersFactory");
const {v4: uuidv4} = require("uuid");

const sharp = require("sharp");
const expressAsyncHandler = require("express-async-handler");
const {uploadMixOfImages} = require("../middlewares/uploadImageMiddleware");

exports.uploadProductImages = uploadMixOfImages([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 5,
  },
]);

exports.resizeProductImages = expressAsyncHandler(async (req, res, next) => {
  // 1- image processing for image cover
  if (req.files.imageCover) {
    const imageCoverFilename = `products-${uuidv4()}-${Date.now()}-cover.${"jpeg"}`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({quality: 95})
      .toFile(`uploads/products/${imageCoverFilename}`);

    //Save image into our db
    req.body.imageCover = imageCoverFilename;
  }

  //2- image processing for product images
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `products-${uuidv4()}-${Date.now()}-${
          index + 1
        }.${"jpeg"}`;
        
        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({quality: 95})
          .toFile(`uploads/products/${imageName}`);

        //Save image into our db

        req.body.images.push(imageName);
      })
    );
    console.log(req.body.imageCover);
    console.log(req.body.images);

    next();
  }
});

//@desc Get list of products
//route GET /api/v1/products
//@access Public
exports.getProducts = factory.getAll(ProductModel, "products");

//@desc Get product by _id
//route GET api/v1/products/:id
//access Public
exports.getProduct = factory.getOne(ProductModel , "reviews");

//@desc Create product
//route POST api/v1/products
//access Private
exports.createProduct = factory.createOne(ProductModel);

//@desc Update product
//route PUT api/v1/products/:id
//access Private
exports.updateProduct = factory.updateOne(ProductModel);

//@desc Delete product
//route DELETE api/v1/products/:id
//access Private
exports.deleteProduct = factory.deleteOne(ProductModel);
