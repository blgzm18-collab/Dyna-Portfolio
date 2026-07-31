import express from "express";
import { Client, GatewayIntentBits } from "discord.js";

const DYNA_ID = "1216256359280939111";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.DirectMessages
  ]
});

let dynaStatus = "offline";

client.on("presenceUpdate", (oldPresence, newPresence) => {
  if (newPresence.userId === DYNA_ID) {
    dynaStatus = newPresence.status;
  }
});

client.login(process.env.BOT_TOKEN);

const app = express();

app.get("/presence", (req, res) => {
  res.json({ status: dynaStatus });
});

app.listen(3000, () => console.log("Presence API running"));
