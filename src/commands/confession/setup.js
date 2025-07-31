const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../../data/database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("confessionsetup")
        .setDescription("Thiết lập nhanh hệ thống confession")
        .addChannelOption((option) =>
            option
                .setName("kênh_confession")
                .setDescription("Kênh để đăng confession đã duyệt")
                .setRequired(true)
        )
        .addChannelOption((option) =>
            option
                .setName("kênh_review")
                .setDescription("Kênh để review confession")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const confessionChannel = interaction.options.getChannel("kênh_confession");
        const reviewChannel = interaction.options.getChannel("kênh_review");

        // Kiểm tra loại kênh
        if (!confessionChannel.isTextBased() || !reviewChannel.isTextBased()) {
            return interaction.editReply({
                content: "❌ Cả hai kênh phải là kênh text!",
                ephemeral: true,
            });
        }

        try {
            // Thiết lập cả hai kênh
            await db.setConfessionChannel(interaction.guild.id, confessionChannel.id);
            await db.setReviewChannel(interaction.guild.id, reviewChannel.id);

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle("✅ Thiết lập Confession Hoàn tất")
                .setDescription("Hệ thống confession đã được thiết lập thành công!")
                .addFields(
                    { name: "📢 Kênh Confession", value: confessionChannel.toString(), inline: true },
                    { name: "👨‍⚖️ Kênh Review", value: reviewChannel.toString(), inline: true },
                    { name: "🎯 Trạng thái", value: "✅ Sẵn sàng nhận confession", inline: true }
                )
                .addFields({
                    name: "📋 Cách sử dụng",
                    value: "• `/confess` - Gửi confession\n• `!confess` - Gửi confession (message command)\n• Click nút trong kênh review để duyệt/từ chối",
                    inline: false
                })
                .setFooter({
                    text: `Confession Bot • ${interaction.guild.name}`,
                    iconURL: interaction.guild.iconURL(),
                })
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("Lỗi khi thiết lập confession:", error);
            return interaction.editReply({
                content: "❌ Đã xảy ra lỗi khi thiết lập hệ thống confession!",
                ephemeral: true,
            });
        }
    },
}; 