const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "skip",
    aliases: ["s"],
    description: "Bỏ qua bài hát hiện tại",
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
        if (!player || !player.playing) {
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
            const currentTrack = player.queue.current;
            await player.skip();

            const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle("⏭️ Đã bỏ qua bài hát")
                .setDescription(`[${currentTrack.title}](${currentTrack.uri})`)
                .addFields({
                    name: "👤 Yêu cầu bởi",
                    value: message.author.tag,
                })
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Lỗi khi bỏ qua bài hát:", error);
            const errorMsg = await message.reply(
                "❌ Đã xảy ra lỗi khi bỏ qua bài hát!"
            );
            setTimeout(() => errorMsg.delete().catch(console.error), 5000);
        }
    },
};
