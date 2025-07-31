const { REST, Routes } = require("discord.js");
const { clientId, guildId, token } = require("./config.json");

const commands = [
    {
        name: "confess",
        description: "Gửi một confession mới",
        options: [
            {
                name: "content",
                description: "Nội dung confession",
                type: 3, // STRING type
                required: true,
            },
        ],
    },
    {
        name: "setreviewchannel",
        description: "Thiết lập kênh kiểm duyệt confession",
        options: [
            {
                name: "channel",
                description: "Kênh để kiểm duyệt confession",
                type: 7, // CHANNEL type
                required: true,
            },
        ],
    },
    {
        name: "setconfessionchannel",
        description: "Thiết lập kênh hiển thị confession",
        options: [
            {
                name: "channel",
                description: "Kênh để hiển thị confession",
                type: 7, // CHANNEL type
                required: true,
            },
        ],
    },
    {
        name: "help",
        description: "Hiển thị danh sách các lệnh có sẵn",
    },
];

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
    try {
        console.log("Bắt đầu đăng ký các slash commands...");

        await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
            body: commands,
        });

        console.log("Đã đăng ký thành công các slash commands!");
    } catch (error) {
        console.error("Có lỗi xảy ra khi đăng ký commands:", error);
    }
})();
