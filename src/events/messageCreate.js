const { EmbedBuilder } = require("discord.js");
const db = require("../data/mongodb");
const messageHandler = require("../utils/MessageCommandHandler");

module.exports = {
    name: "messageCreate",
    async execute(message) {
        // Bỏ qua bot messages
        if (message.author.bot) return;

        // Xử lý comments trong threads
        if (message.channel.isThread()) {
            await handleThreadComment(message);
            return;
        }

        // Xử lý message commands
        await messageHandler.handleMessage(message);
    },
};

async function handleThreadComment(message) {
    try {
        // Kiểm tra xem thread có phải là thread của confession không
        const threadName = message.channel.name;
        const confessionMatch = threadName.match(/confession-(\d+)/i);
        
        if (!confessionMatch) return;

        const confessionNumber = parseInt(confessionMatch[1]);
        
        // Tìm confession trong database
        const confession = await db.getConfessionByNumber(message.guild.id, confessionNumber);
        if (!confession) return;

        // Lưu comment vào database
        await db.addComment(
            message.guild.id,
            confession._id,
            message.author.id,
            message.id,
            message.channel.id,
            message.content
        );

        console.log(`Comment added to confession #${confessionNumber} by ${message.author.tag}: ${message.content.substring(0, 50)}...`);

    } catch (error) {
        console.error('Error handling thread comment:', error);
    }
}
