const db = require("../data/mongodb");

module.exports = {
    name: "messageReactionRemove",
    async execute(reaction, user) {
        // Bỏ qua bot reactions
        if (user.bot) return;

        // Kiểm tra xem message có phải là confession không
        const embed = reaction.message.embeds[0];
        if (!embed || !embed.title || !embed.title.includes('Confession #')) {
            return;
        }

        console.log(`🗑️ Discord reaction removed from confession: ${reaction.emoji.name} by ${user.tag}`);
    },
}; 