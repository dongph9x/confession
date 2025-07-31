const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "play",
    aliases: ["p"],
    description: "Phát nhạc từ YouTube hoặc Spotify",
    async execute(message, args) {
        const { channel } = message.member.voice;

        // Kiểm tra người dùng có trong voice channel không
        if (!channel) {
            const errorMsg = await message.reply(
                "❌ Bạn cần vào một kênh thoại để sử dụng lệnh này!"
            );
            setTimeout(() => errorMsg.delete().catch(console.error), 5000);
            return;
        }

        // Kiểm tra quyền của bot
        const permissions = channel.permissionsFor(message.client.user);
        if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
            const errorMsg = await message.reply(
                "❌ Bot cần quyền vào kênh và phát nhạc!"
            );
            setTimeout(() => errorMsg.delete().catch(console.error), 5000);
            return;
        }

        // Kiểm tra có nhập link/tên bài hát không
        if (!args.length) {
            const errorMsg = await message.reply(
                "❌ Vui lòng nhập tên bài hát hoặc URL!"
            );
            setTimeout(() => errorMsg.delete().catch(console.error), 5000);
            return;
        }

        const query = args.join(" ");

        try {
            // Tìm và phát nhạc
            const result = await message.client.music.search(query, {
                requester: message.author,
            });
            if (!result.tracks.length) {
                const errorMsg = await message.reply(
                    "❌ Không tìm thấy bài hát!"
                );
                setTimeout(() => errorMsg.delete().catch(console.error), 5000);
                return;
            }

            const player = await message.client.music.createPlayer({
                guildId: message.guild.id,
                textId: message.channel.id,
                voiceId: channel.id,
                deaf: true,
            });

            player.queue.add(result.tracks[0]);

            if (!player.playing && !player.paused) {
                await player.play();
            }

            const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle("🎵 Đã thêm vào hàng đợi")
                .setDescription(
                    `[${result.tracks[0].title}](${result.tracks[0].uri})`
                )
                .addFields(
                    {
                        name: "👤 Yêu cầu bởi",
                        value: message.author.tag,
                        inline: true,
                    },
                    {
                        name: "⏱️ Thời lượng",
                        value: result.tracks[0].duration,
                        inline: true,
                    }
                )
                .setThumbnail(result.tracks[0].thumbnail)
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Lỗi khi phát nhạc:", error);
            const errorMsg = await message.reply(
                "❌ Đã xảy ra lỗi khi phát nhạc!"
            );
            setTimeout(() => errorMsg.delete().catch(console.error), 5000);
        }
    },
};
