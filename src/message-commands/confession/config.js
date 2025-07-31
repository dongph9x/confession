const { EmbedBuilder } = require("discord.js");
const db = require("../../data/database");

module.exports = {
    name: "confessconfig",
    description: "Xem cấu hình confession hiện tại",
    async execute(message, args) {
        // Xóa tin nhắn gốc
        try {
            await message.delete();
        } catch (error) {
            console.log("Could not delete message:", error.message);
        }

        try {
            const guildSettings = await db.getGuildSettings(message.guild.id);
            
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle("⚙️ Cấu hình Confession")
                .setDescription(`Cấu hình cho server **${message.guild.name}**`)
                .setFooter({
                    text: `Confession Bot • ${message.guild.name}`,
                    iconURL: message.guild.iconURL(),
                })
                .setTimestamp();

            // Thông tin kênh confession
            if (guildSettings?.confession_channel) {
                const confessionChannel = message.guild.channels.cache.get(guildSettings.confession_channel);
                embed.addFields({
                    name: "📢 Kênh Confession",
                    value: confessionChannel ? confessionChannel.toString() : "❌ Kênh không tồn tại",
                    inline: true
                });
            } else {
                embed.addFields({
                    name: "📢 Kênh Confession",
                    value: "❌ Chưa thiết lập",
                    inline: true
                });
            }

            // Thông tin kênh review
            if (guildSettings?.review_channel) {
                const reviewChannel = message.guild.channels.cache.get(guildSettings.review_channel);
                embed.addFields({
                    name: "👨‍⚖️ Kênh Review",
                    value: reviewChannel ? reviewChannel.toString() : "❌ Kênh không tồn tại",
                    inline: true
                });
            } else {
                embed.addFields({
                    name: "👨‍⚖️ Kênh Review",
                    value: "❌ Chưa thiết lập",
                    inline: true
                });
            }

            // Thông tin counter
            embed.addFields({
                name: "🔢 Số Confession",
                value: `${guildSettings?.confession_counter || 0}`,
                inline: true
            });

            // Hướng dẫn thiết lập
            if (!guildSettings?.review_channel) {
                embed.addFields({
                    name: "📋 Hướng dẫn thiết lập",
                    value: "1. Tạo kênh review: `!setreview #review-confession`\n2. Tạo kênh confession: `!setconfess #confession`\n3. Gửi confession: `!confess <nội dung>`",
                    inline: false
                });
            }

            const configMsg = await message.channel.send({ embeds: [embed] });
            setTimeout(() => {
                configMsg.delete().catch(() => {});
            }, 15000);

        } catch (error) {
            console.error("Lỗi khi lấy cấu hình confession:", error);
            const errorMsg = await message.channel.send(
                "❌ Đã xảy ra lỗi khi lấy cấu hình!"
            );
            setTimeout(() => {
                errorMsg.delete().catch(() => {});
            }, 5000);
        }
    },
}; 