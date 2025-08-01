const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const db = require("../../data/database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("confessionconfig")
        .setDescription("Xem và quản lý cấu hình confession bot"),

    async execute(interaction) {
        // Kiểm tra quyền
        if (!interaction.member.permissions.has("Administrator")) {
            return interaction.reply({
                content: "❌ Bạn cần quyền Administrator để sử dụng lệnh này!",
                ephemeral: true
            });
        }

        const settings = await db.getGuildSettings(interaction.guild.id);
        const confessionChannel = settings.confession_channel ? `<#${settings.confession_channel}>` : "❌ Chưa thiết lập";
        const reviewChannel = settings.review_channel ? `<#${settings.review_channel}>` : "❌ Chưa thiết lập";

        const configEmbed = new EmbedBuilder()
            .setTitle("⚙️ Cấu hình Confession Bot")
            .setColor(0x1877F2)
            .addFields(
                { name: "📝 Kênh Confession", value: confessionChannel, inline: true },
                { name: "👨‍⚖️ Kênh Review", value: reviewChannel, inline: true },
                { name: "📊 Confession Counter", value: `${settings.confession_counter || 0}`, inline: true }
            )
            .setFooter({ text: "Confession Bot • Facebook Style" })
            .setTimestamp();

        // Tạo select menu cho actions
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("config_action")
            .setPlaceholder("Chọn hành động...")
            .addOptions([
                {
                    label: "📝 Thiết lập kênh confession",
                    value: "setup_confession",
                    description: "Chọn kênh để đăng confessions"
                },
                {
                    label: "👨‍⚖️ Thiết lập kênh review",
                    value: "setup_review",
                    description: "Chọn kênh để review confessions"
                },
                {
                    label: "🔄 Thiết lập cả hai",
                    value: "setup_both",
                    description: "Thiết lập cả confession và review"
                },
                {
                    label: "📊 Xem thống kê",
                    value: "view_stats",
                    description: "Xem thống kê confession"
                }
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
            embeds: [configEmbed],
            components: [row],
            ephemeral: true
        });
    },
}; 