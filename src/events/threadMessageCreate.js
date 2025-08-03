const { Events } = require("discord.js");
const db = require("../data/mongodb");

module.exports = {
    name: "messageCreate",
    once: false,
    async execute(message) {
        // Chỉ xử lý messages trong threads
        if (!message.channel.isThread()) return;
        
        // Bỏ qua bot messages
        if (message.author.bot) return;
        
        // Bỏ qua messages quá ngắn
        if (message.content.length < 1) return;
        
        try {
            const thread = message.channel;
            const parentMessage = await thread.fetchStarterMessage();
            
            if (!parentMessage) {
                console.log('❌ Không tìm thấy parent message cho thread');
                return;
            }
            
            // Kiểm tra xem parent message có phải là confession không
            const confessionMatch = parentMessage.content.match(/Confession #(\d+)/);
            if (!confessionMatch) {
                console.log('❌ Parent message không phải là confession');
                return;
            }
            
            const confessionNumber = parseInt(confessionMatch[1]);
            const guildId = message.guild.id;
            
            // Lấy confession từ database
            const confession = await db.getConfessionByNumber(guildId, confessionNumber);
            if (!confession) {
                console.log(`❌ Không tìm thấy confession #${confessionNumber}`);
                return;
            }
            
            // Lấy thread info
            const threadId = thread.id;
            const messageId = message.id;
            const userId = message.author.id;
            const username = message.author.username;
            const content = message.content;
            
            // Kiểm tra xem comment đã tồn tại chưa
            const existingComment = await db.getCommentByMessageId(messageId);
            if (existingComment) {
                console.log('✅ Comment đã tồn tại, bỏ qua');
                return;
            }
            
            // Thêm comment vào database
            const commentId = await db.addComment(
                guildId,
                confession._id,
                userId,
                username,
                content,
                messageId,
                threadId,
                false // isAnonymous = false cho comments
            );
            
            console.log(`✅ Đã thêm comment: "${content.substring(0, 30)}..." cho confession #${confessionNumber} bởi ${username}`);
            
            // Gửi confirmation message (optional)
            await message.react('✅');
            
        } catch (error) {
            console.error('❌ Error handling thread message:', error);
        }
    },
}; 