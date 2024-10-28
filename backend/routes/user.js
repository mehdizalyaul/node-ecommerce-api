const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User.js");
const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/RefreshToken.js");
const isAuthenticated = require("../middlewares/authMiddleware.js");
const {
  registerUserSchema,
  loginUserSchema,
  updateUserSchema,
} = require("../validation/userValidation.js");

const accessSecretKey = `${process.env.ACCESS_SECRET_KEY}`;
const refreshSecretKey = `${process.env.REFRESH_SECRET_KEY}`;

async function generateTokens(userId) {
  const accessExpiresIn = `${process.env.ACCESS_EXPIRES_IN}`; // minutes
  const refreshExpiresIn = `${process.env.REFRESH_EXPIRES_IN}`; // days

  // Generate access token
  const accessToken = await jwt.sign({ userId }, accessSecretKey, {
    subject: "accessApi",
    expiresIn: `${accessExpiresIn}m`, // access token expires in 5 minutes
  });

  // Generate refresh token
  const refreshToken = await jwt.sign({ userId }, refreshSecretKey, {
    subject: "refreshToken",
    expiresIn: `${refreshExpiresIn}d`, // refresh token expires in 7 days
  });

  // Calculate access token expiry date
  let expiryDate = new Date();
  expiryDate.setMinutes(expiryDate.getMinutes() + accessExpiresIn);
  expiryDate = expiryDate.toISOString();

  // Store the new refresh token in the database
  await RefreshToken.create({ userId, expiryDate, token: refreshToken });
  return { accessToken, refreshToken, expiryDate };
}

// create a user
router.post("/register", async (req, res) => {
  const { error } = registerUserSchema.validate(req.body, {
    allowUnknown: false,
  });
  if (error) return res.status(400).json({ message: error.details[0].message });
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ code: 400, error: "Validation Error" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ code: 201, data: user });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// User Login
router.post("/login", async (req, res) => {
  const { error } = loginUserSchema.validate(req.body, {
    allowUnknown: false,
  });
  if (error) return res.status(400).json({ message: error.details[0].message });
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ code: 400, error: "Validation Error" });
    }

    const user = await User.findOne({
      where: { email: email },
    });

    if (!user) {
      res.status(404).json({ code: 404, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
    }

    const { accessToken, refreshToken, expiryDate } = await generateTokens(
      user.id
    );

    res
      .status(200)
      .json({ code: 200, data: { accessToken, refreshToken, expiryDate } });
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
  const { error } = updateUserSchema.validate(req.body, {
    allowUnknown: false,
  });
  if (error) return res.status(400).json({ message: error.details[0].message });
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

// Refresh Token
router.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;
  try {
    const decoded = jwt.verify(refreshToken, refreshSecretKey);
    const isTokenValid = await RefreshToken.findOne({
      where: {
        token: refreshToken,
        userId: decoded.userId,
      },
    });

    if (!isTokenValid) {
      return res
        .status(400)
        .json({ error: "Invalid or expired refresh token" });
    }

    await RefreshToken.destroy({
      where: { token: refreshToken, userId: decoded.userId },
    });

    // Generate new tokens
    const {
      accessToken,
      refreshToken: newRefreshToken,
      expiryDate,
    } = await generateTokens(decoded.userId);

    res.status(200).json({
      code: 200,
      data: { accessToken, refreshToken: newRefreshToken, expiryDate },
    });
  } catch (error) {
    res
      .status(401)
      .json({ code: 401, message: "Invalid or expired refresh token" });
    console.error("Token is invalid or expired:", error.message);
  }
});

// Protected
router.get("/profile", isAuthenticated, async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ code: 404, message: "User not found." });
    }

    res.status(200).json({ code: 200, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
