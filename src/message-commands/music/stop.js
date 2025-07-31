const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "stop",
    aliases: ["leave", "disconnect"],
    description: "Dừng phát nhạc và rời khỏi kênh thoại",
    async execute(message) {
        const { channel } = message.member.voice;

        // Kiểm tra người dùng có trong voice channel không
        if (!channel) {
            const errorMsg = await message.reply(
                "❌ Bạn cần vào một kênh thoại để sử dụng lệnh này!"
            );
            setTimeout(() => errorMsg.delete().catch(console.error), 5000);
            return;
        }

        const player = message.client.music.players.get(message.guild.id);

        // Kiểm tra có đang phát nhạc không
        if (!player) {
            const errorMsg = await message.reply(
                "❌ Không có bài hát nào đang phát!"
            );
            setTimeout(() => errorMsg.delete().catch(console.error), 5000);
            return;
        }

        // Kiểm tra người dùng có cùng kênh với bot không
        if (channel.id !== player.voiceId) {
            const errorMsg = await message.reply(
                "❌ Bạn cần ở cùng kênh thoại với bot!"
            );
            setTimeout(() => errorMsg.delete().catch(console.error), 5000);
            return;
        }

        try {
            // Dừng phát nhạc và xóa hàng đợi
            player.queue.clear();
            await player.destroy();

            const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle("⏹️ Đã dừng phát nhạc")
                .setDescription("Bot đã rời khỏi kênh thoại")
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Lỗi khi dừng phát nhạc:", error);
            const errorMsg = await message.reply(
                "❌ Đã xảy ra lỗi khi dừng phát nhạc!"
            );
            setTimeout(() => errorMsg.delete().catch(console.error), 5000);
        }
    },
};
