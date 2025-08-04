const { EmbedBuilder } = require('discord.js');
const db = require('../../data/mongodb');
const { isForumChannel, getForumChannel } = require('../../utils/forumChannel');

module.exports = {
    name: 'foruminfo',
    description: 'Xem thông tin forum channel',
    usage: '!foruminfo',
    async execute(message, args) {
        try {
            // Lấy guild settings
            const guildSettings = await db.getGuildSettings(message.guild.id);
            if (!guildSettings?.confessionChannel) {
                const errorMsg = await message.channel.send({
                    content: "❌ Chưa có confession channel được thiết lập! Sử dụng `!setupforum` để tạo forum channel.",
                    ephemeral: true
                });
                setTimeout(() => errorMsg.delete().catch(() => {}), 8000);
                return;
            }

            // Lấy channel
            const channel = message.guild.channels.cache.get(guildSettings.confessionChannel);
            if (!channel) {
                const errorMsg = await message.channel.send({
                    content: "❌ Không tìm thấy confession channel! Có thể channel đã bị xóa.",
                    ephemeral: true
                });
                setTimeout(() => errorMsg.delete().catch(() => {}), 8000);
                return;
            }

            // Kiểm tra xem có phải forum không
            const isForum = isForumChannel(channel);

            // Tạo embed thông tin
            const infoEmbed = new EmbedBuilder()
                .setColor(isForum ? 0x00FF00 : 0xFFA500)
                .setTitle(`📊 Thông Tin Confession Channel`)
                .setDescription(`Thông tin chi tiết về confession channel hiện tại.`)
                .addFields(
                    { name: '📝 Tên Channel', value: `#${channel.name}`, inline: true },
                    { name: '🆔 Channel ID', value: channel.id, inline: true },
                    { name: '🏛️ Loại Channel', value: isForum ? 'Forum Channel' : 'Text Channel', inline: true },
                    { name: '📅 Tạo lúc', value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:R>`, inline: true },
                    { name: '👥 Số thành viên', value: channel.members?.size?.toString() || 'N/A', inline: true },
                    { name: '🔒 Quyền', value: channel.permissionsFor(message.guild.members.me).has('SendMessages') ? '✅ Có quyền gửi' : '❌ Không có quyền', inline: true }
                );

            // Thêm thông tin forum nếu là forum channel
            if (isForum) {
                const forumInfo = [
                    `📊 **Tags:** ${channel.availableTags.length} tags`,
                    `⏰ **Auto Archive:** ${channel.defaultAutoArchiveDuration / 60} phút`,
                    `🎯 **Default Reaction:** ${channel.defaultReactionEmoji || 'Không có'}`,
                    `📝 **Topic:** ${channel.topic || 'Không có'}`,
                    `🔄 **Thread Count:** ${channel.threads.cache.size} threads`
                ];

                infoEmbed.addFields({
                    name: '🏛️ Forum Features',
                    value: forumInfo.join('\n'),
                    inline: false
                });

                // Thêm danh sách tags
                if (channel.availableTags.length > 0) {
                    const tagList = channel.availableTags.map(tag => 
                        `${tag.emoji || '📝'} **${tag.name}** ${tag.moderated ? '(Moderated)' : ''}`
                    ).join('\n');

                    infoEmbed.addFields({
                        name: '🏷️ Available Tags',
                        value: tagList,
                        inline: false
                    });
                }
            }

            // Thêm thống kê confessions
            const totalConfessions = await db.getConfessions(message.guild.id).then(confessions => confessions.length);
            const approvedConfessions = await db.getApprovedConfessionsCount(message.guild.id);
            const pendingConfessions = await db.getPendingConfessions(message.guild.id).then(confessions => confessions.length);

            infoEmbed.addFields({
                name: '📈 Thống Kê Confessions',
                value: `📊 **Tổng cộng:** ${totalConfessions}\n✅ **Đã duyệt:** ${approvedConfessions}\n⏳ **Chờ duyệt:** ${pendingConfessions}`,
                inline: false
            });

            infoEmbed.setFooter({
                text: `Confession Bot • ${message.guild.name}`,
                iconURL: message.guild.iconURL(),
            })
            .setTimestamp();

            const infoMsg = await message.channel.send({
                embeds: [infoEmbed]
            });

            // Tự động xóa sau 20 giây
            setTimeout(() => {
                infoMsg.delete().catch(() => {});
            }, 20000);

        } catch (error) {
            console.error('❌ [FORUM] Lỗi khi lấy thông tin forum:', error);
            
            const errorMsg = await message.channel.send({
                content: `❌ **Lỗi khi lấy thông tin forum:**\n\n${error.message}`,
                ephemeral: true
            });
            
            setTimeout(() => errorMsg.delete().catch(() => {}), 10000);
        }
    },
}; 