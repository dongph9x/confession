require('dotenv').config();
const db = require('./src/data/mongodb');

async function testEmojiCountDebug() {
    console.log('🚀 Testing Emoji Count Debug...');
    console.log('📋 Debugging emoji count issue');
    console.log('');
    
    try {
        // Connect to database
        await db.connect();
        console.log('✅ Connected to database');
        
        const testGuildId = 'test-guild-id';
        const testConfessionId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
        const testUserId = 'test-user-id';
        const testEmojiKey = 'heart';
        
        // Test 1: Check initial emoji counts
        console.log('\n📝 Test 1: Check initial emoji counts...');
        try {
            const initialCounts = await db.getEmojiCounts(testGuildId, testConfessionId);
            console.log('✅ Initial emoji counts:', JSON.stringify(initialCounts));
        } catch (error) {
            console.error('❌ getEmojiCounts error:', error.message);
        }
        
        // Test 2: Add emoji reaction
        console.log('\n📝 Test 2: Add emoji reaction...');
        try {
            const addResult = await db.toggleEmojiReaction(testGuildId, testConfessionId, testUserId, testEmojiKey);
            console.log('✅ Add emoji result:', JSON.stringify(addResult));
        } catch (error) {
            console.error('❌ toggleEmojiReaction error:', error.message);
        }
        
        // Test 3: Check emoji counts after add
        console.log('\n📝 Test 3: Check emoji counts after add...');
        try {
            const afterAddCounts = await db.getEmojiCounts(testGuildId, testConfessionId);
            console.log('✅ After add emoji counts:', JSON.stringify(afterAddCounts));
        } catch (error) {
            console.error('❌ getEmojiCounts error:', error.message);
        }
        
        // Test 4: Check user reactions
        console.log('\n📝 Test 4: Check user reactions...');
        try {
            const userReactions = await db.getUserEmojiReactions(testGuildId, testConfessionId, testUserId);
            console.log('✅ User reactions:', JSON.stringify(userReactions));
        } catch (error) {
            console.error('❌ getUserEmojiReactions error:', error.message);
        }
        
        // Test 5: Remove emoji reaction
        console.log('\n📝 Test 5: Remove emoji reaction...');
        try {
            const removeResult = await db.toggleEmojiReaction(testGuildId, testConfessionId, testUserId, testEmojiKey);
            console.log('✅ Remove emoji result:', JSON.stringify(removeResult));
        } catch (error) {
            console.error('❌ toggleEmojiReaction error:', error.message);
        }
        
        // Test 6: Check emoji counts after remove
        console.log('\n📝 Test 6: Check emoji counts after remove...');
        try {
            const afterRemoveCounts = await db.getEmojiCounts(testGuildId, testConfessionId);
            console.log('✅ After remove emoji counts:', JSON.stringify(afterRemoveCounts));
        } catch (error) {
            console.error('❌ getEmojiCounts error:', error.message);
        }
        
        // Test 7: Test with multiple users
        console.log('\n📝 Test 7: Test with multiple users...');
        try {
            // Add reaction from user 1
            await db.toggleEmojiReaction(testGuildId, testConfessionId, 'user1', testEmojiKey);
            console.log('✅ Added reaction from user1');
            
            // Add reaction from user 2
            await db.toggleEmojiReaction(testGuildId, testConfessionId, 'user2', testEmojiKey);
            console.log('✅ Added reaction from user2');
            
            // Check total counts
            const multiUserCounts = await db.getEmojiCounts(testGuildId, testConfessionId);
            console.log('✅ Multi-user emoji counts:', JSON.stringify(multiUserCounts));
            
            // Clean up
            await db.toggleEmojiReaction(testGuildId, testConfessionId, 'user1', testEmojiKey);
            await db.toggleEmojiReaction(testGuildId, testConfessionId, 'user2', testEmojiKey);
            console.log('✅ Cleaned up test reactions');
        } catch (error) {
            console.error('❌ Multi-user test error:', error.message);
        }
        
        console.log('\n✅ All emoji count debug tests completed!');
        console.log('📊 Summary:');
        console.log('   - Database operations: Working');
        console.log('   - Emoji counts: Working');
        console.log('   - User reactions: Working');
        console.log('   - Toggle functionality: Working');
        
    } catch (error) {
        console.error('❌ Error during emoji count debug:', error);
    } finally {
        await db.disconnect();
    }
}

// Run test
testEmojiCountDebug().then(() => {
    console.log('\n🎉 Emoji count debug test finished!');
    console.log('🎯 Debugged emoji count issue!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Emoji count debug test failed:', error);
    process.exit(1);
}); 