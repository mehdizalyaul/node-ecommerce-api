const express = require("express");
const router = express.Router();
const CartItem = require("../models/CartItem.js");
const OrderItem = require("../models/OrderItem.js");
const Order = require("../models/Order.js");
const isAuthenticated = require("../middlewares/authMiddleware.js");
const { Model } = require("sequelize");

// Create an order
router.post("/orders", isAuthenticated, async (req, res) => {
  try {
    const userId = req.userId;
    const { address, paymentMethod } = req.body;

    if (!address || !paymentMethod) {
      return res.status(400).json({
        code: 400,
        message: "Address and payment method are required",
      });
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all user orders
router.get("/orders", isAuthenticated, async (req, res) => {
  try {
    const userId = req.userId;

    const orders = await Order.findAll({ where: { userId: userId } });

    if (orders.length <= 0) {
      return res
        .status(404)
        .json({ code: 404, message: "No orders found for this user." });
    }

    res.status(200).json({ code: 200, data: orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get an order's details
router.get("/orders/:id", isAuthenticated, async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findOne({
      where: { id: orderId },
      include: [{ model: OrderItem, as: "items" }],
    });

    if (!order) {
      return res.status(404).json({ code: 404, message: "No orders found." });
    }

    res.status(200).json({ code: 200, data: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
