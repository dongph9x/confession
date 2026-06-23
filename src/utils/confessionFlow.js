const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
} = require("discord.js");
const db = require("../data/mongodb");
const config = require("../config/bot");
const { createEmojiButtons } = require("./emojiButtons");

/**
 * Đăng confession đã duyệt (hoặc đăng thẳng khi tắt kiểm duyệt) vào kênh confession.
 * Hỗ trợ cả kênh text thường lẫn kênh forum. Tự tạo thread bình luận + nút emoji,
 * tăng counter và đánh dấu confession 'approved' trong DB, rồi DM cho người gửi.
 *
 * @returns {Promise<{ ok: boolean, error?: string, confessionNumber?: number }>}
 */
async function publishConfession({ guild, client, confession, reviewerId = null }) {
    const guildSettings = await db.getGuildSettings(guild.id);
    const confessionChannel = guildSettings?.confessionChannel
        ? guild.channels.cache.get(guildSettings.confessionChannel)
        : null;

    if (!confessionChannel) {
        return { ok: false, error: "Kênh confession chưa được thiết lập!" };
    }

    const confessionNumber = (guildSettings.confessionCounter || 0) + 1;
    const isAnonymous = confession.isAnonymous;

    // Embed confession đã duyệt
    const approvedEmbed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle("💝 Confession #" + confessionNumber)
        .setDescription(confession.content)
        .addFields(
            {
                name: "👤 Người gửi",
                value: isAnonymous ? "🕵️ Ẩn danh" : `<@${confession.userId}>`,
                inline: true,
            },
            {
                name: "⏰ Thời gian",
                value: `<t:${Math.floor(new Date(confession.createdAt).getTime() / 1000)}:R>`,
                inline: true,
            }
        )
        .setFooter({
            text: `Confession Bot • ${guild.name}`,
            iconURL: guild.iconURL(),
        })
        .setTimestamp();

    if (!isAnonymous) {
        try {
            const author = await client.users.fetch(confession.userId);
            approvedEmbed.setAuthor({
                name: author.username,
                iconURL: author.displayAvatarURL(),
            });
        } catch (_) {
            // không lấy được author thì bỏ qua
        }
    }

    const emojiCounts = await db.getEmojiCounts(guild.id, confession._id);
    const emojiButtons = createEmojiButtons(emojiCounts);

    let message; // message chứa embed + emoji buttons
    let thread; // thread để bình luận

    if (confessionChannel.type === ChannelType.GuildForum) {
        // Kênh forum: nội dung phải nằm ở phần TEXT của post (nếu chỉ có embed,
        // Discord hiện preview là "Click to see attachment"). Embed chỉ giữ metadata.
        const forumEmbed = EmbedBuilder.from(approvedEmbed).setDescription(null);
        thread = await confessionChannel.threads.create({
            name: `💝 Confession #${confessionNumber}`,
            message: {
                content: confession.content.slice(0, 2000),
                embeds: [forumEmbed],
                components: emojiButtons,
                allowedMentions: { parse: [] }, // không ping ai từ nội dung
            },
            reason: "Confession post",
        });
        message = await thread.fetchStarterMessage();
    } else {
        // Kênh text thường: gửi message rồi tạo thread bình luận
        message = await confessionChannel.send({
            embeds: [approvedEmbed],
            components: emojiButtons,
        });
        thread = await message.startThread({
            name: `💬 Bình luận Confession #${confessionNumber}`,
            autoArchiveDuration: 1440, // 24 giờ
            reason: "Thread cho confession",
        });
    }

    // Cập nhật trạng thái + gán số thứ tự
    const updated = await db.updateConfessionStatus(
        confession._id,
        "approved",
        reviewerId,
        message?.id || null,
        thread.id
    );

    if (!updated || updated.status !== "approved") {
        // Rollback nội dung đã đăng nếu cập nhật DB thất bại
        try {
            await thread.delete();
        } catch (_) {}
        if (confessionChannel.type !== ChannelType.GuildForum && message) {
            try {
                await message.delete();
            } catch (_) {}
        }
        return { ok: false, error: "Không cập nhật được trạng thái confession." };
    }

    // DM cho người gửi
    try {
        const user = await client.users.fetch(confession.userId);
        await user.send({
            content: `🎉 Confession của bạn đã được đăng lên server **${guild.name}**!`,
        });
    } catch (_) {
        // user tắt DM thì bỏ qua
    }

    return { ok: true, confessionNumber };
}

