const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "uptime",
    description: "Xem thời gian hoạt động của bot",
    async execute(message) {
        const uptime = message.client.uptime;
        const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
            (uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((uptime % (1000 * 60)) / 1000);

        const uptimeString = `${days} ngày, ${hours} giờ, ${minutes} phút, ${seconds} giây`;

        const embed = new EmbedBuilder()
            .setTitle("⏰ Thời gian hoạt động")
            .setDescription(uptimeString)
            .setColor("#00ff00")
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    },
};
