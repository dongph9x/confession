const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../../data/mongodb");

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
        try {
            const channel = interaction.options.getChannel("channel");

            await db.setConfessionChannel(interaction.guildId, channel.id);

            await interaction.reply({
                content: `✅ Đã thiết lập kênh hiển thị confession: ${channel}`,
                ephemeral: true,
            });
        } catch (error) {
            console.error("Lỗi khi thiết lập kênh hiển thị:", error);
            await interaction.reply({
                content:
                    "❌ Đã xảy ra lỗi khi thiết lập kênh hiển thị confession!",
                ephemeral: true,
            });
        }
    },
};
