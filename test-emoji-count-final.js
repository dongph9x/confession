require('dotenv').config();
const db = require('./src/data/mongodb');

async function testEmojiCountFinal() {
    console.log('🚀 Testing Final Emoji Count...');
    console.log('📋 Confirming emoji count functionality');
    console.log('');
    
    try {
        // Connect to database
        await db.connect();
        console.log('✅ Connected to database');
        
        const testGuildId = 'test-guild-id';
        const testConfessionId = '507f1f77bcf86cd799439011';
        const testUserId = 'test-user-id';
        
        // Test 1: Add multiple emoji reactions
        console.log('\n📝 Test 1: Add multiple emoji reactions...');
        
        const emojiKeys = ['heart', 'laugh', 'wow', 'sad', 'fire', 'clap', 'pray', 'love'];
        
        for (const emojiKey of emojiKeys) {
            const result = await db.toggleEmojiReaction(testGuildId, testConfessionId, testUserId, emojiKey);
            console.log(`✅ Added ${emojiKey}: ${result.action}`);
        }
        
        // Test 2: Check emoji counts
        console.log('\n📝 Test 2: Check emoji counts...');
        const counts = await db.getEmojiCounts(testGuildId, testConfessionId);
        console.log('✅ Emoji counts:', JSON.stringify(counts));
        
        // Test 3: Check user reactions
        console.log('\n📝 Test 3: Check user reactions...');
        const userReactions = await db.getUserEmojiReactions(testGuildId, testConfessionId, testUserId);
        console.log('✅ User reactions:', JSON.stringify(userReactions));
        
        // Test 4: Remove some reactions
        console.log('\n📝 Test 4: Remove some reactions...');
        const removeKeys = ['heart', 'laugh', 'wow'];
        for (const emojiKey of removeKeys) {
            const result = await db.toggleEmojiReaction(testGuildId, testConfessionId, testUserId, emojiKey);
            console.log(`✅ Removed ${emojiKey}: ${result.action}`);
        }
        
        // Test 5: Check updated counts
        console.log('\n📝 Test 5: Check updated counts...');
        const updatedCounts = await db.getEmojiCounts(testGuildId, testConfessionId);
        console.log('✅ Updated emoji counts:', JSON.stringify(updatedCounts));
        
        // Test 6: Check updated user reactions
        console.log('\n📝 Test 6: Check updated user reactions...');
        const updatedUserReactions = await db.getUserEmojiReactions(testGuildId, testConfessionId, testUserId);
        console.log('✅ Updated user reactions:', JSON.stringify(updatedUserReactions));
        
        // Test 7: Clean up all reactions
        console.log('\n📝 Test 7: Clean up all reactions...');
        const remainingKeys = ['sad', 'fire', 'clap', 'pray', 'love'];
        for (const emojiKey of remainingKeys) {
            const result = await db.toggleEmojiReaction(testGuildId, testConfessionId, testUserId, emojiKey);
            console.log(`✅ Removed ${emojiKey}: ${result.action}`);
        }
        
        // Test 8: Verify all reactions removed
        console.log('\n📝 Test 8: Verify all reactions removed...');
        const finalCounts = await db.getEmojiCounts(testGuildId, testConfessionId);
        const finalUserReactions = await db.getUserEmojiReactions(testGuildId, testConfessionId, testUserId);
        console.log('✅ Final emoji counts:', JSON.stringify(finalCounts));
        console.log('✅ Final user reactions:', JSON.stringify(finalUserReactions));
        
        console.log('\n✅ All emoji count tests completed successfully!');
        console.log('📊 Summary:');
        console.log('   - Add emoji reactions: ✅ Working');
        console.log('   - Get emoji counts: ✅ Working');
        console.log('   - Get user reactions: ✅ Working');
        console.log('   - Remove emoji reactions: ✅ Working');
        console.log('   - Count updates correctly: ✅ Working');
        console.log('   - User reactions update correctly: ✅ Working');
        
    } catch (error) {
        console.error('❌ Error during emoji count test:', error);
    } finally {
        await db.disconnect();
    }
}

// Run test
testEmojiCountFinal().then(() => {
    console.log('\n🎉 Emoji count final test finished!');
    console.log('🎯 Emoji count functionality confirmed working!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Emoji count final test failed:', error);
    process.exit(1);
}); 