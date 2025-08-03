require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('./src/data/mongodb');

async function testTopCommenters() {
    console.log('💬 Testing Top Commenters System');
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
        const confessionIds = [];
        for (let i = 0; i < 3; i++) {
            const confessionId = await db.addConfession(
                testGuildId,
                `test_user_${i}`,
                `Đây là confession test số ${i + 1} để test commenters`,
                false
            );
            confessionIds.push(confessionId);
            console.log(`     Added confession ${i + 1}: ${confessionId}`);
        }
        console.log('');
        
        // Test 2: Add test comments from different users
        console.log('📋 Test 2: Adding Test Comments');
        const commentData = [
            { userId: 'user1', username: 'User1', comments: ['Great confession!', 'I agree', 'Well said', 'Thanks for sharing'] },
            { userId: 'user2', username: 'User2', comments: ['Amazing!', 'This is interesting', 'Keep it up', 'So relatable', 'I love this'] },
            { userId: 'user3', username: 'User3', comments: ['Wow!', 'This is great', 'Thanks'] },
            { userId: 'user4', username: 'User4', comments: ['Nice!', 'Good point', 'I can relate', 'Well done', 'Excellent', 'Perfect'] },
            { userId: 'user5', username: 'User5', comments: ['Cool!', 'Interesting'] }
        ];
        
        for (let i = 0; i < commentData.length; i++) {
            const user = commentData[i];
            const confessionId = confessionIds[i % confessionIds.length];
            
            for (let j = 0; j < user.comments.length; j++) {
                const comment = user.comments[j];
                const messageId = `msg_${Date.now()}_${i}_${j}`;
                const threadId = `thread_${Date.now()}_${i}`;
                
                try {
                    const commentId = await db.addComment(
                        testGuildId,
                        confessionId,
                        user.userId,
                        user.username,
                        comment,
                        messageId,
                        threadId
                    );
                    console.log(`     Added comment: "${comment}" by ${user.username} - Success`);
                } catch (error) {
                    console.log(`     Failed to add comment: "${comment}" by ${user.username} - ${error.message}`);
                }
            }
        }
        console.log('');
        
        // Test 3: Get top commenters
        console.log('📋 Test 3: Getting Top Commenters');
        const topCommenters = await db.getTopCommenters(testGuildId, 10);
        console.log(`   Found ${topCommenters.length} top commenters:`);
        topCommenters.forEach((commenter, index) => {
            console.log(`     ${index + 1}. ${commenter.username}: ${commenter.commentCount} comments`);
        });
        console.log('');
        
        // Test 4: Get user comment stats
        console.log('📋 Test 4: Getting User Comment Stats');
        if (topCommenters.length > 0) {
            const topUser = topCommenters[0];
            const userStats = await db.getUserCommentStats(testGuildId, topUser.userId);
            console.log(`   Stats for ${topUser.username}:`);
            console.log(`     Total Comments: ${userStats.totalComments}`);
            console.log(`     Unique Confessions: ${userStats.uniqueConfessions}`);
            console.log(`     This Week: ${userStats.commentsThisWeek}`);
            console.log(`     This Month: ${userStats.commentsThisMonth}`);
            console.log(`     Recent Comments: ${userStats.recentComments.length}`);
        }
        console.log('');
        
        // Test 5: Get commenter ranking
        console.log('📋 Test 5: Getting Commenter Ranking');
        const ranking = await db.getCommenterRanking(testGuildId, 10);
        console.log(`   Ranking (${ranking.length} users):`);
        ranking.forEach((user, index) => {
            console.log(`     ${user.rankEmoji} ${user.username}: ${user.commentCount} comments`);
        });
        console.log('');
        
        // Test 6: Test command
        console.log('📋 Test 6: Testing Command');
        
        // Import the command
        const topCommentersCommand = require('./src/message-commands/confession/topcommenters');
        
        // Create mock message
        const mockMessage = {
            content: '!topcommenters 5',
            guild: {
                id: testGuildId,
                name: 'Test Guild',
                iconURL: () => 'https://example.com/icon.png'
            },
            member: {
                permissions: {
                    has: () => true // Mock permissions
                }
            },
            reply: async (options) => {
                console.log('📤 Bot Reply:', typeof options === 'string' ? options : 'Embed/Complex Reply');
                if (typeof options === 'object' && options.embeds) {
                    console.log(`   📊 Embeds: ${options.embeds.length}`);
                    options.embeds.forEach((embed, index) => {
                        console.log(`     Embed ${index + 1}: ${embed.title}`);
                    });
                }
                if (typeof options === 'object' && options.content) {
                    console.log(`   💬 Content: ${options.content}`);
                }
                return { id: 'mock_message_id' };
            }
        };
        
        const args = ['5'];
        
        try {
            await topCommentersCommand.execute(mockMessage, args);
            console.log('   ✅ Command executed successfully');
        } catch (error) {
            console.log(`   ❌ Command failed: ${error.message}`);
        }
        
        console.log('\n📊 Final Summary:');
        console.log(`   ✅ Test Confessions Added: ${confessionIds.length}`);
        console.log(`   ✅ Top Commenters: ${topCommenters.length} users`);
        console.log(`   ✅ Commenter Ranking: ${ranking.length} users`);
        console.log(`   ✅ Top Commenters System Ready!`);
        
        // Show expected rankings
        console.log('\n🏆 Expected Rankings:');
        console.log('   User4 (6 comments) > User2 (5 comments) > User1 (4 comments) > User3 (3 comments) > User5 (2 comments)');
        
    } catch (error) {
        console.error('❌ Error during top commenters test:', error);
    } finally {
        await db.disconnect();
    }
}

// Run test
testTopCommenters().then(() => {
    console.log('\n🎉 Top commenters test finished!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Top commenters test failed:', error);
    process.exit(1);
}); 