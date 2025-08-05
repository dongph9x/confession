const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: "createconfession",
    description: "Tạo button để gửi confession",
    async execute(message, args) {
        try {
            // Kiểm tra quyền
            if (!message.member.permissions.has("ManageMessages")) {
                return message.reply("❌ Bạn không có quyền sử dụng lệnh này!");
            }

            // Tạo embed
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle("📝 Tạo Confession")
                .setDescription("Click vào button bên dưới để tạo confession mới!")
                .addFields(
                    { name: "📋 Hướng dẫn", value: "1. Click button 'Tạo Confession'\n2. Chọn loại confession (Công khai/Ẩn danh)\n3. Nhập nội dung (tối đa 2000 ký tự)\n4. Submit để gửi", inline: false },
                    { name: "⛔ Nghiêm cấm", value: "Nội dung confession không được đề cập cụ thể tới bất kì cá nhân, tổ chức nào cả!", inline: false },
                    { name: "🤖 AI Review", value: "Confession sẽ được AI tự động kiểm tra và gửi thẳng đến forum", inline: false }
                )
                .setFooter({
                    text: `Confession Bot • ${message.guild.name}`,
                    iconURL: message.guild.iconURL(),
                })
                .setTimestamp();

            // Tạo button
            const button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("create_confession_button")
                        .setLabel(" Tạo Confession")
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("📝")
                );

            await message.reply({
                embeds: [embed],
                components: [button]
            });

        } catch (error) {
            console.error("Lỗi khi tạo button confession:", error);
            await message.reply("❌ Đã xảy ra lỗi khi tạo button!");
        }
    }
}; 