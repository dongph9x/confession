const { EmbedBuilder } = require("discord.js");
const db = require("../../data/mongodb");

module.exports = {
    name: "setreview",
    description: "Thiết lập kênh review confession (Admin only)",
    async execute(message, args) {
        // Kiểm tra quyền
        if (!message.member.permissions.has('Administrator')) {
            const errorMsg = await message.channel.send(
                "❌ Bạn không có quyền để thiết lập kênh review!"
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
                "❌ Vui lòng mention kênh review!\nCách sử dụng: `!setreview #kênh-review`"
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
                "❌ Không tìm thấy kênh! Vui lòng mention kênh hợp lệ.\nVí dụ: `!setreview #review-confession`"
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
            // Thiết lập kênh review
            await db.setReviewChannel(message.guild.id, channel.id);

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle("✅ Kênh Review Đã Được Thiết Lập")
                .setDescription(`Kênh review confession đã được thiết lập thành công!`)
                .addFields(
                    { name: "👨‍⚖️ Kênh Review", value: channel.toString(), inline: true },
                    { name: "🎯 Trạng thái", value: "✅ Sẵn sàng nhận confession", inline: true }
                )
                .addFields({
                    name: "📋 Cách sử dụng",
                    value: "• `!confess <nội dung>` - Gửi confession\n• Confession sẽ được gửi đến kênh review này\n• Click nút để duyệt/từ chối",
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
            console.error("Lỗi khi thiết lập kênh review:", error);
            const errorMsg = await message.channel.send(
                "❌ Đã xảy ra lỗi khi thiết lập kênh review!"
            );
            setTimeout(() => {
                errorMsg.delete().catch(() => {});
            }, 5000);
        }
    },
};
