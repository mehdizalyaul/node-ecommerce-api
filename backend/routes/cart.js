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
const asyncErrorHandler = require("../utils/asyncErrorHandler.js");
const CustomError = require("../utils/CustomError");
// TODO: create a getter method to calculate the total price of the cart item by multiplying the product price with the quantity

// Add item to cart
router.post(
  "/",
  isAuthenticated,
  asyncErrorHandler(async (req, res, next) => {
    const { error } = createCartSchema.validate(req.body, {
      allowUnknown: false,
    });

    if (error) {
      return next(new CustomError(error.details[0].message, 400));
    }

    const userId = req.userId;
    const { productId, quantity } = req.body;

    // Check if the product exists
    const product = await Product.findOne({ where: { id: productId } });

    if (!product) {
      return next(new CustomError("No product has this ID.", 400));
    }

    const cartItem = await CartItem.create({
      userId,
      productId: product.id,
      quantity,
    });

    res.status(201).json({ code: 201, data: cartItem });
  })
);

// Get cart items of a user
router.get(
  "/",
  isAuthenticated,
  asyncErrorHandler(async (req, res) => {
    const userId = req.userId;

    const cartItems = await CartItem.findAll({ where: { userId: userId } });

    res.status(200).json({ code: 200, data: cartItems });
  })
);

// Get a single cart item by ID
router.get(
  "/:itemId",
  isAuthenticated,
  asyncErrorHandler(async (req, res) => {
    const itemId = req.params.itemId;
    const userId = req.userId;

    const cartItem = await CartItem.findOne({ where: { userId, id: itemId } });

    if (!cartItem) {
      return next(new CustomError("Item not exist in your cart", 404));
    }

    res.status(200).json({ code: 200, data: cartItem });
  })
);

// Update a cart item
router.put(
  "/:itemId",
  isAuthenticated,
  asyncErrorHandler(async (req, res) => {
    const { error } = updateCartSchema.validate(req.body, {
      allowUnknown: false,
    });

    if (error) {
      return next(new CustomError(error.details[0].message, 400));
    }

    const itemId = req.params.itemId;
    const userId = req.userId;
    const { productId, quantity } = req.body;

    const [rowsUpdated] = await CartItem.update(
      { productId, quantity },
      { where: { userId, id: itemId } }
    );

    if (rowsUpdated === 0) {
      return next(
        new CustomError("Cart item not found or no changes made.", 404)
      );
    }

    const updatedCart = await CartItem.findOne({
      where: { id: itemId, userId },
    });

    res.status(200).json({ code: 200, data: updatedCart });
  })
);

// Delete a cart item
router.delete(
  "/:itemId",
  isAuthenticated,
  asyncErrorHandler(async (req, res) => {
    const itemId = req.params.itemId;
    const userId = req.userId;

    const deletedItems = await CartItem.destroy({
      where: { userId, id: itemId },
    });

    if (deletedItems === 0) {
      return next(new CustomError("No item found to delete", 404));
    }

    res.status(204).json({ code: 204, data: null });
  })
);

module.exports = router;
