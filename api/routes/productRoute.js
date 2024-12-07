const express = require("express");
const {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  resizeProductImages,
} = require("../services/productService");
const {
  getProductValidator,
  createProdcutValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../utils/validators/productValidator");
const {protect, allowedTo} = require("../services/authService");
const router = express.Router();
const reviewsRoute = require("./reviewRoute")




//POST  /products/:productId/reviews ==> reviewRoute
//GET  /products/:productId/reviews ==> reviewRoute
router.use("/:productId/reviews", reviewsRoute);

router
  .route("/")
  .get(getProducts)
  .post(
    protect,
    allowedTo("admin", "manager"),
    uploadProductImages,
    resizeProductImages,
    createProdcutValidator,
    createProduct
  );

router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(
    protect,
    allowedTo("admin", "manager"),
    uploadProductImages,
    resizeProductImages,
    updateProductValidator,
    updateProduct
  )
  .delete(
    protect,
    allowedTo("admin"),
    deleteProductValidator,
    deleteProduct
  );

module.exports = router;
