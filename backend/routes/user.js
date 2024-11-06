const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middlewares/authMiddleware.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User.js");
const CustomError = require("../utils/CustomError");
const {
  registerUserSchema,
  loginUserSchema,
  updateUserSchema,
} = require("../validation/userValidation.js");
const asyncErrorHandler = require("../utils/asyncErrorHandler.js");
const generateTokens = require("../utils/generateAuthTokens.js");
const Sequelize = require("sequelize");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../utils/emailHandler/emailActions.js");

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

    // User creation
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    await sendVerificationEmail(user);
    // Success response
    res.status(201).json({ code: 201, message: "Email verification sent" });
  })
);

// Email Verification
router.get(
  "/verify-email",
  asyncErrorHandler(async (req, res, next) => {
    const { token, email } = req.query;

    const user = await User.findOne({
      where: {
        email: email,
        verifyEmailTokenExpire: { [Sequelize.Op.gt]: Date.now() },
      },
    });

    // Check if user exists and token hasn't expired
    if (!user) {
      return next(new CustomError("Invalid or expired token.", 400));
    }

    // Compare the provided token with the stored hashed token
    const isTokenValid = await bcrypt.compare(token, user.verifyEmailToken);

    if (!isTokenValid) {
      return next(new CustomError("Invalid token.", 400));
    }

    user.isEmailVerified = true;
    user.verifyEmailToken = null; // Clear the token
    user.verifyEmailTokenExpire = null; // Clear expiration
    await user.save();

    res.status(200).json({ message: "Email verified successfully." });
  })
);

//Resend verification Email
router.post(
  "/resend-verify-email",
  asyncErrorHandler(async (req, res, next) => {
    const { email } = req.query;

    // Find user who is not yet verified and matches the provided email
    const user = await User.findOne({
      where: {
        email: email,
        isEmailVerified: false,
      },
    });

    if (!user) {
      return next(
        new CustomError("User is already verified or does not exist.", 400)
      );
    }

    await sendVerificationEmail(user);

    // Respond with success
    res
      .status(200)
      .json({ message: "Verification email resent successfully." });
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
    console.log(accessToken);
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

    if (userDeleted === 0) {
      return next(new CustomError("User not found", 404));
    }

    res.status(204).json({ code: 204, data: null });
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

    const [rowsUpdated] = await User.update(
      { ...req.body },
      { where: { id: id } }
    );

    if (rowsUpdated === 0) {
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

//Forget Password
router.post(
  "/forgetpassword",
  asyncErrorHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return next(new CustomError("Email not found", 404));
    }

    await sendPasswordResetEmail(user);

    res.status(200).json({ code: 200, message: "Password reset email sent" });
  })
);

// Reset Password
router.post("/reset-password/:token", async (req, res, next) => {
  const token = req.params.token;
  const { newPassword, userId } = req.body;

  // Find the user with the token that hasn’t expired
  const user = await User.findOne({
    where: {
      id: userId,
      resetTokenExpire: { [Sequelize.Op.gt]: Date.now() },
    },
  });

  if (!user) {
    return next(new CustomError("Invalid or expired token.", 400));
  }

  // Compare the plain token with the hashed token in the database
  const isMatch = await bcrypt.compare(token, user.resetToken);
  if (!isMatch) {
    return next(new CustomError("Invalid token.", 400));
  }

  // Hash the new password and update it
  const newPasswordHashed = await bcrypt.hash(newPassword, 10);
  user.password = newPasswordHashed;

  // Clear the reset token and expiration
  user.resetToken = null;
  user.resetTokenExpire = null;
  await user.save();

  res
    .status(200)
    .json({ code: 200, message: "Password has been reset successfully." });
});

module.exports = router;
