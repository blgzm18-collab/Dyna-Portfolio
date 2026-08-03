import { Client, GatewayIntentBits } from "discord.js";
import { createClient } from "@supabase/supabase-js";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

client.on("messageCreate", async (msg) => {
    if (!msg.content.startsWith("!setbio")) return;

    const newBio = msg.content.replace("!setbio", "").trim();
    if (!newBio.length) return msg.reply("Bio cannot be empty.");

    const { error } = await supabase
        .from("dynexed_site")
        .update({ bio: newBio })
        .eq("id", 1);

    if (error) {
        console.error(error);
        return msg.reply("Failed to update bio.");
    }

    msg.reply("Bio updated successfully.");
});

client.login(process.env.BOT_TOKEN);
