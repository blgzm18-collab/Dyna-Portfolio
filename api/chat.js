let messages = [];

export default function handler(req, res) {
  if (req.method === "POST") {
    const { user, text } = req.body;
    messages.push({
      user,
      text,
      time: new Date().toLocaleTimeString()
    });
    return res.status(200).json({ ok: true });
  }

  if (req.method === "GET") {
    return res.status(200).json(messages);
  }

  res.status(405).json({ error: "Method not allowed" });
}
