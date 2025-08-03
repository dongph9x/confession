const db = require('./src/data/mongodb.js');

async function fixConfession74Display() {
    try {
        console.log('🔧 Fix Confession #74 Display Issue...');
        
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
        
        // Tìm confession với content tương tự
        console.log(`\n📊 2. Tìm confession với content tương tự:`);
        const Confession = require('./src/models/Confession');
        const GuildSettings = require('./src/models/GuildSettings');
        const targetContent = "Có những ngày, lòng mình chùng xuống không vì lý do gì rõ ràng";
        const similarConfessions = await Confession.find({ 
            guildId: guildId,
            content: { $regex: targetContent.substring(0, 20), $options: 'i' }
        }).sort({ confessionNumber: -1 });
        
        console.log(`   Confessions with similar content: ${similarConfessions.length}`);
        similarConfessions.forEach(conf => {
            console.log(`     - Confession #${conf.confessionNumber}: ${conf.content.substring(0, 50)}... (Status: ${conf.status})`);
        });
        
        // Tìm confession #73 (confession cuối cùng)
        console.log(`\n📊 3. Kiểm tra confession #73:`);
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
                
                // Option 1: Tăng confession counter để sync
                console.log(`\n🔧 4. Fix bằng cách tăng confession counter:`);
                try {
                    const updatedSettings = await GuildSettings.findOneAndUpdate(
                        { guildId: guildId },
                        { confessionCounter: guildSettings.confessionCounter + 1 },
                        { new: true, upsert: true }
                    );
                    console.log(`   ✅ Updated confession counter: ${updatedSettings.confessionCounter}`);
                    
                    // Kiểm tra lại
                    const newGuildSettings = await db.getGuildSettings(guildId);
                    console.log(`   ✅ New confession counter: ${newGuildSettings.confessionCounter}`);
                    
                } catch (error) {
                    console.log(`   ❌ Error updating counter: ${error.message}`);
                }
                
                // Option 2: Tạo confession #74 mới với content tương tự
                console.log(`\n🔧 5. Alternative: Tạo confession #74 mới:`);
                try {
                    const confessionId = await db.addConfession(
                        guildId,
                        'system_fix',
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
                            'system_fix',
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
        console.log(`\n📊 6. Kiểm tra kết quả sau khi fix:`);
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
        console.log(`\n📊 7. Kiểm tra tất cả confessions gần đây:`);
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
fixConfession74Display().then(() => {
    console.log('🎯 Fix script completed');
    process.exit(0);
}).catch(error => {
    console.error('💥 Fix script failed:', error);
    process.exit(1);
}); 