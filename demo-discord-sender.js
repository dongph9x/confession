require('dotenv').config();
const puppeteerCanvas = require('./src/utils/puppeteerCanvas');
const discordSender = require('./src/utils/discordImageSender');

// Demo data
const demoConfession = {
    content: "Đây là một confession demo được gửi lên Discord thông qua Puppeteer. Template này có thiết kế đẹp với gradient background và modern UI.",
    isAnonymous: false,
    createdAt: new Date()
};

const demoGuildSettings = {
    confessionCounter: 456,
    guildName: "Demo Server"
};

const demoAuthor = {
    username: "Đông",
    id: ""
};

async function demoDiscordSender() {
    console.log('🚀 Starting Discord Sender Demo...');
    
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
        
        // Create confession image optimized for Discord
        console.log('📸 Creating confession image optimized for Discord...');
        
        const imageBuffer = await puppeteerCanvas.createConfessionImage(
            demoConfession, 
            demoGuildSettings, 
            demoAuthor,
            { discordOptimized: true } // Use Discord optimized template
        );
        
        console.log(`📊 Image created: ${imageBuffer.length} bytes`);
        
        // Send to Discord
        console.log('📤 Sending to Discord...');
        await discordSender.sendConfessionImage(
            imageBuffer,
            process.env.CHANNEL_ID,
            { content: "📢 Có một bài confession mới!" }
        );
        
        console.log('✅ Demo completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during demo:', error);
    } finally {
        // Cleanup
        await discordSender.close();
        await puppeteerCanvas.close();
    }
}

// Run demo
demoDiscordSender().then(() => {
    console.log('🎉 Demo finished!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Demo failed:', error);
    process.exit(1);
}); 