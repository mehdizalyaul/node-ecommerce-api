const express = require("express");
const router = express.Router();
const Product = require("../models/Product.js");
const multer = require("multer");
const path = require("path");

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
router.post("/products", upload.array("images", 7), async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;

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
      category,
      images,
    });

    res.status(201).json({ code: 201, data: { product } });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Get all products
router.get("/products", async (req, res) => {
  try {
    const products = await Product.findAll();

    if (!products || products.length === 0) {
      return res.status(404).json({ code: 404, message: "Products not found" });
    }

    res.status(200).json({ code: 200, data: { products } });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Get a single product by ID
router.get("/products/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findOne({ where: { id: id } });

    if (!product) {
      return res.status(404).json({ code: 404, message: "Product not found" });
    }

    res.status(200).json({ code: 200, data: { product } });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Delete a product by ID
router.delete("/products/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const rowsDeleted = await Product.destroy({ where: { id: id } });

    if (!rowsDeleted) {
      return res.status(404).json({ code: 404, message: "Product not found" });
    }

    res
      .status(200)
      .json({ code: 200, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Update a product by ID
router.put("/products/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const [rowsUpdated] = await Product.update(
      { ...req.body },
      { where: { id: id } }
    );

    if (!rowsUpdated) {
      return res
        .status(404)
        .json({ code: 404, message: "Product not found or no changes made" });
    }

    const updatedProduct = await Product.findOne({ where: { id: id } });

    res.status(200).json({ code: 200, data: { product: updatedProduct } });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
