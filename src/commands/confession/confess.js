const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../../data/database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("confess")
        .setDescription("Gửi một confession ẩn danh")
        .addStringOption((option) =>
            option
                .setName("noidung")
                .setDescription("Nội dung confession của bạn")
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const content = interaction.options.getString("noidung");

        const guildSettings = await db.getGuildSettings(interaction.guild.id);
        if (!guildSettings?.confession_channel) {
            return interaction.editReply({
                content:
                    "❌ Kênh confession chưa được thiết lập! Hãy nhờ Admin sử dụng lệnh `/setconfess`",
                ephemeral: true,
            });
        }

        const confessionChannel = interaction.guild.channels.cache.get(
            guildSettings.confession_channel
        );
        if (!confessionChannel) {
            return interaction.editReply({
                content:
                    "❌ Không tìm thấy kênh confession! Có thể kênh đã bị xóa.",
                ephemeral: true,
            });
        }

        try {
            await db.addConfession(
                interaction.guild.id,
                interaction.user.id,
                content
            );

            const embed = new EmbedBuilder()
                .setColor(0x2f3136)
                .setTitle("Confession Ẩn Danh")
                .setDescription(content)
                .setFooter({
                    text: `Confession Bot • ${interaction.guild.name}`,
                    iconURL: interaction.guild.iconURL(),
                })
                .setTimestamp();

            await confessionChannel.send({ embeds: [embed] });

            return interaction.editReply({
                content: "✅ Confession của bạn đã được gửi ẩn danh!",
                ephemeral: true,
            });
        } catch (error) {
            console.error("Lỗi khi gửi confession:", error);
            return interaction.editReply({
                content: "❌ Đã xảy ra lỗi khi gửi confession!",
                ephemeral: true,
            });
        }
    },
};
