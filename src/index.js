require("dotenv").config();
const {
    Client,
    GatewayIntentBits,
    Collection,
    Partials,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const db = require("./data/mongodb");
const messageHandler = require("./utils/MessageCommandHandler");
const logger = require("./utils/logger");
const config = require("./config/bot");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// Khởi tạo collections
client.commands = new Collection();
client.cooldowns = new Collection();

// Load slash commands
const loadSlashCommands = async () => {
    const commandsPath = path.join(__dirname, "commands");
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
                client.commands.set(command.data.name, command);
                logger.debug(`Loaded command: ${command.data.name}`);
            }
        }
    }
    logger.info(`Loaded ${client.commands.size} slash commands`);
};

// Load events
const loadEvents = async () => {
    const eventsPath = path.join(__dirname, "events");
    const eventFiles = fs
        .readdirSync(eventsPath)
        .filter((file) => file.endsWith(".js"));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
        logger.debug(`Loaded event: ${event.name}`);
    }
    logger.info(`Loaded ${eventFiles.length} events`);
    return eventFiles.length;
};

// Khởi tạo bot
const init = async () => {
    try {
        logger.info("🚀 Starting Confession Bot...");
        logger.info(`Version: ${config.bot.version}`);

        // Khởi tạo database
        await db.connect();
        logger.info("✅ MongoDB connected");

        // Load commands
        await loadSlashCommands();
        await messageHandler.loadCommands();
        logger.info("✅ Commands loaded");

        // Load events
        const eventCount = await loadEvents();
        logger.info("✅ Events loaded");

        // Đăng nhập vào Discord
        await client.login(process.env.BOT_TOKEN);
        logger.info("✅ Bot logged in successfully");
    } catch (error) {
        logger.error("Failed to initialize bot", error);
        process.exit(1);
    }
};

// Xử lý các sự kiện của process
process.on("unhandledRejection", (error) => {
    logger.error("Unhandled promise rejection:", error);
});

process.on("SIGINT", () => {
    logger.info("🛑 Shutting down bot...");
    db.close();
    client.destroy();
    process.exit(0);
});

// Khởi động bot
init();
