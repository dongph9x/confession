const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../../data/mongodb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("aistats")
        .setDescription("Xem thống kê AI analysis"),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            // Lấy thống kê từ database
            const Confession = require("../../models/Confession");
            
            const totalConfessions = await Confession.countDocuments({ guildId: interaction.guild.id });
            const aiAnalyzedConfessions = await Confession.countDocuments({ 
                guildId: interaction.guild.id,
                aiAnalysis: { $exists: true }
            });
            
            const safetyLevelStats = await Confession.aggregate([
                { $match: { guildId: interaction.guild.id, aiAnalysis: { $exists: true } } },
                { $group: { _id: "$aiAnalysis.safety_level", count: { $sum: 1 } } }
            ]);

            const contentTypeStats = await Confession.aggregate([
                { $match: { guildId: interaction.guild.id, aiAnalysis: { $exists: true } } },
                { $group: { _id: "$aiAnalysis.content_type", count: { $sum: 1 } } }
            ]);

            const recommendationStats = await Confession.aggregate([
                { $match: { guildId: interaction.guild.id, aiAnalysis: { $exists: true } } },
                { $group: { _id: "$aiAnalysis.recommendation", count: { $sum: 1 } } }
            ]);

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle("🤖 AI Analysis Statistics")
                .setDescription(`**Server:** ${interaction.guild.name}`)
                .addFields(
                    { name: "📊 Tổng confession", value: totalConfessions.toString(), inline: true },
                    { name: "🤖 Đã phân tích AI", value: aiAnalyzedConfessions.toString(), inline: true },
                    { name: "📈 Tỷ lệ phân tích", value: totalConfessions > 0 ? ((aiAnalyzedConfessions / totalConfessions) * 100).toFixed(1) + "%" : "0%", inline: true }
                );

            // Safety Level Stats
            if (safetyLevelStats.length > 0) {
                let safetyLevelText = "";
                safetyLevelStats.forEach(stat => {
                    const emoji = stat._id === 'APPROPRIATE' ? '✅' : stat._id === 'FLAG_FOR_REVIEW' ? '⚠️' : '🚫';
                    safetyLevelText += `${emoji} ${stat._id}: ${stat.count}\n`;
                });
                embed.addFields({ name: "🛡️ Safety Level", value: safetyLevelText, inline: true });
            }

            // Content Type Stats
            if (contentTypeStats.length > 0) {
                let contentTypeText = "";
                contentTypeStats.forEach(stat => {
                    contentTypeText += `📝 ${stat._id}: ${stat.count}\n`;
                });
                embed.addFields({ name: "📝 Content Type", value: contentTypeText, inline: true });
            }

            // Recommendation Stats
            if (recommendationStats.length > 0) {
                let recommendationText = "";
                recommendationStats.forEach(stat => {
                    const emoji = stat._id === 'APPROVE' ? '✅' : stat._id === 'REJECT' ? '🚫' : '⚠️';
                    recommendationText += `${emoji} ${stat._id}: ${stat.count}\n`;
                });
                embed.addFields({ name: "🎯 Recommendation", value: recommendationText, inline: true });
            }

            embed.setTimestamp();

            await interaction.editReply({
                embeds: [embed],
                ephemeral: true
            });

        } catch (error) {
            console.error("Error getting AI stats:", error);
            await interaction.editReply({
                content: "❌ Đã xảy ra lỗi khi lấy thống kê AI!",
                ephemeral: true
            });
        }
    },
}; 