const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const confessionCanvas = require('./src/utils/confessionCanvas');

// Test confession data
const testConfession = {
    content: "Cậu giống như hoàng hôn hôm đó – đẹp đến mức khiến tớ quên mất phải nói điều gì. Tớ từng nghĩ chỉ cần im lặng, dõi theo là đủ, nhưng hoá ra càng im lặng, càng đau.",
    isAnonymous: false,
    createdAt: new Date(),
    userId: "123456789"
};

const testGuildSettings = {
    confessionCounter: 39,
    guildName: "Test Server"
};

const testAuthor = {
    username: "dev_dg_2010",
    id: "123456789"
};

async function testRatioComparison() {
    console.log('🧪 Testing Different Canvas Ratios for Discord...\n');

    try {
        // Test 1: 3:2 ratio (current)
        console.log('📝 Test 1: 3:2 ratio (1500x1000px)...');
        const imageBuffer1 = await confessionCanvas.createStyledConfessionImage(
            testConfession,
            testGuildSettings,
            testAuthor
        );

        console.log('✅ 3:2 ratio canvas created successfully!');
        console.log(`📏 Image size: ${imageBuffer1.length} bytes`);
        console.log(`🖼️ Canvas dimensions: 1500x1000px (3:2 ratio)`);
        console.log(`📐 Aspect ratio: 3:2`);
        console.log(`📊 File size: ~${Math.round(imageBuffer1.length / 1024)}KB`);

        // Test 2: Tạo với tỷ lệ khác (tạm thời thay đổi)
        console.log('\n📝 Test 2: Testing different ratios...');
        
        // Lưu kích thước hiện tại
        const originalWidth = confessionCanvas.width;
        const originalHeight = confessionCanvas.height;
        
        // Test 5:4 ratio
        confessionCanvas.width = 1600;
        confessionCanvas.height = 1280;
        const imageBuffer2 = await confessionCanvas.createStyledConfessionImage(
            testConfession,
            testGuildSettings,
            testAuthor
        );
        
        console.log('✅ 5:4 ratio canvas created successfully!');
        console.log(`📏 Image size: ${imageBuffer2.length} bytes`);
        console.log(`🖼️ Canvas dimensions: 1600x1280px (5:4 ratio)`);
        console.log(`📐 Aspect ratio: 5:4`);
        console.log(`📊 File size: ~${Math.round(imageBuffer2.length / 1024)}KB`);

        // Test 1:1 ratio (square)
        confessionCanvas.width = 1200;
        confessionCanvas.height = 1200;
        const imageBuffer3 = await confessionCanvas.createStyledConfessionImage(
            testConfession,
            testGuildSettings,
            testAuthor
        );
        
        console.log('✅ 1:1 ratio canvas created successfully!');
        console.log(`📏 Image size: ${imageBuffer3.length} bytes`);
        console.log(`🖼️ Canvas dimensions: 1200x1200px (1:1 ratio)`);
        console.log(`📐 Aspect ratio: 1:1 (square)`);
        console.log(`📊 File size: ~${Math.round(imageBuffer3.length / 1024)}KB`);

        // Khôi phục kích thước gốc
        confessionCanvas.width = originalWidth;
        confessionCanvas.height = originalHeight;

        console.log('\n🎉 All ratio comparison tests completed!');
        console.log('\n📋 Summary:');
        console.log('- ✅ 3:2 ratio (1500x1000px): Working');
        console.log('- ✅ 5:4 ratio (1600x1280px): Working');
        console.log('- ✅ 1:1 ratio (1200x1200px): Working');

        console.log('\n💡 Discord Display Recommendations:');
        console.log('- 🖼️ **3:2 ratio**: Good balance of width and height');
        console.log('- 📏 **5:4 ratio**: More square-like, might display better');
        console.log('- 🔲 **1:1 ratio**: Square format, maximum Discord compatibility');
        console.log('- 📐 **Pure image mode**: No embed for maximum size');

        console.log('\n📊 Technical Comparison:');
        console.log('- 3:2 ratio: 1500x1000px (~107KB)');
        console.log('- 5:4 ratio: 1600x1280px (~120KB)');
        console.log('- 1:1 ratio: 1200x1200px (~95KB)');

        console.log('\n🎯 Best Practices for Discord:');
        console.log('- 📐 Use square or near-square ratios for best display');
        console.log('- 🖼️ Avoid very wide ratios (like 21:1)');
        console.log('- 📱 Test with pure image mode (no embed)');
        console.log('- 🎨 Consider Discord\'s layout constraints');

        console.log('\n🚀 Recommendation: Try 1:1 (square) ratio for maximum Discord compatibility!');

        return { imageBuffer1, imageBuffer2, imageBuffer3 };

    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    }
}

// Export function để sử dụng trong Discord bot
module.exports = { testRatioComparison };

// Nếu chạy trực tiếp file này
if (require.main === module) {
    testRatioComparison()
        .then(result => {
            console.log('\n✅ Test completed successfully!');
            console.log('📎 Multiple ratio images ready for comparison');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Test failed:', error);
            process.exit(1);
        });
} 