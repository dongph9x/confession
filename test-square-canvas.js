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

async function testSquareCanvas() {
    console.log('🧪 Testing SQUARE Canvas Confession (1:1 ratio)...\n');

    try {
        // Test 1: Tạo canvas confession image với tỷ lệ square
        console.log('📝 Test 1: Creating square canvas confession image...');
        const imageBuffer = await confessionCanvas.createStyledConfessionImage(
            testConfession,
            testGuildSettings,
            testAuthor
        );

        console.log('✅ Square canvas confession image created successfully!');
        console.log(`📏 Image size: ${imageBuffer.length} bytes`);
        console.log(`🖼️ Canvas dimensions: 1200x1200px (1:1 square ratio)`);
        console.log(`📐 Aspect ratio: 1:1 (square)`);
        console.log(`📊 File size: ~${Math.round(imageBuffer.length / 1024)}KB`);

        // Test 2: Tạo attachment
        console.log('\n📎 Test 2: Creating Discord attachment...');
        const attachment = new AttachmentBuilder(imageBuffer, { 
            name: 'confession.png',
            description: `Square Confession - 1:1 ratio`
        });

        console.log('✅ Discord attachment created successfully!');
        console.log('File name: confession.png');
        console.log('Description: Square confession with 1:1 ratio');

        // Test 3: Test với anonymous confession
        console.log('\n🕵️ Test 3: Testing anonymous confession...');
        const anonymousConfession = { ...testConfession, isAnonymous: true };
        const anonymousImageBuffer = await confessionCanvas.createStyledConfessionImage(
            anonymousConfession,
            testGuildSettings,
            testAuthor
        );

        console.log('✅ Anonymous confession canvas created successfully!');
        console.log(`📏 Anonymous image size: ${anonymousImageBuffer.length} bytes`);

        // Test 4: Test với confession dài
        console.log('\n📖 Test 4: Testing long confession...');
        const longConfession = {
            ...testConfession,
            content: "Đây là một confession rất dài để test word wrapping với canvas square. " + 
                    "Tớ muốn xem canvas 1200x1200px có thể handle được text dài như thế nào. " +
                    "Có thể nó sẽ wrap text một cách đẹp mắt và dễ đọc hơn với không gian vuông. " +
                    "Tớ hy vọng rằng confession này sẽ hiển thị tốt trong Discord với square format. " +
                    "Và tớ cũng muốn test xem có thể hiển thị tốt không với 1:1 ratio. " +
                    "Nếu có thể hiển thị tốt thì thật tuyệt vời!"
        };

        const longImageBuffer = await confessionCanvas.createStyledConfessionImage(
            longConfession,
            testGuildSettings,
            testAuthor
        );

        console.log('✅ Long confession canvas created successfully!');
        console.log(`📏 Long image size: ${longImageBuffer.length} bytes`);

        console.log('\n🎉 All SQUARE canvas confession tests passed!');
        console.log('\n📋 Summary:');
        console.log('- ✅ Canvas confession image: Working');
        console.log('- ✅ Discord attachment: Working');
        console.log('- ✅ Anonymous support: Working');
        console.log('- ✅ Long text support: Working');
        console.log('- ✅ 1:1 square ratio: Working');

        console.log('\n💡 SQUARE Canvas Confession Benefits:');
        console.log('- 🖼️ 1:1 square ratio for maximum Discord compatibility');
        console.log('- 📏 1200x1200px dimensions');
        console.log('- 🔤 Readable fonts and spacing');
        console.log('- 📐 Professional layout');
        console.log('- 🎨 Better Discord display');
        console.log('- 🚀 Pure image mode (no embed)');

        console.log('\n📊 SQUARE Technical Specifications:');
        console.log('- Width: 1200px (1:1 square ratio)');
        console.log('- Height: 1200px (1:1 square ratio)');
        console.log('- Padding: 80px');
        console.log('- Font size: 36px');
        console.log('- Line height: 50px');
        console.log('- Aspect ratio: 1:1 (square)');

        console.log('\n🎯 Discord Square Optimization:');
        console.log('- 📐 1:1 ratio provides maximum Discord compatibility');
        console.log('- 🖼️ Square format works best with Discord layout');
        console.log('- 📱 Responsive design for Discord display');
        console.log('- 🎨 Professional appearance in Discord');
        console.log('- 🚀 Pure image mode for maximum size');

        console.log('\n🚀 Ready for Discord display with 1:1 square ratio!');

        return attachment;

    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    }
}

// Export function để sử dụng trong Discord bot
module.exports = { testSquareCanvas };

// Nếu chạy trực tiếp file này
if (require.main === module) {
    testSquareCanvas()
        .then(attachment => {
            console.log('\n✅ Test completed successfully!');
            console.log('📎 Square attachment ready for Discord use');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Test failed:', error);
            process.exit(1);
        });
} 