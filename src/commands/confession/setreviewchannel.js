const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../../data/database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setreviewchannel")
        .setDescription("Thiết lập kênh review confession (chỉ Admin)")
        .addChannelOption((option) =>
            option
                .setName("kênh")
                .setDescription("Kênh để review confession")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const channel = interaction.options.getChannel("kênh");
        
        if (!channel.isTextBased()) {
            return interaction.reply({
                content: "❌ Kênh phải là kênh text!",
                ephemeral: true,
            });
        }

        try {
            await db.setReviewChannel(interaction.guild.id, channel.id);
            
            return interaction.reply({
                content: `✅ Đã thiết lập kênh review confession: ${channel}`,
                ephemeral: true,
            });
        } catch (error) {
            console.error("Lỗi khi thiết lập kênh review:", error);
            return interaction.reply({
                content: "❌ Đã xảy ra lỗi khi thiết lập kênh review!",
                ephemeral: true,
            });
        }
    },
};
