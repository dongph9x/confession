const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../../data/database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("confessionstats")
        .setDescription("Xem thống kê confession của server")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const stats = await db.getConfessionStats(interaction.guild.id);
            const guildSettings = await db.getGuildSettings(interaction.guild.id);

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle("📊 Thống Kê Confession")
                .setDescription(`Thống kê confession của server **${interaction.guild.name}**`)
                .addFields(
                    { name: "📝 Tổng số confession", value: `${stats.total || 0}`, inline: true },
                    { name: "⏳ Đang chờ duyệt", value: `${stats.pending || 0}`, inline: true },
                    { name: "✅ Đã duyệt", value: `${stats.approved || 0}`, inline: true },
                    { name: "❌ Đã từ chối", value: `${stats.rejected || 0}`, inline: true },
                    { name: "🔢 Số confession hiện tại", value: `${guildSettings?.confession_counter || 0}`, inline: true }
                )
                .setFooter({
                    text: `Confession Bot • ${interaction.guild.name}`,
                    iconURL: interaction.guild.iconURL(),
                })
                .setTimestamp();

            // Thêm thông tin về kênh
            if (guildSettings?.confession_channel) {
                const confessionChannel = interaction.guild.channels.cache.get(guildSettings.confession_channel);
                embed.addFields({
                    name: "📢 Kênh confession",
                    value: confessionChannel ? confessionChannel.toString() : "❌ Kênh không tồn tại",
                    inline: false
                });
            }

            if (guildSettings?.review_channel) {
                const reviewChannel = interaction.guild.channels.cache.get(guildSettings.review_channel);
                embed.addFields({
                    name: "👨‍⚖️ Kênh review",
                    value: reviewChannel ? reviewChannel.toString() : "❌ Kênh không tồn tại",
                    inline: false
                });
            }

            return interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("Lỗi khi lấy thống kê confession:", error);
            return interaction.editReply({
                content: "❌ Đã xảy ra lỗi khi lấy thống kê!",
                ephemeral: true,
            });
        }
    },
}; 