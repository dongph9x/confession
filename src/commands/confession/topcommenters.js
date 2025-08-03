const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("../../data/mongodb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("topcommenters")
        .setDescription("Xem top commenters có nhiều comments nhất")
        .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('Số lượng commenters (1-20)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(20)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const guildId = interaction.guild.id;
            const limit = interaction.options.getInteger('limit') || 10;

            // Lấy top commenters
            const topCommenters = await db.getTopCommenters(guildId, limit);

            if (topCommenters.length === 0) {
                await interaction.editReply({
                    content: "❌ Không có commenters nào!",
                    ephemeral: true
                });
                return;
            }

            // Tạo embed chính
            const mainEmbed = new EmbedBuilder()
                .setColor(0x4ECDC4)
                .setTitle('💬 Top Commenters')
                .setDescription(`Top ${limit} commenters có nhiều comments nhất`)
                .setFooter({
                    text: `Confession Bot • ${interaction.guild.name}`,
                    iconURL: interaction.guild.iconURL(),
                })
                .setTimestamp();

            // Tạo embeds cho từng commenter
            const commenterEmbeds = [];
            for (let i = 0; i < topCommenters.length; i++) {
                const commenter = topCommenters[i];
                const rank = i + 1;
                const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
                
                // Lấy thống kê chi tiết cho user
                const userStats = await db.getUserCommentStats(guildId, commenter.userId);
                
                // Tạo danh sách comments gần nhất
                const recentCommentsList = commenter.comments
                    .slice(0, 3)
                    .map(comment => {
                        const truncatedContent = comment.content.length > 50 
                            ? comment.content.substring(0, 50) + '...' 
                            : comment.content;
                        return `• "${truncatedContent}"`;
                    })
                    .join('\n');

                const embed = new EmbedBuilder()
                    .setColor(0x4ECDC4)
                    .setTitle(`${rankEmoji} ${commenter.username}`)
                    .setDescription(`**User ID:** <@${commenter.userId}>`)
                    .addFields(
                        { 
                            name: '📊 Thống kê', 
                            value: `Total Comments: **${commenter.commentCount}**\nUnique Confessions: **${userStats.uniqueConfessions}**\nThis Week: **${userStats.commentsThisWeek}**\nThis Month: **${userStats.commentsThisMonth}**`,
                            inline: true 
                        },
                        { 
                            name: '⏰ Hoạt động', 
                            value: `First Comment: <t:${Math.floor(commenter.comments[0]?.createdAt?.getTime() / 1000) || 0}:R>\nLast Comment: <t:${Math.floor(commenter.comments[commenter.comments.length - 1]?.createdAt?.getTime() / 1000) || 0}:R>`, 
                            inline: true 
                        }
                    )
                    .setFooter({ text: `Rank #${rank} • ${interaction.guild.name}` })
                    .setTimestamp();

                // Thêm recent comments nếu có
                if (recentCommentsList) {
                    embed.addFields({
                        name: '💬 Comments gần nhất',
                        value: recentCommentsList,
                        inline: false
                    });
                }

                commenterEmbeds.push(embed);
            }

            // Gửi response
            await interaction.editReply({
                embeds: [mainEmbed, ...commenterEmbeds],
                content: `💬 **Top ${limit} commenters đã được tải!**`
            });

        } catch (error) {
            console.error('❌ Error in topcommenters command:', error);
            await interaction.editReply({
                content: "❌ Có lỗi xảy ra khi tải top commenters!",
                ephemeral: true
            });
        }
    },
}; 