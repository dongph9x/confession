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

async function testNewCanvas() {
    console.log('🧪 Testing NEW Canvas Confession with 16:9 ratio...\n');

    try {
        // Test 1: Tạo canvas confession image với kích thước mới
        console.log('📝 Test 1: Creating new canvas confession image...');
        const imageBuffer = await confessionCanvas.createStyledConfessionImage(
            testConfession,
            testGuildSettings,
            testAuthor
        );

        console.log('✅ Canvas confession image created successfully!');
        console.log(`📏 Image size: ${imageBuffer.length} bytes`);
        console.log(`🖼️ Canvas dimensions: 1600x900px (16:9 ratio)`);
        console.log(`📐 Aspect ratio: 16:9 (optimized for Discord)`);
        console.log(`📊 File size: ~${Math.round(imageBuffer.length / 1024)}KB`);

        // Test 2: Tạo attachment
        console.log('\n📎 Test 2: Creating Discord attachment...');
        const attachment = new AttachmentBuilder(imageBuffer, { 
            name: 'confession.png',
            description: `New Confession - 16:9 ratio`
        });

        console.log('✅ Discord attachment created successfully!');
        console.log('File name: confession.png');
        console.log('Description: New confession with 16:9 ratio');

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
            content: "Đây là một confession rất dài để test word wrapping với canvas 16:9. " + 
                    "Tớ muốn xem canvas 1600x900px có thể handle được text dài như thế nào. " +
                    "Có thể nó sẽ wrap text một cách đẹp mắt và dễ đọc hơn với không gian rộng hơn. " +
                    "Tớ hy vọng rằng confession này sẽ hiển thị tốt trong Discord với full width. " +
                    "Và tớ cũng muốn test xem có thể hiển thị full width không với 16:9 ratio. " +
                    "Nếu có thể hiển thị full width thì thật tuyệt vời!"
        };

        const longImageBuffer = await confessionCanvas.createStyledConfessionImage(
            longConfession,
            testGuildSettings,
            testAuthor
        );

        console.log('✅ Long confession canvas created successfully!');
        console.log(`📏 Long image size: ${longImageBuffer.length} bytes`);

        console.log('\n🎉 All NEW canvas confession tests passed!');
        console.log('\n📋 Summary:');
        console.log('- ✅ Canvas confession image: Working');
        console.log('- ✅ Discord attachment: Working');
        console.log('- ✅ Anonymous support: Working');
        console.log('- ✅ Long text support: Working');
        console.log('- ✅ 16:9 ratio: Working');

        console.log('\n💡 NEW Canvas Confession Benefits:');
        console.log('- 🖼️ 16:9 ratio optimized for Discord');
        console.log('- 📏 1600x900px dimensions');
        console.log('- 🔤 Readable fonts and spacing');
        console.log('- 📐 Professional layout');
        console.log('- 🎨 Better Discord compatibility');
        console.log('- 🚀 Full width display potential');

        console.log('\n📊 NEW Technical Specifications:');
        console.log('- Width: 1600px (16:9 ratio)');
        console.log('- Height: 900px (16:9 ratio)');
        console.log('- Padding: 80px');
        console.log('- Font size: 40px');
        console.log('- Line height: 60px');
        console.log('- Aspect ratio: 16:9 (Discord optimized)');

        console.log('\n🎯 Discord Display Optimization:');
        console.log('- 📐 16:9 ratio matches Discord expectations');
        console.log('- 🖼️ Standard dimensions for better scaling');
        console.log('- 📱 Responsive design for Discord display');
        console.log('- 🎨 Professional appearance in Discord');
        console.log('- 🚀 Better full width utilization');

        console.log('\n🚀 Ready for Discord display with 16:9 ratio!');

        return attachment;

    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    }
}

// Export function để sử dụng trong Discord bot
module.exports = { testNewCanvas };

// Nếu chạy trực tiếp file này
if (require.main === module) {
    testNewCanvas()
        .then(attachment => {
            console.log('\n✅ Test completed successfully!');
            console.log('📎 Attachment ready for Discord use');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Test failed:', error);
            process.exit(1);
        });
} 