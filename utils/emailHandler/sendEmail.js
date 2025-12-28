const transporter = require("../../config/nodemailer.js");

async function sendEmail(to, subject, content) {
  return await transporter.sendMail({
    to,
    subject,
    html: content,
  });
}

module.exports = sendEmail;
