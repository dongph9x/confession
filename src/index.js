require("dotenv").config();
const {
    Client,
    GatewayIntentBits,
    Collection,
    Partials,
    EmbedBuilder,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const db = require("./data/mongodb");
const messageHandler = require("./utils/MessageCommandHandler");
const logger = require("./utils/logger");
const config = require("./config/bot");
const { Kazagumo, Plugins } = require("kazagumo");
const { Connectors } = require("shoukaku");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
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

        // Khởi tạo music client
        try {
            client.music = new Kazagumo(
                {
                    defaultSearchEngine: "youtube",
                    send: (guildId, payload) => {
                        const guild = client.guilds.cache.get(guildId);
                        if (guild) guild.shard.send(payload);
                    },
                },
                new Connectors.DiscordJS(client),
                [
                    {
                        name: "Main Node",
                        url: process.env.LAVALINK_URL || "localhost:2333",
                        auth: process.env.LAVALINK_AUTH || "youshallnotpass",
                        secure: false,
                    },
                ]
            );
            
            // Set global reference for music commands
            global.kazagumo = client.music;
            
            // Xử lý lỗi Shoukaku
            client.music.shoukaku.on('error', (_, error) => {
                logger.warn('Lavalink connection error:', error.message);
            });
            
            client.music.shoukaku.on('disconnect', (_, reason) => {
                logger.warn('Lavalink disconnected:', reason);
            });
            
            logger.info("✅ Music client initialized");
        } catch (error) {
            logger.warn("⚠️ Could not initialize music client (Lavalink server not available)");
            logger.info("💡 To use music features, run a Lavalink server");
            global.kazagumo = null;
        }

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

client.on("ready", async () => {
    logger.info("=== Bot Information ===");
    logger.info(`🤖 Bot Name: ${client.user.tag}`);
    logger.info(`📝 Bot ID: ${client.user.id}`);
    logger.info(`🏠 Servers: ${client.guilds.cache.size}`);
    logger.info(`📜 Commands: ${client.commands.size}`);
    logger.info("=====================");

    // Tải cấu hình kênh cho mỗi server
    logger.info("=== Loading Channel Configuration ===");
    for (const guild of client.guilds.cache.values()) {
        const settings = await db.getGuildSettings(guild.id);
        if (settings) {
            if (settings.confessionChannel) {
                const confessionChannel = guild.channels.cache.get(
                    settings.confessionChannel
                );
                if (confessionChannel) {
                    logger.info(`✅ Loaded confession channel for ${guild.name}: ${confessionChannel.name}`);
                }
            }
            if (settings.reviewChannel) {
                const reviewChannel = guild.channels.cache.get(
                    settings.reviewChannel
                );
                if (reviewChannel) {
                    logger.info(`✅ Loaded review channel for ${guild.name}: ${reviewChannel.name}`);
                }
            }
        }
    }
    logger.info("=== Channel Configuration Complete ===");
    
    // Set bot status
    client.user.setActivity('confessions | /help', { type: 'WATCHING' });
});

// Xử lý tương tác
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
        logger.info(`Command executed: ${interaction.commandName} by ${interaction.user.tag} in ${interaction.guild.name}`);
    } catch (error) {
        logger.error(`Error executing command ${interaction.commandName}`, error);
        const errorMessage = {
            content: "❌ Đã xảy ra lỗi khi thực hiện lệnh!",
            ephemeral: true,
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.editReply(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});
