// /api/save-json.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const json = req.body;

    // Validate JSON
    if (typeof json !== "object") {
      return res.status(400).json({ error: "Invalid JSON" });
    }

    // Update row with id=1
    const { error } = await supabase
      .from("site_content")
      .update({ content: json })
      .eq("id", 1);

    if (error) throw error;

    res.status(200).json({ message: "Saved successfully!" });
  } catch (err) {
    console.error("Save error:", err);
    res.status(500).json({ error: "Database save failed" });
  }
}
