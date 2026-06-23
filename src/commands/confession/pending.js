const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../../data/mongodb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pendingconfessions")
        .setDescription("Xem các confession đang chờ duyệt")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const pendingConfessions = await db.getPendingConfessions(interaction.guild.id);

            if (pendingConfessions.length === 0) {
                return interaction.editReply({
                    content: "✅ Không có confession nào đang chờ duyệt!",
                    ephemeral: true,
                });
            }

            const embed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle("⏳ Confessions Đang Chờ Duyệt")
                .setDescription(`Có **${pendingConfessions.length}** confession đang chờ duyệt`)
                .setFooter({
                    text: `Confession Bot • ${interaction.guild.name}`,
                    iconURL: interaction.guild.iconURL(),
                })
                .setTimestamp();

            // Hiển thị tối đa 10 confession đầu tiên
            const displayConfessions = pendingConfessions.slice(0, 10);
            
            for (const confession of displayConfessions) {
                const user = await interaction.client.users.fetch(confession.userId).catch(() => null);
                const username = user ? user.username : "Unknown User";
                const idLabel = confession._id.toString().slice(-6);

                embed.addFields({
                    name: `📝 Confession #${idLabel}`,
                    value: `**Nội dung:** ${confession.content.substring(0, 100)}${confession.content.length > 100 ? '...' : ''}\n**Người gửi:** ${username} (<@${confession.userId}>)\n**Thời gian:** <t:${Math.floor(new Date(confession.createdAt).getTime() / 1000)}:R>`,
                    inline: false
                });
            }

            if (pendingConfessions.length > 10) {
                embed.addFields({
                    name: "📄 Còn lại",
                    value: `Và **${pendingConfessions.length - 10}** confession khác...`,
                    inline: false
                });
            }

            return interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("Lỗi khi lấy confession đang chờ:", error);
            return interaction.editReply({
                content: "❌ Đã xảy ra lỗi khi lấy danh sách confession!",
                ephemeral: true,
            });
        }
    },
}; 