import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/* ============================
   EMAIL TRANSPORT
   ============================ */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/* ============================
   CONTACT ENDPOINT
   ============================ */

app.post("/api/contact", async (req, res) => {
  const { email, name, message } = req.body;

  if (!email || !name || !message) {
    return res.status(400).json({ success: false, error: "Missing fields" });
  }

  try {
    await transporter.sendMail({
      from: `"Dynabot" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Dynabot message from ${name}`,
      replyTo: email,
      text: `
From: ${name} <${email}>

Message:
${message}
      `
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ success: false, error: "Email failed" });
  }
});

/* ============================
   START SERVER
   ============================ */

app.listen(PORT, () => {
  console.log(`Dynabot backend running on http://localhost:${PORT}`);
});
