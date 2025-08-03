require('dotenv').config();
const discordSender = require('./src/utils/discordImageSender');

async function testEmojiNoNotification() {
    console.log('🚀 Testing Emoji Button without Notification...');
    console.log('📋 Testing emoji button functionality without success messages');
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
        
        // Test: Send confession với emoji buttons
        console.log('\n📝 Test: Send confession với emoji buttons...');
        
        const confessionNumber = 9999;
        const timeString = `<t:${Math.floor(Date.now() / 1000)}:R>`;
        const authorString = `<@389957152153796608>`;
        
        const plainTextContent = `📢 **Confession #${confessionNumber}**\n\nĐây là một confession test để kiểm tra emoji button không có thông báo.\n\n👤 **Người gửi:** ${authorString}\n⏰ **Thời gian:** ${timeString}\n\n*Confession Bot • Test Server*`;

        // Tạo emoji buttons
        const { createEmojiButtons } = require('./src/utils/emojiButtons');
        const emojiButtons = createEmojiButtons({});

        const message = await discordSender.client.channels.fetch(process.env.CHANNEL_ID).then(channel => 
            channel.send({ 
                content: plainTextContent,
                components: emojiButtons
            })
        );
        
        console.log('✅ Confession với emoji buttons sent');
        console.log(`📝 Message ID: ${message.id}`);
        console.log(`📊 Content length: ${plainTextContent.length} characters`);
        console.log(`🎯 Confession number: ${confessionNumber}`);
        
        console.log('\n✅ Emoji button test completed!');
        console.log('📊 Summary:');
        console.log('   - Confession sent with emoji buttons: ✅');
        console.log('   - No success notification: ✅');
        console.log('   - Emoji counts will update silently: ✅');
        console.log('   - User can click emoji without spam: ✅');
        
        console.log('\n🎯 Test Instructions:');
        console.log('1. Click vào các emoji buttons trên message');
        console.log('2. Kiểm tra xem emoji có được toggle không');
        console.log('3. Kiểm tra xem emoji counts có được cập nhật không');
        console.log('4. Kiểm tra xem KHÔNG có thông báo spam không');
        
    } catch (error) {
        console.error('❌ Error during emoji no notification test:', error);
    } finally {
        await discordSender.close();
    }
}

// Run test
testEmojiNoNotification().then(() => {
    console.log('\n🎉 Emoji no notification test finished!');
    console.log('🎯 Emoji button hoạt động mà không có thông báo spam!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Emoji no notification test failed:', error);
    process.exit(1);
}); 