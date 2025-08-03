const puppeteerCanvas = require('./src/utils/puppeteerCanvas');
const confessionCanvas = require('./src/utils/confessionCanvas');

// Mock data for testing
const mockConfession = {
    content: "Đây là một confession test sử dụng Puppeteer để tạo ảnh từ HTML template. Template này có thiết kế đẹp và responsive, với gradient background và modern UI.",
    isAnonymous: false,
    createdAt: new Date()
};

const mockGuildSettings = {
    confessionCounter: 42,
    guildName: "Test Server"
};

const mockAuthor = {
    username: "TestUser",
    id: "123456789"
};

async function testPuppeteerConfession() {
    console.log('🚀 Testing Puppeteer Confession Generation...');
    
    try {
        // Test Puppeteer renderer
        console.log('📸 Creating confession image with Puppeteer...');
        const puppeteerResult = await puppeteerCanvas.createConfessionWithEmbed(
            mockConfession, 
            mockGuildSettings, 
            mockAuthor
        );
        
        console.log('✅ Puppeteer image created successfully!');
        console.log('📊 Image buffer size:', puppeteerResult.imageBuffer.length, 'bytes');
        
        // Test Canvas renderer for comparison
        console.log('\n🎨 Testing Canvas renderer...');
        confessionCanvas.setRenderer('canvas');
        const canvasResult = await confessionCanvas.createConfessionWithEmbed(
            mockConfession, 
            mockGuildSettings, 
            mockAuthor
        );
        
        console.log('✅ Canvas image created successfully!');
        console.log('📊 Image buffer size:', canvasResult.imageBuffer.length, 'bytes');
        
        // Test Puppeteer renderer through confessionCanvas
        console.log('\n🔄 Testing Puppeteer through confessionCanvas...');
        confessionCanvas.setRenderer('puppeteer');
        const hybridResult = await confessionCanvas.createConfessionWithEmbed(
            mockConfession, 
            mockGuildSettings, 
            mockAuthor
        );
        
        console.log('✅ Hybrid Puppeteer image created successfully!');
        console.log('📊 Image buffer size:', hybridResult.imageBuffer.length, 'bytes');
        
        console.log('\n🎉 All tests completed successfully!');
        
        // Cleanup
        await confessionCanvas.cleanup();
        
    } catch (error) {
        console.error('❌ Error during testing:', error);
    }
}

// Test anonymous confession
async function testAnonymousConfession() {
    console.log('\n🕵️ Testing Anonymous Confession...');
    
    const anonymousConfession = {
        ...mockConfession,
        isAnonymous: true
    };
    
    try {
        confessionCanvas.setRenderer('puppeteer');
        const result = await confessionCanvas.createConfessionWithEmbed(
            anonymousConfession, 
            mockGuildSettings, 
            mockAuthor
        );
        
        console.log('✅ Anonymous confession created successfully!');
        console.log('📊 Image buffer size:', result.imageBuffer.length, 'bytes');
        
        await confessionCanvas.cleanup();
        
    } catch (error) {
        console.error('❌ Error creating anonymous confession:', error);
    }
}

// Run tests
async function runTests() {
    await testPuppeteerConfession();
    await testAnonymousConfession();
    
    console.log('\n🏁 All tests finished!');
    process.exit(0);
}

runTests(); 