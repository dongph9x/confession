const { Events } = require("discord.js");
const buttonHandler = require("../interactions/buttonHandler");
const selectMenuHandler = require("../interactions/selectMenuHandler");
const logger = require("../utils/logger");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        try {
            // Slash commands
            if (interaction.isChatInputCommand()) {
                const command = interaction.client.commands.get(
                    interaction.commandName
                );
                if (!command) return;

                await command.execute(interaction);
                logger.info(
                    `Command executed: ${interaction.commandName} by ${interaction.user.tag} in ${interaction.guild?.name}`
                );
                return;
            }

            // Button interactions (duyệt/từ chối confession, emoji reactions)
            if (interaction.isButton()) {
                await buttonHandler.execute(interaction);
                return;
            }

            // Select menu interactions (setup/config)
            if (interaction.isStringSelectMenu()) {
                await selectMenuHandler.execute(interaction);
                return;
            }
        } catch (error) {
            logger.error("Error handling interaction:", error);

            const errorMessage = {
                content: "❌ Đã xảy ra lỗi khi thực hiện!",
                flags: 64, // Ephemeral
            };

            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            } catch (replyError) {
                logger.error("Không thể gửi thông báo lỗi:", replyError);
            }
        }
    },
};
