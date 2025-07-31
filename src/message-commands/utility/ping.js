const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "ping",
    description: "Kiểm tra độ trễ của bot",
    async execute(message) {
        const sent = await message.reply("Đang tính toán độ trễ...");
        const latency = sent.createdTimestamp - message.createdTimestamp;
        const apiLatency = Math.round(message.client.ws.ping);

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

        await sent.edit({ content: null, embeds: [embed] });
    },
};
