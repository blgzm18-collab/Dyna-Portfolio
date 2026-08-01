// /api/get-json.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase
      .from("site_content")
      .select("content")
      .eq("id", 1)
      .single();

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    console.error("Load error:", err);
    res.status(500).json({ error: "Failed to load JSON" });
  }
}
