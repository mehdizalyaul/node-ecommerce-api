const express = require("express");
const router = express.Router();
const Product = require("../models/Product.js");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads"); // Adjust the path as necessary
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

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

    res.status(200).json({ code: 200, data: { product } });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