/**
 * Gửi confession. Nếu server BẬT kiểm duyệt → đưa vào kênh review chờ mod duyệt.
 * Nếu TẮT kiểm duyệt → đăng thẳng vào kênh confession.
 *
 * @returns {Promise<{ ok: boolean, error?: string, requireReview?: boolean }>}
 */
async function submitConfessionForReview({ guild, user, content, isAnonymous, client }) {
    // Kiểm tra độ dài
    if (content.length > config.confession.maxLength) {
        return {
            ok: false,
            error: `Confession quá dài! Tối đa ${config.confession.maxLength} ký tự.`,
        };
    }
    if (content.length < config.confession.minLength) {
        return {
            ok: false,
            error: `Confession quá ngắn! Tối thiểu ${config.confession.minLength} ký tự.`,
        };
    }

    const guildSettings = await db.getGuildSettings(guild.id);
    const requireReview = guildSettings?.requireReview !== false; // mặc định BẬT

    if (requireReview) {
        // ----- Có kiểm duyệt: đưa vào kênh review -----
        if (!guildSettings?.reviewChannel) {
            return {
                ok: false,
                error: "Kênh review confession chưa được thiết lập! Hãy nhờ Admin thiết lập trước.",
            };
        }
        const reviewChannel = guild.channels.cache.get(guildSettings.reviewChannel);
        if (!reviewChannel) {
            return {
                ok: false,
                error: "Không tìm thấy kênh review! Có thể kênh đã bị xóa.",
            };
        }

        const confessionId = await db.addConfession(guild.id, user.id, content, isAnonymous);
        if (!confessionId) {
            return { ok: false, error: "Không thể lưu confession vào database!" };
        }

        const reviewEmbed = new EmbedBuilder()
            .setColor(config.colors.warning)
            .setTitle("📝 Confession Cần Duyệt")
            .setDescription(content)
            .addFields(
                { name: "🆔 ID Confession", value: `#${confessionId}`, inline: true },
                { name: "👤 Người gửi", value: `<@${user.id}>`, inline: true },
                {
                    name: "⏰ Thời gian",
                    value: `<t:${Math.floor(Date.now() / 1000)}:R>`,
                    inline: true,
                },
                {
                    name: "🕵️ Chế độ",
                    value: isAnonymous ? "🕵️ Ẩn danh" : "👤 Hiển thị tên",
                    inline: true,
                }
            )
            .setFooter({
                text: `Confession Bot • ${guild.name}`,
                iconURL: guild.iconURL(),
            })
            .setTimestamp();

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`approve_${confessionId}`)
                .setLabel("✅ Duyệt")
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`reject_${confessionId}`)
                .setLabel("❌ Từ chối")
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(`edit_${confessionId}`)
                .setLabel("✏️ Chỉnh sửa")
                .setStyle(ButtonStyle.Secondary)
        );

        await reviewChannel.send({ embeds: [reviewEmbed], components: [buttons] });
        return { ok: true, requireReview: true };
    }

    // ----- Không kiểm duyệt: đăng thẳng -----
    if (!guildSettings?.confessionChannel) {
        return {
            ok: false,
            error: "Kênh đăng confession chưa được thiết lập! Hãy nhờ Admin thiết lập trước.",
        };
    }

    const confessionId = await db.addConfession(guild.id, user.id, content, isAnonymous);
    if (!confessionId) {
        return { ok: false, error: "Không thể lưu confession vào database!" };
    }

    const confession = await db.getConfession(confessionId);
    const result = await publishConfession({
        guild,
        client: client || guild.client,
        confession,
        reviewerId: null,
    });
    if (!result.ok) {
        return { ok: false, error: result.error };
    }

    return { ok: true, requireReview: false };
}

module.exports = { submitConfessionForReview, publishConfession };
