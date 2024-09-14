require("dotenv").config();
const express = require("express");
const handlebars = require("handlebars");

const { authenticate } = require("./middlewares/authMiddleware");
const { sendEmail } = require("./controllers/sendEmail");

// Express setup
const app = express();
app.use(express.json());

const MAX_CAPACITY = process.env.MAX_CAPACITY || 5;

// Endpoint single email send
app.post("/", authenticate, async (req, res) => {
  const { to, subject, template, props } = req.body;
  if (!to || !subject || !template) {
    return res
      .status(400)
      .json({ error: "Missing required fields, { to, subject, template }" });
  }

  // Compile the Handlebars template
  const compiledTemplate = handlebars.compile(template);
  const htmlContent = compiledTemplate(props);

  // send
  const response = await sendEmail({ to, subject, htmlContent });
  console.log("send res: ", to, " : ", response);

  return res.status(200).json({ message: `Successfully send email to: ${to}` });
});

// Endpoint multipal email send
app.post("/multipal", authenticate, async (req, res) => {
  const { recipients, subject, template } = req.body;
  if (
    !Array.isArray(recipients) ||
    !recipients?.length ||
    !subject ||
    !template
  ) {
    return res.status(400).json({
      error:
        "Missing required fields , { recipients(Array[]), subject, template }",
    });
  }

  if (recipients?.length > MAX_CAPACITY) {
    return res.status(400).json({
      error: `Maximum capacity ${MAX_CAPACITY} recipients but got ${recipients?.length}`,
    });
  }

  // Compile the Handlebars template
  const compiledTemplate = handlebars.compile(template);

  for (const recipient of recipients) {
    const htmlContent = compiledTemplate(recipient?.props);
    const response = await sendEmail({
      to: recipient?.to,
      subject,
      htmlContent,
    });
    console.log("send res: ", recipient?.to, " : ", response);
  }

  return res.status(200).json({ message: `Successfully send emails` });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`> Ready on port http://localhost:${PORT}`);
});
