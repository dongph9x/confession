const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../../data/mongodb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("aiinfo")
        .setDescription("Xem thông tin AI analysis của confession")
        .addStringOption(option =>
            option.setName("confession_id")
                .setDescription("ID của confession")
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        
        const confessionId = interaction.options.getString("confession_id");

        try {
            const confession = await db.getConfession(confessionId);
            
            if (!confession) {
                return interaction.editReply({
                    content: "❌ Không tìm thấy confession với ID này!",
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`🤖 AI Analysis - Confession #${confessionId}`)
                .setDescription(`**Nội dung:**\n${confession.content}`)
                .addFields(
                    { name: "📊 Trạng thái", value: confession.status, inline: true },
                    { name: "👤 Người gửi", value: `<@${confession.userId}>`, inline: true },
                    { name: "📅 Thời gian", value: `<t:${Math.floor(new Date(confession.createdAt).getTime() / 1000)}:R>`, inline: true }
                );

            if (confession.aiAnalysis) {
                const ai = confession.aiAnalysis;
                embed.addFields(
                    { name: "🤖 AI Analysis", value: "**Safety Level:** " + ai.safety_level + "\n**Content Type:** " + ai.content_type + "\n**Score:** " + ai.score + "/10", inline: false },
                    { name: "📝 Lý do", value: ai.reason, inline: false },
                    { name: "🎯 Khuyến nghị", value: ai.recommendation, inline: true },
                    { name: "📊 Độ tin cậy", value: (ai.confidence * 100).toFixed(1) + "%", inline: true },
                    { name: "⏰ Phân tích lúc", value: ai.analyzedAt ? `<t:${Math.floor(new Date(ai.analyzedAt).getTime() / 1000)}:R>` : "N/A", inline: true }
                );

                // Thêm màu sắc dựa trên safety level
                switch (ai.safety_level) {
                    case 'APPROPRIATE':
                        embed.setColor(0x00FF00);
                        break;
                    case 'FLAG_FOR_REVIEW':
                        embed.setColor(0xFFA500);
                        break;
                    case 'INAPPROPRIATE':
                        embed.setColor(0xFF0000);
                        break;
                }
            } else {
                embed.addFields(
                    { name: "🤖 AI Analysis", value: "❌ Chưa được phân tích bởi AI", inline: false }
                );
            }

            embed.setTimestamp();

            await interaction.editReply({
                embeds: [embed],
                ephemeral: true
            });

        } catch (error) {
            console.error("Error getting AI info:", error);
            await interaction.editReply({
                content: "❌ Đã xảy ra lỗi khi lấy thông tin AI!",
                ephemeral: true
            });
        }
    },
}; 