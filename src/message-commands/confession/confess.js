const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("../../data/mongodb");
const config = require("../../config/bot");

module.exports = {
    name: "confess",
    description: "Gửi một confession ẩn danh",
    cooldown: 5, // 5 giây cooldown
    async execute(message, args) {
        // Xóa tin nhắn gốc với error handling
        try {
            await message.delete();
        } catch (error) {
            // Bỏ qua lỗi nếu không thể xóa tin nhắn
            console.log("Could not delete message:", error.message);
        }

        // Kiểm tra argument cho chế độ ẩn danh
        let isAnonymous = false;
        let content = args.join(" ");
        
        // Kiểm tra flag ẩn danh
        if (args.length > 0 && (args[0] === "anonymous" || args[0] === "anon" || args[0] === "ẩn")) {
            isAnonymous = true;
            content = args.slice(1).join(" ");
        }

        if (!content) {
            const errorMsg = await message.channel.send(
                "❌ Vui lòng nhập nội dung confession!\n\n**Cách sử dụng:**\n`!confess nội dung` - Gửi confession bình thường\n`!confess anonymous nội dung` - Gửi confession ẩn danh\n`!confess anon nội dung` - Gửi confession ẩn danh"
            );
            setTimeout(() => {
                errorMsg.delete().catch(() => {}); // Bỏ qua lỗi nếu không thể xóa
            }, 8000);
            return;
        }

        // Kiểm tra độ dài confession
        if (content.length > config.confession.maxLength) {
            const errorMsg = await message.channel.send(
                `❌ Confession quá dài! Tối đa ${config.confession.maxLength} ký tự.`
            );
            setTimeout(() => {
                errorMsg.delete().catch(() => {});
            }, 5000);
            return;
        }

        if (content.length < config.confession.minLength) {
            const errorMsg = await message.channel.send(
                `❌ Confession quá ngắn! Tối thiểu ${config.confession.minLength} ký tự.`
            );
            setTimeout(() => {
                errorMsg.delete().catch(() => {});
            }, 5000);
            return;
        }

        const guildSettings = await db.getGuildSettings(message.guild.id);
        if (!guildSettings?.reviewChannel) {
            const errorMsg = await message.channel.send(
                "❌ Kênh review confession chưa được thiết lập! Hãy nhờ Admin sử dụng lệnh `!setreview`"
            );
            setTimeout(() => {
                errorMsg.delete().catch(() => {});
            }, 5000);
            return;
        }

        const reviewChannel = message.guild.channels.cache.get(
            guildSettings.reviewChannel
        );
        if (!reviewChannel) {
            const errorMsg = await message.channel.send(
                "❌ Không tìm thấy kênh review! Có thể kênh đã bị xóa."
            );
            setTimeout(() => {
                errorMsg.delete().catch(() => {});
            }, 5000);
            return;
        }

        try {
            // Kiểm tra confession gần đây để tránh duplicate
            const recentConfessions = await db.getRecentConfessions(message.guild.id, message.author.id, 30); // 30 giây
            const duplicateConfession = recentConfessions.find(conf => 
                conf.content === content && 
                conf.isAnonymous === isAnonymous &&
                Date.now() - new Date(conf.createdAt).getTime() < 30000 // 30 giây
            );

            if (duplicateConfession) {
                const errorMsg = await message.channel.send(
                    "⚠️ Bạn vừa gửi confession tương tự! Vui lòng đợi một chút hoặc thay đổi nội dung."
                );
                setTimeout(() => {
                    errorMsg.delete().catch(() => {});
                }, 5000);
                return;
            }

            // Lưu confession vào database với thông tin ẩn danh
            const confessionId = await db.addConfession(
                message.guild.id,
                message.author.id,
                content,
                isAnonymous
            );

            if (!confessionId) {
                throw new Error("Failed to save confession to database");
            }

            // Tạo embed cho review
            const reviewEmbed = new EmbedBuilder()
                .setColor(config.colors.warning)
                .setTitle("📝 Confession Cần Duyệt")
                .setDescription(content)
                .addFields(
                    { name: "🆔 ID Confession", value: `#${confessionId}`, inline: true },
                    { name: "👤 Người gửi", value: `<@${message.author.id}>`, inline: true },
                    { name: "⏰ Thời gian", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                    { name: "🕵️ Chế độ", value: isAnonymous ? "🕵️ Ẩn danh" : "👤 Hiển thị tên", inline: true }
                )
                .setAuthor({
                    name: message.author.username,
                    iconURL: message.author.displayAvatarURL()
                })
                .setFooter({
                    text: `Confession Bot • ${message.guild.name}`,
                    iconURL: message.guild.iconURL(),
                })
                .setTimestamp();

            // Tạo buttons
            const buttons = new ActionRowBuilder()
                .addComponents(
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

            await reviewChannel.send({
                content: `📝 Confession mới từ **${message.author.username}** (${message.author.tag}) cần duyệt!`,
                embeds: [reviewEmbed],
                components: [buttons]
            });

            const successMsg = await message.channel.send(
                `✅ Confession của bạn đã được gửi để duyệt! ${isAnonymous ? '🕵️ Confession sẽ được đăng ẩn danh.' : '👤 Confession sẽ hiển thị tên của bạn.'}\n\nBạn sẽ được thông báo khi confession được duyệt hoặc từ chối.`
            );
            setTimeout(() => {
                successMsg.delete().catch(() => {});
            }, 8000);
        } catch (error) {
            console.error("Lỗi khi gửi confession:", error);
            const errorMsg = await message.channel.send(
                "❌ Đã xảy ra lỗi khi gửi confession!"
            );
            setTimeout(() => {
                errorMsg.delete().catch(() => {});
            }, 5000);
        }
    },
};
