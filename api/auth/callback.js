export default async function handler(req, res) {
  try {
    const code = req.query.code;
    if (!code) {
      return res.status(400).json({ error: "Missing code" });
    }

    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
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

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      console.error("Token error:", tokenData);
      return res.status(500).json({ error: "Token exchange failed", details: tokenData });
    }

    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const discordUser = await userResponse.json();

    const MOD_IDS = ["1216256359280939111", "1415809741254426714", "1493371173679927316"];

    if (!MOD_IDS.includes(discordUser.id)) {
      return res.redirect("/");
    }

    // Store just what the dashboard needs to display identity —
    // no role field, the mod check above already gates access.
    const identity = {
      id: discordUser.id,
      username: discordUser.username,
      global_name: discordUser.global_name || null,
      avatar: discordUser.avatar || null
    };

    const cookieValue = encodeURIComponent(JSON.stringify(identity));
    const isProd = process.env.NODE_ENV === "production";

    // Readable by client-side JS (no HttpOnly) since moderator.html
    // parses it directly to render the identity card.
    res.setHeader(
      "Set-Cookie",
      `user=${cookieValue}; Path=/; Max-Age=86400; SameSite=Lax${isProd ? "; Secure" : ""}`
    );

    return res.redirect("/moderator.html");
  } catch (err) {
    console.error("Callback crash:", err);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
}
