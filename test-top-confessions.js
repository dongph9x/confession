require('dotenv').config();
const db = require('./src/data/mongodb');

async function testTopConfessions() {
    console.log('🏆 Testing Top Confessions System');
    console.log('================================');
    console.log('');
    
    try {
        // Connect to MongoDB
        console.log('🔗 Connecting to MongoDB...');
        await db.connect();
        
        // Test guild ID
        const testGuildId = process.env.TEST_GUILD_ID || '123456789';
        
        console.log(`🏠 Testing with Guild ID: ${testGuildId}`);
        console.log('');
        
        // Test 1: Add test confessions
        console.log('📋 Test 1: Adding Test Confessions');
        const testConfessions = [
            { content: "Đây là confession test số 1 với nhiều reactions", userId: "user1", isAnonymous: false },
            { content: "Đây là confession test số 2 với nhiều comments", userId: "user2", isAnonymous: true },
            { content: "Đây là confession test số 3 với cả reactions và comments", userId: "user3", isAnonymous: false },
            { content: "Đây là confession test số 4 ít engagement", userId: "user4", isAnonymous: true },
            { content: "Đây là confession test số 5 popular", userId: "user5", isAnonymous: false }
        ];
        
        const confessionIds = [];
        for (let i = 0; i < testConfessions.length; i++) {
            const confession = testConfessions[i];
            try {
                const confessionId = await db.addConfession(
                    testGuildId,
                    confession.userId,
                    confession.content,
                    confession.isAnonymous
                );
                confessionIds.push(confessionId);
                console.log(`     Added confession ${i + 1}: ${confession.content.substring(0, 30)}...`);
            } catch (error) {
                console.log(`     Failed to add confession ${i + 1}: ${error.message}`);
            }
        }
        console.log('');
        
        // Test 2: Add test reactions
        console.log('📋 Test 2: Adding Test Reactions');
        const reactionData = [
            { confessionIndex: 0, reactions: ['heart', 'heart', 'heart', 'like', 'love'] }, // 5 reactions
            { confessionIndex: 1, reactions: ['heart', 'like'] }, // 2 reactions
            { confessionIndex: 2, reactions: ['heart', 'heart', 'like', 'love', 'fire', 'clap'] }, // 6 reactions
            { confessionIndex: 3, reactions: ['heart'] }, // 1 reaction
            { confessionIndex: 4, reactions: ['heart', 'heart', 'like', 'love', 'fire', 'clap', 'pray'] } // 7 reactions
        ];
        
        for (let i = 0; i < reactionData.length; i++) {
            const data = reactionData[i];
            const confessionId = confessionIds[data.confessionIndex];
            
            for (let j = 0; j < data.reactions.length; j++) {
                const emojiKey = data.reactions[j];
                const userId = `reactor_${i}_${j}`;
                
                try {
                    const result = await db.addEmojiReaction(testGuildId, confessionId, userId, emojiKey);
                    console.log(`     Added reaction: ${emojiKey} to confession ${data.confessionIndex + 1} by ${userId} - ${result ? 'Success' : 'Failed'}`);
                } catch (error) {
                    console.log(`     Failed to add reaction: ${emojiKey} to confession ${data.confessionIndex + 1} - ${error.message}`);
                }
            }
        }
        console.log('');
        
        // Test 3: Add test comments
        console.log('📋 Test 3: Adding Test Comments');
        const commentData = [
            { confessionIndex: 0, comments: ["Great confession!", "I can relate"] }, // 2 comments
            { confessionIndex: 1, comments: ["Thanks for sharing", "This is interesting", "I agree", "Well said"] }, // 4 comments
            { confessionIndex: 2, comments: ["Amazing!", "Keep it up", "This is so true"] }, // 3 comments
            { confessionIndex: 3, comments: [] }, // 0 comments
            { confessionIndex: 4, comments: ["Wow!", "This is great", "I love this", "So relatable", "Thanks"] } // 5 comments
        ];
        
        for (let i = 0; i < commentData.length; i++) {
            const data = commentData[i];
            const confessionId = confessionIds[data.confessionIndex];
            
            for (let j = 0; j < data.comments.length; j++) {
                const comment = data.comments[j];
                const userId = `commenter_${i}_${j}`;
                const username = `User${i}_${j}`;
                const messageId = `msg_${Date.now()}_${i}_${j}`;
                const threadId = `thread_${Date.now()}_${i}`;
                
                try {
                    const commentId = await db.addComment(
                        testGuildId,
                        confessionId,
                        userId,
                        username,
                        comment,
                        messageId,
                        threadId
                    );
                    console.log(`     Added comment: "${comment}" to confession ${data.confessionIndex + 1} by ${username} - Success`);
                } catch (error) {
                    console.log(`     Failed to add comment: "${comment}" to confession ${data.confessionIndex + 1} - ${error.message}`);
                }
            }
        }
        console.log('');
        
        // Test 4: Get top confessions by reactions
        console.log('📋 Test 4: Top Confessions by Reactions');
        const topReactions = await db.getTopConfessionsByReactions(testGuildId, 5);
        console.log(`   Found ${topReactions.length} top confessions by reactions:`);
        topReactions.forEach((confession, index) => {
            console.log(`     ${index + 1}. Confession #${confession.confessionNumber}: ${confession.reactionCount} reactions by ${confession.uniqueUsersCount} users`);
        });
        console.log('');
        
        // Test 5: Get top confessions by comments
        console.log('📋 Test 5: Top Confessions by Comments');
        const topComments = await db.getTopConfessionsByComments(testGuildId, 5);
        console.log(`   Found ${topComments.length} top confessions by comments:`);
        topComments.forEach((confession, index) => {
            console.log(`     ${index + 1}. Confession #${confession.confessionNumber}: ${confession.commentCount} comments by ${confession.uniqueUsersCount} users`);
        });
        console.log('');
        
        // Test 6: Get top confessions by engagement
        console.log('📋 Test 6: Top Confessions by Engagement');
        const topEngagement = await db.getTopConfessionsByEngagement(testGuildId, 5);
        console.log(`   Found ${topEngagement.length} top confessions by engagement:`);
        topEngagement.forEach((confession, index) => {
            console.log(`     ${index + 1}. Confession #${confession.confessionNumber}: ${confession.reactionCount} reactions + ${confession.commentCount} comments = ${confession.totalEngagement} total`);
        });
        console.log('');
        
        // Test 7: Get engagement stats for specific confession
        console.log('📋 Test 7: Engagement Stats for Specific Confession');
        if (confessionIds.length > 0) {
            const engagementStats = await db.getConfessionEngagementStats(testGuildId, confessionIds[0]);
            console.log(`   Engagement stats for confession ${confessionIds[0]}:`);
            console.log(`     Reactions: ${engagementStats.reactionCount}`);
            console.log(`     Comments: ${engagementStats.commentCount}`);
            console.log(`     Total engagement: ${engagementStats.totalEngagement}`);
            console.log(`     Unique users reacted: ${engagementStats.uniqueUsersReacted}`);
            console.log(`     Unique users commented: ${engagementStats.uniqueUsersCommented}`);
            console.log(`     Reaction breakdown:`);
            engagementStats.reactionBreakdown.forEach(breakdown => {
                console.log(`       ${breakdown._id}: ${breakdown.count}`);
            });
        }
        console.log('');
        
        console.log('📊 Final Summary:');
        console.log(`   ✅ Test Confessions Added: ${confessionIds.length}`);
        console.log(`   ✅ Top Reactions: ${topReactions.length} confessions`);
        console.log(`   ✅ Top Comments: ${topComments.length} confessions`);
        console.log(`   ✅ Top Engagement: ${topEngagement.length} confessions`);
        
        // Show expected rankings
        console.log('\n🏆 Expected Rankings:');
        console.log('   Reactions: Confession 5 (7) > Confession 3 (6) > Confession 1 (5) > Confession 2 (2) > Confession 4 (1)');
        console.log('   Comments: Confession 5 (5) > Confession 2 (4) > Confession 3 (3) > Confession 1 (2) > Confession 4 (0)');
        console.log('   Engagement: Confession 5 (12) > Confession 3 (9) > Confession 1 (7) > Confession 2 (6) > Confession 4 (1)');
        
    } catch (error) {
        console.error('❌ Error during top confessions test:', error);
    } finally {
        await db.disconnect();
    }
}

// Run test
testTopConfessions().then(() => {
    console.log('\n🎉 Top confessions test finished!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Top confessions test failed:', error);
    process.exit(1);
}); 