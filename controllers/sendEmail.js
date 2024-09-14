const { transporter } = require("../utils/transport");

async function sendEmail(mailOptions) {
  const { to, subject, htmlContent } = mailOptions;
  const options = {
    from: process.env.EMAIL,
    to, // Recipient email
    subject, // Email subject
    html: htmlContent, // Compiled HTML content
  };
  return await transporter.sendMail(options);
}

module.exports = { sendEmail };
