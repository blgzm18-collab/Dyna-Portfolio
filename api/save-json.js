// /api/save-json.js
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const filePath = path.join(process.cwd(), "public", "content.json");
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
    res.status(200).json({ message: "JSON saved successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save JSON." });
  }
}
