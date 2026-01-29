import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith("create")) {
    const url = message.content.split("create")[1];
    return message.reply({
      content: "Generating short ID for.... " + url,
    });
  }
  message.reply({
    content: "Hi form Stash",
  });
});
client.login(process.env.DISCORD_DOT);

client.on("interactionCreate", (integration) => {
  integration.reply("Ming!!");
});
