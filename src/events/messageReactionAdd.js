const { EmbedBuilder } = require("discord.js");
const db = require("../data/mongodb");

module.exports = {
    name: "messageReactionAdd",
    async execute(reaction, user) {
        // Bỏ qua bot reactions
        if (user.bot) return;

        // Kiểm tra xem message có phải là confession không
        const embed = reaction.message.embeds[0];
        if (!embed || !embed.title || !embed.title.includes('Confession #')) {
            return;
        }

        // Xóa Discord reaction ngay lập tức
        try {
            await reaction.remove();
            console.log(`🗑️ Removed Discord reaction from confession: ${reaction.emoji.name}`);
        } catch (error) {
            console.error('Error removing Discord reaction:', error.message);
        }

        // Thông báo cho user (optional)
        try {
            const channel = reaction.message.channel;
            const notification = await channel.send({
                content: `⚠️ <@${user.id}>, vui lòng sử dụng emoji buttons bên dưới thay vì reactions của Discord!`,
                flags: 64 // Ephemeral
            });
            
            // Xóa thông báo sau 5 giây
            setTimeout(() => {
                notification.delete().catch(() => {});
            }, 5000);
        } catch (error) {
            console.error('Error sending notification:', error.message);
        }
    },
};
