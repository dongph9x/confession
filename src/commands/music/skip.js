const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Bỏ qua bài hát hiện tại"),
    async execute(interaction) {
        const kazagumo = global.kazagumo;
        const player = kazagumo.players.get(interaction.guild.id);

        if (!player) {
            const embed = new EmbedBuilder()
                .setColor("#2b2d31")
                .setDescription("`❌` `Không có bài hát nào đang phát!`")
                .setFooter({ text: `From CAPTAIN BOY with ❤️` })
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        }

        const currentTrack = player.queue.current;
        const nextTrack = player.queue[0];

        player.skip();
        const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setDescription(
                `\`⏭️\` \`Đã bỏ qua bài hát\`\n\n` +
                    `\`🎵\` \`Đã bỏ qua: ${currentTrack.title}\`\n` +
                    (nextTrack
                        ? `\`⏩\` \`Tiếp theo: ${nextTrack.title}\``
                        : `\`⏩\` \`Tiếp theo: Không có bài hát nào\``)
            )
            .setFooter({ text: `From CAPTAIN BOY with ❤️` })
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    },
};
