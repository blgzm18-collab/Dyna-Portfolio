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
    // Parse and validate JSON
    const data = typeof req.body === "object" ? req.body : JSON.parse(req.body);

    // Update Supabase table
    const { error } = await supabase
      .from("site_content")
      .update({ content: data })
      .eq("id", 1);

    if (error) throw error;

    res.status(200).json({ message: "Saved successfully!" });
  } catch (err) {
    console.error("Save error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      details: err.message || "Unknown error"
    });
  }
}
