const express = require("express");
const router = express.Router();
const CartItem = require("../models/CartItem.js");
const OrderItem = require("../models/OrderItem.js");
const Order = require("../models/Order.js");
const isAuthenticated = require("../middlewares/authMiddleware.js");

// Create an order
router.post("/orders", isAuthenticated, async (req, res) => {
  try {
    const userId = req.userId;
    const { address, paymentMethod } = req.body;
    let totalAmount = 0;

    // Create the initial order entry
    const order = await Order.create({ userId, address, paymentMethod });

    // Retrieve cart items
    const cartItems = await CartItem.findAll({ where: { userId } });

    // Iterate over cart items to calculate totalAmount and create order items
    for (const item of cartItems) {
      totalAmount += item.price * item.quantity;

      // Create order item for each cart item
      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      });
    }

    // Update order with the calculated total amount
    await order.update({ totalAmount });

    res.status(201).json({ code: 201, data: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
