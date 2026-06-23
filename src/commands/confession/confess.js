const { SlashCommandBuilder } = require("discord.js");
const { submitConfessionForReview } = require("../../utils/confessionFlow");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("confess")
        .setDescription("Gửi một confession")
        .addStringOption((option) =>
            option
                .setName("noidung")
                .setDescription("Nội dung confession của bạn")
                .setRequired(true)
                .setMaxLength(1000)
        )
        .addBooleanOption((option) =>
            option
                .setName("andanh")
                .setDescription("Ẩn danh? (mặc định: không)")
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const content = interaction.options.getString("noidung");
        const isAnonymous = interaction.options.getBoolean("andanh") ?? false;

        const result = await submitConfessionForReview({
            guild: interaction.guild,
            user: interaction.user,
            content,
            isAnonymous,
            client: interaction.client,
        });

        if (!result.ok) {
            return interaction.editReply({ content: `❌ ${result.error}` });
        }

        const modeNote = isAnonymous ? "🕵️ Ẩn danh." : "👤 Hiển thị tên.";
        return interaction.editReply({
            content: result.requireReview
                ? `✅ Confession của bạn đã được gửi để duyệt! ${modeNote}\nBạn sẽ được thông báo khi được duyệt hoặc từ chối.`
                : `✅ Confession của bạn đã được đăng! ${modeNote}`,
        });
    },
};
