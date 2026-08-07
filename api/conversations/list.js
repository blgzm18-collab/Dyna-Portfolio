// api/conversations/list.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("id, email, name, preview, unread, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return res.json({ success: true, conversations: data });
  } catch (err) {
    console.error("list error", err);
    return res.status(500).json({ success: false, error: err.message || "Server error" });
  }
}
