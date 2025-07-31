const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../../data/database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("confessionconfig")
        .setDescription("Xem cấu hình confession hiện tại")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const guildSettings = await db.getGuildSettings(interaction.guild.id);
            
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle("⚙️ Cấu hình Confession")
                .setDescription(`Cấu hình cho server **${interaction.guild.name}**`)
                .setFooter({
                    text: `Confession Bot • ${interaction.guild.name}`,
                    iconURL: interaction.guild.iconURL(),
                })
                .setTimestamp();

            // Thông tin kênh confession
            if (guildSettings?.confession_channel) {
                const confessionChannel = interaction.guild.channels.cache.get(guildSettings.confession_channel);
                embed.addFields({
                    name: "📢 Kênh Confession",
                    value: confessionChannel ? confessionChannel.toString() : "❌ Kênh không tồn tại",
                    inline: true
                });
            } else {
                embed.addFields({
                    name: "📢 Kênh Confession",
                    value: "❌ Chưa thiết lập",
                    inline: true
                });
            }

            // Thông tin kênh review
            if (guildSettings?.review_channel) {
                const reviewChannel = interaction.guild.channels.cache.get(guildSettings.review_channel);
                embed.addFields({
                    name: "👨‍⚖️ Kênh Review",
                    value: reviewChannel ? reviewChannel.toString() : "❌ Kênh không tồn tại",
                    inline: true
                });
            } else {
                embed.addFields({
                    name: "👨‍⚖️ Kênh Review",
                    value: "❌ Chưa thiết lập",
                    inline: true
                });
            }

            // Thông tin counter
            embed.addFields({
                name: "🔢 Số Confession",
                value: `${guildSettings?.confession_counter || 0}`,
                inline: true
            });

            // Hướng dẫn thiết lập
            if (!guildSettings?.review_channel) {
                embed.addFields({
                    name: "📋 Hướng dẫn thiết lập",
                    value: "1. Tạo kênh review (ví dụ: #review-confession)\n2. Sử dụng `/setreviewchannel #kênh-review`\n3. Sử dụng `/setconfessionchannel #kênh-confession`",
                    inline: false
                });
            }

            return interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("Lỗi khi lấy cấu hình confession:", error);
            return interaction.editReply({
                content: "❌ Đã xảy ra lỗi khi lấy cấu hình!",
                ephemeral: true,
            });
        }
    },
}; 