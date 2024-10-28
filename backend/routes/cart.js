const express = require("express");
const router = express.Router();
const CartItem = require("../models/CartItem.js");
const isAuthenticated = require("../middlewares/authMiddleware.js");
const Op = require("sequelize");
const Product = require("../models/Product.js");
const {
  createCartSchema,
  updateCartSchema,
} = require("../validation/cartValidation.js");

//Add item to cart
router.post("/cart", isAuthenticated, async (req, res) => {
  const { error } = createCartSchema.validate(req.body, {
    allowUnknown: false,
  });
  if (error)
    return res
      .status(400)
      .json({ code: 400, message: error.details[0].message });

  try {
    const userId = req.userId;
    const { productId, quantity, description } = req.body;

    const product = await Product.findOne({ where: { id: productId } });

    if (!productId) {
      return res
        .status(400)
        .json({ code: 400, error: { message: "Product is required." } });
    }
    if (quantity <= 0) {
      return res.status(400).json({
        code: 400,
        error: { message: "Quantity must be at least 1." },
      });
    }

    const cartItem = await CartItem.create({
      userId,
      productId,
      quantity,
      description,
      price: product.price * quantity,
    });

    res.status(201).json({ code: 201, data: { cartItem } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get cart items of a user
router.get("/cart", isAuthenticated, async (req, res) => {
  try {
    const userId = req.userId;

    const cartItems = await CartItem.findAll({ where: { userId: userId } });

    if (cartItems.length <= 0) {
      return res
        .status(404)
        .json({ code: 404, message: "cart items not found." });
    }

    res.status(200).json({ code: 200, data: cartItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a cart item
router.put("/cart/:itemId", isAuthenticated, async (req, res) => {
  const { error } = updateCartSchema.validate(req.body, {
    allowUnknown: false,
  });
  if (error)
    return res
      .status(400)
      .json({ code: 400, message: error.details[0].message });

  try {
    const itemId = req.params.itemId;
    const userId = req.userId;
    const { productId, quantity, description } = req.body;

    const [rowsUpdated] = await CartItem.update(
      { productId, quantity, description },
      { where: { userId, id: itemId } }
    );

    if (rowsUpdated === 0) {
      return res.status(404).json({
        code: 404,
        error: { message: "Cart item not found or no changes made." },
      });
    }

    const updatedCart = await CartItem.findOne({
      where: { id: itemId, userId },
    });

    res.status(200).json({ code: 200, data: updatedCart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a cart item
router.delete("/cart/:itemId", isAuthenticated, async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const userId = req.userId;

    const deletedItems = await CartItem.destroy({
      where: { userId, id: itemId },
    });

    if (deletedItems === 0) {
      return res.status(404).json({
        code: 404,
        error: { message: "No item found to delete" },
      });
    }

    res.status(200).json({ code: 200, message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
