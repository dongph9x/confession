const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const db = require("../data/mongodb");
const { getEmojiKeyFromCustomId, updateEmojiButtons } = require("../utils/emojiButtons");
const { submitConfessionForReview, publishConfession } = require("../utils/confessionFlow");
const config = require("../config/bot");

// Giới hạn ký tự cho form đăng confession
const CONFESS_MAX_LENGTH = 1000;

// Track processed interactions to prevent duplicates
const processedInteractions = new Set();

module.exports = {
    async execute(interaction) {
        if (!interaction.isButton()) return;

        // Prevent duplicate processing
        const interactionKey = `${interaction.id}-${interaction.customId}`;
        if (processedInteractions.has(interactionKey)) {
            console.log(`Duplicate interaction detected: ${interactionKey}`);
            return;
        }
        processedInteractions.add(interactionKey);

        // Clean up old interactions (keep only last 1000)
        if (processedInteractions.size > 1000) {
            const iterator = processedInteractions.values();
            for (let i = 0; i < 500; i++) {
                processedInteractions.delete(iterator.next().value);
            }
        }

        const { customId } = interaction;
        
        // Mở form đăng confession
        if (customId === 'confess_open') {
            await handleOpenConfessModal(interaction);
        }
        // Chốt chế độ ẩn danh và gửi confession
        else if (customId === 'confess_submit_anon' || customId === 'confess_submit_public') {
            await handleConfessSubmit(interaction, customId);
        }
        // Xử lý các button review confession
        else if (customId.startsWith('approve_') || customId.startsWith('reject_') || customId.startsWith('edit_')) {
            await handleConfessionReview(interaction, customId);
        }
        // Xử lý emoji buttons
        else if (customId.startsWith('emoji_')) {
            await handleEmojiButton(interaction, customId);
        }
    },
};

// Mở modal nhập nội dung confession
async function handleOpenConfessModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId("confess_modal")
        .setTitle("📝 Đăng Confession");

    const contentInput = new TextInputBuilder()
        .setCustomId("confess_content")
        .setLabel("Nội dung confession")
        .setStyle(TextInputStyle.Paragraph)
        .setMinLength(config.confession.minLength)
        .setMaxLength(CONFESS_MAX_LENGTH)
        .setRequired(true)
        .setPlaceholder(`Nhập confession của bạn (tối đa ${CONFESS_MAX_LENGTH} ký tự)...`);

    modal.addComponents(
        new ActionRowBuilder().addComponents(contentInput)
    );

    try {
        await interaction.showModal(modal);
    } catch (error) {
        console.error("Không thể mở modal confession:", error.message);
    }
}

// Đọc nội dung từ embed xem trước, gắn chế độ ẩn danh và gửi đi duyệt
async function handleConfessSubmit(interaction, customId) {
    const isAnonymous = customId === "confess_submit_anon";
    const content = interaction.message.embeds[0]?.description;

    if (!content) {
        return interaction.update({
            content: "❌ Không đọc được nội dung confession. Vui lòng thử lại.",
            embeds: [],
            components: [],
        });
    }

    try {
        const result = await submitConfessionForReview({
            guild: interaction.guild,
            user: interaction.user,
            content,
            isAnonymous,
            client: interaction.client,
        });

        if (!result.ok) {
            return interaction.update({
                content: `❌ ${result.error}`,
                embeds: [],
                components: [],
            });
        }

        const modeNote = isAnonymous
            ? "🕵️ Đăng ẩn danh."
            : "👤 Hiển thị tên của bạn.";
        const statusNote = result.requireReview
            ? "✅ Confession của bạn đã được gửi để duyệt! Bạn sẽ được thông báo khi được duyệt hoặc từ chối."
            : "✅ Confession của bạn đã được đăng!";

        await interaction.update({
            content: `${statusNote} ${modeNote}`,
            embeds: [],
            components: [],
        });
    } catch (error) {
        console.error("Lỗi khi gửi confession từ modal:", error);
        try {
            await interaction.update({
                content: "❌ Đã xảy ra lỗi khi gửi confession!",
                embeds: [],
                components: [],
            });
        } catch (_) {
            // bỏ qua nếu không update được
        }
    }
}

