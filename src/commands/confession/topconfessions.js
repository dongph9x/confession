const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("../../data/mongodb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("topconfessions")
        .setDescription("Xem top confessions có nhiều reactions và comments")
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Loại top confessions')
                .setRequired(true)
                .addChoices(
                    { name: '🔥 Top Reactions', value: 'reactions' },
                    { name: '💬 Top Comments', value: 'comments' },
                    { name: '⭐ Top Engagement', value: 'engagement' }
                )
        )
        .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('Số lượng confessions (1-20)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(20)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const guildId = interaction.guild.id;
            const type = interaction.options.getString('type');
            const limit = interaction.options.getInteger('limit') || 10;

            let topConfessions = [];
            let title = '';
            let color = 0x0099FF;

            // Lấy top confessions theo loại
            switch (type) {
                case 'reactions':
                    topConfessions = await db.getTopConfessionsByReactions(guildId, limit);
                    title = '🔥 Top Confessions by Reactions';
                    color = 0xFF6B6B;
                    break;
                case 'comments':
                    topConfessions = await db.getTopConfessionsByComments(guildId, limit);
                    title = '💬 Top Confessions by Comments';
                    color = 0x4ECDC4;
                    break;
                case 'engagement':
                    topConfessions = await db.getTopConfessionsByEngagement(guildId, limit);
                    title = '⭐ Top Confessions by Engagement';
                    color = 0xFFD93D;
                    break;
            }

            if (topConfessions.length === 0) {
                await interaction.editReply({
                    content: `❌ Không có confession nào có ${type === 'reactions' ? 'reactions' : type === 'comments' ? 'comments' : 'engagement'}!`,
                    ephemeral: true
                });
                return;
            }

            // Tạo embed chính
            const mainEmbed = new EmbedBuilder()
                .setColor(color)
                .setTitle(title)
                .setDescription(`Top ${limit} confessions có nhiều ${type === 'reactions' ? 'reactions' : type === 'comments' ? 'comments' : 'engagement'} nhất`)
                .setFooter({
                    text: `Confession Bot • ${interaction.guild.name}`,
                    iconURL: interaction.guild.iconURL(),
                })
                .setTimestamp();

            // Tạo embeds cho từng confession
            const confessionEmbeds = [];
            for (let i = 0; i < topConfessions.length; i++) {
                const confession = topConfessions[i];
                const rank = i + 1;
                const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
                
                // Truncate content nếu quá dài
                const truncatedContent = confession.content.length > 200 
                    ? confession.content.substring(0, 200) + '...' 
                    : confession.content;

                const embed = new EmbedBuilder()
                    .setColor(color)
                    .setTitle(`${rankEmoji} Confession #${confession.confessionNumber}`)
                    .setDescription(truncatedContent)
                    .addFields(
                        { 
                            name: '📊 Thống kê', 
                            value: type === 'reactions' 
                                ? `Reactions: **${confession.reactionCount}**\nUsers reacted: **${confession.uniqueUsersCount}**`
                                : type === 'comments'
                                ? `Comments: **${confession.commentCount}**\nUsers commented: **${confession.uniqueUsersCount}**`
                                : `Reactions: **${confession.reactionCount}**\nComments: **${confession.commentCount}**\nTotal: **${confession.totalEngagement}**`,
                            inline: true 
                        },
                        { 
                            name: '👤 Người gửi', 
                            value: confession.isAnonymous ? '🕵️ Ẩn danh' : `<@${confession.userId}>`, 
                            inline: true 
                        },
                        { 
                            name: '⏰ Thời gian', 
                            value: `<t:${Math.floor(confession.createdAt.getTime() / 1000)}:R>`, 
                            inline: true 
                        }
                    )
                    .setFooter({ text: `Rank #${rank} • ${interaction.guild.name}` })
                    .setTimestamp();

                confessionEmbeds.push(embed);
            }

            // Tạo buttons để xem các loại khác
            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('top_reactions')
                        .setLabel('🔥 Reactions')
                        .setStyle(type === 'reactions' ? ButtonStyle.Primary : ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('top_comments')
                        .setLabel('💬 Comments')
                        .setStyle(type === 'comments' ? ButtonStyle.Primary : ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('top_engagement')
                        .setLabel('⭐ Engagement')
                        .setStyle(type === 'engagement' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                );

            // Gửi response
            await interaction.editReply({
                embeds: [mainEmbed, ...confessionEmbeds],
                components: [buttons],
                content: `📊 **Top ${limit} confessions đã được tải!**`
            });

        } catch (error) {
            console.error('❌ Error in topconfessions command:', error);
            await interaction.editReply({
                content: "❌ Có lỗi xảy ra khi tải top confessions!",
                ephemeral: true
            });
        }
    },
}; 