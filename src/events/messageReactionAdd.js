const { EmbedBuilder } = require("discord.js");
const db = require("../data/database");

module.exports = {
    name: "messageReactionAdd",
    async execute(reaction, user) {
        // Đảm bảo reaction đã được fetch đầy đủ
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Error fetching reaction:', error);
                return;
            }
        }

        // Kiểm tra xem message có phải là confession không
        if (!reaction.message.embeds || reaction.message.embeds.length === 0) return;
        
        const embed = reaction.message.embeds[0];
        if (!embed.title || !embed.title.includes('Confession #')) return;

        // Lấy confession number từ title
        const confessionNumber = embed.title.match(/Confession #(\d+)/)?.[1];
        if (!confessionNumber) return;

        try {
            // Tìm confession trong database
            const confession = await db.getConfessionByNumber(reaction.message.guild.id, parseInt(confessionNumber));
            if (!confession) return;

            // Log reaction
            console.log(`Reaction added to confession #${confessionNumber}: ${reaction.emoji.name} by ${user.tag}`);

            // Có thể thêm logic xử lý reaction ở đây
            // Ví dụ: Thống kê reaction, thông báo cho người gửi confession, etc.

        } catch (error) {
            console.error('Error handling reaction:', error);
        }
    },
};
