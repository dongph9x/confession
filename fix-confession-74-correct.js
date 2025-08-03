const db = require('./src/data/mongodb.js');

async function fixConfession74Correct() {
    try {
        console.log('🔧 Fix Confession #74 Correctly...');
        
        // Kết nối database
        console.log('🔗 Kết nối database...');
        await db.connect();
        
        const guildId = '1005280612845891615';
        
        console.log(`\n📊 1. Kiểm tra tình trạng hiện tại:`);
        const guildSettings = await db.getGuildSettings(guildId);
        if (guildSettings) {
            console.log(`   ✅ Guild settings:`);
            console.log(`      Confession Counter: ${guildSettings.confessionCounter}`);
        }
        
        // Tìm confession #73 (confession được hiển thị là #74)
        console.log(`\n📊 2. Kiểm tra confession #73:`);
        const Confession = require('./src/models/Confession');
        const confession73 = await db.getConfessionByNumberAnyStatus(guildId, 73);
        if (confession73) {
            console.log(`   ✅ Found confession #73:`);
            console.log(`      ID: ${confession73._id}`);
            console.log(`      Number: ${confession73.confessionNumber}`);
            console.log(`      Status: ${confession73.status}`);
            console.log(`      Content: ${confession73.content.substring(0, 50)}...`);
            
            // Kiểm tra xem confession này có phải là confession được hiển thị là #74 không
            if (confession73.content.includes("Có những ngày, lòng mình chùng xuống không vì lý do gì rõ ràng")) {
                console.log(`   🎯 This confession matches the content displayed as #74!`);
                
                // Option 1: Update confession #73 thành #74
                console.log(`\n🔧 3. Update confession #73 thành #74:`);
                try {
                    const updatedConfession = await Confession.findByIdAndUpdate(
                        confession73._id,
                        { confessionNumber: 74 },
                        { new: true }
                    );
                    
                    if (updatedConfession) {
                        console.log(`   ✅ Updated confession #73 thành #74:`);
                        console.log(`      ID: ${updatedConfession._id}`);
                        console.log(`      Number: ${updatedConfession.confessionNumber}`);
                        console.log(`      Status: ${updatedConfession.status}`);
                    }
                    
                } catch (error) {
                    console.log(`   ❌ Error updating confession: ${error.message}`);
                }
                
                // Option 2: Tạo confession #74 mới và xóa confession #75
                console.log(`\n🔧 4. Tạo confession #74 mới và xóa confession #75:`);
                try {
                    // Xóa confession #75 (confession được tạo nhầm)
                    const confession75 = await db.getConfessionByNumberAnyStatus(guildId, 75);
                    if (confession75) {
                        await Confession.findByIdAndDelete(confession75._id);
                        console.log(`   ✅ Deleted confession #75`);
                    }
                    
                    // Tạo confession #74 mới
                    const confessionId = await db.addConfession(
                        guildId,
                        'system_fix_74',
                        confession73.content,
                        confession73.isAnonymous
                    );
                    
                    if (confessionId) {
                        console.log(`   ✅ Created new confession #74:`);
                        console.log(`      ID: ${confessionId}`);
                        
                        // Approve confession #74
                        const approvedConfession = await db.updateConfessionStatus(
                            confessionId,
                            'approved',
                            'system_fix_74',
                            null,
                            null
                        );
                        
                        if (approvedConfession) {
                            console.log(`   ✅ Approved confession #74:`);
                            console.log(`      Number: ${approvedConfession.confessionNumber}`);
                            console.log(`      Status: ${approvedConfession.status}`);
                        }
                    }
                    
                } catch (error) {
                    console.log(`   ❌ Error creating confession #74: ${error.message}`);
                }
                
            } else {
                console.log(`   ❌ This confession doesn't match the content displayed as #74`);
            }
        } else {
            console.log(`   ❌ Confession #73 not found`);
        }
        
        // Kiểm tra kết quả
        console.log(`\n📊 5. Kiểm tra kết quả sau khi fix:`);
        const finalGuildSettings = await db.getGuildSettings(guildId);
        console.log(`   Final confession counter: ${finalGuildSettings.confessionCounter}`);
        
        const confession74 = await db.getConfessionByNumberAnyStatus(guildId, 74);
        if (confession74) {
            console.log(`   ✅ Found confession #74:`);
            console.log(`      ID: ${confession74._id}`);
            console.log(`      Status: ${confession74.status}`);
            console.log(`      Content: ${confession74.content.substring(0, 50)}...`);
        } else {
            console.log(`   ❌ Confession #74 still not found`);
        }
        
        // Kiểm tra tất cả confessions gần đây
        console.log(`\n📊 6. Kiểm tra tất cả confessions gần đây:`);
        const allRecentConfessions = await Confession.find({ guildId: guildId }).sort({ confessionNumber: -1 }).limit(5);
        console.log(`   Recent confessions: ${allRecentConfessions.length}`);
        allRecentConfessions.forEach((conf, index) => {
            console.log(`   ${index + 1}. Confession #${conf.confessionNumber}: ${conf.content.substring(0, 30)}... (Status: ${conf.status})`);
        });
        
        console.log('\n✅ Fix hoàn thành!');
        
    } catch (error) {
        console.error('❌ Error trong fix:', error);
    } finally {
        await db.disconnect();
    }
}

// Chạy fix
fixConfession74Correct().then(() => {
    console.log('🎯 Fix script completed');
    process.exit(0);
}).catch(error => {
    console.error('💥 Fix script failed:', error);
    process.exit(1);
}); 