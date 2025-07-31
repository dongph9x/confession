const { EmbedBuilder } = require("discord.js");
const db = require("../../data/database");

module.exports = {
    name: "setconfess",
    description: "Thiết lập kênh confession (Admin only)",
    async execute(message, args) {
        // Kiểm tra quyền
        if (!message.member.permissions.has('Administrator')) {
            const errorMsg = await message.channel.send(
                "❌ Bạn không có quyền để thiết lập kênh confession!"
            );
            setTimeout(() => {
                errorMsg.delete().catch(() => {});
            }, 5000);
            return;
        }

        // Xóa tin nhắn gốc
        try {
            await message.delete();
        } catch (error) {
            console.log("Could not delete message:", error.message);
        }

        // Kiểm tra argument
        if (args.length === 0) {
            const errorMsg = await message.channel.send(
                "❌ Vui lòng mention kênh confession!\nCách sử dụng: `!setconfess #kênh-confession`"
            );
            setTimeout(() => {
                errorMsg.delete().catch(() => {});
            }, 5000);
            return;
        }

        // Lấy kênh từ mention
        const channelMention = args[0];
        const channelId = channelMention.replace(/[<#>]/g, '');
        const channel = message.guild.channels.cache.get(channelId);

        if (!channel) {
            const errorMsg = await message.channel.send(
                "❌ Không tìm thấy kênh! Vui lòng mention kênh hợp lệ.\nVí dụ: `!setconfess #confession`"
            );
            setTimeout(() => {
                errorMsg.delete().catch(() => {});
            }, 5000);
            return;
        }

        if (!channel.isTextBased()) {
            const errorMsg = await message.channel.send(
                "❌ Kênh phải là kênh text!"
            );
            setTimeout(() => {
                errorMsg.delete().catch(() => {});
            }, 5000);
            return;
        }

        try {
            // Thiết lập kênh confession
            await db.setConfessionChannel(message.guild.id, channel.id);

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle("✅ Kênh Confession Đã Được Thiết Lập")
                .setDescription(`Kênh đăng confession đã được thiết lập thành công!`)
                .addFields(
                    { name: "📢 Kênh Confession", value: channel.toString(), inline: true },
                    { name: "🎯 Trạng thái", value: "✅ Sẵn sàng đăng confession", inline: true }
                )
                .addFields({
                    name: "📋 Lưu ý",
                    value: "• Confession đã duyệt sẽ được đăng vào kênh này\n• Đảm bảo bot có quyền gửi tin nhắn trong kênh",
                    inline: false
                })
                .setFooter({
                    text: `Confession Bot • ${message.guild.name}`,
                    iconURL: message.guild.iconURL(),
                })
                .setTimestamp();

            const successMsg = await message.channel.send({ embeds: [embed] });
            setTimeout(() => {
                successMsg.delete().catch(() => {});
            }, 10000);

        } catch (error) {
            console.error("Lỗi khi thiết lập kênh confession:", error);
            const errorMsg = await message.channel.send(
                "❌ Đã xảy ra lỗi khi thiết lập kênh confession!"
            );
            setTimeout(() => {
                errorMsg.delete().catch(() => {});
            }, 5000);
        }
    },
};
