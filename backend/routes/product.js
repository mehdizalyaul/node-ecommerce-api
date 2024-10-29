const express = require("express");
const router = express.Router();
const Product = require("../models/Product.js");
const multer = require("multer");
const path = require("path");
const {
  createProductSchema,
  updateProductSchema,
} = require("../validation/productValidation.js");
const asyncErrorHandler = require("../utils/asyncErrorHandler.js");
const CustomError = require("../utils/CustomError");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Create new product
router.post(
  "/products",
  upload.array("images", 7),
  asyncErrorHandler(async (req, res) => {
    const { error } = createProductSchema.validate(req.body, {
      allowUnknown: false,
    });
    if (error) {
      return next(new CustomError(error.details[0].message, 400));
    }

    const { name, description, price, stock, categoryId } = req.body;
    const images = [];

    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        images.push(file.filename);
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      categoryId,
      images,
    });

    res.status(201).json({ code: 201, data: { product } });
  })
);

// Get all products
router.get(
  "/products",
  asyncErrorHandler(async (req, res) => {
    const products = await Product.findAll();

    if (!products || products.length === 0) {
      return next(new CustomError("Products not found", 404));
    }

    res.status(200).json({ code: 200, data: { products } });
  })
);

// Get a single product by ID
router.get(
  "/products/:id",
  asyncErrorHandler(async (req, res) => {
    const id = req.params.id;
    const product = await Product.findOne({ where: { id: id } });

    if (!product) {
      return next(new CustomError("Products not found", 404));
    }

    res.status(200).json({ code: 200, data: { product } });
  })
);

// Delete a product by ID
router.delete(
  "/products/:id",
  asyncErrorHandler(async (req, res) => {
    const id = req.params.id;
    const rowsDeleted = await Product.destroy({ where: { id: id } });

    if (!rowsDeleted) {
      return next(new CustomError("Products not found", 404));
    }

    res
      .status(200)
      .json({ code: 200, message: "Product deleted successfully" });
  })
);

// Update a product by ID
router.put(
  "/products/:id",
  asyncErrorHandler(async (req, res) => {
    const { error } = updateProductSchema.validate(req.body, {
      allowUnknown: false,
    });
    if (error) {
      return next(new CustomError(error.details[0].message, 400));
    }
    const id = req.params.id;
    const [rowsUpdated] = await Product.update(
      { ...req.body },
      { where: { id: id } }
    );

    if (!rowsUpdated) {
      return next(new CustomError("Product not found or no changes made", 404));
    }

    const updatedProduct = await Product.findOne({ where: { id: id } });

    res.status(200).json({ code: 200, data: { product: updatedProduct } });
  })
);

module.exports = router;
