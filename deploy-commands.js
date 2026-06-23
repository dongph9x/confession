require("dotenv").config();
const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
const logger = require("./src/utils/logger");

const commands = [];
const commandsPath = path.join(__dirname, "src/commands");
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

        if ("data" in command && "execute" in command) {
            commands.push(command.data.toJSON());
            logger.debug(`Preparing command: ${command.data.name}`);
        } else {
            logger.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

if (!process.env.BOT_TOKEN || !process.env.CLIENT_ID) {
    logger.error("Thiếu BOT_TOKEN hoặc CLIENT_ID trong môi trường — không thể deploy.");
    process.exit(1);
}

const rest = new REST().setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        const guildId = process.env.GUILD_ID;

        // Nếu có GUILD_ID → đăng ký theo guild (hiện NGAY LẬP TỨC, tiện test)
        // Nếu không → đăng ký global (có thể mất tới ~1 giờ để hiện)
        const route = guildId
            ? Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId)
            : Routes.applicationCommands(process.env.CLIENT_ID);

        logger.info(
            `Started refreshing ${commands.length} (/) commands ` +
            (guildId ? `cho guild ${guildId} (hiện ngay).` : `global (có thể trễ tới 1 giờ).`)
        );

        const data = await rest.put(route, { body: commands });

        logger.info(`Successfully reloaded ${data.length} application (/) commands.`);

        // Log all deployed commands
        logger.info("Deployed commands:");
        commands.forEach(cmd => {
            logger.info(`  - /${cmd.name}: ${cmd.description}`);
        });

    } catch (error) {
        logger.error("Error deploying commands:", error);
        process.exit(1);
    }
})(); 