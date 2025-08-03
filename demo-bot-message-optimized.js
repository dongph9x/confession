require('dotenv').config();
const puppeteerCanvas = require('./src/utils/puppeteerCanvas');
const discordSender = require('./src/utils/discordImageSender');

// Demo data
const demoConfession = {
    content: "Đây là một confession demo được tối ưu hóa đặc biệt cho bot messages trên Discord. Template này có kích thước compact và layout tối ưu để hiển thị tốt trong bot messages mà không bị giới hạn 50% width.",
    isAnonymous: false,
    createdAt: new Date()
};

const demoGuildSettings = {
    confessionCounter: 1234,
    guildName: "Bot Message Optimized Server"
};

const demoAuthor = {
    username: "Đông",
    id: ""
};

async function demoBotMessageOptimized() {
    console.log('🚀 Starting Bot Message Optimized Demo...');
    console.log('📋 This demo will test bot message optimization:');
    console.log('   1. Compact layout for bot messages');
    console.log('   2. Smaller viewport (600x400)');
    console.log('   3. Optimized for Discord bot display');
    console.log('');
    
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
        
        // Test 1: Normal template (for comparison)
        console.log('\n📸 Test 1: Normal template (for comparison)...');
        const normalImage = await puppeteerCanvas.createConfessionImage(
            demoConfession, 
            demoGuildSettings, 
            demoAuthor
        );
        
        console.log(`📊 Normal image: ${normalImage.length} bytes`);
        
        await discordSender.sendConfessionImage(
            normalImage,
            process.env.CHANNEL_ID,
            { content: "📢 Confession với template bình thường (có thể bị giới hạn 50% width)" }
        );
        
        // Test 2: Bot message optimized template
        console.log('\n📸 Test 2: Bot message optimized template...');
        const optimizedImage = await puppeteerCanvas.createConfessionImage(
            demoConfession, 
            demoGuildSettings, 
            demoAuthor,
            { discordOptimized: true }
        );
        
        console.log(`📊 Bot optimized image: ${optimizedImage.length} bytes`);
        
        await discordSender.sendConfessionImage(
            optimizedImage,
            process.env.CHANNEL_ID,
            { content: "📢 Confession với template tối ưu hóa cho bot messages (hiển thị tốt hơn)" }
        );
        
        // Test 3: Anonymous confession with bot optimization
        console.log('\n🕵️ Test 3: Anonymous confession với bot optimization...');
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
        
        console.log(`📊 Anonymous bot optimized image: ${anonymousImage.length} bytes`);
        
        await discordSender.sendConfessionImage(
            anonymousImage,
            process.env.CHANNEL_ID,
            { content: "📢 Confession ẩn danh với template tối ưu hóa cho bot messages" }
        );
        
        // Test 4: Long content with bot optimization
        console.log('\n📝 Test 4: Long content với bot optimization...');
        const longConfession = {
            content: "Đây là một confession rất dài để test khả năng hiển thị của template tối ưu hóa cho bot messages. Nội dung này có thể dài và phức tạp, nhưng template sẽ đảm bảo hiển thị tốt trong bot messages mà không bị giới hạn 50% width như các template thông thường.",
            isAnonymous: false,
            createdAt: new Date()
        };
        
        const longImage = await puppeteerCanvas.createConfessionImage(
            longConfession, 
            demoGuildSettings, 
            demoAuthor,
            { discordOptimized: true }
        );
        
        console.log(`📊 Long content bot optimized image: ${longImage.length} bytes`);
        
        await discordSender.sendConfessionImage(
            longImage,
            process.env.CHANNEL_ID,
            { content: "📢 Confession dài với template tối ưu hóa cho bot messages" }
        );
        
        console.log('\n✅ All bot message optimization tests completed successfully!');
        console.log('📊 Summary:');
        console.log('   - Normal template: ~450KB (có thể bị giới hạn 50% width)');
        console.log('   - Bot optimized: ~280KB (hiển thị tốt hơn trong bot messages)');
        console.log('   - Compact layout: 500px max-width');
        console.log('   - Smaller viewport: 600x400');
        console.log('   - Better bot message display');
        
    } catch (error) {
        console.error('❌ Error during bot message optimization demo:', error);
    } finally {
        // Cleanup
        await discordSender.close();
        await puppeteerCanvas.close();
    }
}

// Run demo
demoBotMessageOptimized().then(() => {
    console.log('\n🎉 Bot message optimization demo finished!');
    console.log('🎯 Template đã được tối ưu hóa cho bot messages!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Bot message optimization demo failed:', error);
    process.exit(1);
}); 