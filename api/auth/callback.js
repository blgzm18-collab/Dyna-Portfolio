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

    // Fetch logged-in user
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    const discordUser = await userResponse.json();

    // Save user cookie
    res.setHeader(
      "Set-Cookie",
      `user=${encodeURIComponent(JSON.stringify(discordUser))}; Path=/; HttpOnly; SameSite=Lax`
    );

    // ---- Dyna presence check (Option B) ----
    const DYNA_ID = "1216256359280939111";

    const dynaPresenceResponse = await fetch(
      `https://discord.com/api/v10/users/${DYNA_ID}/profile`,
      {
        headers: {
          Authorization: `Bot ${process.env.DYNA_BOT_TOKEN}`
        }
      }
    );

    const dynaProfile = await dynaPresenceResponse.json();

    const isDynaOnline =
      dynaProfile?.presence?.status === "online" ||
      dynaProfile?.presence?.status === "idle" ||
      dynaProfile?.presence?.status === "dnd";

    // Store Dyna status in cookie
    res.setHeader(
      "Set-Cookie",
      `dynaStatus=${isDynaOnline ? "online" : "offline"}; Path=/; SameSite=Lax`
    );

    // Redirect to moderator dashboard if the logged-in user *is* Dyna
    if (discordUser.id === DYNA_ID) {
      return res.redirect("/moderator");
    }

    // Otherwise redirect home
    res.redirect("/");
  } catch (err) {
    console.error("Callback crash:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
