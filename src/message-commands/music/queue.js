const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "queue",
    aliases: ["q"],
    description: "Hiển thị danh sách phát hiện tại",
    async execute(message) {
        const kazagumo = global.kazagumo;
        if (!kazagumo) {
            const errorMsg = await message.reply(
                "❌ Tính năng nhạc đang được tắt trên bot này."
            );
            setTimeout(() => errorMsg.delete().catch(console.error), 5000);
            return;
        }
        const player = kazagumo.players.get(message.guild.id);

        // Kiểm tra có đang phát nhạc không
        if (!player || !player.playing) {
            const errorMsg = await message.reply(
                "❌ Không có bài hát nào đang phát!"
            );
            setTimeout(() => errorMsg.delete().catch(console.error), 5000);
            return;
        }

        const queue = player.queue;
        const currentTrack = queue.current;

        // Tạo danh sách bài hát
        const tracks = queue.map((track, index) => {
            return `${index + 1}. [${track.title}](${track.uri}) | ${
                track.duration
            } | Yêu cầu bởi: ${track.requester.tag}`;
        });

        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle("📑 Danh sách phát")
            .addFields({
                name: "🎵 Đang phát",
                value: `[${currentTrack.title}](${currentTrack.uri}) | ${currentTrack.duration} | Yêu cầu bởi: ${currentTrack.requester.tag}`,
            });

        if (tracks.length) {
            embed.addFields({
                name: "📋 Tiếp theo",
                value:
                    tracks.slice(0, 10).join("\n") +
                    (tracks.length > 10 ? "\n...và còn nữa" : ""),
            });
        }

        embed.addFields(
            {
                name: "🎧 Tổng số bài hát",
                value: `${tracks.length + 1}`,
                inline: true,
            },
            { name: "⌛ Tổng thời gian", value: queue.duration, inline: true }
        );

        await message.reply({ embeds: [embed] });
    },
};
