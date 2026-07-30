export default async function handler(req, res) {
  try {
    const code = req.query.code;
    if (!code) {
      return res.status(400).json({ error: "Missing code" });
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
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

    // Fetch user info
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    const user = await userResponse.json();

    // Save user in cookie
    res.setHeader(
      "Set-Cookie",
      `user=${encodeURIComponent(JSON.stringify(user))}; Path=/; HttpOnly; SameSite=Lax`
    );

    // Redirect back to homepage
    res.redirect("/");
  } catch (err) {
    console.error("Callback crash:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

console.log("ENV:", {
  id: process.env.DISCORD_CLIENT_ID,
  secret: process.env.DISCORD_CLIENT_SECRET,
  redirect: process.env.DISCORD_REDIRECT_URI
});
