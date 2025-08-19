const { EmbedBuilder } = require("discord.js");
const db = require("../data/mongodb");
const config = require("../config/bot");
const messageHandler = require("../utils/MessageCommandHandler");

module.exports = {
    name: "messageCreate",
    async execute(message) {
        // Bỏ qua bot messages
        if (message.author.bot) return;

        // Bỏ qua messages trong DMs
        if (!message.guild) return;

        // Xử lý message commands trước
        await messageHandler.handleMessage(message);

        // Kiểm tra confession reminder
        try {
            await handleConfessionReminder(message);
        } catch (error) {
            console.error("❌ [REMINDER] Uncaught error:", error);
        }
    },
};

async function handleConfessionReminder(message) {
    // Kiểm tra xem có phải confession channel không
    let guildSettings = null;
    try {
        guildSettings = await db.getGuildSettings(message.guild.id);
    } catch (err) {
        console.warn("getGuildSettings failed during reminder; skipping reminder.");
        return;
    }
    if (!guildSettings?.confessionChannel) return;

    const confessionChannel = message.guild.channels.cache.get(guildSettings.confessionChannel);
    if (!confessionChannel || message.channel.id !== confessionChannel.id) return;

    // Bỏ qua nếu message bắt đầu bằng prefix hoặc slash command
    if (message.content.startsWith(config.prefix) || message.content.startsWith('/')) return;

    // Kiểm tra độ dài message (có thể là confession)
    if (message.content.length < 10 || message.content.length > 2000) return;

    // Kiểm tra xem có phải confession thật sự không (loại bỏ spam, emoji, etc.)
    const words = message.content.split(' ').filter(word => word.length > 0);
    if (words.length < 3) return; // Ít nhất 3 từ

    // Kiểm tra xem có quá nhiều emoji không
    const emojiCount = (message.content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length;
    if (emojiCount > 5) return; // Quá nhiều emoji

    // Tạo embed nhắc nhở
    const reminderEmbed = new EmbedBuilder()
        .setColor(0xFFA500)
        .setTitle("💡 Nhắc nhở sử dụng lệnh Confession")
        .setDescription(`Bạn có vẻ muốn gửi confession! Hãy sử dụng lệnh \`!confess\` để gửi confession đúng cách.`)
        .addFields(
            { name: "📝 Cách sử dụng", value: "`!confess nội dung` - Gửi confession bình thường\n`!confess anonymous nội dung` - Gửi confession ẩn danh", inline: false },
            { name: "🤖 AI Kiểm duyệt", value: "Confession sẽ được AI kiểm tra tự động để đảm bảo nội dung phù hợp", inline: false },
            { name: "⏰ Tự động xóa", value: "Tin nhắn này sẽ tự động xóa sau 10 giây", inline: false }
        )
        .setFooter({
            text: `Confession Bot • ${message.guild.name}`,
            iconURL: message.guild.iconURL(),
        })
        .setTimestamp();

    try {
        // Xóa message gốc
        await message.delete().catch(error => {
            // Bỏ qua lỗi nếu message đã bị xóa hoặc không tồn tại
            if (error.code === 10008 || error.code === 10003) {
                console.log(`📝 [REMINDER] Message đã bị xóa hoặc không tồn tại: ${error.message}`);
            } else {
                console.error("❌ [REMINDER] Lỗi khi xóa message:", error);
            }
        });
        
        // Gửi embed nhắc nhở
        const reminderMsg = await message.channel.send({
            content: `<@${message.author.id}>`,
            embeds: [reminderEmbed]
        });

        // Tự động xóa sau 10 giây
        setTimeout(async () => {
            try {
                await reminderMsg.delete();
            } catch (error) {
                // Bỏ qua lỗi nếu message đã bị xóa
                if (error.code === 10008 || error.code === 10003) {
                    console.log(`📝 [REMINDER] Reminder message đã bị xóa: ${error.message}`);
                } else {
                    console.log("Could not delete reminder message:", error.message);
                }
            }
        }, 10000);

    } catch (error) {
        console.error("❌ [REMINDER] Error handling confession reminder:", error);
    }
}
