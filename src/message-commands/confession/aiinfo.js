const { EmbedBuilder } = require("discord.js");
const db = require("../../data/mongodb");

module.exports = {
    name: "aiinfo",
    description: "Xem đánh giá chi tiết từ AI cho confession",
    usage: "!aiinfo [confession_id]",
    async execute(message, args) {
        // Xóa tin nhắn gốc
        try {
            await message.delete();
        } catch (error) {
            console.log("Could not delete message:", error.message);
        }

        if (args.length === 0) {
            const errorMsg = await message.channel.send(
                "❌ Vui lòng cung cấp ID confession!\n\n**Cách sử dụng:**\n`!aiinfo [confession_id]`\n\n**Ví dụ:**\n`!aiinfo 6890f2e72ebaa619cfc33332`"
            );
            setTimeout(() => {
                errorMsg.delete().catch(() => {});
            }, 8000);
            return;
        }

        const confessionId = args[0];

        try {
            // Lấy confession từ database
            const confession = await db.getConfession(confessionId);
            
            if (!confession) {
                const errorMsg = await message.channel.send(
                    "❌ Không tìm thấy confession với ID này!"
                );
                setTimeout(() => {
                    errorMsg.delete().catch(() => {});
                }, 5000);
                return;
            }

            // Kiểm tra xem có AI analysis không
            if (!confession.aiAnalysis) {
                const errorMsg = await message.channel.send(
                    "❌ Confession này chưa có đánh giá từ AI!"
                );
                setTimeout(() => {
                    errorMsg.delete().catch(() => {});
                }, 5000);
                return;
            }

            const aiAnalysis = confession.aiAnalysis;

            // Tạo embed chi tiết
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle(`🤖 AI Analysis - Confession #${confessionId}`)
                .setDescription(`**Nội dung:** ${confession.content}`)
                .addFields(
                    { name: "📊 Score", value: `${aiAnalysis.score}/10`, inline: true },
                    { name: "🛡️ Safety Level", value: aiAnalysis.safety_level, inline: true },
                    { name: "📝 Content Type", value: aiAnalysis.content_type, inline: true },
                    { name: "💡 Recommendation", value: aiAnalysis.recommendation, inline: true },
                    { name: "📋 Reason", value: aiAnalysis.reason, inline: false }
                )
                .addFields(
                    { name: "👤 Người gửi", value: confession.isAnonymous ? "🕵️ Ẩn danh" : `<@${confession.userId}>`, inline: true },
                    { name: "⏰ Thời gian", value: `<t:${Math.floor(new Date(confession.createdAt).getTime() / 1000)}:R>`, inline: true },
                    { name: "📈 Trạng thái", value: confession.status, inline: true }
                )
                .setFooter({
                    text: `Confession Bot • ${message.guild.name}`,
                    iconURL: message.guild.iconURL(),
                })
                .setTimestamp();

            // Thêm thông tin confidence nếu có
            if (aiAnalysis.confidence) {
                embed.addFields(
                    { name: "🎯 Confidence", value: `${(aiAnalysis.confidence * 100).toFixed(1)}%`, inline: true }
                );
            }

            // Thêm màu sắc dựa trên safety level
            switch (aiAnalysis.safety_level) {
                case 'APPROPRIATE':
                    embed.setColor(0x00FF00); // Xanh lá
                    break;
                case 'FLAG_FOR_REVIEW':
                    embed.setColor(0xFFA500); // Cam
                    break;
                case 'INAPPROPRIATE':
                    embed.setColor(0xFF0000); // Đỏ
                    break;
                default:
                    embed.setColor(0x808080); // Xám
            }

            const infoMsg = await message.channel.send({ embeds: [embed] });
            setTimeout(() => {
                infoMsg.delete().catch(() => {});
            }, 15000);

        } catch (error) {
            console.error("Lỗi khi lấy AI info:", error);
            const errorMsg = await message.channel.send(
                "❌ Đã xảy ra lỗi khi lấy thông tin AI analysis!"
            );
            setTimeout(() => {
                errorMsg.delete().catch(() => {});
            }, 5000);
        }
    },
}; 