const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Demo data
const demoData = {
    number: 123,
    content: "Đây là một confession demo sử dụng Puppeteer để tạo ảnh từ HTML template. Template này có thiết kế đẹp với gradient background và modern UI.",
    author: {
        username: "DemoUser",
        isAnonymous: false
    },
    time: "Vừa xong",
    serverName: "Demo Server"
};

async function demoPuppeteerConfession() {
    console.log('🚀 Starting Puppeteer Confession Demo...');
    
    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
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
        
        // Set viewport
        await page.setViewport({ 
            width: 800, 
            height: 600,
            deviceScaleFactor: 2
        });
        
        // Update template with demo data
        console.log('🔄 Updating template with demo data...');
        await page.evaluate((data) => {
            if (window.updateConfession) {
                window.updateConfession(data);
            }
        }, demoData);
        
        // Wait for any animations
        await page.waitForTimeout(1000);
        
        // Take screenshot
        console.log('📸 Taking screenshot...');
        const screenshot = await page.screenshot({
            type: 'png',
            fullPage: false,
            omitBackground: false
        });
        
        // Save to file
        const outputPath = path.join(__dirname, 'demo-confession.png');
        fs.writeFileSync(outputPath, screenshot);
        
        console.log('✅ Screenshot saved to:', outputPath);
        console.log('📊 File size:', screenshot.length, 'bytes');
        
    } catch (error) {
        console.error('❌ Error during demo:', error);
    } finally {
        await browser.close();
        console.log('🔚 Browser closed');
    }
}

// Run demo
demoPuppeteerConfession().then(() => {
    console.log('🎉 Demo completed!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Demo failed:', error);
    process.exit(1);
}); 