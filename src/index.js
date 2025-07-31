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
const db = require("./data/database");
const messageHandler = require("./utils/MessageCommandHandler");
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
            }
        }
    }
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
    }
    return eventFiles.length;
};

// Khởi tạo bot
const init = async () => {
    try {
        console.log("Đang khởi tạo bot...");

        // Khởi tạo database
        await db.init();
        console.log("Đã khởi tạo database");

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
                console.log('⚠️ Lavalink connection error:', error.message);
            });
            
            client.music.shoukaku.on('disconnect', (_, reason) => {
                console.log('⚠️ Lavalink disconnected:', reason);
            });
            
            console.log("✅ Đã khởi tạo music client");
        } catch (error) {
            console.log("⚠️ Không thể khởi tạo music client (Lavalink server không khả dụng)");
            console.log("💡 Để sử dụng tính năng music, hãy chạy Lavalink server");
            global.kazagumo = null;
        }

        // Load commands
        await loadSlashCommands();
        await messageHandler.loadCommands();
        console.log("Đã tải xong các lệnh");

        // Load events
        const eventCount = await loadEvents();
        console.log("Đã tải xong các events");

        // Đăng nhập vào Discord
        await client.login(process.env.BOT_TOKEN);
        console.log("Bot đã đăng nhập thành công");
    } catch (error) {
        console.error("Lỗi trong quá trình khởi tạo:", error);
        process.exit(1);
    }
};

// Xử lý các sự kiện của process
process.on("unhandledRejection", (error) => {
    console.error("Lỗi promise chưa được xử lý:", error);
});

process.on("SIGINT", () => {
    console.log("Đang tắt bot...");
    db.close();
    client.destroy();
    process.exit(0);
});

// Khởi động bot
init();

client.on("ready", async () => {
    console.log("\n=== Thông tin Bot ===");
    console.log(`🤖 Tên Bot: ${client.user.tag}`);
    console.log(`📝 ID Bot: ${client.user.id}`);
    console.log(`🏠 Số server: ${client.guilds.cache.size}`);
    console.log(`📜 Số lệnh: ${client.commands.size}`);
    console.log(`📋 Số event: ${client.eventCount}`);
    console.log("=====================\n");

    // Tải cấu hình kênh cho mỗi server
    console.log("=== Đang tải cấu hình kênh ===");
    for (const guild of client.guilds.cache.values()) {
        const settings = await db.getGuildSettings(guild.id);
        if (settings) {
            if (settings.confession_channel) {
                const confessionChannel = guild.channels.cache.get(
                    settings.confession_channel
                );
                if (confessionChannel) {
                    console.log(
                        `✅ Đã tải kênh confession cho ${guild.name}: ${confessionChannel.name}`
                    );
                }
            }
        }
    }
    console.log("=== Tải cấu hình kênh hoàn tất ===\n");
});

// Xử lý tương tác
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(
            `Lỗi khi thực hiện lệnh ${interaction.commandName}:`,
            error
        );
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
