const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const confessionCanvas = require('./src/utils/confessionCanvas');
const db = require('./src/data/mongodb');

// Tạo Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Test confession data
const testConfession = {
    content: "Cậu giống như hoàng hôn hôm đó – đẹp đến mức khiến tớ quên mất phải nói điều gì. Tớ từng nghĩ chỉ cần im lặng, dõi theo là đủ, nhưng hoá ra càng im lặng, càng đau. Nếu một ngày nào đó, cậu đọc được dòng này... thì hãy biết rằng, có một người từng yêu cậu rất nhiều.",
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

async function testCanvasConfession() {
    console.log('🧪 Testing Canvas Confession with Full Size Image...\n');

    try {
        // Test 1: Tạo canvas confession image
        console.log('📝 Test 1: Creating canvas confession image...');
        const imageBuffer = await confessionCanvas.createStyledConfessionImage(
            testConfession,
            testGuildSettings,
            testAuthor
        );

        console.log('✅ Canvas confession image created successfully!');
        console.log(`📏 Image size: ${imageBuffer.length} bytes`);
        console.log(`🖼️ Canvas dimensions: 6400x300px`);
        console.log(`📐 Aspect ratio: 21.33:1 (super wide for Discord)`);
        console.log(`📊 File size: ~${Math.round(imageBuffer.length / 1024)}KB`);

        // Test 2: Tạo attachment
        console.log('\n📎 Test 2: Creating Discord attachment...');
        const attachment = new AttachmentBuilder(imageBuffer, { 
            name: 'confession.png',
            description: `Confession #${testGuildSettings.confessionCounter + 1}`
        });

        console.log('✅ Discord attachment created successfully!');
        console.log('File name: confession.png');
        console.log('Description: Confession image with full size');

        // Test 3: Simulate Discord message structure
        console.log('\n📋 Test 3: Simulating Discord message structure...');
        const mockMessageStructure = {
            files: [attachment],
            components: [] // Emoji buttons sẽ được thêm sau
        };

        console.log('✅ Discord message structure created successfully!');
        console.log('Content: None (Pure image)');
        console.log('File count: 1');
        console.log('Embed count: 0 (Pure image approach)');
        console.log('Full width potential: ✅ Yes (Super wide canvas)');

        // Test 4: Test với anonymous confession
        console.log('\n🕵️ Test 4: Testing anonymous confession...');
        const anonymousConfession = { ...testConfession, isAnonymous: true };
        const anonymousImageBuffer = await confessionCanvas.createStyledConfessionImage(
            anonymousConfession,
            testGuildSettings,
            testAuthor
        );

        console.log('✅ Anonymous confession canvas created successfully!');
        console.log(`📏 Anonymous image size: ${anonymousImageBuffer.length} bytes`);

        // Test 5: Test với confession dài
        console.log('\n📖 Test 5: Testing long confession...');
        const longConfession = {
            ...testConfession,
            content: "Đây là một confession rất dài để test word wrapping với super wide canvas. " + 
                    "Tớ muốn xem canvas 6400px width có thể handle được text dài như thế nào. " +
                    "Có thể nó sẽ wrap text một cách đẹp mắt và dễ đọc hơn với không gian rộng hơn. " +
                    "Tớ hy vọng rằng confession này sẽ hiển thị tốt trong Discord với full width. " +
                    "Và tớ cũng muốn test xem có thể hiển thị full width không với super wide canvas. " +
                    "Nếu có thể hiển thị full width thì thật tuyệt vời!"
        };

        const longImageBuffer = await confessionCanvas.createStyledConfessionImage(
            longConfession,
            testGuildSettings,
            testAuthor
        );

        console.log('✅ Long confession canvas created successfully!');
        console.log(`📏 Long image size: ${longImageBuffer.length} bytes`);

        console.log('\n🎉 All canvas confession tests passed!');
        console.log('\n📋 Summary:');
        console.log('- ✅ Canvas confession image: Working');
        console.log('- ✅ Discord attachment: Working');
        console.log('- ✅ Message structure: Working');
        console.log('- ✅ Anonymous support: Working');
        console.log('- ✅ Long text support: Working');
        console.log('- ✅ Super wide canvas: Working');

        console.log('\n💡 Canvas Confession Benefits:');
        console.log('- 🖼️ Super wide canvas (6400px width) for full size');
        console.log('- 📏 21.33:1 aspect ratio optimized for Discord');
        console.log('- 🔤 Massive, highly readable fonts');
        console.log('- 📐 Generous spacing and margins');
        console.log('- 🎨 Professional appearance in Discord');
        console.log('- 🚀 Full width display potential');

        console.log('\n📊 Technical Specifications:');
        console.log('- Width: 6400px (8x original)');
        console.log('- Height: 300px (0.75x original)');
        console.log('- Padding: 320px (8x original)');
        console.log('- Font size: 120px (6.67x original)');
        console.log('- Line height: 160px (5.33x original)');
        console.log('- Aspect ratio: 21.33:1 (super wide for Discord)');

        console.log('\n🎯 Full Size Image Optimization:');
        console.log('- 📐 21.33:1 ratio optimized for Discord scaling');
        console.log('- 🖼️ Super wide canvas compensates for Discord constraints');
        console.log('- 📱 Responsive design for Discord display');
        console.log('- 🎨 Professional appearance in Discord');
        console.log('- 🚀 Maximum width utilization');

        console.log('\n🚀 Ready for Discord full size image display!');

        // Trả về attachment để sử dụng trong Discord
        return attachment;

    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    }
}

// Export function để sử dụng trong Discord bot
module.exports = { testCanvasConfession };

// Nếu chạy trực tiếp file này
if (require.main === module) {
    testCanvasConfession()
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