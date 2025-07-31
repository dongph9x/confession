const { EmbedBuilder } = require("discord.js");
const db = require("../../data/database");

module.exports = {
    name: "confessstats",
    description: "Xem thống kê confession",
    async execute(message, args) {
        // Xóa tin nhắn gốc
        try {
            await message.delete();
        } catch (error) {
            console.log("Could not delete message:", error.message);
        }

        try {
            const stats = await db.getConfessionStats(message.guild.id);
            const guildSettings = await db.getGuildSettings(message.guild.id);

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle("📊 Thống Kê Confession")
                .setDescription(`Thống kê confession của server **${message.guild.name}**`)
                .addFields(
                    { name: "📝 Tổng số confession", value: `${stats.total || 0}`, inline: true },
                    { name: "⏳ Đang chờ duyệt", value: `${stats.pending || 0}`, inline: true },
                    { name: "✅ Đã duyệt", value: `${stats.approved || 0}`, inline: true },
                    { name: "❌ Đã từ chối", value: `${stats.rejected || 0}`, inline: true },
                    { name: "🔢 Số confession hiện tại", value: `${guildSettings?.confession_counter || 0}`, inline: true }
                )
                .setFooter({
                    text: `Confession Bot • ${message.guild.name}`,
                    iconURL: message.guild.iconURL(),
                })
                .setTimestamp();

            // Thêm thông tin về kênh
            if (guildSettings?.confession_channel) {
                const confessionChannel = message.guild.channels.cache.get(guildSettings.confession_channel);
                embed.addFields({
                    name: "📢 Kênh confession",
                    value: confessionChannel ? confessionChannel.toString() : "❌ Kênh không tồn tại",
                    inline: false
                });
            }

            if (guildSettings?.review_channel) {
                const reviewChannel = message.guild.channels.cache.get(guildSettings.review_channel);
                embed.addFields({
                    name: "👨‍⚖️ Kênh review",
                    value: reviewChannel ? reviewChannel.toString() : "❌ Kênh không tồn tại",
                    inline: false
                });
            }

            const statsMsg = await message.channel.send({ embeds: [embed] });
            setTimeout(() => {
                statsMsg.delete().catch(() => {});
            }, 15000);

        } catch (error) {
            console.error("Lỗi khi lấy thống kê confession:", error);
            const errorMsg = await message.channel.send(
                "❌ Đã xảy ra lỗi khi lấy thống kê!"
            );
            setTimeout(() => {
                errorMsg.delete().catch(() => {});
            }, 5000);
        }
    },
}; 