const express = require("express");
const CustomError = require("../utils/CustomError");
const globalErrorHandler = require("../utils/globalErrorHandler");

const router = express.Router();

const categoryRoutes = require("./category");
const productRoutes = require("./product");
const userRoutes = require("./user");
const cartRoutes = require("./cart");
const orderRoutes = require("./order.js");

// TODO: group routes by their prefix
router.use("/api/categories", categoryRoutes);
router.use("/api/products", productRoutes);
router.use("/api/", userRoutes);
router.use("/api/cart", cartRoutes);
router.use("/api/orders", orderRoutes);

router.all("*", (req, res, next) => {
    const err = new CustomError(
        `Can't find ${req.originalUrl} on the server!`,
        404
    );

    next(err);
});

router.use(globalErrorHandler);

module.exports = router;