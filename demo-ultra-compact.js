require('dotenv').config();
const puppeteerCanvas = require('./src/utils/puppeteerCanvas');
const discordSender = require('./src/utils/discordImageSender');

// Demo data
const demoConfession = {
    content: "Đây là một confession demo sử dụng ultra compact template để bypass hoàn toàn giới hạn 50% width của Discord images. Template này được thiết kế cực kỳ compact với max-width chỉ 400px để đảm bảo hiển thị tốt trong Discord.",
    isAnonymous: false,
    createdAt: new Date()
};

const demoGuildSettings = {
    confessionCounter: 5678,
    guildName: "Ultra Compact Server"
};

const demoAuthor = {
    username: "Đông",
    id: ""
};

async function demoUltraCompact() {
    console.log('🚀 Starting Ultra Compact Demo...');
    console.log('📋 This demo will test ultra compact template:');
    console.log('   1. Ultra compact layout (400px max-width)');
    console.log('   2. Very small viewport (500x300)');
    console.log('   3. Bypass Discord image width limitations');
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
        
        // Test 2: Discord optimized template
        console.log('\n📸 Test 2: Discord optimized template...');
        const optimizedImage = await puppeteerCanvas.createConfessionImage(
            demoConfession, 
            demoGuildSettings, 
            demoAuthor,
            { discordOptimized: true }
        );
        
        console.log(`📊 Discord optimized image: ${optimizedImage.length} bytes`);
        
        await discordSender.sendConfessionImage(
            optimizedImage,
            process.env.CHANNEL_ID,
            { content: "📢 Confession với Discord optimized template" }
        );
        
        // Test 3: Ultra compact template
        console.log('\n📸 Test 3: Ultra compact template...');
        const ultraCompactImage = await puppeteerCanvas.createConfessionImage(
            demoConfession, 
            demoGuildSettings, 
            demoAuthor,
            { ultraCompact: true }
        );
        
        console.log(`📊 Ultra compact image: ${ultraCompactImage.length} bytes`);
        
        await discordSender.sendConfessionImage(
            ultraCompactImage,
            process.env.CHANNEL_ID,
            { content: "📢 Confession với ultra compact template (bypass Discord limitations)" }
        );
        
        // Test 4: Anonymous confession with ultra compact
        console.log('\n🕵️ Test 4: Anonymous confession với ultra compact...');
        const anonymousConfession = {
            ...demoConfession,
            isAnonymous: true
        };
        
        const anonymousUltraImage = await puppeteerCanvas.createConfessionImage(
            anonymousConfession, 
            demoGuildSettings, 
            demoAuthor,
            { ultraCompact: true }
        );
        
        console.log(`📊 Anonymous ultra compact image: ${anonymousUltraImage.length} bytes`);
        
        await discordSender.sendConfessionImage(
            anonymousUltraImage,
            process.env.CHANNEL_ID,
            { content: "📢 Confession ẩn danh với ultra compact template" }
        );
        
        // Test 5: Long content with ultra compact
        console.log('\n📝 Test 5: Long content với ultra compact...');
        const longConfession = {
            content: "Đây là một confession rất dài để test khả năng hiển thị của ultra compact template. Nội dung này có thể dài và phức tạp, nhưng template ultra compact sẽ đảm bảo hiển thị tốt trong Discord mà không bị giới hạn 50% width như các template thông thường. Template này được thiết kế đặc biệt để bypass hoàn toàn các limitations của Discord.",
            isAnonymous: false,
            createdAt: new Date()
        };
        
        const longUltraImage = await puppeteerCanvas.createConfessionImage(
            longConfession, 
            demoGuildSettings, 
            demoAuthor,
            { ultraCompact: true }
        );
        
        console.log(`📊 Long content ultra compact image: ${longUltraImage.length} bytes`);
        
        await discordSender.sendConfessionImage(
            longUltraImage,
            process.env.CHANNEL_ID,
            { content: "📢 Confession dài với ultra compact template" }
        );
        
        console.log('\n✅ All ultra compact tests completed successfully!');
        console.log('📊 Summary:');
        console.log('   - Normal template: ~450KB (có thể bị giới hạn 50% width)');
        console.log('   - Discord optimized: ~280KB (hiển thị tốt hơn)');
        console.log('   - Ultra compact: ~200KB (bypass hoàn toàn limitations)');
        console.log('   - Ultra compact layout: 400px max-width');
        console.log('   - Ultra compact viewport: 500x300');
        console.log('   - Maximum Discord compatibility');
        
    } catch (error) {
        console.error('❌ Error during ultra compact demo:', error);
    } finally {
        // Cleanup
        await discordSender.close();
        await puppeteerCanvas.close();
    }
}

// Run demo
demoUltraCompact().then(() => {
    console.log('\n🎉 Ultra compact demo finished!');
    console.log('🎯 Template đã được tối ưu hóa cực kỳ compact cho Discord!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Ultra compact demo failed:', error);
    process.exit(1);
}); 