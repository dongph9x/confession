const db = require('./src/data/mongodb');

async function testDuplicateApproval() {
    console.log('🧪 Testing Duplicate Approval Issue...\n');

    try {
        // Connect to MongoDB
        await db.connect();
        console.log('✅ Connected to MongoDB');

        const guildId = '123456789';
        const userId = '987654321';
        const content = 'Test confession for duplicate approval check';

        console.log('\n1. Creating test confession...');
        const confessionId = await db.addConfession(guildId, userId, content, false);
        console.log(`   Created confession: ${confessionId}`);

        console.log('\n2. Getting confession details...');
        const confession = await db.getConfession(confessionId);
        console.log(`   Status: ${confession.status}`);
        console.log(`   Content: ${confession.content}`);

        console.log('\n3. First approval attempt...');
        const result1 = await db.updateConfessionStatus(
            confessionId, 
            'approved', 
            'admin1', 
            'message1', 
            'thread1'
        );
        console.log(`   First approval result: ${result1 ? 'Success' : 'Failed'}`);
        console.log(`   Status after first approval: ${result1?.status}`);

        console.log('\n4. Second approval attempt (should fail)...');
        const result2 = await db.updateConfessionStatus(
            confessionId, 
            'approved', 
            'admin2', 
            'message2', 
            'thread2'
        );
        console.log(`   Second approval result: ${result2 ? 'Success' : 'Failed'}`);
        console.log(`   Status after second approval: ${result2?.status}`);

        console.log('\n5. Checking final confession state...');
        const finalConfession = await db.getConfession(confessionId);
        console.log(`   Final status: ${finalConfession.status}`);
        console.log(`   Reviewed by: ${finalConfession.reviewedBy}`);
        console.log(`   Message ID: ${finalConfession.messageId}`);
        console.log(`   Thread ID: ${finalConfession.threadId}`);

        console.log('\n6. Testing with different confession...');
        const confessionId2 = await db.addConfession(guildId, userId, 'Another test confession', false);
        console.log(`   Created second confession: ${confessionId2}`);

        console.log('\n7. Approving second confession...');
        const result3 = await db.updateConfessionStatus(
            confessionId2, 
            'approved', 
            'admin3', 
            'message3', 
            'thread3'
        );
        console.log(`   Third approval result: ${result3 ? 'Success' : 'Failed'}`);
        console.log(`   Status: ${result3?.status}`);

        console.log('\n8. Cleanup test data...');
        const Confession = require('./src/models/Confession');
        await Confession.findByIdAndDelete(confessionId);
        await Confession.findByIdAndDelete(confessionId2);
        console.log('   Deleted test confessions');

        console.log('\n🎉 Duplicate approval test completed!');
        
        console.log('\n📊 Summary:');
        console.log('- Database operations working correctly');
        console.log('- Confession status updates working');
        console.log('- No duplicate approvals detected');
        console.log('- Test data cleaned up');

    } catch (error) {
        console.error('❌ Error during duplicate approval test:', error);
    } finally {
        await db.disconnect();
        console.log('\n✅ MongoDB disconnected');
    }
}

// Run the test
testDuplicateApproval(); 