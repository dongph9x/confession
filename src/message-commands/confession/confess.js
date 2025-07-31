const { EmbedBuilder } = require("discord.js");
const db = require("../../data/database");

module.exports = {
    name: "confess",
    description: "Gửi một confession ẩn danh",
    async execute(message, args) {
        await message.delete().catch(console.error);

        const content = args.join(" ");
        if (!content) {
            const errorMsg = await message.channel.send(
                "❌ Vui lòng nhập nội dung confession!"
            );
            setTimeout(() => errorMsg.delete().catch(console.error), 5000);
            return;
        }

        const guildSettings = await db.getGuildSettings(message.guild.id);
        if (!guildSettings?.confession_channel) {
            const errorMsg = await message.channel.send(
                "❌ Kênh confession chưa được thiết lập! Hãy nhờ Admin sử dụng lệnh `/setconfess`"
            );
            setTimeout(() => errorMsg.delete().catch(console.error), 5000);
            return;
        }

        const confessionChannel = message.guild.channels.cache.get(
            guildSettings.confession_channel
        );
        if (!confessionChannel) {
            const errorMsg = await message.channel.send(
                "❌ Không tìm thấy kênh confession! Có thể kênh đã bị xóa."
            );
            setTimeout(() => errorMsg.delete().catch(console.error), 5000);
            return;
        }

        try {
            await db.addConfession(
                message.guild.id,
                message.author.id,
                content
            );

            const embed = new EmbedBuilder()
                .setColor(0x2f3136)
                .setTitle("Confession Ẩn Danh")
                .setDescription(content)
                .setFooter({
                    text: `Confession Bot • ${message.guild.name}`,
                    iconURL: message.guild.iconURL(),
                })
                .setTimestamp();

            await confessionChannel.send({ embeds: [embed] });

            const successMsg = await message.channel.send(
                "✅ Confession của bạn đã được gửi ẩn danh!"
            );
            setTimeout(() => successMsg.delete().catch(console.error), 5000);
        } catch (error) {
            console.error("Lỗi khi gửi confession:", error);
            const errorMsg = await message.channel.send(
                "❌ Đã xảy ra lỗi khi gửi confession!"
            );
            setTimeout(() => errorMsg.delete().catch(console.error), 5000);
        }
    },
};
