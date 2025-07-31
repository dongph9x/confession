const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setreviewchannel")
        .setDescription("Thiết lập kênh kiểm duyệt confession")
        .addChannelOption((option) =>
            option
                .setName("channel")
                .setDescription("Kênh để kiểm duyệt confession")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const channel = interaction.options.getChannel("channel");

        try {
            interaction.client.config.reviewChannel = channel;
            await interaction.reply({
                content: `Đã thiết lập kênh kiểm duyệt là ${channel}!`,
                ephemeral: true,
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "Có lỗi xảy ra khi thiết lập kênh kiểm duyệt!",
                ephemeral: true,
            });
        }
    },
};