async function handleEmojiButton(interaction, customId) {
    // Defer reply ngay lập tức để tránh timeout
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
            return interaction.reply({
                content: "❌ Không tìm thấy confession!",
                flags: 64
            });
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

        // Kiểm tra xem user đã react chưa
        const userReactions = await db.getUserEmojiReactions(interaction.guild.id, confession._id, interaction.user.id);
        const hasReacted = userReactions.includes(emojiKey);

        if (hasReacted) {
            // Xóa reaction
            await db.removeEmojiReaction(interaction.guild.id, confession._id, interaction.user.id, emojiKey);
            userReactions.splice(userReactions.indexOf(emojiKey), 1);
        } else {
            // Thêm reaction
            await db.addEmojiReaction(interaction.guild.id, confession._id, interaction.user.id, emojiKey);
            userReactions.push(emojiKey);
        }

        // Lấy emoji counts mới
        const emojiCounts = await db.getEmojiCounts(interaction.guild.id, confession._id);

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
                    content: "✅ Reaction đã được cập nhật!",
                    flags: 64
                });
            } catch (replyError) {
                console.error("Không thể followUp interaction:", replyError.message);
            }
        }

    } catch (error) {
        console.error('Error handling emoji button:', error);
        try {
            await interaction.reply({
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
        const confession = await db.getConfession(confessionId);
        if (!confession) {
            return interaction.reply({
                content: "❌ Không tìm thấy confession này!",
                flags: 64 // Ephemeral flag
            });
        }

        // Kiểm tra xem confession đã được xử lý chưa
        if (confession.status !== 'pending') {
            return interaction.reply({
                content: `❌ Confession này đã được ${confession.status === 'approved' ? 'duyệt' : 'từ chối'} rồi!`,
                flags: 64 // Ephemeral flag
            });
        }

        if (action === 'approve') {
            // Đăng confession (xử lý cả kênh text lẫn forum) qua helper dùng chung
            const result = await publishConfession({
                guild: interaction.guild,
                client: interaction.client,
                confession,
                reviewerId: interaction.user.id,
            });

            if (!result.ok) {
                return interaction.reply({
                    content: `❌ ${result.error}`,
                    flags: 64 // Ephemeral flag
                });
            }

            // Cập nhật embed gốc
            const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
                .setColor(0x00FF00)
                .setTitle("✅ Confession Đã Được Duyệt")
                .addFields(
                    { name: "👨‍⚖️ Duyệt bởi", value: `<@${interaction.user.id}>`, inline: true },
                    { name: "⏰ Thời gian duyệt", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
                );

            // Disable buttons
            const disabledButtons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`approve_${confessionId}`)
                        .setLabel("✅ Đã Duyệt")
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId(`reject_${confessionId}`)
                        .setLabel("❌ Từ chối")
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId(`edit_${confessionId}`)
                        .setLabel("✏️ Chỉnh sửa")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true)
                );

            await interaction.message.edit({
                embeds: [updatedEmbed],
                components: [disabledButtons]
            });

            try {
                await interaction.reply({
                    content: `✅ Đã duyệt và đăng confession #${result.confessionNumber}!`,
                    flags: 64 // Ephemeral flag
                });
            } catch (replyError) {
                console.error("Không thể reply interaction:", replyError.message);
            }
            // (DM cho người gửi đã được xử lý trong publishConfession)

        } else if (action === 'reject') {
            // Từ chối confession
            await db.updateConfessionStatus(confessionId, 'rejected', interaction.user.id);

            const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
                .setColor(0xFF0000)
                .setTitle("❌ Confession Đã Bị Từ Chối")
                .addFields(
                    { name: "👨‍⚖️ Từ chối bởi", value: `<@${interaction.user.id}>`, inline: true },
                    { name: "⏰ Thời gian từ chối", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
                );

            const disabledButtons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`approve_${confessionId}`)
                        .setLabel("✅ Duyệt")
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId(`reject_${confessionId}`)
                        .setLabel("❌ Đã Từ Chối")
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId(`edit_${confessionId}`)
                        .setLabel("✏️ Chỉnh sửa")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true)
                );

            await interaction.message.edit({
                embeds: [updatedEmbed],
                components: [disabledButtons]
            });

            try {
                await interaction.reply({
                    content: `❌ Đã từ chối confession #${confessionId}!`,
                    flags: 64 // Ephemeral flag
                });
            } catch (replyError) {
                console.error("Không thể reply interaction:", replyError.message);
            }

            // Thông báo cho người gửi
            try {
                const user = await interaction.client.users.fetch(confession.userId);
                await user.send({
                    content: `😔 Confession của bạn đã bị từ chối trên server **${interaction.guild.name}**.`
                });
            } catch (error) {
                console.log("Không thể gửi DM cho user:", error.message);
            }

        } else if (action === 'edit') {
            // Hiển thị modal để chỉnh sửa
            try {
                await interaction.reply({
                    content: "✏️ Tính năng chỉnh sửa sẽ được phát triển trong phiên bản tiếp theo!",
                    flags: 64 // Ephemeral flag
                });
            } catch (replyError) {
                console.error("Không thể reply interaction:", replyError.message);
            }
        }

    } catch (error) {
        console.error("Lỗi khi xử lý review confession:", error);
        try {
            await interaction.reply({
                content: "❌ Đã xảy ra lỗi khi xử lý review!",
                flags: 64 // Ephemeral flag
            });
        } catch (replyError) {
            console.error("Không thể reply interaction:", replyError.message);
        }
    }
} 