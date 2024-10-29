const express = require("express");

const router = express.Router();

const categoryRoutes = require("./category");
const productRoutes = require("./product");
const userRoutes = require("./user");
const cartRoutes = require("./cart");
const orderRoutes = require("./order.js");

router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/", userRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);

module.exports = router;