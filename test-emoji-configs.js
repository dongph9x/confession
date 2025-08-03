require('dotenv').config();
const { getAllConfigsInfo, getEmojiConfig } = require('./src/utils/emojiConfigs');
const discordSender = require('./src/utils/discordImageSender');

async function testEmojiConfigs() {
    console.log('🎯 Emoji Configuration Options');
    console.log('==============================');
    console.log('');
    
    // Hiển thị tất cả cấu hình
    const configsInfo = getAllConfigsInfo();
    
    configsInfo.forEach((config, index) => {
        console.log(`📋 ${index + 1}. ${config.name.toUpperCase()} (${config.emojiCount} emojis, ${config.rows} rows)`);
        console.log('   Emojis:');
        config.emojis.forEach((emoji, emojiIndex) => {
            console.log(`      ${emojiIndex + 1}. ${emoji.emoji} ${emoji.label} (${emoji.key})`);
        });
        console.log('');
    });
    
    // Test từng cấu hình
    console.log('🎨 Testing Each Emoji Configuration...');
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
        
        // Test từng cấu hình
        for (const configInfo of configsInfo) {
            console.log(`📝 Testing ${configInfo.name} configuration...`);
            
            // Lấy cấu hình emoji
            const emojis = getEmojiConfig(configInfo.name);
            
            // Tạo test counts
            const testCounts = {};
            Object.keys(emojis).forEach(key => {
                testCounts[key] = Math.floor(Math.random() * 10) + 1; // Random count 1-10
            });
            
            // Tạo emoji buttons
            const { createEmojiButtons } = require('./src/utils/emojiButtons');
            
            // Temporarily override EMOJIS for this test
            const originalEmojis = require('./src/utils/emojiButtons').EMOJIS;
            require('./src/utils/emojiButtons').EMOJIS = emojis;
            
            const emojiButtons = createEmojiButtons(testCounts);
            
            // Restore original EMOJIS
            require('./src/utils/emojiButtons').EMOJIS = originalEmojis;
            
            // Test message
            const testContent = `📢 **Emoji Test: ${configInfo.name.toUpperCase()}**\n\nĐây là test cho cấu hình ${configInfo.name} với ${configInfo.emojiCount} emoji.\n\n👤 **Test User**\n⏰ **Just now**\n\n*Confession Bot • Test Server*`;
            
            const message = await discordSender.client.channels.fetch(process.env.CHANNEL_ID).then(channel => 
                channel.send({ 
                    content: testContent,
                    components: emojiButtons
                })
            );
            
            console.log(`   ✅ ${configInfo.name} sent (${emojiButtons.length} rows)`);
            console.log(`   📝 Message ID: ${message.id}`);
            
            // Hiển thị counts
            console.log('   📊 Counts:');
            Object.entries(testCounts).forEach(([key, count]) => {
                const emoji = emojis[key].emoji;
                console.log(`      ${emoji} ${key}: ${count}`);
            });
            console.log('');
            
            // Delay giữa các message
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log('✅ All emoji configurations tested!');
        console.log('');
        console.log('🎯 Summary:');
        configsInfo.forEach(config => {
            console.log(`   ${config.name}: ${config.emojiCount} emojis, ${config.rows} rows`);
        });
        
        console.log('\n💡 Recommendations:');
        console.log('1. minimal: 3 emojis - Gọn gàng nhất');
        console.log('2. basic: 4 emojis - Cân bằng tốt');
        console.log('3. popular: 6 emojis - Phổ biến (mặc định)');
        console.log('4. reaction: 5 emojis - Tập trung vào phản ứng');
        console.log('5. full: 8 emojis - Đầy đủ nhất');
        
    } catch (error) {
        console.error('❌ Error during emoji configs test:', error);
    } finally {
        await discordSender.close();
    }
}

// Run test
testEmojiConfigs().then(() => {
    console.log('\n🎉 Emoji configs test finished!');
    console.log('🎯 Bạn có thể xem tất cả cấu hình emoji trên Discord và chọn cấu hình phù hợp!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Emoji configs test failed:', error);
    process.exit(1);
}); 