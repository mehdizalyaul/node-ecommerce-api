const express = require("express");
const router = express.Router();
const User = require("../models/User.js");

// create a user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.create({ name, email, password });

    res.status(200).json({ code: 201, data: user });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.findAll();

    res.status(200).json({ code: 200, data: users });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Get a user by ID
router.get("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({ where: { id: id } });

    if (!user) {
      res.status(404).json({ code: 404, message: "User not found" });
    }

    res.status(200).json({ code: 200, data: user });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Delete a user by ID
router.delete("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const userDeleted = await User.destroy({ where: { id: id } });

    if (!userDeleted) {
      res.status(404).json({ code: 404, message: "User not found" });
    }

    res.status(200).json({ code: 200, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Update a user by ID
router.put("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const [rawsUpdated] = await User.update(
      { ...req.body },
      { where: { id: id } }
    );

    if (!rawsUpdated) {
      res
        .status(404)
        .json({ code: 404, message: "User not found or no changes made" });
    }

    const updatedUser = await User.findOne({ where: { id: id } });

    res.status(200).json({ code: 200, data: updatedUser });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
