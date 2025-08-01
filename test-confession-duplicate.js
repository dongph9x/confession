const { Client, GatewayIntentBits } = require('discord.js');
const db = require('./src/data/mongodb');
require('dotenv').config();

async function testConfessionDuplicate() {
    console.log('🧪 Testing confession duplicate creation...\n');

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

        // Test 2: Tạo confession và kiểm tra
        console.log('\n📝 Test 2: Create Confession and Check');
        const confessionId1 = await db.addConfession(
            testGuildId,
            testUserId,
            'Test confession để kiểm tra duplicate',
            false
        );
        console.log('Confession 1 created:', confessionId1);

        // Test 3: Kiểm tra pending confessions ngay lập tức
        console.log('\n🔍 Test 3: Check Pending Confessions Immediately');
        const pendingAfterFirst = await db.getUserPendingConfessions(testGuildId, testUserId);
        console.log('Pending confessions after first:', pendingAfterFirst.length);
        
        if (pendingAfterFirst.length > 0) {
            console.log('All pending confessions:');
            pendingAfterFirst.forEach((confession, index) => {
                const timeAgo = Math.floor((Date.now() - new Date(confession.createdAt).getTime()) / 1000 / 60);
                console.log(`  ${index + 1}. #${confession._id} - ${confession.content.substring(0, 30)}... (${timeAgo} phút trước)`);
            });
        }

        // Test 4: Tạo confession thứ hai để test prevention
        console.log('\n🚫 Test 4: Try to Create Second Confession');
        const confessionId2 = await db.addConfession(
            testGuildId,
            testUserId,
            'Test confession thứ hai - sẽ bị ngăn',
            false
        );
        console.log('Confession 2 created (should be prevented):', confessionId2);

        // Test 5: Kiểm tra lại pending confessions
        console.log('\n🔍 Test 5: Check Pending Confessions After Second');
        const pendingAfterSecond = await db.getUserPendingConfessions(testGuildId, testUserId);
        console.log('Pending confessions after second:', pendingAfterSecond.length);
        
        if (pendingAfterSecond.length > 0) {
            console.log('All pending confessions:');
            pendingAfterSecond.forEach((confession, index) => {
                const timeAgo = Math.floor((Date.now() - new Date(confession.createdAt).getTime()) / 1000 / 60);
                console.log(`  ${index + 1}. #${confession._id} - ${confession.content.substring(0, 30)}... (${timeAgo} phút trước)`);
            });
        }

        // Test 6: Kiểm tra xem có duplicate không
        console.log('\n🔍 Test 6: Check for Duplicates');
        const allConfessions = await db.getUserPendingConfessions(testGuildId, testUserId);
        const uniqueContents = [...new Set(allConfessions.map(c => c.content))];
        console.log('Total confessions:', allConfessions.length);
        console.log('Unique contents:', uniqueContents.length);
        
        if (allConfessions.length !== uniqueContents.length) {
            console.log('⚠️  DUPLICATE DETECTED!');
            const contentCounts = {};
            allConfessions.forEach(confession => {
                contentCounts[confession.content] = (contentCounts[confession.content] || 0) + 1;
            });
            
            Object.entries(contentCounts).forEach(([content, count]) => {
                if (count > 1) {
                    console.log(`  Duplicate content "${content.substring(0, 30)}..." appears ${count} times`);
                }
            });
        } else {
            console.log('✅ No duplicates detected');
        }

        // Test 7: Cleanup
        console.log('\n🧹 Test 7: Cleanup');
        for (const confession of allConfessions) {
            await db.updateConfessionStatus(confession._id, 'rejected', testUserId);
            console.log(`Marked confession #${confession._id} as rejected`);
        }

        console.log('\n✅ All confession duplicate tests completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await db.disconnect();
        await client.destroy();
        console.log('\n✅ Cleanup completed');
    }
}

// Run the test
testConfessionDuplicate(); 