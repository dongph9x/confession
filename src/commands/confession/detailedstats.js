const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../../data/mongodb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("detailedstats")
        .setDescription("Xem thống kê chi tiết confession với reactions và comments")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const guildId = interaction.guild.id;
            
            // Lấy thống kê
            const confessionStats = await db.getConfessionStats(guildId);
            const reactionStats = await db.getReactionStats(guildId);
            const commentStats = await db.getCommentStats(guildId);
            const guildSettings = await db.getGuildSettings(guildId);

            // Tạo embed chính
            const mainEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle("📊 Thống Kê Chi Tiết Confession")
                .setDescription(`Thống kê chi tiết của server **${interaction.guild.name}**`)
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

            // Tạo embed thống kê reactions chi tiết
            const reactionEmbed = new EmbedBuilder()
                .setColor(0xFF6B6B)
                .setTitle("❤️ Thống Kê Reactions")
                .addFields(
                    { 
                        name: "📊 Tổng quan", 
                        value: `Tổng reactions: **${reactionStats.total_reactions}**\nConfessions có reactions: **${reactionStats.confessions_with_reactions}**\nUsers đã react: **${reactionStats.unique_users_reacted}**`, 
                        inline: false 
                    },
                    { 
                        name: "📈 Tỷ lệ", 
                        value: reactionStats.total_reactions > 0 
                            ? `Tỷ lệ reactions/confession: **${(reactionStats.total_reactions / (confessionStats.approved || 1)).toFixed(2)}**\nTỷ lệ users react: **${(reactionStats.unique_users_reacted / (confessionStats.approved || 1)).toFixed(2)}**`
                            : "Chưa có reactions nào", 
                        inline: false 
                    }
                )
                .setFooter({ text: "Reaction Statistics" })
                .setTimestamp();

            // Tạo embed thống kê comments chi tiết
            const commentEmbed = new EmbedBuilder()
                .setColor(0x4ECDC4)
                .setTitle("💬 Thống Kê Comments")
                .addFields(
                    { 
                        name: "📊 Tổng quan", 
                        value: `Tổng comments: **${commentStats.total_comments}**\nConfessions có comments: **${commentStats.confessions_with_comments}**\nUsers đã comment: **${commentStats.unique_users_commented}**`, 
                        inline: false 
                    },
                    { 
                        name: "📈 Tỷ lệ", 
                        value: commentStats.total_comments > 0 
                            ? `Tỷ lệ comments/confession: **${(commentStats.total_comments / (confessionStats.approved || 1)).toFixed(2)}**\nTỷ lệ users comment: **${(commentStats.unique_users_commented / (confessionStats.approved || 1)).toFixed(2)}**`
                            : "Chưa có comments nào", 
                        inline: false 
                    }
                )
                .setFooter({ text: "Comment Statistics" })
                .setTimestamp();

            // Tạo embed cài đặt server
            const settingsEmbed = new EmbedBuilder()
                .setColor(0x95E1D3)
                .setTitle("⚙️ Cài Đặt Server")
                .addFields(
                    { 
                        name: "🔧 Cài đặt", 
                        value: `Confession Counter: **${guildSettings?.confession_counter || 0}**\nAnonymous Mode: **${guildSettings?.anonymousMode ? 'Bật' : 'Tắt'}**\nPrefix: **${guildSettings?.prefix || '!'}**`, 
                        inline: true 
                    },
                    { 
                        name: "📺 Channels", 
                        value: `Confession Channel: ${guildSettings?.confessionChannel ? `<#${guildSettings.confessionChannel}>` : 'Chưa set'}\nReview Channel: ${guildSettings?.reviewChannel ? `<#${guildSettings.reviewChannel}>` : 'Chưa set'}`, 
                        inline: true 
                    }
                )
                .setFooter({ text: "Server Settings" })
                .setTimestamp();

            // Gửi tất cả embeds
            await interaction.editReply({
                embeds: [mainEmbed, reactionEmbed, commentEmbed, settingsEmbed],
                content: "📊 **Thống kê chi tiết đã được tải!**"
            });

        } catch (error) {
            console.error('❌ Error in detailedstats command:', error);
            await interaction.editReply({
                content: "❌ Có lỗi xảy ra khi tải thống kê chi tiết!",
                ephemeral: true
            });
        }
    },
}; 