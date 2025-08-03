const db = require('./src/data/mongodb.js');

async function testConfession74Emoji() {
    try {
        console.log('🔍 Test Confession #74 Emoji...');
        
        // Kết nối database
        console.log('🔗 Kết nối database...');
        await db.connect();
        
        const guildId = '1005280612845891615';
        const confessionNumber = 74;
        
        console.log(`\n📊 1. Kiểm tra confession #${confessionNumber}:`);
        
        // Tìm confession
        const confession = await db.getConfessionByNumberAnyStatus(guildId, confessionNumber);
        if (confession) {
            console.log(`   ✅ Found confession:`);
            console.log(`      ID: ${confession._id}`);
            console.log(`      Number: ${confession.confessionNumber}`);
            console.log(`      Status: ${confession.status}`);
            console.log(`      Content: ${confession.content.substring(0, 50)}...`);
        } else {
            console.log(`   ❌ Confession not found`);
            return;
        }
        
        // Test emoji reaction
        console.log(`\n🎨 2. Test emoji reaction với confession #${confessionNumber}:`);
        
        const emojiKey = 'heart';
        console.log(`   Testing emoji: ${emojiKey}`);
        
        try {
            const toggleResult = await db.toggleEmojiReaction(guildId, confession._id, 'test_user_74', emojiKey);
            console.log(`   Toggle result:`, toggleResult);
            
            const emojiCounts = await db.getEmojiCounts(guildId, confession._id);
            console.log(`   Emoji counts:`, emojiCounts);
            
            const userReactions = await db.getUserEmojiReactions(guildId, confession._id, 'test_user_74');
            console.log(`   User reactions:`, userReactions);
            
            console.log(`   ✅ Emoji reaction test completed`);
            
        } catch (error) {
            console.log(`   ❌ Error testing emoji reaction: ${error.message}`);
        }
        
        // Test parsing logic
        console.log(`\n🔍 3. Test parsing logic với confession #${confessionNumber}:`);
        
        const testMessageContent = `📢 **Confession #${confessionNumber}**\n\n${confession.content}\n\n👤 **Người gửi:** <@1397381362763169853>\n⏰ **Thời gian:** <t:1754210536:R>\n\n*Confession Bot • The Monk's server*`;
        console.log(`   Test message content: "${testMessageContent.substring(0, 100)}..."`);
        
        // Simulate parsing logic
        let parsedConfessionNumber = null;
        
        // Method 1: Tìm từ message content
        if (testMessageContent) {
            const titleMatch = testMessageContent.match(/Confession #(\d+)/);
            if (titleMatch) {
                parsedConfessionNumber = parseInt(titleMatch[1]);
                console.log(`   ✅ Found confession number from content: ${parsedConfessionNumber}`);
            }
        }
        
        if (parsedConfessionNumber) {
            // Test tìm confession trong database
            const foundConfession = await db.getConfessionByNumberAnyStatus(guildId, parsedConfessionNumber);
            if (foundConfession) {
                console.log(`   ✅ Found confession in database:`);
                console.log(`      ID: ${foundConfession._id}`);
                console.log(`      Status: ${foundConfession.status}`);
                
                // Test emoji reaction
                console.log(`   🎨 Testing emoji reaction with parsed confession:`);
                const toggleResult = await db.toggleEmojiReaction(guildId, foundConfession._id, 'test_user_74', 'laugh');
                console.log(`   Toggle result:`, toggleResult);
                
                const emojiCounts = await db.getEmojiCounts(guildId, foundConfession._id);
                console.log(`   Emoji counts:`, emojiCounts);
                
                console.log(`   ✅ Emoji reaction test completed with parsed confession`);
                
            } else {
                console.log(`   ❌ Confession not found in database`);
            }
        } else {
            console.log(`   ❌ Could not parse confession number`);
        }
        
        // Test với confession #73 để so sánh
        console.log(`\n📊 4. Test với confession #73 để so sánh:`);
        const confession73 = await db.getConfessionByNumberAnyStatus(guildId, 73);
        if (confession73) {
            console.log(`   ✅ Found confession #73:`);
            console.log(`      ID: ${confession73._id}`);
            console.log(`      Status: ${confession73.status}`);
            
            // Test emoji reaction với confession #73
            console.log(`   🎨 Testing emoji reaction với confession #73:`);
            const toggleResult73 = await db.toggleEmojiReaction(guildId, confession73._id, 'test_user_74', emojiKey);
            console.log(`   Toggle result:`, toggleResult73);
            
            const emojiCounts73 = await db.getEmojiCounts(guildId, confession73._id);
            console.log(`   Emoji counts:`, emojiCounts73);
            
            console.log(`   ✅ Emoji reaction test completed for confession #73`);
            
        } else {
            console.log(`   ❌ Confession #73 not found`);
        }
        
        console.log('\n✅ Test hoàn thành!');
        
    } catch (error) {
        console.error('❌ Error trong test:', error);
    } finally {
        await db.disconnect();
    }
}

// Chạy test
testConfession74Emoji().then(() => {
    console.log('🎯 Test script completed');
    process.exit(0);
}).catch(error => {
    console.error('💥 Test script failed:', error);
    process.exit(1);
}); 