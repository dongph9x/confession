require('dotenv').config();
const discordSender = require('./src/utils/discordImageSender');
const widthOptimizer = require('./src/utils/discordWidthOptimizer');

// Test content với các độ dài khác nhau
const shortContent = "Đây là một confession ngắn để test format image.";
const mediumContent = `Đây là một confession có độ dài trung bình để test format embed. 

Nội dung này có đủ thông tin để tạo thành một confession hoàn chỉnh với nhiều đoạn văn bản khác nhau. Khi gửi dưới dạng embed, Discord sẽ hiển thị full width và có formatting đẹp mắt.

Confession này bao gồm:
• Nhiều đoạn văn bản
• Emoji và formatting
• Thông tin chi tiết
• Cảm xúc và suy nghĩ

Khi gửi embed, Discord sẽ hiển thị đẹp và dễ đọc.`;

const longContent = `Đây là một confession rất dài để test format text được tối ưu hóa. 

Nội dung này có thể dài và phức tạp, với nhiều đoạn văn bản khác nhau. Khi gửi dưới dạng text thông thường, Discord sẽ hiển thị full width và có thể scroll để đọc toàn bộ nội dung.

Nhưng khi gửi dưới dạng image, Discord có thể bị giới hạn 50% width và khó đọc hơn. Đây là lý do tại sao chúng ta cần tối ưu hóa template cho Discord.

Confession này bao gồm:
• Nhiều đoạn văn bản
• Emoji và formatting
• Thông tin chi tiết
• Cảm xúc và suy nghĩ

Khi gửi text, Discord sẽ hiển thị đẹp và dễ đọc. Nhưng khi gửi image, có thể bị giới hạn kích thước.

Đây là đoạn văn bản bổ sung để làm cho confession dài hơn. Nội dung này sẽ được test với nhiều format khác nhau để tìm ra format nào hiển thị tốt nhất trên Discord.

Chúng ta sẽ test:
• Plain text format
• Code block format
• Quote block format
• Spoiler format
• Embed format
• Image format

Mỗi format có ưu điểm và nhược điểm riêng. Mục tiêu là tìm ra format nào bypass được Discord's 50% width limitation và hiển thị tốt nhất cho người đọc.`;

const veryLongContent = `Đây là một confession cực kỳ dài để test format split content. 

Nội dung này sẽ được chia thành nhiều phần để gửi lên Discord, vì nó quá dài để gửi trong một message duy nhất. Khi content quá dài, Discord có thể bị giới hạn và không hiển thị đầy đủ.

Chúng ta sẽ sử dụng DiscordWidthOptimizer để tự động chọn format tốt nhất dựa trên độ dài của content. Điều này sẽ đảm bảo rằng confession luôn được hiển thị tốt nhất có thể trên Discord.

Các format có thể được sử dụng:
1. Image format: Cho content ngắn (< 500 chars)
2. Embed format: Cho content trung bình (500-1500 chars)
3. Optimized text format: Cho content dài (> 1500 chars)

Optimized text format bao gồm:
• Code block: Bypass width limit
• Quote block: Bypass width limit
• Spoiler: Bypass width limit
• Split content: Cho content rất dài

Mỗi format có ưu điểm riêng:
• Code block: Hiển thị full width, dễ copy
• Quote block: Hiển thị full width, có formatting
• Spoiler: Hiển thị full width, ẩn content
• Split content: Chia thành nhiều message

Đây là đoạn văn bản bổ sung để làm cho confession dài hơn nữa. Nội dung này sẽ được test với nhiều format khác nhau để tìm ra format nào hiển thị tốt nhất trên Discord.

Chúng ta sẽ test:
• Plain text format
• Code block format
• Quote block format
• Spoiler format
• Embed format
• Image format

Mỗi format có ưu điểm và nhược điểm riêng. Mục tiêu là tìm ra format nào bypass được Discord's 50% width limitation và hiển thị tốt nhất cho người đọc.

Đây là đoạn văn bản cuối cùng để hoàn thành confession dài này. Nội dung này sẽ được chia thành nhiều phần và gửi lên Discord một cách tối ưu nhất.`;

