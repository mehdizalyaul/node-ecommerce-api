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
const asyncErrorHandler = require("../utils/asyncErrorHandler.js");
const CustomError = require("../utils/CustomError");

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
router.post(
  "/register",
  asyncErrorHandler(async (req, res, next) => {
    // Schema validation
    const { error } = registerUserSchema.validate(req.body, {
      allowUnknown: false,
    });
    if (error) {
      return next(new CustomError(error.details[0].message, 400));
    }

    const { name, email, password } = req.body;

    // Manual validation
    if (!name || !email || !password) {
      return next(new CustomError("All fields are required", 400));
    }

    // User creation
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    // Success response
    res.status(201).json({ code: 201, data: user });
  })
);

// User Login
router.post(
  "/login",
  asyncErrorHandler(async (req, res, next) => {
    const { error } = loginUserSchema.validate(req.body, {
      allowUnknown: false,
    });
    if (error) {
      return next(new CustomError(error.details[0].message, 400));
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return next(new CustomError("Validation Error", 400));
    }

    const user = await User.findOne({
      where: { email: email },
    });

    if (!user) {
      return next(new CustomError("Invalid credentials", 401));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(new CustomError("Invalid credentials", 401));
    }

    const { accessToken, refreshToken, expiryDate } = await generateTokens(
      user.id
    );

    res
      .status(200)
      .json({ code: 200, data: { accessToken, refreshToken, expiryDate } });
  })
);

// Get all users
router.get(
  "/users",
  asyncErrorHandler(async (req, res, next) => {
    const users = await User.findAll();

    res.status(200).json({ code: 200, data: users });
  })
);

// Get a user by ID
router.get(
  "/users/:id",
  asyncErrorHandler(async (req, res, next) => {
    const id = req.params.id;
    const user = await User.findOne({ where: { id: id } });

    if (!user) {
      return next(new CustomError("User not found", 404));
    }

    res.status(200).json({ code: 200, data: user });
  })
);

// Delete a user by ID
router.delete(
  "/users/:id",
  asyncErrorHandler(async (req, res, next) => {
    const id = req.params.id;
    const userDeleted = await User.destroy({ where: { id: id } });

    if (!userDeleted) {
      return next(new CustomError("User not found", 404));
    }

    res.status(200).json({ code: 200, message: "User deleted successfully" });
  })
);

// Update a user by ID
router.put(
  "/users/:id",
  asyncErrorHandler(async (req, res, next) => {
    const { error } = updateUserSchema.validate(req.body, {
      allowUnknown: false,
    });
    if (error) return next(new CustomError(error.details[0].message, 400));

    const id = req.params.id;

    const [rawsUpdated] = await User.update(
      { ...req.body },
      { where: { id: id } }
    );

    if (!rawsUpdated) {
      return next(new CustomError("User not found or no changes made", 404));
    }

    const updatedUser = await User.findOne({ where: { id: id } });

    res.status(200).json({ code: 200, data: updatedUser });
  })
);

// Refresh Token
router.post(
  "/refresh-token",
  asyncErrorHandler(async (req, res, next) => {
    const { refreshToken } = req.body;

    const decoded = jwt.verify(refreshToken, refreshSecretKey);
    const isTokenValid = await RefreshToken.findOne({
      where: {
        token: refreshToken,
        userId: decoded.userId,
      },
    });

    if (!isTokenValid) {
      return next(new CustomError("Invalid or expired refresh token", 400));
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
  })
);

// Protected
router.get(
  "/profile",
  isAuthenticated,
  asyncErrorHandler(async (req, res, next) => {
    const userId = req.userId;

    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return next(new CustomError("User not found.", 404));
    }

    res.status(200).json({ code: 200, data: user });
  })
);

module.exports = router;
