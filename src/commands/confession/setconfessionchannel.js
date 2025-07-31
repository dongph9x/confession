const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { db } = require("../../utils/database");

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

            const guildConfig = await db.get(
                "SELECT * FROM guild_configs WHERE guild_id = ?",
                [interaction.guildId]
            );

            if (!guildConfig) {
                await db.run(
                    "INSERT INTO guild_configs (guild_id, confession_channel_id) VALUES (?, ?)",
                    [interaction.guildId, channel.id]
                );
            } else {
                await db.run(
                    "UPDATE guild_configs SET confession_channel_id = ? WHERE guild_id = ?",
                    [channel.id, interaction.guildId]
                );
            }

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
