require('dotenv').config();
const db = require('./src/data/mongodb');

async function testStatsReactionsComments() {
    console.log('📊 Testing Stats for Reactions and Comments');
    console.log('==========================================');
    console.log('');
    
    try {
        // Connect to MongoDB
        console.log('🔗 Connecting to MongoDB...');
        await db.connect();
        
        // Test guild ID (thay bằng guild ID thực của bạn)
        const testGuildId = process.env.TEST_GUILD_ID || '123456789';
        
        console.log(`🏠 Testing with Guild ID: ${testGuildId}`);
        console.log('');
        
        // Test 1: Confession Stats
        console.log('📋 Test 1: Confession Stats');
        const confessionStats = await db.getConfessionStats(testGuildId);
        console.log('   Confession Stats:');
        console.log(`     Total: ${confessionStats.total}`);
        console.log(`     Approved: ${confessionStats.approved}`);
        console.log(`     Pending: ${confessionStats.pending}`);
        console.log(`     Rejected: ${confessionStats.rejected}`);
        console.log('');
        
        // Test 2: Reaction Stats
        console.log('📋 Test 2: Reaction Stats');
        const reactionStats = await db.getReactionStats(testGuildId);
        console.log('   Reaction Stats:');
        console.log(`     Confessions with reactions: ${reactionStats.confessions_with_reactions}`);
        console.log(`     Total reactions: ${reactionStats.total_reactions}`);
        console.log(`     Unique users reacted: ${reactionStats.unique_users_reacted}`);
        console.log('');
        
        // Test 3: Comment Stats
        console.log('📋 Test 3: Comment Stats');
        const commentStats = await db.getCommentStats(testGuildId);
        console.log('   Comment Stats:');
        console.log(`     Confessions with comments: ${commentStats.confessions_with_comments}`);
        console.log(`     Total comments: ${commentStats.total_comments}`);
        console.log(`     Unique users commented: ${commentStats.unique_users_commented}`);
        console.log('');
        
        // Test 4: Add test reactions
        console.log('📋 Test 4: Adding Test Reactions');
        const testConfessionId = '507f1f77bcf86cd799439011'; // Test ObjectId
        const testUserId = '123456789';
        
        // Add some test reactions
        const reactionResults = [];
        const emojiKeys = ['heart', 'like', 'love', 'fire', 'clap'];
        
        for (let i = 0; i < 5; i++) {
            const emojiKey = emojiKeys[i % emojiKeys.length];
            const userId = `${testUserId}_${i}`;
            
            try {
                const result = await db.addEmojiReaction(testGuildId, testConfessionId, userId, emojiKey);
                reactionResults.push({ emojiKey, userId, success: result });
                console.log(`     Added reaction: ${emojiKey} by ${userId} - ${result ? 'Success' : 'Failed'}`);
            } catch (error) {
                console.log(`     Failed to add reaction: ${emojiKey} by ${userId} - ${error.message}`);
            }
        }
        console.log('');
        
        // Test 5: Get emoji counts
        console.log('📋 Test 5: Get Emoji Counts');
        const emojiCounts = await db.getEmojiCounts(testGuildId, testConfessionId);
        console.log('   Emoji Counts:');
        Object.entries(emojiCounts).forEach(([emoji, count]) => {
            console.log(`     ${emoji}: ${count}`);
        });
        console.log('');
        
        // Test 6: Updated Reaction Stats
        console.log('📋 Test 6: Updated Reaction Stats');
        const updatedReactionStats = await db.getReactionStats(testGuildId);
        console.log('   Updated Reaction Stats:');
        console.log(`     Confessions with reactions: ${updatedReactionStats.confessions_with_reactions}`);
        console.log(`     Total reactions: ${updatedReactionStats.total_reactions}`);
        console.log(`     Unique users reacted: ${updatedReactionStats.unique_users_reacted}`);
        console.log('');
        
        // Test 7: Add test comments
        console.log('📋 Test 7: Adding Test Comments');
        const testComments = [
            { content: "Great confession!", username: "User1" },
            { content: "I can relate to this", username: "User2" },
            { content: "Thanks for sharing", username: "User3" }
        ];
        
        const commentResults = [];
        for (let i = 0; i < testComments.length; i++) {
            const comment = testComments[i];
            const userId = `${testUserId}_comment_${i}`;
            const messageId = `msg_${Date.now()}_${i}`;
            const threadId = `thread_${Date.now()}`;
            
            try {
                const commentId = await db.addComment(
                    testGuildId, 
                    testConfessionId, 
                    userId, 
                    comment.username, 
                    comment.content, 
                    messageId, 
                    threadId
                );
                commentResults.push({ commentId, success: true });
                console.log(`     Added comment: "${comment.content}" by ${comment.username} - Success`);
            } catch (error) {
                commentResults.push({ success: false, error: error.message });
                console.log(`     Failed to add comment: "${comment.content}" - ${error.message}`);
            }
        }
        console.log('');
        
        // Test 8: Get comments by confession
        console.log('📋 Test 8: Get Comments by Confession');
        const comments = await db.getCommentsByConfession(testGuildId, testConfessionId);
        console.log(`   Found ${comments.length} comments for confession ${testConfessionId}:`);
        comments.forEach((comment, index) => {
            console.log(`     ${index + 1}. "${comment.content}" by ${comment.username} (${comment.createdAt})`);
        });
        console.log('');
        
        // Test 9: Updated Comment Stats
        console.log('📋 Test 9: Updated Comment Stats');
        const updatedCommentStats = await db.getCommentStats(testGuildId);
        console.log('   Updated Comment Stats:');
        console.log(`     Confessions with comments: ${updatedCommentStats.confessions_with_comments}`);
        console.log(`     Total comments: ${updatedCommentStats.total_comments}`);
        console.log(`     Unique users commented: ${updatedCommentStats.unique_users_commented}`);
        console.log('');
        
        // Test 10: Get user reactions
        console.log('📋 Test 10: Get User Reactions');
        const userReactions = await db.getUserEmojiReactions(testGuildId, testConfessionId, `${testUserId}_0`);
        console.log(`   User reactions for ${testUserId}_0:`);
        userReactions.forEach(reaction => {
            console.log(`     ${reaction.emojiKey} (${reaction.createdAt})`);
        });
        console.log('');
        
        console.log('📊 Final Summary:');
        console.log(`   ✅ Confession Stats: ${confessionStats.total} total confessions`);
        console.log(`   ✅ Reaction Stats: ${updatedReactionStats.total_reactions} total reactions`);
        console.log(`   ✅ Comment Stats: ${updatedCommentStats.total_comments} total comments`);
        console.log(`   ✅ Test Reactions Added: ${reactionResults.filter(r => r.success).length}`);
        console.log(`   ✅ Test Comments Added: ${commentResults.filter(r => r.success).length}`);
        
    } catch (error) {
        console.error('❌ Error during stats test:', error);
    } finally {
        await db.disconnect();
    }
}

// Run test
testStatsReactionsComments().then(() => {
    console.log('\n🎉 Stats test finished!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Stats test failed:', error);
    process.exit(1);
}); 