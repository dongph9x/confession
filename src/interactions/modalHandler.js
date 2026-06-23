const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");

module.exports = {
    async execute(interaction) {
        if (!interaction.isModalSubmit()) return;

        if (interaction.customId === "confess_modal") {
            await handleConfessModal(interaction);
        }
    },
};

async function handleConfessModal(interaction) {
    const content = interaction.fields.getTextInputValue("confess_content");

    // Hiển thị bản xem trước + 2 nút chọn chế độ (chỉ người gửi thấy)
    const previewEmbed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("👀 Xem lại confession")
        .setDescription(content)
        .setFooter({
            text: "Chọn chế độ đăng bên dưới — nội dung sẽ được gửi đi để duyệt.",
        });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("confess_submit_anon")
            .setLabel("Ẩn danh")
            .setEmoji("🕵️")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId("confess_submit_public")
            .setLabel("Hiện tên")
            .setEmoji("👤")
            .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
        embeds: [previewEmbed],
        components: [row],
        flags: 64, // Ephemeral — chỉ người gửi thấy
    });
}
