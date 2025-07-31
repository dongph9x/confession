const { PermissionFlagsBits } = require("discord.js");
const { db } = require("../../utils/database");

module.exports = {
    name: "setreview",
    description: "Thiết lập kênh kiểm duyệt confession",
    async execute(message, args) {
        if (
            !message.member.permissions.has(PermissionFlagsBits.Administrator)
        ) {
            const reply = await message.reply(
                "❌ Bạn không có quyền sử dụng lệnh này!"
            );
            setTimeout(() => {
                reply.delete().catch(console.error);
                message.delete().catch(console.error);
            }, 5000);
            return;
        }

        const channel = message.mentions.channels.first();
        if (!channel) {
            const reply = await message.reply(
                "❌ Vui lòng tag kênh cần thiết lập! (Ví dụ: !setreview #tên-kênh)"
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

            if (!guildConfig) {
                await db.run(
                    "INSERT INTO guild_configs (guild_id, review_channel_id) VALUES (?, ?)",
                    [message.guildId, channel.id]
                );
            } else {
                await db.run(
                    "UPDATE guild_configs SET review_channel_id = ? WHERE guild_id = ?",
                    [channel.id, message.guildId]
                );
            }

            const confirmMessage = await message.channel.send(
                `✅ Đã thiết lập kênh kiểm duyệt confession: ${channel}`
            );
            setTimeout(() => {
                confirmMessage.delete().catch(console.error);
                message.delete().catch(console.error);
            }, 5000);
        } catch (error) {
            console.error("Lỗi khi thiết lập kênh kiểm duyệt:", error);
            const errorMessage = await message.reply(
                "❌ Đã xảy ra lỗi khi thiết lập kênh kiểm duyệt!"
            );
            setTimeout(() => {
                errorMessage.delete().catch(console.error);
                message.delete().catch(console.error);
            }, 5000);
        }
    },
};
