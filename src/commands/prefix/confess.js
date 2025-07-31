const { EmbedBuilder } = require("discord.js");
const { db } = require("../../utils/database");

module.exports = {
    name: "confess",
    description: "Gửi một confession ẩn danh",
    async execute(message, args) {
        const content = args.join(" ");
        if (!content) {
            const reply = await message.reply(
                "Vui lòng nhập nội dung confession!"
            );
            setTimeout(() => {
                reply.delete().catch(console.error);
                message.delete().catch(console.error);
            }, 5000);
            return;
        }

        try {
            const guildConfig = await db.get(
                "SELECT * FROM guild_configs WHERE guild_id = ?",
                [message.guildId]
            );

            if (!guildConfig || !guildConfig.review_channel_id) {
                const reply = await message.reply(
                    "Kênh kiểm duyệt chưa được thiết lập!"
                );
                setTimeout(() => {
                    reply.delete().catch(console.error);
                    message.delete().catch(console.error);
                }, 5000);
                return;
            }

            const result = await db.run(
                "INSERT INTO confessions (guild_id, content) VALUES (?, ?)",
                [message.guildId, content]
            );

            const confessionId = result.lastID;
            const reviewChannel = message.guild.channels.cache.get(
                guildConfig.review_channel_id
            );

            if (!reviewChannel) {
                const reply = await message.reply(
                    "Không tìm thấy kênh kiểm duyệt! Vui lòng liên hệ Admin."
                );
                setTimeout(() => {
                    reply.delete().catch(console.error);
                    message.delete().catch(console.error);
                }, 5000);
                return;
            }

            const currentTime = Math.floor(Date.now() / 1000);
            const reviewEmbed = new EmbedBuilder()
                .setTitle("📝 Confession Mới")
                .setDescription(content)
                .setColor("#2b2d31")
                .addFields(
                    {
                        name: "ID",
                        value: `#${confessionId}`,
                        inline: true,
                    },
                    {
                        name: "📅 Thời gian",
                        value: `<t:${currentTime}:F> (<t:${currentTime}:R>)`,
                        inline: true,
                    },
                    {
                        name: "Trạng thái",
                        value: "⏳ Đang chờ duyệt",
                        inline: false,
                    }
                )
                .setTimestamp()
                .setFooter({ text: "React ✅ để duyệt hoặc ❌ để từ chối" });

            const reviewMessage = await reviewChannel.send({
                embeds: [reviewEmbed],
            });

            await reviewMessage.react("✅");
            await reviewMessage.react("❌");

            await db.run(
                "UPDATE confessions SET review_message_id = ? WHERE id = ?",
                [reviewMessage.id, confessionId]
            );

            await message.delete().catch(console.error);

            const confirmMessage = await message.channel.send(
                "✅ Confession của bạn đã được gửi và đang chờ duyệt!"
            );
            setTimeout(() => {
                confirmMessage.delete().catch(console.error);
            }, 5000);
        } catch (error) {
            console.error("Lỗi khi xử lý confession:", error);
            const errorMessage = await message.reply(
                "❌ Đã xảy ra lỗi khi gửi confession!"
            );
            setTimeout(() => {
                errorMessage.delete().catch(console.error);
                message.delete().catch(console.error);
            }, 5000);
        }
    },
};
