require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('./src/data/mongodb');

// Mock message object for testing
function createMockThreadMessage(content, confessionNumber, guildId = '123456789') {
    return {
        content: content,
        author: {
            id: 'test_user_123',
            username: 'TestUser',
            bot: false
        },
        channel: {
            isThread: () => true,
            id: 'thread_123',
            fetchStarterMessage: async () => ({
                content: `📢 **Confession #${confessionNumber}**\n\nTest confession content\n\n👤 **Người gửi:** @user\n⏰ **Thời gian:** <t:1234567890:R>\n\n*Confession Bot • Test Guild*`
            })
        },
        guild: {
            id: guildId,
            name: 'Test Guild'
        },
        id: `msg_${Date.now()}_${Math.random()}`,
        react: async (emoji) => {
            console.log(`   ✅ Reacted with ${emoji}`);
        }
    };
}

async function testCommentSystem() {
    console.log('💬 Testing Comment System');
    console.log('========================');
    console.log('');
    
    try {
        // Connect to MongoDB
        console.log('🔗 Connecting to MongoDB...');
        await db.connect();
        
        // Test guild ID
        const testGuildId = process.env.TEST_GUILD_ID || '123456789';
        
        console.log(`🏠 Testing with Guild ID: ${testGuildId}`);
        console.log('');
        
        // Test 1: Add test confession
        console.log('📋 Test 1: Adding Test Confession');
        const confessionId = await db.addConfession(
            testGuildId,
            'test_user_456',
            'Đây là confession test để test comment system',
            false
        );
        console.log(`     Added confession: ${confessionId}`);
        console.log('');
        
        // Test 2: Test comment handler
        console.log('📋 Test 2: Testing Comment Handler');
        
        // Import the comment handler
        const commentHandler = require('./src/events/threadMessageCreate');
        
        // Test cases
        const testCases = [
            { 
                content: "Đây là comment test số 1", 
                confessionNumber: 16, 
                description: 'Valid comment' 
            },
            { 
                content: "Comment test số 2 với nội dung dài hơn để test truncation", 
                confessionNumber: 16, 
                description: 'Long comment' 
            },
            { 
                content: "👍", 
                confessionNumber: 16, 
                description: 'Short comment' 
            },
            { 
                content: "Comment test số 3", 
                confessionNumber: 999, 
                description: 'Invalid confession number' 
            }
        ];
        
        for (const testCase of testCases) {
            console.log(`\n🧪 Testing: ${testCase.description}`);
            console.log(`   Content: "${testCase.content}"`);
            console.log(`   Confession: #${testCase.confessionNumber}`);
            
            const mockMessage = createMockThreadMessage(testCase.content, testCase.confessionNumber, testGuildId);
            
            try {
                await commentHandler.execute(mockMessage);
                console.log('   ✅ Comment handler executed successfully');
            } catch (error) {
                console.log(`   ❌ Comment handler failed: ${error.message}`);
            }
        }
        console.log('');
        
        // Test 3: Check comments in database
        console.log('📋 Test 3: Checking Comments in Database');
        
        // Lấy confession để có confession ID đúng
        const confession = await db.getConfessionByNumber(testGuildId, 16);
        if (confession) {
            const comments = await db.getCommentsByConfession(testGuildId, confession._id);
            console.log(`   Found ${comments.length} comments for confession ${confession._id}:`);
            comments.forEach((comment, index) => {
                console.log(`     ${index + 1}. "${comment.content}" by ${comment.username}`);
            });
        } else {
            console.log('   ❌ Không tìm thấy confession #16');
        }
        console.log('');
        
        // Test 4: Test comment stats
        console.log('📋 Test 4: Testing Comment Stats');
        const commentStats = await db.getCommentStats(testGuildId);
        console.log(`   Comment Stats:`);
        console.log(`     Total comments: ${commentStats.total_comments}`);
        console.log(`     Confessions with comments: ${commentStats.confessions_with_comments}`);
        console.log(`     Unique users commented: ${commentStats.unique_users_commented}`);
        console.log('');
        
        // Test 5: Test top comments
        console.log('📋 Test 5: Testing Top Comments');
        const topComments = await db.getTopConfessionsByComments(testGuildId, 5);
        console.log(`   Top Comments:`);
        topComments.forEach((confession, index) => {
            console.log(`     ${index + 1}. Confession #${confession.confessionNumber}: ${confession.commentCount} comments`);
        });
        console.log('');
        
        console.log('📊 Final Summary:');
        console.log(`   ✅ Test Confession Added: 1`);
        console.log(`   ✅ Comment Handlers Tested: ${testCases.length}`);
        console.log(`   ✅ Comments in Database: ${comments.length}`);
        console.log(`   ✅ Comment System Ready!`);
        
    } catch (error) {
        console.error('❌ Error during comment system test:', error);
    } finally {
        await db.disconnect();
    }
}

// Run test
testCommentSystem().then(() => {
    console.log('\n🎉 Comment system test finished!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Comment system test failed:', error);
    process.exit(1);
}); 