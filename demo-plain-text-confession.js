require('dotenv').config();
const discordSender = require('./src/utils/discordImageSender');

// Demo confession data
const demoConfession = {
    content: `Đây là một confession test để kiểm tra plain text format.

Nội dung này sẽ được gửi dưới dạng plain text thay vì embed để có full width display trên Discord.

Confession này bao gồm:
• Nhiều đoạn văn bản
• Emoji và formatting
• Thông tin chi tiết
• Cảm xúc và suy nghĩ

Khi gửi dưới dạng plain text, Discord sẽ hiển thị full width và dễ đọc hơn so với embed hoặc image.`,
    isAnonymous: false,
    createdAt: new Date()
};

const demoGuildSettings = {
    confessionCounter: 9999,
    guildName: "Plain Text Test Server"
};

const demoAuthor = {
    username: "Đông",
    id: ""
};

async function demoPlainTextConfession() {
    console.log('🚀 Starting Plain Text Confession Demo...');
    console.log('📋 Testing confession with plain text format for full width display');
    console.log('');
    
    try {
        // Check environment
        if (!process.env.BOT_TOKEN || !process.env.CHANNEL_ID) {
            console.error('❌ Missing environment variables');
            process.exit(1);
        }
        
        // Initialize Discord client
        console.log('🔗 Initializing Discord client...');
        await discordSender.initialize(process.env.BOT_TOKEN);
        
        // Test 1: Plain text confession (full width)
        console.log('\n📝 Test 1: Plain text confession (full width)...');
        
        const confessionNumber = demoGuildSettings.confessionCounter + 1;
        const timeString = `<t:${Math.floor(demoConfession.createdAt.getTime() / 1000)}:R>`;
        const authorString = demoConfession.isAnonymous ? "🕵️ Ẩn danh" : `<@${demoAuthor.id}>`;
        
        const plainTextContent = `📢 **Confession #${confessionNumber}**\n\n${demoConfession.content}\n\n👤 **Người gửi:** ${authorString}\n⏰ **Thời gian:** ${timeString}\n\n*Confession Bot • ${demoGuildSettings.guildName}*`;

        await discordSender.sendConfessionImage(
            Buffer.from('dummy'),
            process.env.CHANNEL_ID,
            { 
                sendAsText: true,
                content: plainTextContent
            }
        );
        
        console.log('✅ Plain text confession sent (should display full width)');
        
        // Test 2: Anonymous confession
        console.log('\n📝 Test 2: Anonymous confession...');
        
        const anonymousConfession = {
            content: `Đây là một confession ẩn danh để test plain text format.

Nội dung này sẽ được gửi dưới dạng plain text với thông tin ẩn danh.

Confession này bao gồm:
• Nội dung ẩn danh
• Không hiển thị tên người gửi
• Vẫn có đầy đủ thông tin khác
• Format plain text cho full width`,
            isAnonymous: true,
            createdAt: new Date()
        };
        
        const anonymousContent = `📢 **Confession #${confessionNumber + 1}**\n\n${anonymousConfession.content}\n\n👤 **Người gửi:** 🕵️ Ẩn danh\n⏰ **Thời gian:** ${timeString}\n\n*Confession Bot • ${demoGuildSettings.guildName}*`;

        await discordSender.sendConfessionImage(
            Buffer.from('dummy'),
            process.env.CHANNEL_ID,
            { 
                sendAsText: true,
                content: anonymousContent
            }
        );
        
        console.log('✅ Anonymous confession sent');
        
        // Test 3: Long confession
        console.log('\n📝 Test 3: Long confession...');
        
        const longConfession = {
            content: `Đây là một confession rất dài để test plain text format với nội dung dài.

Nội dung này có thể dài và phức tạp, với nhiều đoạn văn bản khác nhau. Khi gửi dưới dạng plain text, Discord sẽ hiển thị full width và có thể scroll để đọc toàn bộ nội dung.

Nhưng khi gửi dưới dạng image, Discord có thể bị giới hạn 50% width và khó đọc hơn. Đây là lý do tại sao chúng ta cần sử dụng plain text format cho confession.

Confession này bao gồm:
• Nhiều đoạn văn bản
• Emoji và formatting
• Thông tin chi tiết
• Cảm xúc và suy nghĩ

Khi gửi plain text, Discord sẽ hiển thị đẹp và dễ đọc. Nhưng khi gửi image, có thể bị giới hạn kích thước.

Đây là đoạn văn bản bổ sung để làm cho confession dài hơn. Nội dung này sẽ được test với plain text format để đảm bảo hiển thị tốt trên Discord.

Chúng ta sẽ test:
• Plain text format cho full width
• Anonymous confession
• Long confession
• Emoji và formatting

Mỗi format có ưu điểm riêng. Mục tiêu là tìm ra format nào hiển thị tốt nhất cho người đọc.`,
            isAnonymous: false,
            createdAt: new Date()
        };
        
        const longContent = `📢 **Confession #${confessionNumber + 2}**\n\n${longConfession.content}\n\n👤 **Người gửi:** ${authorString}\n⏰ **Thời gian:** ${timeString}\n\n*Confession Bot • ${demoGuildSettings.guildName}*`;

        await discordSender.sendConfessionImage(
            Buffer.from('dummy'),
            process.env.CHANNEL_ID,
            { 
                sendAsText: true,
                content: longContent
            }
        );
        
        console.log('✅ Long confession sent');
        
        // Test 4: Confession với emoji
        console.log('\n📝 Test 4: Confession với emoji...');
        
        const emojiConfession = {
            content: `Đây là một confession với nhiều emoji để test plain text format 😊

Nội dung này bao gồm nhiều emoji khác nhau:
😊 😂 🥰 😍 😎 🤔 😮 😢 😭 😡
❤️ 💕 💖 💗 💘 💝 💞 💟 💠 💢
🎉 🎊 🎈 🎁 🎂 🎄 🎃 🎗️ 🎟️ 🎫

Confession này sẽ test:
• Emoji trong plain text
• Full width display
• Formatting với emoji
• Readability với emoji

Kết quả mong đợi:
✅ Full width display
✅ Emoji hiển thị đẹp
✅ Dễ đọc và copy
✅ Không bị giới hạn width`,
            isAnonymous: false,
            createdAt: new Date()
        };
        
        const emojiContent = `📢 **Confession #${confessionNumber + 3}**\n\n${emojiConfession.content}\n\n👤 **Người gửi:** ${authorString}\n⏰ **Thời gian:** ${timeString}\n\n*Confession Bot • ${demoGuildSettings.guildName}*`;

        await discordSender.sendConfessionImage(
            Buffer.from('dummy'),
            process.env.CHANNEL_ID,
            { 
                sendAsText: true,
                content: emojiContent
            }
        );
        
        console.log('✅ Emoji confession sent');
        
        console.log('\n✅ All plain text confession tests completed!');
        console.log('📊 Summary:');
        console.log('   - Plain text confession: Full width display');
        console.log('   - Anonymous confession: Full width with privacy');
        console.log('   - Long confession: Full width with scroll');
        console.log('   - Emoji confession: Full width with emoji');
        console.log('   - All confessions: Easy to read and copy');
        
    } catch (error) {
        console.error('❌ Error during plain text confession demo:', error);
    } finally {
        await discordSender.close();
    }
}

// Run demo
demoPlainTextConfession().then(() => {
    console.log('\n🎉 Plain text confession demo finished!');
    console.log('🎯 Confession với plain text format cho full width display!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Plain text confession demo failed:', error);
    process.exit(1);
}); 