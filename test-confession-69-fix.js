const db = require('./src/data/mongodb.js');

async function testConfession69Fix() {
    try {
        console.log('🔍 Test Confession #69 Fix...');
        
        // Kết nối database
        console.log('🔗 Kết nối database...');
        await db.connect();
        
        const guildId = '1005280612845891615';
        const confessionNumber = 69;
        
        console.log(`\n📊 1. Test với confession #${confessionNumber}:`);
        
        // Test method cũ
        console.log(`   Method cũ: getConfessionByNumberAnyStatus(${guildId}, ${confessionNumber})`);
        const confessionOld = await db.getConfessionByNumberAnyStatus(guildId, confessionNumber);
        if (confessionOld) {
            console.log(`   ✅ Found confession:`);
            console.log(`      ID: ${confessionOld._id}`);
            console.log(`      Guild ID: ${confessionOld.guildId}`);
            console.log(`      Status: ${confessionOld.status}`);
        } else {
            console.log(`   ❌ Confession not found with old method`);
        }
        
        // Test method mới (tìm ở bất kỳ guild nào)
        console.log(`\n   Method mới: getConfessionByNumberAnyStatus(null, ${confessionNumber})`);
        const confessionNew = await db.getConfessionByNumberAnyStatus(null, confessionNumber);
        if (confessionNew) {
            console.log(`   ✅ Found confession:`);
            console.log(`      ID: ${confessionNew._id}`);
            console.log(`      Guild ID: ${confessionNew.guildId}`);
            console.log(`      Status: ${confessionNew.status}`);
            console.log(`      Content: ${confessionNew.content.substring(0, 50)}...`);
        } else {
            console.log(`   ❌ Confession not found with new method`);
        }
        
        // Test với confession có sẵn
        console.log(`\n📊 2. Test với confession có sẵn:`);
        const testConfession = await db.getConfessionByNumberAnyStatus(guildId, 68);
        if (testConfession) {
            console.log(`   ✅ Found confession #68:`);
            console.log(`      ID: ${testConfession._id}`);
            console.log(`      Guild ID: ${testConfession.guildId}`);
            console.log(`      Status: ${testConfession.status}`);
            
            // Test emoji reaction với confession có sẵn
            console.log(`\n🎨 3. Test emoji reaction với confession #68:`);
            const emojiKey = 'heart';
            const toggleResult = await db.toggleEmojiReaction(guildId, testConfession._id, 'test_user_69', emojiKey);
            console.log(`   Toggle result:`, toggleResult);
            
            const emojiCounts = await db.getEmojiCounts(guildId, testConfession._id);
            console.log(`   Emoji counts:`, emojiCounts);
            
            const userReactions = await db.getUserEmojiReactions(guildId, testConfession._id, 'test_user_69');
            console.log(`   User reactions:`, userReactions);
            
            console.log(`   ✅ Emoji reaction test completed`);
            
        } else {
            console.log(`   ❌ Confession #68 not found`);
        }
        
        // Test logic mới
        console.log(`\n📊 4. Test logic mới cho confession #69:`);
        
        // Simulate the new logic
        let confession = await db.getConfessionByNumberAnyStatus(guildId, confessionNumber);
        
        if (!confession) {
            console.log(`   ❌ Confession #${confessionNumber} not found in guild ${guildId}`);
            console.log(`   ⚠️ This confession might be displayed in Discord but not saved in database`);
            
            // Try to find confession in any guild
            const confessionAnyGuild = await db.getConfessionByNumberAnyStatus(null, confessionNumber);
            if (confessionAnyGuild) {
                console.log(`   ✅ Found confession #${confessionNumber} in another guild: ${confessionAnyGuild.guildId}`);
                confession = confessionAnyGuild;
            } else {
                console.log(`   ❌ Confession #${confessionNumber} not found in any guild`);
                console.log(`   💡 This confession is displayed in Discord but not saved in database`);
            }
        } else {
            console.log(`   ✅ Found confession #${confessionNumber} in guild ${guildId}`);
        }
        
        console.log('\n✅ Test hoàn thành!');
        
    } catch (error) {
        console.error('❌ Error trong test:', error);
    } finally {
        await db.disconnect();
    }
}

// Chạy test
testConfession69Fix().then(() => {
    console.log('🎯 Test script completed');
    process.exit(0);
}).catch(error => {
    console.error('💥 Test script failed:', error);
    process.exit(1);
}); 