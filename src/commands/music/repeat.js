const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("repeat")
        .setDescription("Đặt chế độ lặp lại")
        .addStringOption((option) =>
            option
                .setName("mode")
                .setDescription("Chế độ lặp lại")
                .setRequired(true)
                .addChoices(
                    { name: "Tắt", value: "none" },
                    { name: "Lặp lại một bài", value: "track" },
                    { name: "Lặp lại tất cả", value: "queue" }
                )
        ),
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

        const mode = interaction.options.getString("mode");
        player.setLoop(mode);

        const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setFooter({ text: `From CAPTAIN BOY with ❤️` })
            .setTimestamp();

        switch (mode) {
            case "none":
                embed.setDescription("`🔄` `Đã tắt chế độ lặp lại`");
                break;
            case "track":
                embed.setDescription("`🔂` `Đã bật chế độ lặp lại một bài`");
                break;
            case "queue":
                embed.setDescription("`🔁` `Đã bật chế độ lặp lại tất cả`");
                break;
        }

        await interaction.reply({ embeds: [embed] });
    },
};
