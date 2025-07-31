const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Hiển thị danh sách các lệnh của bot"),

    async execute(interaction) {
        const commands = interaction.client.commands;
        const embed = new EmbedBuilder()
            .setTitle("📝 Danh sách lệnh của Confession Bot")
            .setColor(0x0099ff)
            .setDescription("Dưới đây là danh sách các lệnh có sẵn:")
            .addFields(
                {
                    name: "🤫 /confess",
                    value: "Gửi một confession mới\nSử dụng: `/confess content:nội_dung_confession`",
                    inline: false,
                },
                {
                    name: "⚙️ /setreviewchannel",
                    value: "Thiết lập kênh kiểm duyệt confession (Chỉ dành cho Admin)\nSử dụng: `/setreviewchannel channel:#kênh_kiểm_duyệt`",
                    inline: false,
                },
                {
                    name: "📢 /setconfessionchannel",
                    value: "Thiết lập kênh hiển thị confession (Chỉ dành cho Admin)\nSử dụng: `/setconfessionchannel channel:#kênh_hiển_thị`",
                    inline: false,
                },
                {
                    name: "❓ /help",
                    value: "Hiển thị danh sách lệnh này",
                    inline: false,
                }
            )
            .setFooter({ text: "Confession Bot - Made with ❤️" })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
