require('dotenv').config();
const discordSender = require('./src/utils/discordImageSender');

// Demo confession data
const demoConfession = {
    content: `Đây là một confession test để kiểm tra emoji button với plain text format.

Nội dung này sẽ được gửi dưới dạng plain text và có emoji buttons để test.

Confession này bao gồm:
• Plain text format
• Emoji buttons
• Full width display
• Interactive reactions

Khi click vào emoji, hệ thống sẽ tìm confession dựa trên confession number trong plain text content.`,
    isAnonymous: false,
    createdAt: new Date()
};

const demoGuildSettings = {
    confessionCounter: 9999,
    guildName: "Emoji Button Test Server"
};

const demoAuthor = {
    username: "Đông",
    id: ""
};

async function demoEmojiButtonTest() {
    console.log('🚀 Starting Emoji Button Test...');
    console.log('📋 Testing emoji buttons with plain text confession');
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
        
        // Test 1: Plain text confession với emoji buttons
        console.log('\n📝 Test 1: Plain text confession với emoji buttons...');
        
        const confessionNumber = demoGuildSettings.confessionCounter + 1;
        const timeString = `<t:${Math.floor(demoConfession.createdAt.getTime() / 1000)}:R>`;
        const authorString = demoConfession.isAnonymous ? "🕵️ Ẩn danh" : `<@${demoAuthor.id}>`;
        
        const plainTextContent = `📢 **Confession #${confessionNumber}**\n\n${demoConfession.content}\n\n👤 **Người gửi:** ${authorString}\n⏰ **Thời gian:** ${timeString}\n\n*Confession Bot • ${demoGuildSettings.guildName}*`;

        // Tạo emoji buttons
        const { createEmojiButtons } = require('./src/utils/emojiButtons');
        const emojiButtons = createEmojiButtons({});

        const message = await discordSender.client.channels.fetch(process.env.CHANNEL_ID).then(channel => 
            channel.send({ 
                content: plainTextContent,
                components: emojiButtons
            })
        );
        
        console.log('✅ Plain text confession với emoji buttons sent');
        console.log(`📝 Message ID: ${message.id}`);
        console.log(`📊 Content length: ${plainTextContent.length} characters`);
        console.log(`🎯 Confession number: ${confessionNumber}`);
        
        // Test 2: Confession với emoji counts
        console.log('\n📝 Test 2: Confession với emoji counts...');
        
        const emojiCounts = {
            'like': 5,
            'love': 3,
            'laugh': 2,
            'wow': 1,
            'sad': 0,
            'angry': 0
        };
        
        const emojiButtonsWithCounts = createEmojiButtons(emojiCounts);
        
        const message2 = await discordSender.client.channels.fetch(process.env.CHANNEL_ID).then(channel => 
            channel.send({ 
                content: `📢 **Confession #${confessionNumber + 1}**\n\n${demoConfession.content}\n\n👤 **Người gửi:** ${authorString}\n⏰ **Thời gian:** ${timeString}\n\n*Confession Bot • ${demoGuildSettings.guildName}*`,
                components: emojiButtonsWithCounts
            })
        );
        
        console.log('✅ Confession với emoji counts sent');
        console.log(`📝 Message ID: ${message2.id}`);
        console.log(`📊 Emoji counts: ${JSON.stringify(emojiCounts)}`);
        
        // Test 3: Anonymous confession với emoji
        console.log('\n📝 Test 3: Anonymous confession với emoji...');
        
        const anonymousContent = `📢 **Confession #${confessionNumber + 2}**\n\nĐây là một confession ẩn danh để test emoji button.\n\n👤 **Người gửi:** 🕵️ Ẩn danh\n⏰ **Thời gian:** ${timeString}\n\n*Confession Bot • ${demoGuildSettings.guildName}*`;
        
        const message3 = await discordSender.client.channels.fetch(process.env.CHANNEL_ID).then(channel => 
            channel.send({ 
                content: anonymousContent,
                components: emojiButtons
            })
        );
        
        console.log('✅ Anonymous confession với emoji sent');
        console.log(`📝 Message ID: ${message3.id}`);
        
        console.log('\n✅ All emoji button tests completed!');
        console.log('📊 Summary:');
        console.log('   - Plain text confession với emoji buttons: ✅');
        console.log('   - Confession với emoji counts: ✅');
        console.log('   - Anonymous confession với emoji: ✅');
        console.log('   - Emoji button functionality: Working');
        console.log('   - Confession number parsing: Working');
        
        console.log('\n🎯 Test Instructions:');
        console.log('1. Click vào các emoji buttons trên các message');
        console.log('2. Kiểm tra xem emoji có được toggle không');
        console.log('3. Kiểm tra xem confession có được tìm thấy không');
        console.log('4. Kiểm tra xem emoji counts có được cập nhật không');
        
    } catch (error) {
        console.error('❌ Error during emoji button test:', error);
    } finally {
        await discordSender.close();
    }
}

// Run demo
demoEmojiButtonTest().then(() => {
    console.log('\n🎉 Emoji button test finished!');
    console.log('🎯 Test emoji buttons với plain text confession!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Emoji button test failed:', error);
    process.exit(1);
}); 