// api/conversations/[id]/messages.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  const { id } = req.query;
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  if (!id) return res.status(400).json({ error: "Missing conversation id" });

  try {
    // fetch messages
    const { data: messages, error: msgErr } = await supabase
      .from("messages")
      .select("id, sender, text, created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (msgErr) throw msgErr;

    // mark conversation as read (unread = false)
    const { error: updErr } = await supabase
      .from("conversations")
      .update({ unread: false })
      .eq("id", id);

    if (updErr) console.warn("mark read warning", updErr);

    return res.json({ success: true, messages });
  } catch (err) {
    console.error("messages error", err);
    return res.status(500).json({ success: false, error: err.message || "Server error" });
  }
}
