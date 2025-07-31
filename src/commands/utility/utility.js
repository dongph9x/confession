const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("utility")
        .setDescription("Các lệnh tiện ích")
        .addSubcommand((subcommand) =>
            subcommand.setName("ping").setDescription("Kiểm tra độ trễ của bot")
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("uptime")
                .setDescription("Xem thời gian hoạt động của bot")
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "ping") {
            const sent = await interaction.reply({
                content: "Đang tính toán độ trễ...",
                fetchReply: true,
            });
            const latency =
                sent.createdTimestamp - interaction.createdTimestamp;
            const apiLatency = Math.round(interaction.client.ws.ping);

            const embed = new EmbedBuilder()
                .setTitle("🏓 Pong!")
                .setColor("#00ff00")
                .addFields(
                    {
                        name: "Bot Latency",
                        value: `${latency}ms`,
                        inline: true,
                    },
                    {
                        name: "API Latency",
                        value: `${apiLatency}ms`,
                        inline: true,
                    }
                )
                .setTimestamp();

            await interaction.editReply({ content: null, embeds: [embed] });
        } else if (subcommand === "uptime") {
            const uptime = interaction.client.uptime;
            const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
                (uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            const minutes = Math.floor(
                (uptime % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor((uptime % (1000 * 60)) / 1000);

            const uptimeString = `${days} ngày, ${hours} giờ, ${minutes} phút, ${seconds} giây`;

            const embed = new EmbedBuilder()
                .setTitle("⏰ Thời gian hoạt động")
                .setDescription(uptimeString)
                .setColor("#00ff00")
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    },
};
