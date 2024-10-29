const express = require("express");
const router = express.Router();
const CartItem = require("../models/CartItem.js");
const OrderItem = require("../models/OrderItem.js");
const Order = require("../models/Order.js");
const isAuthenticated = require("../middlewares/authMiddleware.js");
const { createOrderSchema } = require("../validation/orderValidation.js");
const asyncErrorHandler = require("../utils/asyncErrorHandler.js");
const CustomError = require("../utils/CustomError");

// Create an order
router.post(
  "/",
  isAuthenticated,
  asyncErrorHandler(async (req, res) => {
    const { error } = createOrderSchema.validate(req.body, {
      allowUnknown: false,
    });
    if (error) {
      return next(new CustomError(error.details[0].message, 400));
    }
    const userId = req.userId;
    const { address, paymentMethod } = req.body;

    if (!address || !paymentMethod) {
      return next(
        new CustomError("Address and payment method are required", 400)
      );
    }

    let totalAmount = 0;

    const order = await Order.create({
      userId,
      address,
      paymentMethod,
      totalAmount,
    });

    const cartItems = await CartItem.findAll({ where: { userId } });

    for (const item of cartItems) {
      totalAmount += item.price * item.quantity;

      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
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

    if (orders.length <= 0) {
      return next(new CustomError("No orders found for this user.", 404));
    }

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
      include: [{ model: OrderItem, as: "items" }],
    });

    if (!order) {
      return next(new CustomError("No orders found.", 404));
    }

    res.status(200).json({ code: 200, data: order });
  })
);

module.exports = router;
