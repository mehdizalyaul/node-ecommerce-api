async function verifyEmailInfo(token, user) {
  const verificationUrl = `http://localhost:${process.env.PORT}/api/verify-email?token=${token}&email=${user.email}`;
  const html = `<p>Welcome ${user.name}, please verify your email by clicking <a href="${verificationUrl}">here</a>.</p>`;
  return html;
}

async function resetEmailInfo(token, user) {
  const resetUrl = `http://localhost:${process.env.PORT}/api/reset-password/${token}`;
  const html = `<p>Welcome ${user.name}, please click <a href="${resetUrl}">here</a> to reset your password.</p>`;

  return html;
}

module.exports = { verifyEmailInfo, resetEmailInfo };
