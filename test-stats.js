const db = require('./src/data/mongodb');

async function testStats() {
    console.log('🧪 Testing Stats Functionality...\n');

    try {
        // Connect to MongoDB
        await db.connect();
        console.log('✅ Connected to MongoDB');

        const guildId = '123456789';

        // Test 1: Initial stats (should be 0)
        console.log('\n1. Testing initial stats...');
        const initialReactionStats = await db.getReactionStats(guildId);
        const initialCommentStats = await db.getCommentStats(guildId);
        
        console.log('✅ Initial reaction stats:', initialReactionStats);
        console.log('✅ Initial comment stats:', initialCommentStats);

        // Test 2: Add some test reactions
        console.log('\n2. Testing reaction tracking...');
        
        // Tạo test confession
        const confession = await db.addConfession(guildId, 'user1', 'Test confession for reactions', false);
        console.log('✅ Created test confession:', confession._id);

        // Thêm reactions
        await db.addReaction(guildId, confession._id, 'user1', '❤️');
        await db.addReaction(guildId, confession._id, 'user2', '❤️');
        await db.addReaction(guildId, confession._id, 'user3', '👍');
        await db.addReaction(guildId, confession._id, 'user1', '😊');
        
        console.log('✅ Added 4 reactions');

        // Test 3: Add some test comments
        console.log('\n3. Testing comment tracking...');
        
        // Thêm comments
        await db.addComment(guildId, confession._id, 'user1', 'msg1', 'thread1', 'Great confession!');
        await db.addComment(guildId, confession._id, 'user2', 'msg2', 'thread1', 'I agree!');
        await db.addComment(guildId, confession._id, 'user3', 'msg3', 'thread1', 'Thanks for sharing');
        
        console.log('✅ Added 3 comments');

        // Test 4: Check updated stats
        console.log('\n4. Testing updated stats...');
        const updatedReactionStats = await db.getReactionStats(guildId);
        const updatedCommentStats = await db.getCommentStats(guildId);
        
        console.log('✅ Updated reaction stats:', updatedReactionStats);
        console.log('✅ Updated comment stats:', updatedCommentStats);

        // Test 5: Test reaction removal
        console.log('\n5. Testing reaction removal...');
        await db.removeReaction(guildId, confession._id, 'user1', '❤️');
        
        const afterRemovalStats = await db.getReactionStats(guildId);
        console.log('✅ Stats after removing reaction:', afterRemovalStats);

        // Test 6: Test with multiple confessions
        console.log('\n6. Testing multiple confessions...');
        
        const confession2 = await db.addConfession(guildId, 'user2', 'Another test confession', true);
        await db.addReaction(guildId, confession2._id, 'user1', '❤️');
        await db.addComment(guildId, confession2._id, 'user1', 'msg4', 'thread2', 'Another comment');
        
        const finalStats = await db.getReactionStats(guildId);
        const finalCommentStats = await db.getCommentStats(guildId);
        
        console.log('✅ Final reaction stats:', finalStats);
        console.log('✅ Final comment stats:', finalCommentStats);

        // Test 7: Test confession stats
        console.log('\n7. Testing confession stats...');
        const confessionStats = await db.getConfessionStats(guildId);
        console.log('✅ Confession stats:', confessionStats);

        console.log('\n🎉 All stats tests completed successfully!');
        
        console.log('\n📊 Final Summary:');
        console.log(`- Confessions: ${confessionStats.total}`);
        console.log(`- Confessions with reactions: ${finalStats.confessions_with_reactions}`);
        console.log(`- Total reactions: ${finalStats.total_reactions}`);
        console.log(`- Unique users reacted: ${finalStats.unique_users_reacted}`);
        console.log(`- Confessions with comments: ${finalCommentStats.confessions_with_comments}`);
        console.log(`- Total comments: ${finalCommentStats.total_comments}`);
        console.log(`- Unique users commented: ${finalCommentStats.unique_users_commented}`);

    } catch (error) {
        console.error('❌ Error during stats test:', error);
    } finally {
        await db.disconnect();
        console.log('\n✅ MongoDB disconnected');
    }
}

// Run the test
testStats(); 