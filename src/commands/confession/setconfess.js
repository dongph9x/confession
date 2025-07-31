const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../../data/database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setconfess")
        .setDescription("Thiết lập kênh để đăng confession")
        .addChannelOption((option) =>
            option
                .setName("kenh")
                .setDescription("Kênh để đăng confession")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        console.log("🔍 setconfess command được gọi");
        
        const channel = interaction.options.getChannel("kenh");
        console.log("📝 Kênh được chọn:", channel?.name, channel?.id);

        if (!channel) {
            console.log("❌ Không tìm thấy kênh");
            return interaction.reply({
                content: "❌ Không tìm thấy kênh được chọn!",
                ephemeral: true,
            });
        }

        const botPermissions = channel.permissionsFor(interaction.client.user);
        console.log("🔐 Bot permissions:", botPermissions.toArray());
        
        if (
            !botPermissions.has([
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.EmbedLinks,
            ])
        ) {
            console.log("❌ Bot thiếu quyền");
            return interaction.reply({
                content:
                    "❌ Bot cần có quyền xem kênh, gửi tin nhắn và gửi embed trong kênh đó!",
                ephemeral: true,
            });
        }

        try {       
            console.log("💾 Đang lưu vào database...");
            await db.setConfessionChannel(interaction.guild.id, channel.id);
            console.log("✅ Đã lưu thành công");

            return interaction.reply({
                content: `✅ Đã thiết lập ${channel} làm kênh confession!`,
                ephemeral: true,
            });
        } catch (error) {
            console.error("❌ Lỗi khi thiết lập kênh confession:", error);
            return interaction.reply({
                content: "❌ Đã xảy ra lỗi khi thiết lập kênh confession!",
                ephemeral: true,
            });
        }
    },
};
