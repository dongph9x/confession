const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("confesspanel")
        .setDescription("Đăng bảng nút gửi confession vào kênh hiện tại")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle("📝 Gửi Confession")
            .setDescription(
                "Bấm nút bên dưới để gửi confession của bạn.\n" +
                    "Sau khi nhập nội dung, bạn sẽ chọn **🕵️ Ẩn danh** hoặc **👤 Hiện tên**.\n\n" +
                    "*Tối đa 1000 ký tự. Mọi confession đều được kiểm duyệt trước khi đăng.*"
            )
            .setFooter({
                text: `Confession Bot • ${interaction.guild.name}`,
                iconURL: interaction.guild.iconURL(),
            });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("confess_open")
                .setLabel("Đăng Confession")
                .setEmoji("📝")
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({
            content: "✅ Đã đăng bảng gửi confession vào kênh này!",
            flags: 64,
        });
    },
};
