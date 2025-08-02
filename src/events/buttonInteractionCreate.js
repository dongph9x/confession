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
        // Lấy confession ID từ message embed
        const embed = interaction.message.embeds[0];
        if (!embed || !embed.title) {
            try {
                await interaction.followUp({
                    content: "❌ Không tìm thấy confession!",
                    flags: 64
                });
            } catch (replyError) {
                console.error("Không thể reply interaction:", replyError.message);
            }
            return;
        }

        // Tìm confession ID từ title (Confession #123)
        const titleMatch = embed.title.match(/Confession #(\d+)/);
        if (!titleMatch) {
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

        const confessionNumber = parseInt(titleMatch[1]);
        const confession = await db.getConfessionByNumber(interaction.guild.id, confessionNumber);
        
        if (!confession) {
            try {
                await interaction.followUp({
                    content: "❌ Không tìm thấy confession!",
                    flags: 64
                });
            } catch (replyError) {
                console.error("Không thể reply interaction:", replyError.message);
            }
            return;
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

        // Cập nhật message
        try {
            await interaction.editReply({
                embeds: [embed],
                components: updatedComponents
            });
        } catch (updateError) {
            console.error("Không thể edit reply:", updateError.message);
            // Fallback: thử followUp nếu edit thất bại
            try {
                await interaction.followUp({
                    content: `✅ ${result.action === 'added' ? 'Đã thêm' : 'Đã xóa'} emoji ${emojiKey}!`,
                    flags: 64
                });
            } catch (replyError) {
                console.error("Không thể followUp interaction:", replyError.message);
            }
        }

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

            // Tạo embed cho confession đã duyệt
            const approvedEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle("💝 Confession #" + (guildSettings.confessionCounter + 1))
                .setDescription(confession.content)
                .addFields(
                    { 
                        name: "👤 Người gửi", 
                        value: isAnonymous ? "🕵️ Ẩn danh" : `<@${confession.userId}>`, 
                        inline: true 
                    },
                    { 
                        name: "⏰ Thời gian", 
                        value: `<t:${Math.floor(new Date(confession.createdAt).getTime() / 1000)}:R>`, 
                        inline: true 
                    }
                )
                .setFooter({
                    text: `Confession Bot • ${interaction.guild.name}`,
                    iconURL: interaction.guild.iconURL(),
                })
                .setTimestamp();

            // Chỉ hiển thị author nếu không ở chế độ ẩn danh
            if (!isAnonymous) {
                approvedEmbed.setAuthor({
                    name: confessionAuthor.username,
                    iconURL: confessionAuthor.displayAvatarURL()
                });
            }

            // Tạo emoji buttons
            const { createEmojiButtons } = require("../utils/emojiButtons");
            const emojiCounts = await db.getEmojiCounts(interaction.guild.id, confession._id);
            const emojiButtons = createEmojiButtons(emojiCounts);

            const message = await confessionChannel.send({ 
                embeds: [approvedEmbed],
                components: emojiButtons
            });

            // Tạo thread cho confession để người dùng có thể bình luận
            const thread = await message.startThread({
                name: `💬 Bình luận Confession #${guildSettings.confessionCounter + 1}`,
                autoArchiveDuration: 1440, // 24 giờ
                reason: 'Thread cho confession'
            });

            // Cập nhật trạng thái trong database với message ID và thread ID
            await db.updateConfessionStatus(confessionId, 'approved', interaction.user.id, message.id, thread.id);

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