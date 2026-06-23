const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Hiển thị danh sách các lệnh có sẵn"),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle("📚 Danh sách lệnh")
            .setColor("#00ff00")
            .setDescription(
                "Prefix cho message commands: `!`\nSử dụng `/` cho slash commands"
            )
            .addFields(
                {
                    name: "💌 Confession",
                    value: "`!confess` - Gửi confession ẩn danh\n`!setreview` - Đặt kênh kiểm duyệt\n`/setconfess` - Đặt kênh hiển thị confession",
                    inline: false,
                },
                {
                    name: "🛠️ Tiện ích",
                    value: "`!ping` - Kiểm tra độ trễ\n`!uptime` - Xem thời gian hoạt động\n`/help` - Hiển thị menu này",
                    inline: false,
                }
            )
            .setTimestamp()
            .setFooter({ text: "Sử dụng lệnh một cách hợp lý nhé!" });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
