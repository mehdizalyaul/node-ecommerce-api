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

//Add item to cart
router.post(
  "/",
  isAuthenticated,
  asyncErrorHandler(async (req, res) => {
    const { error } = createCartSchema.validate(req.body, {
      allowUnknown: false,
    });
    if (error) {
      return next(new CustomError(error.details[0].message, 400));
    }

    const userId = req.userId;
    const { productId, quantity, description } = req.body;

    const product = await Product.findOne({ where: { id: productId } });

    if (!productId) {
      return next(new CustomError("No product has this ID.", 400));
    }

    if (quantity <= 0) {
      return next(new CustomError("Quantity must be at least 1.", 400));
    }

    const cartItem = await CartItem.create({
      userId,
      productId,
      quantity,
      description,
      price: product.price * quantity,
    });

    res.status(201).json({ code: 201, data: { cartItem } });
  })
);

// Get cart items of a user
router.get(
  "/",
  isAuthenticated,
  asyncErrorHandler(async (req, res) => {
    const userId = req.userId;

    const cartItems = await CartItem.findAll({ where: { userId: userId } });

    if (cartItems.length <= 0) {
      return next(new CustomError("cart items not found.", 404));
    }

    res.status(200).json({ code: 200, data: cartItems });
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
    const { productId, quantity, description } = req.body;

    const [rowsUpdated] = await CartItem.update(
      { productId, quantity, description },
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

    res.status(200).json({ code: 200, message: "Item deleted successfully" });
  })
);

module.exports = router;
