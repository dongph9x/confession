const { EmbedBuilder } = require("discord.js");
const db = require("../../data/mongodb");

module.exports = {
    name: "aistats",
    description: "Xem thống kê AI analysis cho confessions",
    usage: "!aistats",
    async execute(message, args) {
        // Xóa tin nhắn gốc
        try {
            await message.delete();
        } catch (error) {
            console.log("Could not delete message:", error.message);
        }

        try {
            // Lấy tất cả confessions có AI analysis
            const confessions = await db.getConfessions(message.guild.id);
            const confessionsWithAI = confessions.filter(c => c.aiAnalysis);

            if (confessionsWithAI.length === 0) {
                const errorMsg = await message.channel.send(
                    "❌ Chưa có confession nào được phân tích bởi AI!"
                );
                setTimeout(() => {
                    errorMsg.delete().catch(() => {});
                }, 5000);
                return;
            }

            // Tính toán thống kê
            const stats = {
                total: confessionsWithAI.length,
                safetyLevels: {},
                contentTypes: {},
                recommendations: {},
                scoreRanges: {
                    '1-3': 0,
                    '4-6': 0,
                    '7-10': 0
                },
                averageScore: 0,
                totalScore: 0
            };

            confessionsWithAI.forEach(confession => {
                const ai = confession.aiAnalysis;
                
                // Safety levels
                stats.safetyLevels[ai.safety_level] = (stats.safetyLevels[ai.safety_level] || 0) + 1;
                
                // Content types
                stats.contentTypes[ai.content_type] = (stats.contentTypes[ai.content_type] || 0) + 1;
                
                // Recommendations
                stats.recommendations[ai.recommendation] = (stats.recommendations[ai.recommendation] || 0) + 1;
                
                // Score ranges
                if (ai.score <= 3) stats.scoreRanges['1-3']++;
                else if (ai.score <= 6) stats.scoreRanges['4-6']++;
                else stats.scoreRanges['7-10']++;
                
                // Average score
                stats.totalScore += ai.score;
            });

            stats.averageScore = (stats.totalScore / stats.total).toFixed(1);

            // Tạo embed thống kê
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle(`📊 AI Analysis Statistics`)
                .setDescription(`**Tổng số confessions được phân tích:** ${stats.total}`)
                .addFields(
                    { name: "📈 Average Score", value: `${stats.averageScore}/10`, inline: true },
                    { name: "📊 Total Score", value: `${stats.totalScore}`, inline: true },
                    { name: "🎯 Total Confessions", value: `${stats.total}`, inline: true }
                );

            // Safety Levels
            const safetyLevelText = Object.entries(stats.safetyLevels)
                .map(([level, count]) => `${level}: ${count} (${((count/stats.total)*100).toFixed(1)}%)`)
                .join('\n');
            
            embed.addFields(
                { name: "🛡️ Safety Levels", value: safetyLevelText || "Không có dữ liệu", inline: false }
            );

            // Content Types
            const contentTypeText = Object.entries(stats.contentTypes)
                .map(([type, count]) => `${type}: ${count} (${((count/stats.total)*100).toFixed(1)}%)`)
                .join('\n');
            
            embed.addFields(
                { name: "📝 Content Types", value: contentTypeText || "Không có dữ liệu", inline: false }
            );

            // Recommendations
            const recommendationText = Object.entries(stats.recommendations)
                .map(([rec, count]) => `${rec}: ${count} (${((count/stats.total)*100).toFixed(1)}%)`)
                .join('\n');
            
            embed.addFields(
                { name: "💡 Recommendations", value: recommendationText || "Không có dữ liệu", inline: false }
            );

            // Score Ranges
            const scoreRangeText = Object.entries(stats.scoreRanges)
                .map(([range, count]) => `${range}: ${count} (${((count/stats.total)*100).toFixed(1)}%)`)
                .join('\n');
            
            embed.addFields(
                { name: "📊 Score Ranges", value: scoreRangeText || "Không có dữ liệu", inline: false }
            );

            embed.setFooter({
                text: `Confession Bot • ${message.guild.name}`,
                iconURL: message.guild.iconURL(),
            })
            .setTimestamp();

            const statsMsg = await message.channel.send({ embeds: [embed] });
            setTimeout(() => {
                statsMsg.delete().catch(() => {});
            }, 20000);

        } catch (error) {
            console.error("Lỗi khi lấy AI stats:", error);
            const errorMsg = await message.channel.send(
                "❌ Đã xảy ra lỗi khi lấy thống kê AI analysis!"
            );
            setTimeout(() => {
                errorMsg.delete().catch(() => {});
            }, 5000);
        }
    },
}; 