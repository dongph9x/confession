const { Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
const db = require("../data/mongodb");

class MessageCommandHandler {
    constructor() {
        this.commands = new Collection();
    }

    async loadCommands() {
        const commandsPath = path.join(__dirname, "..", "message-commands");
        const commandFolders = fs.readdirSync(commandsPath);

        for (const folder of commandFolders) {
            const folderPath = path.join(commandsPath, folder);
            if (!fs.statSync(folderPath).isDirectory()) continue;

            const commandFiles = fs
                .readdirSync(folderPath)
                .filter((file) => file.endsWith(".js"));
            for (const file of commandFiles) {
                const filePath = path.join(folderPath, file);
                const command = require(filePath);

                if ("name" in command && "execute" in command) {
                    this.commands.set(command.name, command);
                }
            }
        }
    }

    async handleMessage(message) {
        if (message.author.bot) return;

        // Handle bot mention
        if (message.mentions.has(message.client.user)) {
            const guildSettings = await db.getGuildSettings(message.guild.id);
            const prefix = guildSettings?.prefix || "!";

            return message.reply({
                content:
                    `👋 Hi! My prefix in this server is \`${prefix}\`\n` +
                    `Use \`${prefix}help\` to see my commands!`,
            });
        }

        // Get guild prefix
        const guildSettings = await db.getGuildSettings(message.guild.id);
        const prefix = guildSettings?.prefix || "!";

        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command =
            this.commands.get(commandName) ||
            this.commands.find(
                (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
            );

        if (!command) return;

        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(error);
            try {
                await message.reply({
                    content: "❌ There was an error executing that command!",
                    flags: 64 // Ephemeral flag
                });
            } catch (replyError) {
                console.error("Error sending error message:", replyError);
            }
        }
    }
}

module.exports = new MessageCommandHandler();
