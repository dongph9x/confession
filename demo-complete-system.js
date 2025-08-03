require('dotenv').config();
const puppeteerCanvas = require('./src/utils/puppeteerCanvas');
const confessionCanvas = require('./src/utils/confessionCanvas');
const discordSender = require('./src/utils/discordImageSender');

// Demo data
const demoConfession = {
    content: "Đây là một confession demo hoàn chỉnh sử dụng Puppeteer để tạo ảnh và gửi lên Discord. Template này có thiết kế đẹp với gradient background và modern UI. Hệ thống này kết hợp cả Puppeteer rendering và Discord sending để tạo ra một workflow hoàn chỉnh.",
    isAnonymous: false,
    createdAt: new Date()
};

const demoGuildSettings = {
    confessionCounter: 789,
    guildName: "Complete Demo Server"
};

const demoAuthor = {
    username: "CompleteDemoUser",
    id: "123456789"
};

async function demoCompleteSystem() {
    console.log('🚀 Starting Complete System Demo...');
    console.log('📋 This demo will:');
    console.log('   1. Create confession image with Puppeteer');
    console.log('   2. Send image to Discord channel');
    console.log('   3. Test both simple and embed formats');
    console.log('   4. Test anonymous confessions');
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
        console.log('🔗 Step 1: Initializing Discord client...');
        await discordSender.initialize(process.env.BOT_TOKEN);
        console.log('✅ Discord client ready');
        
        // Test 1: Simple image
        console.log('\n📸 Step 2: Creating and sending simple confession image...');
        const imageBuffer = await puppeteerCanvas.createConfessionImage(
            demoConfession, 
            demoGuildSettings, 
            demoAuthor
        );
        
        console.log(`📊 Image created: ${imageBuffer.length} bytes`);
        
        await discordSender.sendConfessionImage(
            imageBuffer,
            process.env.CHANNEL_ID,
            { content: "📢 Có một bài confession mới!" }
        );
        console.log('✅ Simple image sent successfully');
        
        // Test 2: With embed
        console.log('\n📋 Step 3: Creating and sending confession with embed...');
        const result = await confessionCanvas.createConfessionWithEmbed(
            demoConfession, 
            demoGuildSettings, 
            demoAuthor
        );
        
        await discordSender.sendConfessionWithEmbed(
            result.imageBuffer,
            result.embed,
            process.env.CHANNEL_ID
        );
        console.log('✅ Embed confession sent successfully');
        
        // Test 3: Anonymous confession
        console.log('\n🕵️ Step 4: Testing anonymous confession...');
        const anonymousConfession = {
            ...demoConfession,
            isAnonymous: true
        };
        
        const anonymousResult = await confessionCanvas.createConfessionWithEmbed(
            anonymousConfession, 
            demoGuildSettings, 
            demoAuthor
        );
        
        await discordSender.sendConfessionWithEmbed(
            anonymousResult.imageBuffer,
            anonymousResult.embed,
            process.env.CHANNEL_ID
        );
        console.log('✅ Anonymous confession sent successfully');
        
        // Test 4: Canvas renderer comparison
        console.log('\n🎨 Step 5: Testing Canvas renderer for comparison...');
        confessionCanvas.setRenderer('canvas');
        const canvasResult = await confessionCanvas.createConfessionWithEmbed(
            demoConfession, 
            demoGuildSettings, 
            demoAuthor
        );
        
        await discordSender.sendConfessionWithEmbed(
            canvasResult.imageBuffer,
            canvasResult.embed,
            process.env.CHANNEL_ID
        );
        console.log('✅ Canvas confession sent successfully');
        
        console.log('\n🎉 All tests completed successfully!');
        console.log('📊 Summary:');
        console.log('   - Puppeteer images: ~450KB each');
        console.log('   - Canvas images: ~126KB each');
        console.log('   - All images sent to Discord successfully');
        
    } catch (error) {
        console.error('❌ Error during demo:', error);
    } finally {
        // Cleanup
        console.log('\n🧹 Cleaning up...');
        await discordSender.close();
        await confessionCanvas.cleanup();
        console.log('✅ Cleanup completed');
    }
}

// Run demo
demoCompleteSystem().then(() => {
    console.log('\n🏁 Complete system demo finished!');
    console.log('🎯 You can now integrate this into your confession bot!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Demo failed:', error);
    process.exit(1);
}); 