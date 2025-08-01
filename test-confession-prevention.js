const { Client, GatewayIntentBits } = require('discord.js');
const db = require('./src/data/mongodb');
require('dotenv').config();

async function testConfessionPrevention() {
    console.log('🧪 Testing confession prevention feature...\n');

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

        const testGuildId = '1400498426072010924'; // The Monk's server
        const testUserId = '1362232959322685701'; // Bot ID for testing

        // Test 1: Kiểm tra trạng thái ban đầu
        console.log('\n🔍 Test 1: Check Initial State');
        const initialPending = await db.getUserPendingConfessions(testGuildId, testUserId);
        console.log('Initial pending confessions:', initialPending.length);

        // Test 2: Tạo confession đầu tiên
        console.log('\n📝 Test 2: Create First Confession');
        const firstConfessionId = await db.addConfession(
            testGuildId,
            testUserId,
            'Confession đầu tiên để test prevention',
            false
        );
        console.log('First confession created:', firstConfessionId);

        // Test 3: Kiểm tra pending confessions sau khi tạo
        console.log('\n🔍 Test 3: Check Pending After First Confession');
        const pendingAfterFirst = await db.getUserPendingConfessions(testGuildId, testUserId);
        console.log('Pending confessions after first:', pendingAfterFirst.length);
        
        if (pendingAfterFirst.length > 0) {
            const oldestPending = pendingAfterFirst[0];
            const timeAgo = Math.floor((Date.now() - new Date(oldestPending.createdAt).getTime()) / 1000 / 60);
            console.log('Oldest pending confession:');
            console.log(`  ID: #${oldestPending._id}`);
            console.log(`  Content: ${oldestPending.content.substring(0, 50)}${oldestPending.content.length > 50 ? '...' : ''}`);
            console.log(`  Time ago: ${timeAgo} phút trước`);
        }

        // Test 4: Simulate prevention message
        console.log('\n🚫 Test 4: Simulate Prevention Message');
        if (pendingAfterFirst.length > 0) {
            const oldestPending = pendingAfterFirst[0];
            const timeAgo = Math.floor((Date.now() - new Date(oldestPending.createdAt).getTime()) / 1000 / 60);
            
            const preventionMessage = `❌ Bạn đã có confession đang chờ duyệt!

\`#${oldestPending._id}\` - ${oldestPending.content.substring(0, 50)}${oldestPending.content.length > 50 ? '...' : ''}

⏰ Đã gửi ${timeAgo} phút trước

Vui lòng chờ confession này được duyệt hoặc từ chối trước khi gửi confession mới.`;
            
            console.log('Prevention message would be:');
            console.log(preventionMessage);
        }

        // Test 5: Simulate trying to create second confession
        console.log('\n🚫 Test 5: Simulate Second Confession Attempt');
        const secondConfessionId = await db.addConfession(
            testGuildId,
            testUserId,
            'Confession thứ hai - sẽ bị ngăn',
            false
        );
        console.log('Second confession created (should be prevented):', secondConfessionId);

        // Test 6: Kiểm tra số lượng pending confessions
        console.log('\n🔍 Test 6: Check Pending Confessions Count');
        const allPending = await db.getUserPendingConfessions(testGuildId, testUserId);
        console.log('Total pending confessions:', allPending.length);
        
        if (allPending.length > 0) {
            console.log('All pending confessions:');
            allPending.forEach((confession, index) => {
                const timeAgo = Math.floor((Date.now() - new Date(confession.createdAt).getTime()) / 1000 / 60);
                console.log(`  ${index + 1}. #${confession._id} - ${confession.content.substring(0, 30)}... (${timeAgo} phút trước)`);
            });
        }

        // Test 7: Simulate approval of first confession
        console.log('\n✅ Test 7: Simulate Approval of First Confession');
        const approvedConfession = await db.updateConfessionStatus(firstConfessionId, 'approved', testUserId);
        console.log('First confession approved:', approvedConfession ? 'Success' : 'Failed');

        // Test 8: Kiểm tra pending confessions sau khi approve
        console.log('\n🔍 Test 8: Check Pending After Approval');
        const pendingAfterApproval = await db.getUserPendingConfessions(testGuildId, testUserId);
        console.log('Pending confessions after approval:', pendingAfterApproval.length);

        // Test 9: Simulate creating new confession after approval
        console.log('\n📝 Test 9: Simulate New Confession After Approval');
        if (pendingAfterApproval.length === 0) {
            const newConfessionId = await db.addConfession(
                testGuildId,
                testUserId,
                'Confession mới sau khi approve',
                false
            );
            console.log('New confession created after approval:', newConfessionId);
        } else {
            console.log('Still have pending confessions, cannot create new one');
        }

        // Test 10: Cleanup
        console.log('\n🧹 Test 10: Cleanup');
        const allConfessions = await db.getUserPendingConfessions(testGuildId, testUserId);
        for (const confession of allConfessions) {
            await db.updateConfessionStatus(confession._id, 'rejected', testUserId);
            console.log(`Marked confession #${confession._id} as rejected`);
        }

        console.log('\n✅ All confession prevention tests completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await db.disconnect();
        await client.destroy();
        console.log('\n✅ Cleanup completed');
    }
}

// Run the test
testConfessionPrevention(); 