const demoGuildSettings = {
    confessionCounter: 9999,
    guildName: "Width Optimizer Test Server"
};

const demoAuthor = {
    username: "Đông",
    id: ""
};

async function demoWidthOptimizer() {
    console.log('🚀 Starting Discord Width Optimizer Demo...');
    console.log('📋 Testing automatic format selection based on content length');
    console.log('');
    
    try {
        // Check environment
        if (!process.env.BOT_TOKEN || !process.env.CHANNEL_ID) {
            console.error('❌ Missing environment variables');
            process.exit(1);
        }
        
        // Initialize Discord client
        console.log('🔗 Initializing Discord client...');
        await discordSender.initialize(process.env.BOT_TOKEN);
        
        // Test 1: Short content (< 500 chars) - Should use image
        // console.log('\n📸 Test 1: Short content (should use image format)...');
        // const shortConfession = {
        //     content: shortContent,
        //     isAnonymous: false,
        //     createdAt: new Date()
        // };
        
        // await widthOptimizer.sendOptimizedConfession(
        //     shortConfession,
        //     demoGuildSettings,
        //     demoAuthor,
        //     process.env.CHANNEL_ID,
        //     discordSender
        // );
        
        // // Test 2: Medium content (500-1500 chars) - Should use embed
        // console.log('\n📋 Test 2: Medium content (should use embed format)...');
        // const mediumConfession = {
        //     content: mediumContent,
        //     isAnonymous: false,
        //     createdAt: new Date()
        // };
        
        // await widthOptimizer.sendOptimizedConfession(
        //     mediumConfession,
        //     demoGuildSettings,
        //     demoAuthor,
        //     process.env.CHANNEL_ID,
        //     discordSender
        // );
        
        // // Test 3: Long content (> 1500 chars) - Should use optimized text
        // console.log('\n📝 Test 3: Long content (should use optimized text format)...');
        // const longConfession = {
        //     content: longContent,
        //     isAnonymous: false,
        //     createdAt: new Date()
        // };
        
        // await widthOptimizer.sendOptimizedConfession(
        //     longConfession,
        //     demoGuildSettings,
        //     demoAuthor,
        //     process.env.CHANNEL_ID,
        //     discordSender
        // );
        
        // Test 4: Very long content - Should use split content
        // console.log('\n✂️ Test 4: Very long content (should use split content format)...');
        // const veryLongConfession = {
        //     content: veryLongContent,
        //     isAnonymous: false,
        //     createdAt: new Date()
        // };
        
        // await widthOptimizer.sendOptimizedConfession(
        //     veryLongConfession,
        //     demoGuildSettings,
        //     demoAuthor,
        //     process.env.CHANNEL_ID,
        //     discordSender
        // );
        
        // Test 5: Test all formats for comparison
        console.log('\n🧪 Test 5: Testing all formats for comparison...');
        const testConfession = {
            content: mediumContent,
            isAnonymous: false,
            createdAt: new Date()
        };
        
        const results = await widthOptimizer.testFormats(
            testConfession,
            demoGuildSettings,
            demoAuthor,
            process.env.CHANNEL_ID,
            discordSender
        );
        
        console.log('\n📊 Format test results:');
        results.forEach(result => {
            const status = result.success ? '✅' : '❌';
            console.log(`   ${status} ${result.format}: ${result.success ? 'Success' : result.error}`);
        });
        
        console.log('\n✅ All width optimizer tests completed!');
        console.log('📊 Summary:');
        console.log('   - Short content (< 500 chars): Image format');
        console.log('   - Medium content (500-1500 chars): Embed format');
        console.log('   - Long content (> 1500 chars): Optimized text format');
        console.log('   - Very long content: Split content format');
        console.log('   - All formats tested for comparison');
        
    } catch (error) {
        console.error('❌ Error during width optimizer demo:', error);
    } finally {
        await discordSender.close();
    }
}

// Run demo
demoWidthOptimizer().then(() => {
    console.log('\n🎉 Width optimizer demo finished!');
    console.log('🎯 Tự động chọn format tốt nhất để bypass Discord width limitations!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Width optimizer demo failed:', error);
    process.exit(1);
}); 