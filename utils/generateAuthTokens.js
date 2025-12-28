const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/RefreshToken.js");

const accessSecretKey = `${process.env.ACCESS_SECRET_KEY}`;
const refreshSecretKey = `${process.env.REFRESH_SECRET_KEY}`;

// TODO: move it to a utility file
async function generateTokens(userId) {
  const accessExpiresInMinutes = `${process.env.ACCESS_EXPIRES_IN}`; // minutes
  const refreshExpiresInDays = `${process.env.REFRESH_EXPIRES_IN}`; // days
  // Generate access token
  const accessToken = await jwt.sign({ userId }, accessSecretKey, {
    subject: "accessApi",
    expiresIn: `${accessExpiresInMinutes}`, // access token expires in 5 minutes
  });

  // Generate refresh token
  const refreshToken = await jwt.sign({ userId }, refreshSecretKey, {
    subject: "refreshToken",
    expiresIn: `${refreshExpiresInDays}`, // refresh token expires in 7 days
  });

  let accessExpNumber = accessExpiresInMinutes.slice(
    0,
    accessExpiresInMinutes.length - 1
  );
  accessExpNumber = Number(accessExpNumber);

  // Calculate access token expiry date
  let expiryDate = new Date();
  expiryDate.setMinutes(expiryDate.getMinutes() + accessExpNumber);
  expiryDate = expiryDate.toISOString();

  // Store the new refresh token in the database
  await RefreshToken.create({ userId, expiryDate, token: refreshToken });
  return { accessToken, refreshToken, expiryDate };
}

module.exports = generateTokens;
