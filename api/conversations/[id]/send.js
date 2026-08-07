// api/conversations/[id]/send.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  const { id } = req.query;
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!id) return res.status(400).json({ error: "Missing conversation id" });

  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: "Missing message" });

  try {
    // insert support message
    const { data: msgData, error: msgErr } = await supabase
      .from("messages")
      .insert({ conversation_id: id, sender: "support", text: message })
      .select("id, created_at")
      .single();

    if (msgErr) throw msgErr;

    // update conversation preview and mark unread = false (since support replied)
    const preview = message.slice(0, 120);
    const { error: convoErr } = await supabase
      .from("conversations")
      .update({ preview, unread: false })
      .eq("id", id);

    if (convoErr) console.warn("update convo preview warning", convoErr);

    return res.json({ success: true, message: msgData });
  } catch (err) {
    console.error("send error", err);
    return res.status(500).json({ success: false, error: err.message || "Server error" });
  }
}
