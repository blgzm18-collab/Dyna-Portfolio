// api/conversations/create.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, name, message } = req.body || {};
  if (!email || !name || !message) return res.status(400).json({ error: "Missing fields" });

  try {
    const { data: convo, error: convoErr } = await supabase
      .from("conversations")
      .insert({
        email,
        name,
        preview: message.slice(0, 120),
        unread: true
      })
      .select("id, email, name, preview, unread, created_at")
      .single();

    if (convoErr) throw convoErr;

    const { error: msgErr } = await supabase.from("messages").insert({
      conversation_id: convo.id,
      sender: "user",
      text: message
    });

    if (msgErr) throw msgErr;

    return res.json({ success: true, conversation: convo });
  } catch (err) {
    console.error("create conversation error", err);
    return res.status(500).json({ success: false, error: err.message || "Server error" });
  }
}
