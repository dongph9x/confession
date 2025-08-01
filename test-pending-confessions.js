const { Client, GatewayIntentBits } = require('discord.js');
const db = require('./src/data/mongodb');
require('dotenv').config();

async function testPendingConfessions() {
    console.log('🧪 Testing pending confessions prevention...\n');

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ]
    });

    try {
        await client.login(process.env.BOT_TOKEN);
        console.log('✅ Bot logged in successfully');

        await db.connect();
        console.log('✅ Connected to MongoDB');

        // Test 1: Kiểm tra method getUserPendingConfessions
        console.log('\n🔍 Test 1: Check getUserPendingConfessions Method');
        const testGuildId = '1400498426072010924'; // The Monk's server
        const testUserId = '1362232959322685701'; // Bot ID for testing
        
        const pendingConfessions = await db.getUserPendingConfessions(testGuildId, testUserId);
        console.log('Pending confessions for user:', pendingConfessions.length);
        
        if (pendingConfessions.length > 0) {
            console.log('Found pending confessions:');
            pendingConfessions.forEach((confession, index) => {
                const timeAgo = Math.floor((Date.now() - new Date(confession.createdAt).getTime()) / 1000 / 60);
                console.log(`  ${index + 1}. #${confession._id} - ${confession.content.substring(0, 50)}... (${timeAgo} phút trước)`);
            });
        } else {
            console.log('No pending confessions found for this user');
        }

        // Test 2: Tạo test confession để kiểm tra
        console.log('\n📝 Test 2: Create Test Confession');
        const testConfessionId = await db.addConfession(
            testGuildId,
            testUserId,
            'Test confession để kiểm tra pending prevention',
            false
        );
        console.log('Created test confession:', testConfessionId);

        // Test 3: Kiểm tra lại pending confessions
        console.log('\n🔍 Test 3: Check Pending Confessions After Creation');
        const newPendingConfessions = await db.getUserPendingConfessions(testGuildId, testUserId);
        console.log('Pending confessions after creation:', newPendingConfessions.length);
        
        if (newPendingConfessions.length > 0) {
            const oldestPending = newPendingConfessions[0];
            const timeAgo = Math.floor((Date.now() - new Date(oldestPending.createdAt).getTime()) / 1000 / 60);
            console.log('Oldest pending confession:');
            console.log(`  ID: #${oldestPending._id}`);
            console.log(`  Content: ${oldestPending.content.substring(0, 50)}${oldestPending.content.length > 50 ? '...' : ''}`);
            console.log(`  Time ago: ${timeAgo} phút trước`);
            console.log(`  Status: ${oldestPending.status}`);
        }

        // Test 4: Simulate prevention message
        console.log('\n🚫 Test 4: Simulate Prevention Message');
        if (newPendingConfessions.length > 0) {
            const oldestPending = newPendingConfessions[0];
            const timeAgo = Math.floor((Date.now() - new Date(oldestPending.createdAt).getTime()) / 1000 / 60);
            
            const preventionMessage = `❌ Bạn đã có confession đang chờ duyệt!

\`#${oldestPending._id}\` - ${oldestPending.content.substring(0, 50)}${oldestPending.content.length > 50 ? '...' : ''}

⏰ Đã gửi ${timeAgo} phút trước

Vui lòng chờ confession này được duyệt hoặc từ chối trước khi gửi confession mới.`;
            
            console.log('Prevention message:');
            console.log(preventionMessage);
        }

        // Test 5: Cleanup - Xóa test confession
        console.log('\n🧹 Test 5: Cleanup Test Confession');
        if (testConfessionId) {
            // Note: We can't directly delete from MongoDB in this test, but we can mark it as rejected
            const updatedConfession = await db.updateConfessionStatus(testConfessionId, 'rejected', testUserId);
            console.log('Test confession marked as rejected:', updatedConfession ? 'Success' : 'Failed');
        }

        console.log('\n✅ All pending confessions tests completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await db.disconnect();
        await client.destroy();
        console.log('\n✅ Cleanup completed');
    }
}

// Run the test
testPendingConfessions(); 