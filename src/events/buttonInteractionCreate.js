const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("../data/mongodb");
const { getEmojiKeyFromCustomId, updateEmojiButtons } = require("../utils/emojiButtons");

module.exports = {
    name: "interactionCreate",
    async execute(interaction) {
        if (!interaction.isButton()) return;

        const { customId } = interaction;
        
        // Xử lý các button review confession
        if (customId.startsWith('approve_') || customId.startsWith('reject_') || customId.startsWith('edit_')) {
            await handleConfessionReview(interaction, customId);
        }
        // Xử lý emoji buttons
        else if (customId.startsWith('emoji_')) {
            await handleEmojiButton(interaction, customId);
        }
        // Xử lý top confessions buttons
        else if (customId.startsWith('top_')) {
            await handleTopConfessionsButton(interaction, customId);
        }
    },
};

async function handleEmojiButton(interaction, customId) {
    try {
        await interaction.deferUpdate();
    } catch (deferError) {
        console.error("Không thể defer update:", deferError.message);
        return;
    }

    const emojiKey = getEmojiKeyFromCustomId(customId);
    if (!emojiKey) {
        try {
            await interaction.followUp({
                content: "❌ Emoji không hợp lệ!",
                flags: 64
            });
        } catch (replyError) {
            console.error("Không thể reply interaction:", replyError.message);
        }
        return;
    }

    try {
        // Lấy confession ID từ message content hoặc embeds
        const messageContent = interaction.message.content;
        let confessionNumber = null;
        
        // Debug: Log message info
        console.log('🔍 Debug emoji button click:');
        console.log(`   Message ID: ${interaction.message.id}`);
        console.log(`   Message content: "${messageContent}"`);
        console.log(`   Message content length: ${messageContent ? messageContent.length : 0}`);
        console.log(`   Message embeds: ${interaction.message.embeds.length}`);
        
        // Method 1: Tìm confession bằng messageId trước
        let confession = await db.getConfessionByMessageId(interaction.message.id);
        
        if (confession) {
            console.log(`   ✅ Found confession by messageId: ${confession._id}`);
        } else {
            // Method 2: Tìm từ message content
            if (messageContent) {
                const titleMatch = messageContent.match(/Confession #(\d+)/);
                if (titleMatch) {
                    const confessionNumber = parseInt(titleMatch[1]);
                    console.log(`   ✅ Found confession number from content: ${confessionNumber}`);
                    confession = await db.getConfessionByNumberAnyStatus(interaction.guild.id, confessionNumber);
                }
            }
            
            // Method 3: Tìm từ embeds nếu content rỗng
            if (!confession && interaction.message.embeds.length > 0) {
                const embed = interaction.message.embeds[0];
                console.log(`   Checking embed: "${embed.title}"`);
                
                if (embed.title) {
                    const titleMatch = embed.title.match(/Confession #(\d+)/);
                    if (titleMatch) {
                        const confessionNumber = parseInt(titleMatch[1]);
                        console.log(`   ✅ Found confession number from embed title: ${confessionNumber}`);
                        confession = await db.getConfessionByNumberAnyStatus(interaction.guild.id, confessionNumber);
                    }
                }
                
                if (!confession && embed.description) {
                    const descMatch = embed.description.match(/Confession #(\d+)/);
                    if (descMatch) {
                        const confessionNumber = parseInt(descMatch[1]);
                        console.log(`   ✅ Found confession number from embed description: ${confessionNumber}`);
                        confession = await db.getConfessionByNumberAnyStatus(interaction.guild.id, confessionNumber);
                    }
                }
            }
        }
        
        if (!confession) {
            console.log(`   ❌ No confession found`);
            try {
                await interaction.followUp({
                    content: "❌ Không thể xác định confession!",
                    flags: 64
                });
            } catch (replyError) {
                console.error("Không thể reply interaction:", replyError.message);
            }
            return;
        }
        
        console.log(`   ✅ Found confession: ${confession._id} (Number: ${confession.confessionNumber})`);
        
        if (!confession) {
            console.log(`   ❌ Confession #${confessionNumber} not found in database`);
            console.log(`   ⚠️ This confession might be displayed in Discord but not saved in database`);
            
            // Try to find confession in any guild
            const confessionAnyGuild = await db.getConfessionByNumberAnyStatus(null, confessionNumber);
            if (confessionAnyGuild) {
                console.log(`   ✅ Found confession #${confessionNumber} in another guild: ${confessionAnyGuild.guildId}`);
                // Use the confession from another guild
                const confession = confessionAnyGuild;
            } else {
                console.log(`   ❌ Confession #${confessionNumber} not found in any guild`);
                try {
                    await interaction.followUp({
                        content: "❌ Không tìm thấy confession! (Confession có thể chưa được lưu vào database)",
                        flags: 64
                    });
                } catch (replyError) {
                    console.error("Không thể reply interaction:", replyError.message);
                }
                return;
            }
        }

        // Toggle emoji reaction
        const result = await db.toggleEmojiReaction(
            interaction.guild.id,
            confession._id,
            interaction.user.id,
            emojiKey
        );

        if (!result.success) {
            try {
                await interaction.followUp({
                    content: "❌ Đã xảy ra lỗi khi xử lý emoji!",
                    flags: 64
                });
            } catch (replyError) {
                console.error("Không thể reply interaction:", replyError.message);
            }
            return;
        }

        // Lấy emoji counts mới
        const emojiCounts = await db.getEmojiCounts(interaction.guild.id, confession._id);
        
        // Lấy user reactions để highlight button
        const userReactions = await db.getUserEmojiReactions(
            interaction.guild.id,
            confession._id,
            interaction.user.id
        );

        // Cập nhật buttons
        const updatedComponents = updateEmojiButtons(
            interaction.message.components,
            emojiCounts,
            userReactions
        );

        // Cập nhật message với components mới
        try {
            await interaction.message.edit({
                components: updatedComponents
            });
        } catch (updateError) {
            console.error("Không thể edit message:", updateError.message);
        }

        // Tạo thread khi click emoji (nếu chưa có thread)
        const existingThread = interaction.message.thread;
        if (!existingThread) {
            console.log(`🧵 Creating thread for confession #${confession.confessionNumber}...`);
            
            try {
                const thread = await interaction.message.startThread({
                    name: `💬 Bình luận Confession #${confession.confessionNumber}`,
                    autoArchiveDuration: 1440, // 24 giờ
                    reason: 'Thread được tạo bởi emoji reaction'
                });

                console.log(`✅ Thread created: ${thread.id}`);

                // Cập nhật database với thread ID
                await db.updateConfessionStatus(confession._id, 'approved', null, interaction.message.id, thread.id);

                // Thông báo trong thread
                await thread.send(`💬 Thread được tạo khi có emoji reaction! Bạn có thể bình luận ở đây.`);
                
                console.log(`✅ Thread setup complete for confession #${confession.confessionNumber}`);
            } catch (threadError) {
                console.error('Error creating thread:', threadError);
            }
        } else {
            console.log(`⚠️ Thread already exists for confession #${confession.confessionNumber}`);
        }

        // Không gửi thông báo - chỉ cập nhật emoji counts
        // Thông báo đã được xóa theo yêu cầu

    } catch (error) {
        console.error('Error handling emoji button:', error);
        try {
            await interaction.followUp({
                content: "❌ Đã xảy ra lỗi khi xử lý emoji!",
                flags: 64
            });
        } catch (replyError) {
            console.error("Không thể reply interaction:", replyError.message);
        }
    }
}

async function handleConfessionReview(interaction, customId) {
    // Kiểm tra quyền
    if (!interaction.member.permissions.has('ManageMessages')) {
        return interaction.reply({
            content: "❌ Bạn không có quyền để duyệt confession!",
            flags: 64 // Ephemeral flag
        });
    }

    const confessionId = customId.split('_')[1];
    const action = customId.split('_')[0];

    try {
        // Defer update ngay từ đầu để tránh timeout
        await interaction.deferUpdate();
        
        const confession = await db.getConfession(confessionId);
        if (!confession) {
            return interaction.followUp({
                content: "❌ Không tìm thấy confession này!",
                flags: 64 // Ephemeral flag
            });
        }

        // Kiểm tra xem confession đã được xử lý chưa
        if (confession.status !== 'pending') {
            return interaction.followUp({
                content: `❌ Confession này đã được ${confession.status === 'approved' ? 'duyệt' : 'từ chối'} rồi!`,
                flags: 64 // Ephemeral flag
            });
        }

        if (action === 'approve') {
            // Lấy guild settings
            const guildSettings = await db.getGuildSettings(interaction.guild.id);
            if (!guildSettings) {
                return interaction.followUp({
                    content: "❌ Guild settings chưa được thiết lập!",
                    flags: 64 // Ephemeral flag
                });
            }

            // Kiểm tra kênh confession
            const confessionChannel = interaction.guild.channels.cache.get(guildSettings.confessionChannel);
            if (!confessionChannel) {
                return interaction.followUp({
                    content: "❌ Kênh confession chưa được thiết lập!",
                    flags: 64 // Ephemeral flag
                });
            }

            // Lấy thông tin user
            const confessionAuthor = await interaction.client.users.fetch(confession.userId);
            const isAnonymous = confession.isAnonymous;

            // Lấy số confession thực tế từ database
            const approvedConfessionsCount = await db.getApprovedConfessionsCount(interaction.guild.id);
            const confessionNumber = approvedConfessionsCount + 1;
            
            const timeString = `<t:${Math.floor(new Date(confession.createdAt).getTime() / 1000)}:R>`;
            const authorString = isAnonymous ? "🕵️ Ẩn danh" : `<@${confession.userId}>`;
            
            const plainTextContent = `📢 **Confession #${confessionNumber}**\n\n${confession.content}\n\n👤 **Người gửi:** ${authorString}\n⏰ **Thời gian:** ${timeString}\n\n*Confession Bot • ${interaction.guild.name}*`;

            // Tạo emoji buttons
            const { createEmojiButtons } = require("../utils/emojiButtons");
            const emojiCounts = await db.getEmojiCounts(interaction.guild.id, confession._id);
            const emojiButtons = createEmojiButtons(emojiCounts);

            const message = await confessionChannel.send({ 
                content: plainTextContent,
                components: emojiButtons
            });

            // Cập nhật confession với number mới và message ID
            await db.updateConfessionStatus(confessionId, 'approved', interaction.user.id, message.id, null, confessionNumber);

            // Cập nhật embed gốc
            const originalEmbed = EmbedBuilder.from(interaction.message.embeds[0])
                .setColor(0x00FF00)
                .addFields(
                    { name: "✅ Trạng thái", value: "Đã duyệt", inline: true },
                    { name: "👤 Người duyệt", value: `<@${interaction.user.id}>`, inline: true },
                    { name: "⏰ Thời gian duyệt", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
                );

            await interaction.message.edit({
                embeds: [originalEmbed],
                components: []
            });

            await interaction.followUp({
                content: `✅ Đã duyệt confession #${confessionId}!`,
                flags: 64 // Ephemeral flag
            });

        } else if (action === 'reject') {
            // Cập nhật trạng thái trong database
            await db.updateConfessionStatus(confessionId, 'rejected', interaction.user.id);

            // Cập nhật embed gốc
            const originalEmbed = EmbedBuilder.from(interaction.message.embeds[0])
                .setColor(0xFF0000)
                .addFields(
                    { name: "❌ Trạng thái", value: "Đã từ chối", inline: true },
                    { name: "👤 Người từ chối", value: `<@${interaction.user.id}>`, inline: true },
                    { name: "⏰ Thời gian từ chối", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
                );

            await interaction.message.edit({
                embeds: [originalEmbed],
                components: []
            });

            await interaction.followUp({
                content: `❌ Đã từ chối confession #${confessionId}!`,
                flags: 64 // Ephemeral flag
            });

        } else if (action === 'edit') {
            // Hiển thị modal để chỉnh sửa
            await interaction.followUp({
                content: "✏️ Tính năng chỉnh sửa sẽ được phát triển trong phiên bản tiếp theo!",
                flags: 64 // Ephemeral flag
            });
        }

    } catch (error) {
        console.error("Lỗi khi xử lý review confession:", error);
        try {
            await interaction.followUp({
                content: "❌ Đã xảy ra lỗi khi xử lý review!",
                flags: 64 // Ephemeral flag
            });
        } catch (followUpError) {
            console.error("Không thể gửi followUp:", followUpError.message);
        }
    }
}

async function handleTopConfessionsButton(interaction, customId) {
    try {
        await interaction.deferUpdate();
    } catch (deferError) {
        console.error("Không thể defer update:", deferError.message);
        return;
    }

    try {
        // Kiểm tra quyền
        if (!interaction.member.permissions.has('ManageMessages')) {
            return interaction.followUp({
                content: "❌ Bạn không có quyền sử dụng lệnh này!",
                flags: 64
            });
        }

        const guildId = interaction.guild.id;
        const type = customId.split('_')[1]; // top_reactions -> reactions
        const limit = 10; // Default limit

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
            default:
                return interaction.followUp({
                    content: "❌ Loại không hợp lệ!",
                    flags: 64
                });
        }

        if (topConfessions.length === 0) {
            return interaction.followUp({
                content: `❌ Không có confession nào có ${type === 'reactions' ? 'reactions' : type === 'comments' ? 'comments' : 'engagement'}!`,
                flags: 64
            });
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

        // Cập nhật message với embeds và buttons mới
        await interaction.message.edit({
            embeds: [mainEmbed, ...confessionEmbeds],
            components: [buttons],
            content: `📊 **Top ${limit} confessions đã được tải!**`
        });

    } catch (error) {
        console.error('❌ Error in handleTopConfessionsButton:', error);
        try {
            await interaction.followUp({
                content: "❌ Có lỗi xảy ra khi tải top confessions!",
                flags: 64
            });
        } catch (replyError) {
            console.error("Không thể reply interaction:", replyError.message);
        }
    }
} 