require('dotenv').config();
const puppeteerCanvas = require('./src/utils/puppeteerCanvas');
const confessionCanvas = require('./src/utils/confessionCanvas');
const discordSender = require('./src/utils/discordImageSender');

// Mock data for testing
const mockConfession = {
    content: "Đây là một confession test được gửi lên Discord thông qua Puppeteer. Template này có thiết kế đẹp và modern UI với gradient background.",
    isAnonymous: false,
    createdAt: new Date()
};

const mockGuildSettings = {
    confessionCounter: 123,
    guildName: "Test Server"
};

const mockAuthor = {
    username: "TestUser",
    id: "123456789"
};

async function testDiscordSender() {
    console.log('🚀 Testing Discord Image Sender...');
    
    try {
        // Initialize Discord client
        console.log('🔗 Initializing Discord client...');
        await discordSender.initialize(process.env.BOT_TOKEN);
        
        // Test 1: Send simple image
        console.log('\n📸 Test 1: Sending simple confession image...');
        const imageBuffer = await puppeteerCanvas.createConfessionImage(
            mockConfession, 
            mockGuildSettings, 
            mockAuthor
        );
        
        await discordSender.sendConfessionImage(
            imageBuffer,
            process.env.CHANNEL_ID,
            { content: "📢 Có một bài confession mới!" }
        );
        
        // Test 2: Send with embed
        console.log('\n📋 Test 2: Sending confession with embed...');
        const result = await confessionCanvas.createConfessionWithEmbed(
            mockConfession, 
            mockGuildSettings, 
            mockAuthor
        );
        
        await discordSender.sendConfessionWithEmbed(
            result.imageBuffer,
            result.embed,
            process.env.CHANNEL_ID
        );
        
        // Test 3: Anonymous confession
        console.log('\n🕵️ Test 3: Sending anonymous confession...');
        const anonymousConfession = {
            ...mockConfession,
            isAnonymous: true
        };
        
        const anonymousResult = await confessionCanvas.createConfessionWithEmbed(
            anonymousConfession, 
            mockGuildSettings, 
            mockAuthor
        );
        
        await discordSender.sendConfessionWithEmbed(
            anonymousResult.imageBuffer,
            anonymousResult.embed,
            process.env.CHANNEL_ID
        );
        
        console.log('\n🎉 All Discord tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during Discord testing:', error);
    } finally {
        // Cleanup
        await discordSender.close();
        await confessionCanvas.cleanup();
    }
}

// Check environment variables
function checkEnvironment() {
    const required = ['BOT_TOKEN', 'CHANNEL_ID'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:');
        missing.forEach(key => console.error(`   - ${key}`));
        console.error('\nPlease add them to your .env file:');
        console.error('BOT_TOKEN=your_discord_bot_token');
        console.error('CHANNEL_ID=your_channel_id');
        process.exit(1);
    }
    
    console.log('✅ Environment variables check passed');
}

// Run test
async function runTest() {
    checkEnvironment();
    await testDiscordSender();
    
    console.log('\n🏁 Test finished!');
    process.exit(0);
}

runTest().catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
}); 