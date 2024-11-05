// tokenUtils.js
const crypto = require("crypto");
const bcrypt = require("bcrypt");

async function generateToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = await bcrypt.hash(token, 10);
  return { token, tokenHash };
}

module.exports = { generateToken };
