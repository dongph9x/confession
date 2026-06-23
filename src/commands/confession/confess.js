const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("../../data/mongodb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("confess")
        .setDescription("Gửi một confession ẩn danh")
        .addStringOption((option) =>
            option
                .setName("noidung")
                .setDescription("Nội dung confession của bạn")
                .setRequired(true)
                .setMaxLength(2000)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const content = interaction.options.getString("noidung");

        const guildSettings = await db.getGuildSettings(interaction.guild.id);
        if (!guildSettings?.reviewChannel) {
            return interaction.editReply({
                content:
                    "❌ Kênh review confession chưa được thiết lập! Hãy nhờ Admin sử dụng lệnh `/setreviewchannel`",
                ephemeral: true,
            });
        }

        const reviewChannel = interaction.guild.channels.cache.get(
            guildSettings.reviewChannel
        );
        if (!reviewChannel) {
            return interaction.editReply({
                content:
                    "❌ Không tìm thấy kênh review! Có thể kênh đã bị xóa.",
                ephemeral: true,
            });
        }

        try {
            // Lưu confession vào database
            const confessionId = await db.addConfession(
                interaction.guild.id,
                interaction.user.id,
                content
            );

            // Tạo embed cho review
            const reviewEmbed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle("📝 Confession Cần Duyệt")
                .setDescription(content)
                .addFields(
                    { name: "🆔 ID Confession", value: `#${confessionId}`, inline: true },
                    { name: "👤 Người gửi", value: `<@${interaction.user.id}>`, inline: true },
                    { name: "📅 Thời gian", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
                )
                .setFooter({
                    text: `Confession Bot • ${interaction.guild.name}`,
                    iconURL: interaction.guild.iconURL(),
                })
                .setTimestamp();

            // Tạo buttons
            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`approve_${confessionId}`)
                        .setLabel("✅ Duyệt")
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`reject_${confessionId}`)
                        .setLabel("❌ Từ chối")
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId(`edit_${confessionId}`)
                        .setLabel("✏️ Chỉnh sửa")
                        .setStyle(ButtonStyle.Secondary)
                );

            await reviewChannel.send({
                embeds: [reviewEmbed],
                components: [buttons]
            });

            return interaction.editReply({
                content: "✅ Confession của bạn đã được gửi để duyệt! Bạn sẽ được thông báo khi confession được duyệt hoặc từ chối.",
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
