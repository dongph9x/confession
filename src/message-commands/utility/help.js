const { EmbedBuilder } = require("discord.js");
const db = require("../../data/database");

module.exports = {
    name: "help",
    description: "Hiển thị tất cả các lệnh có sẵn",
    aliases: ["h", "commands"],
    async execute(message, args) {
        const guildSettings = await db.getGuildSettings(message.guild.id);
        const prefix = guildSettings?.prefix || "!";

        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle("📚 Menu Trợ Giúp")
            .setDescription(
                `Dưới đây là tất cả các lệnh! Prefix của bot là \`${prefix}\``
            )
            .addFields(
                {
                    name: "🛠️ Tiện ích",
                    value:
                        `\`${prefix}help\` - Hiển thị menu này\n` +
                        `\`${prefix}ping\` - Kiểm tra độ trễ của bot\n` +
                        `\`${prefix}prefix\` - Thay đổi prefix của server`,
                    inline: false,
                },
                {
                    name: "💭 Confession",
                    value:
                        `\`${prefix}setconfess\` - Thiết lập kênh confession\n` +
                        `\`${prefix}confess\` - Gửi confession ẩn danh\n` +
                        `\`${prefix}confessinfo\` - Xem thống kê confession`,
                    inline: false,
                },
                {
                    name: "🎵 Nhạc",
                    value:
                        `\`${prefix}play\` - Phát nhạc\n` +
                        `\`${prefix}skip\` - Bỏ qua bài hát hiện tại\n` +
                        `\`${prefix}queue\` - Xem danh sách phát\n` +
                        `\`${prefix}stop\` - Dừng phát nhạc`,
                    inline: false,
                }
            )
            .setFooter({
                text: "Mẹo: Bạn cũng có thể sử dụng lệnh slash!",
                iconURL: message.client.user.displayAvatarURL(),
            })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    },
};
