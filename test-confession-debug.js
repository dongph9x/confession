const db = require('./src/data/mongodb.js');

async function testConfessionDebug() {
    try {
        console.log('🔍 Test Confession Debug...');
        
        // Kết nối database
        console.log('🔗 Kết nối database...');
        await db.connect();
        
        const testGuildId = '1202554844858527744';
        const testUserId = '123456789';
        const testContent = 'Đây là confession test để debug emoji button click';
        
        console.log('\n📝 1. Tạo confession test...');
        const confessionId = await db.addConfession(testGuildId, testUserId, testContent, true);
        console.log(`   ✅ Confession created with ID: ${confessionId}`);
        
        // Lấy confession object
        const confession = await db.getConfession(confessionId);
        console.log(`   ✅ Confession details:`);
        console.log(`      ID: ${confession._id}`);
        console.log(`      Number: ${confession.confessionNumber}`);
        console.log(`      Status: ${confession.status}`);
        console.log(`      Content: ${confession.content}`);
        
        console.log('\n🔍 2. Test tìm confession...');
        const foundConfession = await db.getConfessionByNumberAnyStatus(testGuildId, confession.confessionNumber);
        if (foundConfession) {
            console.log(`   ✅ Found confession:`);
            console.log(`      ID: ${foundConfession._id}`);
            console.log(`      Number: ${foundConfession.confessionNumber}`);
            console.log(`      Status: ${foundConfession.status}`);
        } else {
            console.log(`   ❌ Confession not found!`);
        }
        
        console.log('\n📝 3. Test parsing message content...');
        const testMessageContent = `Confession #${confession.confessionNumber}: ${confession.content}`;
        console.log(`   Message content: "${testMessageContent}"`);
        
        const titleMatch = testMessageContent.match(/Confession #(\d+)/);
        if (titleMatch) {
            const confessionNumber = parseInt(titleMatch[1]);
            console.log(`   ✅ Parsed confession number: ${confessionNumber}`);
            
            // Test tìm confession từ parsed number
            const parsedConfession = await db.getConfessionByNumberAnyStatus(testGuildId, confessionNumber);
            if (parsedConfession) {
                console.log(`   ✅ Found confession from parsed number:`);
                console.log(`      ID: ${parsedConfession._id}`);
                console.log(`      Status: ${parsedConfession.status}`);
            } else {
                console.log(`   ❌ Confession not found from parsed number!`);
            }
        } else {
            console.log(`   ❌ Could not parse confession number`);
        }
        
        console.log('\n🎨 4. Test emoji reactions...');
        const emojiKey = 'heart';
        console.log(`   Testing emoji: ${emojiKey}`);
        
        // Test toggle emoji reaction
        const toggleResult = await db.toggleEmojiReaction(testGuildId, confession._id, testUserId, emojiKey);
        console.log(`   Toggle result:`, toggleResult);
        
        // Test emoji counts
        const emojiCounts = await db.getEmojiCounts(testGuildId, confession._id);
        console.log(`   Emoji counts:`, emojiCounts);
        
        // Test user reactions
        const userReactions = await db.getUserEmojiReactions(testGuildId, confession._id, testUserId);
        console.log(`   User reactions:`, userReactions);
        
        console.log('\n✅ Test hoàn thành!');
        
    } catch (error) {
        console.error('❌ Error trong test:', error);
    } finally {
        await db.disconnect();
    }
}

// Chạy test
testConfessionDebug().then(() => {
    console.log('🎯 Test script completed');
    process.exit(0);
}).catch(error => {
    console.error('💥 Test script failed:', error);
    process.exit(1);
}); 