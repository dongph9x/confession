const db = require('./src/data/mongodb.js');

async function testApproveConfessionFinal() {
    try {
        console.log('🔍 Test Approve Confession Process (Final Fix)...');
        
        // Kết nối database
        console.log('🔗 Kết nối database...');
        await db.connect();
        
        const guildId = '1005280612845891615';
        
        console.log(`\n📊 1. Kiểm tra guild settings trước khi tạo confession:`);
        const guildSettings = await db.getGuildSettings(guildId);
        if (guildSettings) {
            console.log(`   ✅ Guild settings:`);
            console.log(`      Confession Counter: ${guildSettings.confessionCounter}`);
        }
        
        // Tạo một confession test mới
        console.log(`\n📝 2. Tạo confession test mới:`);
        try {
            const confessionId = await db.addConfession(
                guildId,
                'test_user_final',
                'Đây là confession test với logic đã fix - confession number sẽ được cập nhật khi approve',
                false
            );
            
            if (confessionId) {
                console.log(`   ✅ Created test confession:`);
                console.log(`      ID: ${confessionId}`);
                
                // Lấy confession để xem number
                const testConfession = await db.getConfession(confessionId);
                if (testConfession) {
                    console.log(`      Number: ${testConfession.confessionNumber}`);
                    console.log(`      Status: ${testConfession.status}`);
                    console.log(`      Content: ${testConfession.content.substring(0, 50)}...`);
                    
                    // Kiểm tra guild settings sau khi tạo confession
                    console.log(`\n📊 3. Kiểm tra guild settings sau khi tạo confession:`);
                    const guildSettingsAfterCreate = await db.getGuildSettings(guildId);
                    if (guildSettingsAfterCreate) {
                        console.log(`   ✅ Guild settings after create:`);
                        console.log(`      Confession Counter: ${guildSettingsAfterCreate.confessionCounter}`);
                    }
                    
                    // Test approve confession
                    console.log(`\n🔧 4. Test approve confession #${testConfession.confessionNumber}:`);
                    
                    // Calculate expected new number
                    const expectedNewNumber = guildSettings.confessionCounter + 1;
                    console.log(`   Expected new number: ${expectedNewNumber}`);
                    
                    // Approve confession
                    const approvedConfession = await db.updateConfessionStatus(
                        confessionId,
                        'approved',
                        'test_admin_final',
                        'test_message_id_final',
                        'test_thread_id_final'
                    );
                    
                    if (approvedConfession) {
                        console.log(`   ✅ Confession approved successfully:`);
                        console.log(`      ID: ${approvedConfession._id}`);
                        console.log(`      Number: ${approvedConfession.confessionNumber}`);
                        console.log(`      Status: ${approvedConfession.status}`);
                        console.log(`      Message ID: ${approvedConfession.messageId}`);
                        console.log(`      Thread ID: ${approvedConfession.threadId}`);
                        
                        // Check if confession number was updated correctly
                        if (approvedConfession.confessionNumber === expectedNewNumber) {
                            console.log(`   ✅ Confession number updated correctly: ${approvedConfession.confessionNumber}`);
                        } else {
                            console.log(`   ❌ Confession number not updated correctly:`);
                            console.log(`      Expected: ${expectedNewNumber}`);
                            console.log(`      Actual: ${approvedConfession.confessionNumber}`);
                        }
                        
                        // Check guild settings after approve
                        console.log(`\n📊 5. Check guild settings after approve:`);
                        const updatedGuildSettings = await db.getGuildSettings(guildId);
                        if (updatedGuildSettings) {
                            console.log(`   ✅ Updated guild settings:`);
                            console.log(`      Confession Counter: ${updatedGuildSettings.confessionCounter}`);
                        }
                        
                        // Check if confession exists with new number
                        console.log(`\n📊 6. Check if confession exists with new number:`);
                        const confessionByNewNumber = await db.getConfessionByNumberAnyStatus(guildId, expectedNewNumber);
                        if (confessionByNewNumber) {
                            console.log(`   ✅ Found confession with new number #${expectedNewNumber}:`);
                            console.log(`      ID: ${confessionByNewNumber._id}`);
                            console.log(`      Status: ${confessionByNewNumber.status}`);
                        } else {
                            console.log(`   ❌ Confession not found with new number #${expectedNewNumber}`);
                        }
                        
                        // Check all recent confessions
                        console.log(`\n📊 7. Check all recent confessions:`);
                        const Confession = require('./src/models/Confession');
                        const allRecentConfessions = await Confession.find({ guildId: guildId }).sort({ confessionNumber: -1 }).limit(5);
                        console.log(`   Recent confessions: ${allRecentConfessions.length}`);
                        allRecentConfessions.forEach((conf, index) => {
                            console.log(`   ${index + 1}. Confession #${conf.confessionNumber}: ${conf.content.substring(0, 30)}... (Status: ${conf.status})`);
                        });
                        
                    } else {
                        console.log(`   ❌ Failed to approve confession`);
                    }
                    
                } else {
                    console.log(`   ❌ Could not retrieve test confession`);
                }
                
            } else {
                console.log(`   ❌ Failed to create test confession`);
            }
            
        } catch (error) {
            console.log(`   ❌ Error creating test confession: ${error.message}`);
        }
        
        console.log('\n✅ Test hoàn thành!');
        
    } catch (error) {
        console.error('❌ Error trong test:', error);
    } finally {
        await db.disconnect();
    }
}

// Chạy test
testApproveConfessionFinal().then(() => {
    console.log('🎯 Test script completed');
    process.exit(0);
}).catch(error => {
    console.error('💥 Test script failed:', error);
    process.exit(1);
}); 