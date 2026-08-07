// api/contact.js
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { to, subject, html } = await req.json();
    if (!to || !subject || !html) return res.status(400).json({ error: "Missing to, subject, or html" });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html
    });

    return res.json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error("send error", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
}
