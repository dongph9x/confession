const db = require('./src/data/mongodb.js');

async function testSimpleEmojiDebug() {
    try {
        console.log('🔍 Test Simple Emoji Debug...');
        
        // Kết nối database
        console.log('🔗 Kết nối database...');
        await db.connect();
        
        // 1. Tạo confession test
        console.log('\n📝 1. Tạo confession test...');
        const testContent = 'Đây là confession test để test emoji button click logic';
        const confessionId = await db.addConfession('1202554844858527744', 'test_user_simple', testContent, true);
        const confession = await db.getConfession(confessionId);
        
        console.log(`   ✅ Confession created:`);
        console.log(`      ID: ${confession._id}`);
        console.log(`      Number: ${confession.confessionNumber}`);
        console.log(`      Status: ${confession.status}`);
        console.log(`      Content: ${confession.content}`);
        
        // 2. Test các trường hợp message content thực tế
        console.log('\n📝 2. Test các trường hợp message content thực tế:');
        
        const testCases = [
            {
                name: 'Plain text confession',
                content: `📢 **Confession #${confession.confessionNumber}**\n\n${confession.content}\n\n👤 **Người gửi:** 🕵️ Ẩn danh\n⏰ **Thời gian:** <t:1234567890:R>\n\n*Confession Bot • Test Guild*`,
                embeds: []
            },
            {
                name: 'Empty content with embed',
                content: '',
                embeds: [{
                    title: `📢 **Confession #${confession.confessionNumber}**`,
                    description: `${confession.content}\n\n👤 **Người gửi:** 🕵️ Ẩn danh\n⏰ **Thời gian:** <t:1234567890:R>`
                }]
            },
            {
                name: 'Image confession (empty content)',
                content: '',
                embeds: []
            },
            {
                name: 'Mixed content',
                content: `Some prefix Confession #${confession.confessionNumber}: ${confession.content}`,
                embeds: []
            }
        ];
        
        for (let index = 0; index < testCases.length; index++) {
            const testCase = testCases[index];
            console.log(`\n   Test Case ${index + 1}: ${testCase.name}`);
            console.log(`     Content: "${testCase.content}"`);
            console.log(`     Content length: ${testCase.content.length}`);
            console.log(`     Embeds: ${testCase.embeds.length}`);
            
            // Simulate the exact parsing logic from buttonInteractionCreate.js
            let confessionNumber = null;
            
            // Method 1: Tìm từ message content
            if (testCase.content) {
                const titleMatch = testCase.content.match(/Confession #(\d+)/);
                if (titleMatch) {
                    confessionNumber = parseInt(titleMatch[1]);
                    console.log(`     ✅ Found confession number from content: ${confessionNumber}`);
                }
            }
            
            // Method 2: Tìm từ embeds nếu content rỗng
            if (!confessionNumber && testCase.embeds.length > 0) {
                const embed = testCase.embeds[0];
                console.log(`     Checking embed: "${embed.title}"`);
                
                if (embed.title) {
                    const titleMatch = embed.title.match(/Confession #(\d+)/);
                    if (titleMatch) {
                        confessionNumber = parseInt(titleMatch[1]);
                        console.log(`     ✅ Found confession number from embed title: ${confessionNumber}`);
                    }
                }
                
                if (!confessionNumber && embed.description) {
                    const descMatch = embed.description.match(/Confession #(\d+)/);
                    if (descMatch) {
                        confessionNumber = parseInt(descMatch[1]);
                        console.log(`     ✅ Found confession number from embed description: ${confessionNumber}`);
                    }
                }
            }
            
            // Method 3: Tìm từ custom ID của button (fallback)
            if (!confessionNumber) {
                const customId = `emoji_heart_${confession.confessionNumber}`;
                const customIdParts = customId.split('_');
                if (customIdParts.length > 1) {
                    const possibleConfessionId = customIdParts[customIdParts.length - 1];
                    if (possibleConfessionId && !isNaN(possibleConfessionId)) {
                        confessionNumber = parseInt(possibleConfessionId);
                        console.log(`     ✅ Found confession number from custom ID: ${confessionNumber}`);
                    }
                }
            }
            
            if (!confessionNumber) {
                console.log(`     ❌ No confession number found - SẼ GÂY LỖI "❌ Không thể xác định confession!"`);
            } else {
                // Test tìm confession trong database
                try {
                    const foundConfession = await db.getConfessionByNumberAnyStatus('1202554844858527744', confessionNumber);
                    if (foundConfession) {
                        console.log(`     ✅ Found confession in database:`);
                        console.log(`        ID: ${foundConfession._id}`);
                        console.log(`        Status: ${foundConfession.status}`);
                        
                        // Test emoji reaction
                        console.log(`     🎨 Testing emoji reaction...`);
                        const emojiKey = 'heart';
                        const toggleResult = await db.toggleEmojiReaction('1202554844858527744', foundConfession._id, 'test_user_simple', emojiKey);
                        console.log(`        Toggle result:`, toggleResult);
                        
                        const emojiCounts = await db.getEmojiCounts('1202554844858527744', foundConfession._id);
                        console.log(`        Emoji counts:`, emojiCounts);
                        
                        console.log(`     ✅ Emoji reaction test completed`);
                        
                    } else {
                        console.log(`     ❌ Confession not found in database - SẼ GÂY LỖI "❌ Không tìm thấy confession!"`);
                    }
                } catch (error) {
                    console.log(`     ❌ Error finding confession: ${error.message}`);
                }
            }
        }
        
        // 3. Test với confession thực tế từ database
        console.log('\n🎯 3. Test với confession thực tế từ database:');
        const Confession = require('./src/models/Confession');
        const allConfessions = await Confession.find({ guildId: '1202554844858527744' }).sort({ confessionNumber: -1 }).limit(3);
        
        console.log(`   Tổng số confessions: ${allConfessions.length}`);
        allConfessions.forEach((conf, index) => {
            console.log(`   ${index + 1}. Confession #${conf.confessionNumber}: ${conf.content.substring(0, 30)}... (Status: ${conf.status})`);
        });
        
        if (allConfessions.length > 0) {
            const testConfession = allConfessions[0];
            console.log(`\n   Testing với confession #${testConfession.confessionNumber}:`);
            
            // Test tìm confession
            const foundConfession = await db.getConfessionByNumberAnyStatus('1202554844858527744', testConfession.confessionNumber);
            if (foundConfession) {
                console.log(`   ✅ Found confession in database`);
                console.log(`      ID: ${foundConfession._id}`);
                console.log(`      Status: ${foundConfession.status}`);
                
                // Test emoji reaction
                console.log(`   🎨 Testing emoji reaction...`);
                const emojiKey = 'heart';
                const toggleResult = await db.toggleEmojiReaction('1202554844858527744', foundConfession._id, 'test_user_simple', emojiKey);
                console.log(`      Toggle result:`, toggleResult);
                
                const emojiCounts = await db.getEmojiCounts('1202554844858527744', foundConfession._id);
                console.log(`      Emoji counts:`, emojiCounts);
                
                console.log(`   ✅ Emoji reaction test completed`);
                
            } else {
                console.log(`   ❌ Confession not found in database`);
            }
        }
        
        console.log('\n✅ Test hoàn thành!');
        
    } catch (error) {
        console.error('❌ Error trong test:', error);
    } finally {
        await db.disconnect();
    }
}

// Chạy test
testSimpleEmojiDebug().then(() => {
    console.log('🎯 Test script completed');
    process.exit(0);
}).catch(error => {
    console.error('💥 Test script failed:', error);
    process.exit(1);
}); 