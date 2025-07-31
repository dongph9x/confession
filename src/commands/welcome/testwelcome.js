const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const guildMemberAdd = require("../../events/guildMemberAdd");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("testwelcome")
        .setDescription("Test the welcome message")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            await guildMemberAdd.execute(interaction.member);

            await interaction.reply({
                content: "Welcome message test sent!",
                ephemeral: true,
            });
        } catch (error) {
            console.error("Error in testwelcome command:", error);
            await interaction.reply({
                content:
                    "There was an error while testing the welcome message!",
                ephemeral: true,
            });
        }
    },
};
