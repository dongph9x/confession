const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("../../data/mongodb");

module.exports = {
    name: "topconfessions",
    aliases: ["top", "topconfession", "topconf"],
    description: "Xem top confessions có nhiều reactions và comments",
    usage: "!topconfessions <type> [limit]\n\nTypes:\n- reactions: Top confessions theo reactions\n- comments: Top confessions theo comments\n- engagement: Top confessions theo engagement\n\nExamples:\n- !topconfessions reactions 10\n- !topconfessions comments 5\n- !topconfessions engagement 20",
    category: "confession",
    permissions: ["ManageMessages"],

    async execute(message, args) {
        try {
            // Check permissions
            if (!message.member.permissions.has("ManageMessages")) {
                return message.reply("❌ Bạn không có quyền sử dụng lệnh này!");
            }

            // Parse arguments
            if (args.length === 0) {
                return message.reply({
                    content: `📋 **Cách sử dụng:**\n\`${this.usage}\``,
                    ephemeral: true
                });
            }

            const type = args[0].toLowerCase();
            const limit = parseInt(args[1]) || 10;

            // Validate type
            const validTypes = ['reactions', 'comments', 'engagement'];
            if (!validTypes.includes(type)) {
                return message.reply(`❌ Loại không hợp lệ! Các loại có sẵn: \`${validTypes.join(', ')}\``);
            }

            // Validate limit
            if (limit < 1 || limit > 20) {
                return message.reply("❌ Số lượng phải từ 1-20!");
            }

            const guildId = message.guild.id;
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
                return message.reply(`❌ Không có confession nào có ${type === 'reactions' ? 'reactions' : type === 'comments' ? 'comments' : 'engagement'}!`);
            }

            // Tạo embed chính
            const mainEmbed = new EmbedBuilder()
                .setColor(color)
                .setTitle(title)
                .setDescription(`Top ${limit} confessions có nhiều ${type === 'reactions' ? 'reactions' : type === 'comments' ? 'comments' : 'engagement'} nhất`)
                .setFooter({
                    text: `Confession Bot • ${message.guild.name}`,
                    iconURL: message.guild.iconURL(),
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
                    .setFooter({ text: `Rank #${rank} • ${message.guild.name}` })
                    .setTimestamp();

                confessionEmbeds.push(embed);
            }

            // Tạo buttons để chuyển đổi
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
            await message.reply({
                embeds: [mainEmbed, ...confessionEmbeds],
                components: [buttons],
                content: `📊 **Top ${limit} confessions đã được tải!**`
            });

        } catch (error) {
            console.error('❌ Error in topconfessions message command:', error);
            await message.reply({
                content: "❌ Có lỗi xảy ra khi tải top confessions!",
                ephemeral: true
            });
        }
    },
}; 