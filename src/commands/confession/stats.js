const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../../data/mongodb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("confessionstats")
        .setDescription("Xem thống kê confession của server")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const confessionStats = await db.getConfessionStats(interaction.guild.id);
            const reactionStats = await db.getReactionStats(interaction.guild.id);
            const commentStats = await db.getCommentStats(interaction.guild.id);
            const guildSettings = await db.getGuildSettings(interaction.guild.id);

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle("📊 Thống Kê Confession")
                .setDescription(`Thống kê confession của server **${interaction.guild.name}**`)
                .addFields(
                    { 
                        name: "📝 Confessions", 
                        value: `Tổng: **${confessionStats.total || 0}**\nĐã duyệt: **${confessionStats.approved || 0}**\nChờ duyệt: **${confessionStats.pending || 0}**\nBị từ chối: **${confessionStats.rejected || 0}**`, 
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
                .setFooter({
                    text: `Confession Bot • ${interaction.guild.name}`,
                    iconURL: interaction.guild.iconURL(),
                })
                .setTimestamp();

            // Thêm thông tin về kênh
            if (guildSettings?.confessionChannel) {
                const confessionChannel = interaction.guild.channels.cache.get(guildSettings.confessionChannel);
                embed.addFields({
                    name: "📢 Kênh confession",
                    value: confessionChannel ? confessionChannel.toString() : "❌ Kênh không tồn tại",
                    inline: false
                });
            }

            if (guildSettings?.reviewChannel) {
                const reviewChannel = interaction.guild.channels.cache.get(guildSettings.reviewChannel);
                embed.addFields({
                    name: "👨‍⚖️ Kênh review",
                    value: reviewChannel ? reviewChannel.toString() : "❌ Kênh không tồn tại",
                    inline: false
                });
            }

            return interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("Lỗi khi lấy thống kê confession:", error);
            return interaction.editReply({
                content: "❌ Đã xảy ra lỗi khi lấy thống kê!",
                ephemeral: true,
            });
        }
    },
}; 