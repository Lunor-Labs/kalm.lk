import { onRequest } from "firebase-functions/v2/https";
import nodemailer from "nodemailer";

// Configure transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // set in Firebase environment
    pass: process.env.GMAIL_PASS, // App password (recommended)
  },
});

export const sessionReminder = onRequest(async (req, res) => {
  try {
    const { to, subject, text } = req.body;

    if (!to || !subject || !text) {
      res.status(400).send("Missing required fields: to, subject, text");
      return;
    }

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).send("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Error sending email");
  }
});
