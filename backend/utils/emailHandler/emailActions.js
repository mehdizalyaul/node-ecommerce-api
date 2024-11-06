const generateToken = require("./tokenUtils.js");
const sendEmail = require("./sendEmail.js");

async function sendVerificationEmail(user) {
  const subject = "User verification email";

  // Generate verification token for user registration
  const { token: verifyEmailToken, tokenHash: verifyEmailTokenHashed } =
    await generateToken();

  user.verifyEmailToken = verifyEmailTokenHashed;
  user.verifyEmailTokenExpire =
    Date.now() + parseInt(process.env.TOKEN_EXPIRATION_TIME);
  await user.save();

  const html = await verifyEmailInfo(verifyEmailToken, user);
  await sendEmail(user.email, subject, html);
}

async function sendPasswordResetEmail(user) {
  const subject = "Password reset email";

  // Generate reset token for password reset
  const { token: resetToken, tokenHash: resetTokenHash } =
    await generateToken();

  user.resetToken = resetTokenHash;
  user.resetTokenExpire =
    Date.now() + parseInt(process.env.TOKEN_EXPIRATION_TIME);
  await user.save();

  const html = await resetEmailInfo(resetToken, user);
  await sendEmail(user.email, subject, html);
}

module.exports = { handleVerifyEmail, handleForgetPasswordEmail };
