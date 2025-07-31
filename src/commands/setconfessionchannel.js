const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setconfessionchannel")
        .setDescription("Thiết lập kênh hiển thị confession")
        .addChannelOption((option) =>
            option
                .setName("channel")
                .setDescription("Kênh để hiển thị confession")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const channel = interaction.options.getChannel("channel");

        try {
            interaction.client.config.confessionChannel = channel;
            await interaction.reply({
                content: `Đã thiết lập kênh hiển thị confession là ${channel}!`,
                ephemeral: true,
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content:
                    "Có lỗi xảy ra khi thiết lập kênh hiển thị confession!",
                ephemeral: true,
            });
        }
    },
};
