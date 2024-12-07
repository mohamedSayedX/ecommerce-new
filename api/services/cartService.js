const expressAsyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Coupon = require("../models/couponModel");

const calcTotalCartPrice = (cart) => {
  // calculate total cart price
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += +item.price * +item.quantity;
  });
  cart.totalPriceAfterDiscount = undefined;

  return totalPrice;
};

//@desc  Add product to cart
//@route POST /api/v1/auth/cart
//@access Private/Protected/User
exports.addProductToCart = expressAsyncHandler(async (req, res, next) => {
  const {productId, quantity, color} = req.body;
  const product = await Product.findById(productId);
  // 1) Get Cart for logged user
  let cart = await Cart.findOne({user: req.user._id});

  // if there is no cart for logged user
  if (!cart) {
    // 2) Create new cart for logged user
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [
        {
          product: productId,
          quantity: quantity,
          color,
          price: product?.price,
        },
      ],
    });
  } else {
    // if product exists already in cart (same product and same color) ==> update porduct quantity
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() == productId && item.color == color
    );

    if (productIndex > -1) {
      // update product quantity, if product already in cart (productId and color)
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;
      cart.cartItems[productIndex] = cartItem;
    } else {
      // if product doesn't exist in cart, add new item
      cart.cartItems.push({
        product: productId,
        color,
        price: product?.price,
      });
    }
  }

  const totalPrice = calcTotalCartPrice(cart);

  cart.totalCartPrice = totalPrice;

  await cart.save();
  res.status(200).json({
    status: "success",
    message: "Product added to cart successfully",
    cart,
  });
});

//@desc  Get Logged user cart
//@route GET /api/v1/auth/cart
//@access Private/Protected/User

exports.getLoggedUserCart = expressAsyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({user: req.user._id});

  if (!cart) {
    return next(new ApiError("No cart found for this user", 404)); // 404 =>> NOTFOUND
  }

  res.status(200).json({
    status: "success",
    data: cart,
    numOfCartItems: cart.cartItems.length,
  });
});

//@desc  Remove specific user cart item
//@route Delete /api/v1/auth/cart/:item_id
//@access Private/Protected/User

exports.removeItemFromCart = expressAsyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    {user: req.user._id},
    {
      $pull: {cartItems: {_id: req.params.item_id}},
    },
    {new: true}
  );

  const totalPrice = calcTotalCartPrice(cart);

  cart.totalCartPrice = totalPrice;
  cart.save();
  res.status(200).json({
    status: "success",
    data: cart,
    message: "Product removed from cart successfully",
    numOfCartItems: cart.cartItems.length,
  });
});

//@desc  Clear logged user cart
//@route DELETE /api/v1/auth/cart
//@access Private/Protected/User

exports.clearCart = expressAsyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({user: req.user._id});

  res.status(200).json({
    status: "success",
    message: "Cart cleared successfully",
    numOfCartItems: 0,
  });
});

//@desc  update specific cart item quantity
//@route PUT /api/v1/auth/cart/:itemId
//@access Private/Protected/User

exports.updateCartItemQuantity = expressAsyncHandler(async (req, res, next) => {
  const {quantity} = req.body;
  const cart = await Cart.findOne({user: req.user._id});

  if (!cart) {
    return next(new ApiError("There is no cart for this user", 404));
  }

  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() == req.params.item_id
  );

  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    cartItem.quantity = quantity;
    cart.cartItems[itemIndex] = cartItem;
  } else {
    return next(new ApiError("No item found in the cart", 404));
  }

  const totalPrice = calcTotalCartPrice(cart);

  cart.totalCartPrice = totalPrice;

  cart.save();
  res.status(200).json({
    status: "success",
    data: cart,
    message: "Cart Product Quantity updated successfully",
    numOfCartItems: cart.cartItems.length,
  });
});

//@desc  Apply Coupon on looged user cart
//@route PUT /api/v1/auth/cart/applyCopupon
//@access Private/Protected/User
exports.applyCoupon = expressAsyncHandler(async (req, res, next) => {
  // 1) Get Coupon based on coupon name
  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expire: {$gt: Date.now()},
  });

  if (!coupon) {
    return next(new ApiError("Invalid Coupon or expired", 400));
  }




  // 2) get logged user cart to get total cart price
  const cart = await Cart.findOne({user: req.user._id});

  if (!cart) {
    return next(new ApiError("There is no cart for this user to upply this coupon coupon", 404));
  }

  const totalPrice = cart.totalCartPrice;

  //3) calculate price after discount
  const totalPriceAfterDiscount = (
    +totalPrice -
    +(+totalPrice * +coupon.discount) / 100
  ).toFixed(2);

  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Coupon applied successfully",
    data: cart,
  });
});


