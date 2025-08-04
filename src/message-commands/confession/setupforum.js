const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../data/mongodb');
const { isForumChannel } = require('../../utils/forumChannel');

module.exports = {
    name: 'setupforum',
    description: 'Chọn forum channel cho confessions',
    usage: '!setupforum',
    async execute(message, args) {
        try {
            // Kiểm tra quyền
            if (!message.member.permissions.has('ManageChannels')) {
                const errorMsg = await message.channel.send({
                    content: "❌ Bạn không có quyền để thiết lập forum channel!",
                    ephemeral: true
                });
                setTimeout(() => errorMsg.delete().catch(() => {}), 5000);
                return;
            }

            // Tìm tất cả forum channels trong guild
            const forumChannels = message.guild.channels.cache.filter(channel => 
                channel.type === 15 // GuildForum
            );

            if (forumChannels.size === 0) {
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('❌ Không Tìm Thấy Forum Channel')
                    .setDescription('Server này chưa có forum channel nào. Vui lòng tạo forum channel trước khi sử dụng lệnh này.')
                    .addFields(
                        { name: '💡 Cách tạo Forum Channel', value: '1. Vào Server Settings\n2. Chọn Channels\n3. Tạo channel mới với loại "Forum"\n4. Đặt tên và cấu hình\n5. Chạy lại lệnh `!setupforum`', inline: false }
                    )
                    .setFooter({
                        text: `Confession Bot • ${message.guild.name}`,
                        iconURL: message.guild.iconURL(),
                    })
                    .setTimestamp();

                const errorMsg = await message.channel.send({
                    embeds: [errorEmbed]
                });

                setTimeout(() => errorMsg.delete().catch(() => {}), 15000);
                return;
            }

            // Tạo select menu với các forum channels
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('setup_forum_channel')
                .setPlaceholder('Chọn forum channel cho confessions')
                .addOptions(
                    forumChannels.map(channel => ({
                        label: `#${channel.name}`,
                        description: `Forum channel với ${channel.availableTags?.length || 0} tags`,
                        value: channel.id,
                        emoji: '🏛️'
                    }))
                );

            const row = new ActionRowBuilder().addComponents(selectMenu);

            // Tạo embed hướng dẫn
            const guideEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('🏛️ Thiết Lập Forum Channel')
                .setDescription('Chọn forum channel mà bạn muốn sử dụng cho confessions.')
                .addFields(
                    { name: '📋 Hướng dẫn', value: '1. Chọn forum channel từ menu bên dưới\n2. Bot sẽ cập nhật settings\n3. Confessions sẽ được gửi vào forum channel đã chọn', inline: false },
                    { name: '📊 Forum Channels tìm thấy', value: `${forumChannels.size} forum channel(s)`, inline: true },
                    { name: '🎯 Tính năng', value: '• Tự động tạo thread cho mỗi confession\n• Tags để phân loại nội dung\n• Emoji buttons trong thread\n• AI analysis hiển thị trong thread', inline: false }
                )
                .setFooter({
                    text: `Confession Bot • ${message.guild.name}`,
                    iconURL: message.guild.iconURL(),
                })
                .setTimestamp();

            const guideMsg = await message.channel.send({
                embeds: [guideEmbed],
                components: [row]
            });

            // Tạo collector để lắng nghe selection
            const collector = guideMsg.createMessageComponentCollector({
                time: 60000 // 60 giây
            });

            let isProcessing = false; // Flag để tránh xử lý nhiều lần

            collector.on('collect', async (interaction) => {
                if (interaction.customId === 'setup_forum_channel') {
                    // Kiểm tra nếu đang xử lý
                    if (isProcessing) {
                        console.log('⚠️ [FORUM] Đang xử lý interaction, bỏ qua...');
                        return;
                    }

                    isProcessing = true; // Đánh dấu đang xử lý

                    // Defer update ngay lập tức để tránh timeout
                    try {
                        await interaction.deferUpdate();
                    } catch (deferError) {
                        console.error('❌ [FORUM] Lỗi khi defer update:', deferError);
                        isProcessing = false;
                        return;
                    }

                    const selectedChannelId = interaction.values[0];
                    const selectedChannel = message.guild.channels.cache.get(selectedChannelId);

                    if (!selectedChannel || !isForumChannel(selectedChannel)) {
                        try {
                            await interaction.followUp({
                                content: '❌ Channel đã chọn không phải là forum channel!',
                                ephemeral: true
                            });
                        } catch (replyError) {
                            console.error('❌ [FORUM] Lỗi khi reply interaction:', replyError);
                            await message.channel.send('❌ Channel đã chọn không phải là forum channel!');
                        }
                        isProcessing = false; // Reset flag
                        return;
                    }

                    try {
                        // Cập nhật guild settings
                        await db.setConfessionChannel(message.guild.id, selectedChannelId);

                        console.log(`✅ [FORUM] Đã setup forum channel "${selectedChannel.name}" cho guild ${message.guild.name}`);

                        // Tạo embed thành công
                        const successEmbed = new EmbedBuilder()
                            .setColor(0x00FF00)
                            .setTitle('✅ Forum Channel Đã Được Thiết Lập Thành Công!')
                            .setDescription(`Forum channel đã được cấu hình cho confessions.`)
                            .addFields(
                                { name: '📝 Tên Channel', value: `#${selectedChannel.name}`, inline: true },
                                { name: '🆔 Channel ID', value: selectedChannel.id, inline: true },
                                { name: '📊 Tags', value: `${selectedChannel.availableTags?.length || 0} tags`, inline: true },
                                { name: '⏰ Auto Archive', value: `${selectedChannel.defaultAutoArchiveDuration / 60} phút`, inline: true },
                                { name: '🎯 Default Reaction', value: selectedChannel.defaultReactionEmoji?.toString() || 'Không có', inline: true }
                            )
                            .addFields(
                                { name: '🎯 Tính năng', value: '• Tự động tạo thread cho mỗi confession\n• Tags để phân loại nội dung\n• Emoji buttons trong thread\n• AI analysis hiển thị trong thread', inline: false },
                                { name: '💡 Lưu ý', value: 'Forum channel sẽ thay thế confession channel thông thường. Mỗi confession sẽ tạo ra một thread riêng biệt để dễ dàng thảo luận!', inline: false }
                            )
                            .setFooter({
                                text: `Confession Bot • ${message.guild.name}`,
                                iconURL: message.guild.iconURL(),
                            })
                            .setTimestamp();

                        try {
                            await interaction.editReply({
                                embeds: [successEmbed],
                                components: []
                            });
                        } catch (updateError) {
                            console.error('❌ [FORUM] Lỗi khi edit reply:', updateError);
                            // Fallback: gửi message mới
                            await message.channel.send({
                                embeds: [successEmbed]
                            });
                        }

                        // Tự động xóa sau 15 giây
                        setTimeout(() => {
                            guideMsg.delete().catch(() => {});
                        }, 15000);

                    } catch (error) {
                        console.error('❌ [FORUM] Lỗi khi setup forum channel:', error);
                        
                        const errorEmbed = new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setTitle('❌ Lỗi Khi Thiết Lập Forum Channel')
                            .setDescription(`Đã xảy ra lỗi khi thiết lập forum channel.`)
                            .addFields(
                                { name: '🔍 Lỗi', value: error.message, inline: false },
                                { name: '💡 Gợi ý', value: '• Kiểm tra quyền của bot\n• Thử lại sau vài giây', inline: false }
                            )
                            .setFooter({
                                text: `Confession Bot • ${message.guild.name}`,
                                iconURL: message.guild.iconURL(),
                            })
                            .setTimestamp();

                        try {
                            await interaction.editReply({
                                embeds: [errorEmbed],
                                components: []
                            });
                        } catch (updateError) {
                            console.error('❌ [FORUM] Lỗi khi edit error reply:', updateError);
                            // Fallback: gửi message mới
                            await message.channel.send({
                                embeds: [errorEmbed]
                            });
                        }

                        setTimeout(() => {
                            guideMsg.delete().catch(() => {});
                        }, 10000);
                    } finally {
                        isProcessing = false; // Reset flag sau khi xử lý xong
                    }
                }
            });

            collector.on('end', () => {
                if (!guideMsg.deleted) {
                    guideMsg.edit({
                        embeds: [EmbedBuilder.from(guideEmbed).setColor(0xFFA500).setTitle('⏰ Hết Thời Gian')],
                        components: []
                    }).then(() => {
                        setTimeout(() => guideMsg.delete().catch(() => {}), 5000);
                    });
                }
            });

        } catch (error) {
            console.error('❌ [FORUM] Lỗi khi setup forum channel:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ Lỗi Khi Thiết Lập Forum Channel')
                .setDescription(`Đã xảy ra lỗi khi thiết lập forum channel.`)
                .addFields(
                    { name: '🔍 Lỗi', value: error.message, inline: false },
                    { name: '💡 Gợi ý', value: '• Kiểm tra quyền của bot\n• Đảm bảo guild có forum channels\n• Thử lại sau vài giây', inline: false }
                )
                .setFooter({
                    text: `Confession Bot • ${message.guild.name}`,
                    iconURL: message.guild.iconURL(),
                })
                .setTimestamp();

            const errorMsg = await message.channel.send({
                embeds: [errorEmbed]
            });

            setTimeout(() => errorMsg.delete().catch(() => {}), 10000);
        }
    },
}; 