require("dotenv").config();
const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

const commands = [];

// Load tất cả commands từ thư mục commands
const loadCommands = () => {
    const commandsPath = path.join(__dirname, "src", "commands");
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
                console.log(`✅ Loaded command: ${command.data.name}`);
            }
        }
    }
};

// Load commands
loadCommands();

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        console.log(`🔄 Bắt đầu đăng ký ${commands.length} slash commands...`);

        // Lấy client ID từ bot token (decode base64)
        const tokenParts = process.env.BOT_TOKEN.split('.');
        const clientId = Buffer.from(tokenParts[0], 'base64').toString();
        console.log(`🔍 Client ID: ${clientId}`);

        // Đăng ký commands cho tất cả guilds (global)
        await rest.put(Routes.applicationCommands(clientId), {
            body: commands,
        });

        console.log("✅ Đã đăng ký thành công các slash commands!");
        console.log(`📝 Số lệnh đã đăng ký: ${commands.length}`);
        
        // Hiển thị danh sách commands
        console.log("\n📋 Danh sách commands:");
        commands.forEach(cmd => {
            console.log(`  - /${cmd.name}: ${cmd.description}`);
        });
        
    } catch (error) {
        console.error("❌ Có lỗi xảy ra khi đăng ký commands:", error);
    }
})(); 