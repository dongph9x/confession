const { EmbedBuilder } = require("discord.js");
const db = require("../../data/mongodb");

module.exports = {
    name: "confessionstats",
    description: "Xem thống kê confession chi tiết",
    async execute(message, args) {
        // Xóa tin nhắn gốc
        try {
            await message.delete();
        } catch (error) {
            console.log("Could not delete message:", error.message);
        }

        try {
            const confessionStats = await db.getConfessionStats(message.guild.id);
            const reactionStats = await db.getReactionStats(message.guild.id);
            const commentStats = await db.getCommentStats(message.guild.id);

            const statsEmbed = new EmbedBuilder()
                .setTitle("📊 Thống Kê Confession")
                .setColor(0x1877F2)
                .addFields(
                    { 
                        name: "📝 Confessions", 
                        value: `Tổng: **${confessionStats.total}**\nĐã duyệt: **${confessionStats.approved}**\nChờ duyệt: **${confessionStats.pending}**\nBị từ chối: **${confessionStats.rejected}**`, 
                        inline: true 
                    },
                    { 
                        name: "❤️ Reactions", 
                        value: `Confessions có reactions: **${reactionStats.confessions_with_reactions}**\nTổng reactions: **${reactionStats.total_reactions}**\nUsers đã react: **${reactionStats.unique_users_reacted}**`, 
                        inline: true 
                    },
                    { 
                        name: "💬 Comments", 
                        value: `Confessions có comments: **${commentStats.confessions_with_comments}**\nTổng comments: **${commentStats.total_comments}**\nUsers đã comment: **${commentStats.unique_users_commented}**`, 
                        inline: true 
                    }
                )
                .setFooter({ text: "Confession Bot • Facebook Style" })
                .setTimestamp();

            await message.channel.send({ embeds: [statsEmbed] });

        } catch (error) {
            console.error("Lỗi khi lấy stats:", error);
            const errorMsg = await message.channel.send(
                "❌ Đã xảy ra lỗi khi lấy thống kê!"
            );
            setTimeout(() => {
                errorMsg.delete().catch(() => {});
            }, 5000);
        }
    },
}; 