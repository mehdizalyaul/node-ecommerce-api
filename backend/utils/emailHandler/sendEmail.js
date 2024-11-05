const transporter = require("../../config/nodemailer.js");
const { verifyEmailInfo, resetEmailInfo } = require("./emailResponse.js");
const generateToken = require("./tokenUtils.js");

async function sendEmail(user, path) {
  let subject;
  let html;

  if (path === "/register" || "/resend-verify-email") {
    subject = "User verification email";

    // Generate verification token for user registration
    const { token: verifyEmailToken, tokenHash: verifyEmailTokenHashed } =
      await generateToken();

    user.verifyEmailToken = verifyEmailTokenHashed;
    user.verifyEmailTokenExpire =
      Date.now() + parseInt(process.env.TOKEN_EXPIRATION_TIME);
    await user.save();

    html = await verifyEmailInfo(verifyEmailToken, user);
  } else if (path === "/forgetpassword") {
    subject = "Password reset email";

    // Generate reset token for password reset
    const { token: resetToken, tokenHash: resetTokenHash } =
      await generateToken();

    user.resetToken = resetTokenHash;
    user.resetTokenExpire =
      Date.now() + parseInt(process.env.TOKEN_EXPIRATION_TIME);
    await user.save();

    html = await resetEmailInfo(resetToken, user);
  }

  // Send the email
  await transporter.sendMail({
    to: user.email,
    subject: subject,
    html: html,
  });
}

module.exports = sendEmail;
