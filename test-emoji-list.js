require('dotenv').config();
const { EMOJIS, createEmojiButtons } = require('./src/utils/emojiButtons');
const discordSender = require('./src/utils/discordImageSender');

async function testEmojiList() {
    console.log('🎯 Current Emoji Configuration');
    console.log('================================');
    console.log('');
    
    // Hiển thị danh sách emoji hiện tại
    console.log('📋 Current Emojis:');
    console.log('-------------------');
    
    const emojiEntries = Object.entries(EMOJIS);
    emojiEntries.forEach(([key, config], index) => {
        console.log(`${index + 1}. ${config.emoji} ${config.label} (${key})`);
    });
    
    console.log('');
    console.log(`📊 Total Emojis: ${emojiEntries.length}`);
    console.log(`📱 Rows: ${Math.ceil(emojiEntries.length / 4)} rows (4 buttons per row)`);
    console.log('');
    
    // Test hiển thị emoji buttons
    console.log('🎨 Testing Emoji Buttons Display...');
    console.log('');
    
    try {
        // Check environment
        if (!process.env.BOT_TOKEN || !process.env.CHANNEL_ID) {
            console.error('❌ Missing environment variables');
            return;
        }
        
        // Initialize Discord client
        console.log('🔗 Initializing Discord client...');
        await discordSender.initialize(process.env.BOT_TOKEN);
        
        // Test data với counts
        const testCounts = {
            heart: 5,
            laugh: 3,
            wow: 2,
            sad: 1,
            fire: 4,
            clap: 0,
            pray: 2,
            love: 7
        };
        
        // Tạo emoji buttons
        const emojiButtons = createEmojiButtons(testCounts);
        
        // Test message
        const testContent = `📢 **Emoji Test Message**\n\nĐây là test để xem emoji buttons hiện tại.\n\n👤 **Test User**\n⏰ **Just now**\n\n*Confession Bot • Test Server*`;
        
        const message = await discordSender.client.channels.fetch(process.env.CHANNEL_ID).then(channel => 
            channel.send({ 
                content: testContent,
                components: emojiButtons
            })
        );
        
        console.log('✅ Emoji test message sent');
        console.log(`📝 Message ID: ${message.id}`);
        console.log(`🎯 Emoji buttons: ${emojiButtons.length} rows`);
        
        console.log('\n📊 Emoji Counts in Test:');
        Object.entries(testCounts).forEach(([key, count]) => {
            const emoji = EMOJIS[key].emoji;
            console.log(`   ${emoji} ${key}: ${count}`);
        });
        
        console.log('\n🎯 Recommendations:');
        console.log('1. Nếu muốn ít emoji hơn, có thể giữ lại 4-6 emoji phổ biến');
        console.log('2. Có thể tạo 2 phiên bản: Basic (4 emoji) và Full (8 emoji)');
        console.log('3. Có thể cho phép admin chọn emoji nào hiển thị');
        
        console.log('\n💡 Suggested Emoji Sets:');
        console.log('   Basic (4): ❤️ Heart, 😂 Laugh, 😮 Wow, 😢 Sad');
        console.log('   Popular (6): ❤️ Heart, 😂 Laugh, 😮 Wow, 😢 Sad, 🔥 Fire, 👏 Clap');
        console.log('   Full (8): Tất cả hiện tại');
        
    } catch (error) {
        console.error('❌ Error during emoji test:', error);
    } finally {
        await discordSender.close();
    }
}

// Run test
testEmojiList().then(() => {
    console.log('\n🎉 Emoji list test finished!');
    console.log('🎯 Bạn có thể xem emoji buttons trên Discord và quyết định lọc lại!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Emoji list test failed:', error);
    process.exit(1);
}); 