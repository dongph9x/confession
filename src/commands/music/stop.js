const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Dừng phát nhạc và xóa hàng đợi"),
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

        player.destroy();
        const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setDescription("⏹️ `Đã dừng phát nhạc và xóa hàng đợi!`")
            .setFooter({ text: `From CAPTAIN BOY with ❤️` })
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    },
};
