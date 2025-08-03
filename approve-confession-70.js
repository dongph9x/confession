const db = require('./src/data/mongodb.js');

async function approveConfession70() {
    try {
        console.log('🔍 Approve Confession #70...');
        
        // Kết nối database
        console.log('🔗 Kết nối database...');
        await db.connect();
        
        const guildId = '1005280612845891615';
        const confessionNumber = 70;
        
        console.log(`\n📊 1. Kiểm tra confession #${confessionNumber} trước khi approve:`);
        
        // Tìm confession
        const confession = await db.getConfessionByNumberAnyStatus(guildId, confessionNumber);
        if (confession) {
            console.log(`   ✅ Found confession:`);
            console.log(`      ID: ${confession._id}`);
            console.log(`      Number: ${confession.confessionNumber}`);
            console.log(`      Status: ${confession.status}`);
            console.log(`      Content: ${confession.content.substring(0, 50)}...`);
        } else {
            console.log(`   ❌ Confession not found`);
            return;
        }
        
        // Approve confession
        console.log(`\n📝 2. Approve confession #${confessionNumber}:`);
        try {
            const approvedConfession = await db.updateConfessionStatus(
                confession._id,
                'approved',
                'test_admin',
                null, // messageId
                null  // threadId
            );
            
            if (approvedConfession) {
                console.log(`   ✅ Confession approved successfully:`);
                console.log(`      ID: ${approvedConfession._id}`);
                console.log(`      Number: ${approvedConfession.confessionNumber}`);
                console.log(`      Status: ${approvedConfession.status}`);
                console.log(`      Reviewed By: ${approvedConfession.reviewedBy}`);
                console.log(`      Reviewed At: ${approvedConfession.reviewedAt}`);
            } else {
                console.log(`   ❌ Failed to approve confession`);
            }
        } catch (error) {
            console.log(`   ❌ Error approving confession: ${error.message}`);
        }
        
        // Kiểm tra confession sau khi approve
        console.log(`\n📊 3. Kiểm tra confession sau khi approve:`);
        const updatedConfession = await db.getConfessionByNumberAnyStatus(guildId, confessionNumber);
        if (updatedConfession) {
            console.log(`   ✅ Updated confession:`);
            console.log(`      ID: ${updatedConfession._id}`);
            console.log(`      Number: ${updatedConfession.confessionNumber}`);
            console.log(`      Status: ${updatedConfession.status}`);
            console.log(`      Content: ${updatedConfession.content.substring(0, 50)}...`);
        }
        
        // Kiểm tra pending confessions
        console.log(`\n📊 4. Kiểm tra pending confessions sau khi approve:`);
        const Confession = require('./src/models/Confession');
        const pendingConfessions = await Confession.find({ guildId: guildId, status: 'pending' }).sort({ confessionNumber: -1 }).limit(5);
        console.log(`   Pending confessions: ${pendingConfessions.length}`);
        pendingConfessions.forEach(conf => {
            console.log(`     - Confession #${conf.confessionNumber}: ${conf.content.substring(0, 30)}...`);
        });
        
        // Kiểm tra approved confessions
        console.log(`\n📊 5. Kiểm tra approved confessions:`);
        const approvedConfessions = await Confession.find({ guildId: guildId, status: 'approved' }).sort({ confessionNumber: -1 }).limit(5);
        console.log(`   Approved confessions: ${approvedConfessions.length}`);
        approvedConfessions.forEach(conf => {
            console.log(`     - Confession #${conf.confessionNumber}: ${conf.content.substring(0, 30)}...`);
        });
        
        console.log('\n✅ Approve hoàn thành!');
        
    } catch (error) {
        console.error('❌ Error trong approve:', error);
    } finally {
        await db.disconnect();
    }
}

// Chạy approve
approveConfession70().then(() => {
    console.log('🎯 Approve script completed');
    process.exit(0);
}).catch(error => {
    console.error('💥 Approve script failed:', error);
    process.exit(1);
}); 