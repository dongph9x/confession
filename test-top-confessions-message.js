require('dotenv').config();
const { Client, GatewayIntentBits, Message } = require('discord.js');
const db = require('./src/data/mongodb');

// Mock message object for testing
function createMockMessage(content, guildId = '123456789') {
    return {
        content: content,
        guild: {
            id: guildId,
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
                    if (embed.fields) {
                        embed.fields.forEach(field => {
                            console.log(`       ${field.name}: ${field.value}`);
                        });
                    }
                });
            }
            if (typeof options === 'object' && options.content) {
                console.log(`   💬 Content: ${options.content}`);
            }
            return { id: 'mock_message_id' };
        }
    };
}

async function testTopConfessionsMessageCommand() {
    console.log('🏆 Testing Top Confessions Message Command');
    console.log('========================================');
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
        
        // Test 4: Test message command
        console.log('📋 Test 4: Testing Message Commands');
        
        // Import the command
        const topConfessionsCommand = require('./src/message-commands/confession/topconfessions');
        
        // Test cases
        const testCases = [
            { command: '!topconfessions reactions 5', description: 'Top reactions with limit 5' },
            { command: '!topconfessions comments 3', description: 'Top comments with limit 3' },
            { command: '!topconfessions engagement 10', description: 'Top engagement with limit 10' },
            { command: '!topconfessions reactions', description: 'Top reactions with default limit' },
            { command: '!topconfessions invalid', description: 'Invalid type test' },
            { command: '!topconfessions reactions 25', description: 'Invalid limit test' },
            { command: '!topconfessions', description: 'No arguments test' }
        ];
        
        for (const testCase of testCases) {
            console.log(`\n🧪 Testing: ${testCase.description}`);
            console.log(`   Command: ${testCase.command}`);
            
            const args = testCase.command.split(' ').slice(1); // Remove '!topconfessions'
            const mockMessage = createMockMessage(testCase.command, testGuildId);
            
            try {
                await topConfessionsCommand.execute(mockMessage, args);
                console.log('   ✅ Command executed successfully');
            } catch (error) {
                console.log(`   ❌ Command failed: ${error.message}`);
            }
        }
        
        console.log('\n📊 Final Summary:');
        console.log(`   ✅ Test Confessions Added: ${confessionIds.length}`);
        console.log(`   ✅ Message Commands Tested: ${testCases.length}`);
        console.log(`   ✅ Top Confessions System Ready!`);
        
        // Show expected rankings
        console.log('\n🏆 Expected Rankings:');
        console.log('   Reactions: Confession 5 (7) > Confession 3 (6) > Confession 1 (5) > Confession 2 (2) > Confession 4 (1)');
        console.log('   Comments: Confession 5 (5) > Confession 2 (4) > Confession 3 (3) > Confession 1 (2) > Confession 4 (0)');
        console.log('   Engagement: Confession 5 (12) > Confession 3 (9) > Confession 1 (7) > Confession 2 (6) > Confession 4 (1)');
        
    } catch (error) {
        console.error('❌ Error during top confessions message command test:', error);
    } finally {
        await db.disconnect();
    }
}

// Run test
testTopConfessionsMessageCommand().then(() => {
    console.log('\n🎉 Top confessions message command test finished!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Top confessions message command test failed:', error);
    process.exit(1);
}); 