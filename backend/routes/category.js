const express = require("express");
const router = express.Router();
const Category = require("../models/Category.js");

router.post("/categories", async (req, res) => {
  const { name } = req.body;
  const newCategory = await Category.create({ name });
  res.status(201).json({ code: 201, data: newCategory });
});

module.exports = router;
