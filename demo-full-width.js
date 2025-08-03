require('dotenv').config();
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const discordSender = require('./src/utils/discordImageSender');

// Demo data
const demoConfession = {
    content: "Đây là một confession demo với full width rendering. Template này được thiết kế để hiển thị tốt trên màn hình rộng với layout responsive và modern UI. Nội dung confession có thể dài hơn và vẫn được hiển thị đẹp mắt.",
    isAnonymous: false,
    createdAt: new Date()
};

const demoGuildSettings = {
    confessionCounter: 789,
    guildName: "Full Width Demo Server"
};

const demoAuthor = {
    username: "Đông",
    id: "389957152153796608"
};

async function createFullWidthConfession() {
    console.log('🚀 Creating Full Width Confession...');
    
    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
        ]
    });
    
    try {
        const page = await browser.newPage();
        
        // Load template
        const templatePath = path.join(__dirname, 'src/utils/confessionTemplate.html');
        console.log('📄 Loading template from:', templatePath);
        
        await page.goto(`file://${templatePath}`, {
            waitUntil: 'networkidle0',
        });
        
        // Set viewport for full width
        await page.setViewport({ 
            width: 1400,  // Wide viewport
            height: 900,   // Taller for full content
            deviceScaleFactor: 2 // High resolution
        });
        
        // Update template with demo data
        console.log('🔄 Updating template with demo data...');
        await page.evaluate((data) => {
            if (window.updateConfession) {
                window.updateConfession(data);
            }
        }, {
            number: demoGuildSettings.confessionCounter + 1,
            content: demoConfession.content,
            author: {
                username: demoAuthor.username,
                isAnonymous: demoConfession.isAnonymous
            },
            time: "Vừa xong",
            serverName: demoGuildSettings.guildName
        });
        
        // Wait for any animations
        await page.waitForTimeout(1000);
        
        // Take screenshot with full page
        console.log('📸 Taking full width screenshot...');
        const screenshot = await page.screenshot({
            type: 'png',
            fullPage: true, // Capture full page
            omitBackground: false
        });
        
        // Save to file
        const outputPath = path.join(__dirname, 'full-width-confession.png');
        fs.writeFileSync(outputPath, screenshot);
        
        console.log('✅ Full width screenshot saved to:', outputPath);
        console.log('📊 File size:', screenshot.length, 'bytes');
        
        return screenshot;
        
    } catch (error) {
        console.error('❌ Error creating full width confession:', error);
        throw error;
    } finally {
        await browser.close();
        console.log('🔚 Browser closed');
    }
}

async function demoFullWidthDiscord() {
    console.log('🚀 Starting Full Width Discord Demo...');
    
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
        
        // Create full width confession image
        console.log('📸 Creating full width confession image...');
        const imageBuffer = await createFullWidthConfession();
        
        console.log(`📊 Image created: ${imageBuffer.length} bytes`);
        
        // Send to Discord
        console.log('📤 Sending full width image to Discord...');
        await discordSender.sendConfessionImage(
            imageBuffer,
            process.env.CHANNEL_ID,
            { content: "📢 Có một bài confession mới với full width!" }
        );
        
        console.log('✅ Full width demo completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during full width demo:', error);
    } finally {
        // Cleanup
        await discordSender.close();
    }
}

// Run demo
demoFullWidthDiscord().then(() => {
    console.log('🎉 Full width demo finished!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Full width demo failed:', error);
    process.exit(1);
}); 