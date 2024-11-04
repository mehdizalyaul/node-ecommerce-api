const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

async function sendEmail(user, subject) {
  const transporter = nodemailer.createTransport({
    host: process.env.TRANSPORT_HOST,
    port: process.env.TRANSPORT_PORT,
    auth: {
      user: process.env.TRANSPORT_USER,
      pass: process.env.TRANSPORT_PASSWORD,
    },
  });

  // Generate and hash a new verification token
  const verifyEmailToken = crypto.randomBytes(32).toString("hex");
  const verifyEmailTokenHashed = await bcrypt.hash(verifyEmailToken, 10);
  const verifyEmailTokenExpire = Date.now() + 3600000; // 1 hour expiration

  // Update user with the new token and expiration
  user.verifyEmailToken = verifyEmailTokenHashed;
  user.verifyEmailTokenExpire = verifyEmailTokenExpire;
  await user.save();

  // Create the verification URL
  const verificationUrl = `http://localhost:${process.env.PORT}/api/verify-email?token=${verifyEmailToken}&email=${email}`;

  // Send the email
  await transporter.sendMail({
    to: user.email,
    subject: subject,
    html: `<p>Welcome ${user.name}, please verify your email by clicking <a href="${verificationUrl}">here</a>.</p>`,
  });
}

module.exports = sendEmail;
