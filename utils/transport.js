const nodemailer = require("nodemailer");

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
  pool: true, // Enables connection pooling
  maxConnections: 5, // Adjust based on your needs
  maxMessages: 1000, // Max number of messages to send in one connection
  rateDelta: 2000, // Time window for rate limit (2 seconds)
  rateLimit: 50, // Max 50 emails per rateDelta
});

module.exports = { transporter };
