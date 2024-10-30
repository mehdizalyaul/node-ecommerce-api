const express = require("express");
const router = express.Router();
const CartItem = require("../models/CartItem.js");
const OrderItem = require("../models/OrderItem.js");
const Order = require("../models/Order.js");
const isAuthenticated = require("../middlewares/authMiddleware.js");
const { createOrderSchema } = require("../validation/orderValidation.js");
const asyncErrorHandler = require("../utils/asyncErrorHandler.js");
const CustomError = require("../utils/CustomError");
const Product = require("../models/Product.js");

// Create an order
// Create an order
router.post(
  "/",
  isAuthenticated,
  asyncErrorHandler(async (req, res, next) => {
    const { error } = createOrderSchema.validate(req.body, {
      allowUnknown: false,
    });

    // Validate request body
    if (error) {
      return next(new CustomError(error.details[0].message, 400));
    }

    const userId = req.userId;
    const { address, paymentMethod } = req.body;

    let totalAmount = 0;

    // Create the order first
    const order = await Order.create({
      userId,
      address,
      paymentMethod,
      totalAmount: 0,
    });

    // Get the user's cart items
    const cartItems = await CartItem.findAll({ where: { userId } });

    for (const item of cartItems) {
      const product = await Product.findOne({ where: { id: item.productId } });

      if (!product) {
        return next(
          new CustomError(`Product with ID ${item.productId} not found.`, 404)
        );
      }

      totalAmount += product.price * item.quantity;

      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: product.price * item.quantity,
      });
    }

    await order.update({ totalAmount });

    res.status(201).json({ code: 201, data: order });
  })
);

// Get all user orders
router.get(
  "/",
  isAuthenticated,
  asyncErrorHandler(async (req, res) => {
    const userId = req.userId;

    const orders = await Order.findAll({ where: { userId: userId } });

    res.status(200).json({ code: 200, data: orders });
  })
);

// Get an order's details
router.get(
  "/:id",
  isAuthenticated,
  asyncErrorHandler(async (req, res) => {
    const orderId = req.params.id;

    const order = await Order.findOne({
      where: { id: orderId },
      include: [{ model: OrderItem, as: "items" }], // get all orderItems related to this orderId
    });

    if (!order) {
      return next(new CustomError("No orders found.", 404));
    }

    res.status(200).json({ code: 200, data: order });
  })
);

module.exports = router;
