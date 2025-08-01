const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const db = require("../../data/mongodb");

module.exports = {
    name: "confessionconfig",
    description: "Quản lý cấu hình confession với select menu",
    async execute(message, args) {
        // Xóa tin nhắn gốc
        try {
            await message.delete();
        } catch (error) {
            console.log("Could not delete message:", error.message);
        }

        const guildSettings = await db.getGuildSettings(message.guild.id);
        const anonymousMode = await db.getAnonymousMode(message.guild.id);

        // Tạo embed hiển thị cấu hình hiện tại
        const configEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle("⚙️ Cấu hình Confession Bot")
            .setDescription("Quản lý cài đặt confession cho server")
            .addFields(
                {
                    name: "📝 Kênh Confession",
                    value: guildSettings?.confessionChannel 
                        ? `<#${guildSettings.confessionChannel}>` 
                        : "❌ Chưa thiết lập",
                    inline: true
                },
                {
                    name: "👨‍⚖️ Kênh Review",
                    value: guildSettings?.reviewChannel 
                        ? `<#${guildSettings.reviewChannel}>` 
                        : "❌ Chưa thiết lập",
                    inline: true
                },
                {
                    name: "📊 Confession Counter",
                    value: guildSettings?.confessionCounter?.toString() || "0",
                    inline: true
                },
                {
                    name: "🕵️ Chế độ Ẩn danh",
                    value: anonymousMode ? "✅ Bật" : "❌ Tắt",
                    inline: true
                }
            )
            .setFooter({
                text: `Confession Bot • ${message.guild.name}`,
                iconURL: message.guild.iconURL(),
            })
            .setTimestamp();

        // Tạo select menu cho các action
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("config_action")
            .setPlaceholder("Chọn hành động...")
            .addOptions([
                {
                    label: "📝 Thiết lập kênh confession",
                    description: "Chọn kênh để đăng confessions đã duyệt",
                    value: "setup_confession",
                    emoji: "📝"
                },
                {
                    label: "👨‍⚖️ Thiết lập kênh review",
                    description: "Chọn kênh để review confessions",
                    value: "setup_review",
                    emoji: "👨‍⚖️"
                },
                {
                    label: "🔄 Thiết lập cả hai kênh",
                    description: "Thiết lập cả kênh confession và review",
                    value: "setup_both",
                    emoji: "🔄"
                },
                {
                    label: "🕵️ Chế độ Ẩn danh",
                    description: "Bật/tắt chế độ ẩn danh cho confessions",
                    value: "toggle_anonymous",
                    emoji: "🕵️"
                },
                {
                    label: "📊 Xem thống kê",
                    description: "Xem thống kê confession chi tiết",
                    value: "view_stats",
                    emoji: "📊"
                }
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const configMsg = await message.channel.send({
            embeds: [configEmbed],
            components: [row]
        });

        // Xóa tin nhắn sau 5 phút
        setTimeout(() => {
            configMsg.delete().catch(() => {});
        }, 300000);
    },
}; 