const db = require('./src/data/mongodb.js');

async function testApproveConfessionProcess() {
    try {
        console.log('🔍 Test Approve Confession Process...');
        
        // Kết nối database
        console.log('🔗 Kết nối database...');
        await db.connect();
        
        const guildId = '1005280612845891615';
        
        console.log(`\n📊 1. Kiểm tra guild settings trước khi approve:`);
        const guildSettings = await db.getGuildSettings(guildId);
        if (guildSettings) {
            console.log(`   ✅ Guild settings:`);
            console.log(`      Confession Counter: ${guildSettings.confessionCounter}`);
            console.log(`      Confession Channel: ${guildSettings.confessionChannel}`);
            console.log(`      Review Channel: ${guildSettings.reviewChannel}`);
        }
        
        // Tìm pending confessions
        console.log(`\n📊 2. Kiểm tra pending confessions:`);
        const pendingConfessions = await db.getPendingConfessions(guildId);
        console.log(`   Pending confessions: ${pendingConfessions.length}`);
        pendingConfessions.forEach(conf => {
            console.log(`     - Confession #${conf.confessionNumber}: ${conf.content.substring(0, 30)}...`);
        });
        
        if (pendingConfessions.length === 0) {
            console.log(`   ❌ No pending confessions to test`);
            return;
        }
        
        // Test approve confession đầu tiên
        const testConfession = pendingConfessions[0];
        console.log(`\n📝 3. Test approve confession #${testConfession.confessionNumber}:`);
        console.log(`   ID: ${testConfession._id}`);
        console.log(`   Content: ${testConfession.content.substring(0, 50)}...`);
        console.log(`   Status: ${testConfession.status}`);
        console.log(`   Confession Number: ${testConfession.confessionNumber}`);
        
        // Simulate approve process
        console.log(`\n🔧 4. Simulate approve process:`);
        
        // Step 1: Calculate new confession number
        const newConfessionNumber = guildSettings.confessionCounter + 1;
        console.log(`   Step 1: Calculate new confession number:`);
        console.log(`      Current counter: ${guildSettings.confessionCounter}`);
        console.log(`      New confession number: ${newConfessionNumber}`);
        
        // Step 2: Update confession status
        console.log(`\n   Step 2: Update confession status:`);
        try {
            const approvedConfession = await db.updateConfessionStatus(
                testConfession._id,
                'approved',
                'test_admin',
                'test_message_id',
                'test_thread_id'
            );
            
            if (approvedConfession) {
                console.log(`   ✅ Confession approved successfully:`);
                console.log(`      ID: ${approvedConfession._id}`);
                console.log(`      Number: ${approvedConfession.confessionNumber}`);
                console.log(`      Status: ${approvedConfession.status}`);
                console.log(`      Message ID: ${approvedConfession.messageId}`);
                console.log(`      Thread ID: ${approvedConfession.threadId}`);
                
                // Check if confession number was updated
                if (approvedConfession.confessionNumber === newConfessionNumber) {
                    console.log(`   ✅ Confession number updated correctly: ${approvedConfession.confessionNumber}`);
                } else {
                    console.log(`   ❌ Confession number not updated correctly:`);
                    console.log(`      Expected: ${newConfessionNumber}`);
                    console.log(`      Actual: ${approvedConfession.confessionNumber}`);
                }
            } else {
                console.log(`   ❌ Failed to approve confession`);
            }
        } catch (error) {
            console.log(`   ❌ Error approving confession: ${error.message}`);
        }
        
        // Step 3: Check guild settings after approve
        console.log(`\n   Step 3: Check guild settings after approve:`);
        const updatedGuildSettings = await db.getGuildSettings(guildId);
        if (updatedGuildSettings) {
            console.log(`   ✅ Updated guild settings:`);
            console.log(`      Confession Counter: ${updatedGuildSettings.confessionCounter}`);
        }
        
        // Step 4: Check if confession exists with new number
        console.log(`\n   Step 4: Check if confession exists with new number:`);
        const confessionByNewNumber = await db.getConfessionByNumberAnyStatus(guildId, newConfessionNumber);
        if (confessionByNewNumber) {
            console.log(`   ✅ Found confession with new number #${newConfessionNumber}:`);
            console.log(`      ID: ${confessionByNewNumber._id}`);
            console.log(`      Status: ${confessionByNewNumber.status}`);
        } else {
            console.log(`   ❌ Confession not found with new number #${newConfessionNumber}`);
        }
        
        // Step 5: Check if old confession still exists
        console.log(`\n   Step 5: Check if old confession still exists:`);
        const oldConfession = await db.getConfessionByNumberAnyStatus(guildId, testConfession.confessionNumber);
        if (oldConfession) {
            console.log(`   ⚠️ Old confession still exists #${testConfession.confessionNumber}:`);
            console.log(`      ID: ${oldConfession._id}`);
            console.log(`      Status: ${oldConfession.status}`);
        } else {
            console.log(`   ✅ Old confession no longer exists #${testConfession.confessionNumber}`);
        }
        
        // Check all recent confessions
        console.log(`\n📊 5. Check all recent confessions:`);
        const Confession = require('./src/models/Confession');
        const allRecentConfessions = await Confession.find({ guildId: guildId }).sort({ confessionNumber: -1 }).limit(5);
        console.log(`   Recent confessions: ${allRecentConfessions.length}`);
        allRecentConfessions.forEach((conf, index) => {
            console.log(`   ${index + 1}. Confession #${conf.confessionNumber}: ${conf.content.substring(0, 30)}... (Status: ${conf.status})`);
        });
        
        console.log('\n✅ Test hoàn thành!');
        
    } catch (error) {
        console.error('❌ Error trong test:', error);
    } finally {
        await db.disconnect();
    }
}

// Chạy test
testApproveConfessionProcess().then(() => {
    console.log('🎯 Test script completed');
    process.exit(0);
}).catch(error => {
    console.error('💥 Test script failed:', error);
    process.exit(1);
}); 