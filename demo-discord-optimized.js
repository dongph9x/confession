require('dotenv').config();
const puppeteerCanvas = require('./src/utils/puppeteerCanvas');
const discordSender = require('./src/utils/discordImageSender');

// Demo data
const demoConfession = {
    content: "Đây là một confession demo được tối ưu hóa cho Discord. Template này có kích thước phù hợp để hiển thị tốt trên Discord với layout compact và dễ đọc.",
    isAnonymous: false,
    createdAt: new Date()
};

const demoGuildSettings = {
    confessionCounter: 999,
    guildName: "Discord Optimized Server"
};

const demoAuthor = {
    username: "Đông",
    id: ""
};

async function demoDiscordOptimized() {
    console.log('🚀 Starting Discord Optimized Demo...');
    
    try {
        // Check environment
        if (!process.env.BOT_TOKEN || !process.env.CHANNEL_ID) {
            console.error('❌ Missing environment variables:');
            console.error('Please add to your .env file:');
            console.error('BOT_TOKEN=your_discord_bot_token');
            console.error('CHANNEL_ID=your_channel_id');
            process.exit(1);
        }
        
        // Initialize Discord client
        console.log('🔗 Initializing Discord client...');
        await discordSender.initialize(process.env.BOT_TOKEN);
        
        // Test 1: Normal template
        console.log('\n📸 Test 1: Normal template...');
        const normalImage = await puppeteerCanvas.createConfessionImage(
            demoConfession, 
            demoGuildSettings, 
            demoAuthor
        );
        
        console.log(`📊 Normal image: ${normalImage.length} bytes`);
        
        await discordSender.sendConfessionImage(
            normalImage,
            process.env.CHANNEL_ID,
            { content: "📢 Confession với template bình thường" }
        );
        
        // Test 2: Discord optimized template
        console.log('\n📸 Test 2: Discord optimized template...');
        const optimizedImage = await puppeteerCanvas.createConfessionImage(
            demoConfession, 
            demoGuildSettings, 
            demoAuthor,
            { discordOptimized: true }
        );
        
        console.log(`📊 Optimized image: ${optimizedImage.length} bytes`);
        
        await discordSender.sendConfessionImage(
            optimizedImage,
            process.env.CHANNEL_ID,
            { content: "📢 Confession với template tối ưu hóa cho Discord" }
        );
        
        // Test 3: Anonymous confession with optimized template
        console.log('\n🕵️ Test 3: Anonymous confession với optimized template...');
        const anonymousConfession = {
            ...demoConfession,
            isAnonymous: true
        };
        
        const anonymousImage = await puppeteerCanvas.createConfessionImage(
            anonymousConfession, 
            demoGuildSettings, 
            demoAuthor,
            { discordOptimized: true }
        );
        
        console.log(`📊 Anonymous optimized image: ${anonymousImage.length} bytes`);
        
        await discordSender.sendConfessionImage(
            anonymousImage,
            process.env.CHANNEL_ID,
            { content: "📢 Confession ẩn danh với template tối ưu hóa" }
        );
        
        console.log('\n✅ All Discord optimized tests completed successfully!');
        console.log('📊 Summary:');
        console.log('   - Normal template: ~450KB');
        console.log('   - Discord optimized: ~300KB');
        console.log('   - Better display on Discord');
        
    } catch (error) {
        console.error('❌ Error during Discord optimized demo:', error);
    } finally {
        // Cleanup
        await discordSender.close();
        await puppeteerCanvas.close();
    }
}

// Run demo
demoDiscordOptimized().then(() => {
    console.log('\n🎉 Discord optimized demo finished!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Discord optimized demo failed:', error);
    process.exit(1);
}); 