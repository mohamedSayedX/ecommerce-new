const expressAsyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");
const ApiError = require("../utils/apiError");
const OrderModel = require("../models/orderModel");
const ProductModel = require("../models/productModel");
const cartModel = require("../models/cartModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

//@desc Create Cash Order
//@route POST / api/v1/orders/:cartId
//@access Private/User
exports.createCashOrder = expressAsyncHandler(async function (req, res, next) {
  // from app settings
  const taxPrice = 0;
  const shippingPrice = 0;

  //1) Get cart depend on cartId
  const cart = await cartModel.findById(req.params.cartId);
  if (!cart) {
    return next(new ApiError("There is no such cart ", 404));
  }

  //2) Get order price depend on cartPrice  =>> "check if coupon uplied"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart?.totalPriceAfterDiscount
    : cart?.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  //3) create order with default payment methos type cash
  const order = await OrderModel.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    totalOrderPrice,
    shippingAddress: req.body.shippingAddress,
  });
  //4) After creating order, decrement product quantity , increment product sold
  if (order) {
    const bulkOptions = cart.cartItems.map((item) => ({
      updateOne: {
        filter: {_id: item.product},
        update: {$inc: {quantity: -item.quantity, sold: +item.quantity}},
      },
    }));
    await ProductModel.bulkWrite(bulkOptions, {});
    //5) clear cart depend on on cardId
    await cartModel.findByIdAndDelete(req.params.cartId);
  }

  res.status(201).json({
    status: "success",
    data: order,
    message: "Order has been created successfully",
  });
});

exports.filterOrdersForLoggedUser = expressAsyncHandler(
  async (req, res, next) => {
    if (req.user.role == "user")
      req.filterObj = {
        user: req.user._id,
      };
    next();
  }
);

//@desc Get All orders
//@route Post /api/v1/orders
//@access Protected/User_Admin_Manager

exports.findAllOrders = factory.getAll(OrderModel);

//@desc Get Specific order
//@route Post /api/v1/orders
//@access Protected/User_Admin_Manager

exports.findSpecificOrder = factory.getOne(OrderModel);

//@desc Update order status to paid
//@route Post /api/v1/orders
//@access Protected/Admin_Manager
exports.updateOrderToPaid = expressAsyncHandler(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order) {
    return next(new ApiError("No order found with this ID", 404));
  }
  //update order to be paid

  order.isPaid = true;
  order.paidAt = Date.now();

  const UpdateOrder = await order.save();

  res.status(200).json({
    status: "success",
    data: UpdateOrder,
    message: "Order has been updated to paid successfully",
  });

  //send email to admin about new order...
});

//@desc Update order status to be delivered
//@route Post /api/v1/orders
//@access Protected/Admin_Manager
exports.updateOrderToDelivered = expressAsyncHandler(async (req, res, next) => {
  try {
    const order = await OrderModel.findById(req.params.id);

    if (!order) {
      return next(new ApiError("No order found with this ID", 404));
    }

    // Update order to be delivered
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save(); // Ensure this is called on a Mongoose document
    res.status(200).json({
      status: "success",
      data: updatedOrder,
      message: "Order has been updated to be delivered successfully",
    });

    // Optionally: Send email to admin about the updated order
  } catch (error) {
    next(error); // Pass unexpected errors to the error handler
  }
});

//@desc Get Checkout session and send it as response
//@route Post /api/v1/orders/checkout-session/:cartId
//@access Protected/User

exports.getCheckoutSession = expressAsyncHandler(async (req, res, next) => {
  // from app settings
  const taxPrice = 0;
  const shippingPrice = 0;

  //1) get logged user cart dependon cartId
  const cart = await cartModel.findById(req.params.cartId);
  if (!cart) {
    return next(new ApiError("There is no such cart ", 404));
  }

  //2) get order price depend on cart price "check if coupon apply"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  //3) create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [

      {
        quantity: 1,
        price_data: {
          currency: "egp",
          product_data: {
            name: req.user.name,
          },
          unit_amount: totalOrderPrice *100, // 10.00 EGP in the smallest currency unit
        },
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/cart`,
    customer_email: req.user.email,
    client_reference_id: cart?._id.toString(),
    metadata: req.body.shippingAddress,
  });

  //4) send session to response
  res.status(200).json({
    status: "success",
    data: session,
    message: "Checkout session has been created successfully",
  });
});
