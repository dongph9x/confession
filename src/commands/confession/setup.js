const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ChannelType } = require("discord.js");
const db = require("../../data/mongodb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("confessionsetup")
        .setDescription("Thiết lập kênh confession và review với select menu")
        .addStringOption(option =>
            option.setName("action")
                .setDescription("Chọn hành động")
                .setRequired(true)
                .addChoices(
                    { name: "📝 Thiết lập kênh confession", value: "confession" },
                    { name: "👨‍⚖️ Thiết lập kênh review", value: "review" },
                    { name: "⚙️ Xem cấu hình hiện tại", value: "config" },
                    { name: "🔄 Thiết lập cả hai", value: "both" }
                )
        ),

    async execute(interaction) {
        // Kiểm tra quyền
        if (!interaction.member.permissions.has("Administrator")) {
            return interaction.reply({
                content: "❌ Bạn cần quyền Administrator để sử dụng lệnh này!",
                ephemeral: true
            });
        }

        const action = interaction.options.getString("action");

        if (action === "config") {
            // Hiển thị cấu hình hiện tại
            const settings = await db.getGuildSettings(interaction.guild.id);
            const confessionChannel = settings?.confessionChannel ? `<#${settings.confessionChannel}>` : "❌ Chưa thiết lập";
            const reviewChannel = settings?.reviewChannel ? `<#${settings.reviewChannel}>` : "❌ Chưa thiết lập";

            const configEmbed = new EmbedBuilder()
                .setTitle("⚙️ Cấu hình Confession Bot")
                .setColor(0x1877F2)
                .addFields(
                    { name: "📝 Kênh Confession", value: confessionChannel, inline: true },
                    { name: "👨‍⚖️ Kênh Review", value: reviewChannel, inline: true },
                    { name: "📊 Confession Counter", value: `${settings?.confessionCounter || 0}`, inline: true }
                )
                .setFooter({ text: "Confession Bot • Facebook Style" })
                .setTimestamp();

            return interaction.reply({ embeds: [configEmbed], ephemeral: true });
        }

        // Tạo select menu cho channels
        const channels = interaction.guild.channels.cache
            .filter(channel => channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildForum) // Text + Forum
            .map(channel => ({
                label: `#${channel.name}`,
                value: channel.id,
                description: `Kênh: ${channel.name}`
            }));

        if (channels.length === 0) {
            return interaction.reply({
                content: "❌ Không tìm thấy kênh text nào trong server!",
                ephemeral: true
            });
        }

        // Tạo select menu
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`setup_${action}`)
            .setPlaceholder("Chọn kênh...")
            .addOptions(channels.slice(0, 25)); // Discord chỉ cho phép tối đa 25 options

        const row = new ActionRowBuilder().addComponents(selectMenu);

        let title, description;
        switch (action) {
            case "confession":
                title = "📝 Thiết lập kênh Confession";
                description = "Chọn kênh để đăng confessions đã được duyệt:";
                break;
            case "review":
                title = "👨‍⚖️ Thiết lập kênh Review";
                description = "Chọn kênh để review confessions:";
                break;
            case "both":
                title = "🔄 Thiết lập cả hai kênh";
                description = "Chọn kênh confession trước, sau đó chọn kênh review:";
                break;
        }

        const setupEmbed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(0x1877F2)
            .setFooter({ text: "Confession Bot • Facebook Style" })
            .setTimestamp();

        await interaction.reply({
            embeds: [setupEmbed],
            components: [row],
            ephemeral: true
        });
    },
}; 