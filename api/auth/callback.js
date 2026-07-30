export default async function handler(req, res) {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).json({ error: "Missing code" });

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI
      })
    });


    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error("Token exchange failed:", tokenData);
      return res.status(500).json({ error: "Token exchange failed" });
    }

    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const user = await userRes.json();

    res.setHeader("Set-Cookie", `user=${encodeURIComponent(JSON.stringify(user))}; Path=/; HttpOnly;`);
    res.redirect("/");
  } catch (err) {
    console.error("Callback error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
