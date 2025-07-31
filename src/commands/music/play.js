const {
    SlashCommandBuilder,
    EmbedBuilder,
    ChannelType,
} = require("discord.js");
const { formatDuration } = require("./utils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Phát một bài hát")
        .addStringOption((option) =>
            option
                .setName("query")
                .setDescription("Tên bài hát hoặc URL")
                .setRequired(true)
        ),
    async execute(interaction) {
        const query = interaction.options.getString("query");
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            const embed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription(
                    "`❌` `Bạn cần vào kênh voice hoặc sân khấu để sử dụng lệnh này!`"
                )
                .setFooter({ text: `From CAPTAIN BOY with ❤️` })
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        }

        await interaction.deferReply();

        try {
            const kazagumo = global.kazagumo;
            // Kiểm tra kết nối Lavalink
            if (!kazagumo || !kazagumo.shoukaku.nodes.size) {
                const embed = new EmbedBuilder()
                    .setColor("#ff0000")
                    .setDescription(
                        "`❌` `Không thể kết nối đến máy chủ nhạc. Vui lòng thử lại sau!`"
                    )
                    .setFooter({ text: `From CAPTAIN BOY with ❤️` })
                    .setTimestamp();
                return interaction.editReply({ embeds: [embed] });
            }

            // Tạo hoặc lấy player
            let player =
                kazagumo.players.get(interaction.guild.id) ||
                (await kazagumo.createPlayer({
                    guildId: interaction.guild.id,
                    textId: interaction.channel.id,
                    voiceId: voiceChannel.id,
                    volume: 40,
                }));

            // Xử lý stage channel
            const voiceState = interaction.guild.members.me?.voice;
            if (
                voiceState?.channel?.type === ChannelType.GuildStageVoice &&
                voiceState.suppress
            ) {
                await voiceState
                    .setSuppressed(false)
                    .catch(() => voiceState.setRequestToSpeak(true));
            }

            let result = await kazagumo.search(query, {
                requester: interaction.user,
            });
            if (!result.tracks.length) {
                const embed = new EmbedBuilder()
                    .setColor("#ff0000")
                    .setDescription("`❌` `Không tìm thấy kết quả!`")
                    .setFooter({ text: `From CAPTAIN BOY with ❤️` })
                    .setTimestamp();
                return interaction.editReply({ embeds: [embed] });
            }

            const embed = new EmbedBuilder().setColor("#00ff00");

            if (result.type === "PLAYLIST") {
                player.queue.add(result.tracks);
                embed
                    .setColor("#2b2d31")
                    .setDescription(
                        `\`✅\` \`Đã thêm danh sách phát vào hàng đợi\`\n\n` +
                            `\`📝\` \`Tên danh sách: ${result.playlistName}\`\n` +
                            `\`🎵\` \`Số bài hát: ${result.tracks.length}\`\n` +
                            `\`⏱️\` \`Tổng thời lượng: ${formatDuration(
                                result.tracks.reduce(
                                    (acc, track) => acc + track.length,
                                    0
                                )
                            )}\``
                    )
                    .setFooter({ text: `From CAPTAIN BOY with ❤️` })
                    .setTimestamp();
            } else {
                const track = result.tracks[0];
                player.queue.add(track);
                embed
                    .setColor("#2b2d31")
                    .setDescription(
                        `\`✅\` \`Đã thêm bài hát vào hàng đợi\`\n\n` +
                            `\`🎵\` \`Bài hát: ${track.title}\`\n` +
                            `\`⏱️\` \`Thời lượng: ${formatDuration(
                                track.length
                            )}\`\n` +
                            `\`👤\` \`Yêu cầu bởi: ${track.requester}\``
                    )
                    .setThumbnail(track.thumbnail)
                    .setFooter({ text: `From CAPTAIN BOY with ❤️` })
                    .setTimestamp();
            }

            if (!player.playing && !player.paused) player.play();
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            const embed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription(
                    "`❌` `Đã xảy ra lỗi khi phát nhạc! Vui lòng thử lại sau.`"
                )
                .setFooter({ text: `From CAPTAIN BOY with ❤️` })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
    },
};
