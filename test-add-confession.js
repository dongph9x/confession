const db = require('./src/data/mongodb.js');

async function testAddConfession() {
    try {
        console.log('🔍 Test Add Confession...');
        
        // Kết nối database
        console.log('🔗 Kết nối database...');
        await db.connect();
        
        const guildId = '1005280612845891615';
        const userId = 'test_user_add';
        const content = 'Đây là confession test để kiểm tra quá trình lưu vào database';
        const isAnonymous = true;
        
        console.log(`\n📝 1. Test thêm confession:`);
        console.log(`   Guild ID: ${guildId}`);
        console.log(`   User ID: ${userId}`);
        console.log(`   Content: ${content}`);
        console.log(`   Anonymous: ${isAnonymous}`);
        
        // Kiểm tra guild settings trước
        console.log(`\n📊 2. Kiểm tra guild settings trước:`);
        const guildSettings = await db.getGuildSettings(guildId);
        if (guildSettings) {
            console.log(`   ✅ Found guild settings:`);
            console.log(`      Confession Counter: ${guildSettings.confessionCounter}`);
            console.log(`      Confession Channel: ${guildSettings.confessionChannel}`);
            console.log(`      Review Channel: ${guildSettings.reviewChannel}`);
        } else {
            console.log(`   ❌ No guild settings found`);
        }
        
        // Test thêm confession
        console.log(`\n📝 3. Test thêm confession:`);
        try {
            const confessionId = await db.addConfession(guildId, userId, content, isAnonymous);
            console.log(`   ✅ Confession added successfully:`);
            console.log(`      ID: ${confessionId}`);
            
            // Kiểm tra confession đã được lưu
            console.log(`\n📊 4. Kiểm tra confession đã được lưu:`);
            const savedConfession = await db.getConfession(confessionId);
            if (savedConfession) {
                console.log(`   ✅ Found saved confession:`);
                console.log(`      ID: ${savedConfession._id}`);
                console.log(`      Number: ${savedConfession.confessionNumber}`);
                console.log(`      Status: ${savedConfession.status}`);
                console.log(`      Content: ${savedConfession.content}`);
                console.log(`      Anonymous: ${savedConfession.isAnonymous}`);
                console.log(`      Guild ID: ${savedConfession.guildId}`);
                console.log(`      User ID: ${savedConfession.userId}`);
            } else {
                console.log(`   ❌ Confession not found after saving`);
            }
            
            // Kiểm tra guild settings sau
            console.log(`\n📊 5. Kiểm tra guild settings sau:`);
            const guildSettingsAfter = await db.getGuildSettings(guildId);
            if (guildSettingsAfter) {
                console.log(`   ✅ Updated guild settings:`);
                console.log(`      Confession Counter: ${guildSettingsAfter.confessionCounter}`);
            }
            
            // Test tìm confession bằng number
            console.log(`\n📊 6. Test tìm confession bằng number:`);
            const confessionByNumber = await db.getConfessionByNumberAnyStatus(guildId, savedConfession.confessionNumber);
            if (confessionByNumber) {
                console.log(`   ✅ Found confession by number #${savedConfession.confessionNumber}:`);
                console.log(`      ID: ${confessionByNumber._id}`);
                console.log(`      Status: ${confessionByNumber.status}`);
            } else {
                console.log(`   ❌ Confession not found by number #${savedConfession.confessionNumber}`);
            }
            
        } catch (error) {
            console.log(`   ❌ Error adding confession: ${error.message}`);
            console.log(`   Error stack: ${error.stack}`);
        }
        
        // Test với confession thứ 2
        console.log(`\n📝 7. Test thêm confession thứ 2:`);
        try {
            const confessionId2 = await db.addConfession(guildId, userId, 'Confession test thứ 2', false);
            console.log(`   ✅ Second confession added:`);
            console.log(`      ID: ${confessionId2}`);
            
            const savedConfession2 = await db.getConfession(confessionId2);
            if (savedConfession2) {
                console.log(`   ✅ Second confession saved:`);
                console.log(`      Number: ${savedConfession2.confessionNumber}`);
                console.log(`      Status: ${savedConfession2.status}`);
            }
            
        } catch (error) {
            console.log(`   ❌ Error adding second confession: ${error.message}`);
        }
        
        // Kiểm tra tất cả confessions trong guild
        console.log(`\n📊 8. Kiểm tra tất cả confessions trong guild:`);
        const Confession = require('./src/models/Confession');
        const allConfessions = await Confession.find({ guildId: guildId }).sort({ confessionNumber: -1 }).limit(5);
        console.log(`   Recent confessions: ${allConfessions.length}`);
        allConfessions.forEach((conf, index) => {
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
testAddConfession().then(() => {
    console.log('🎯 Test script completed');
    process.exit(0);
}).catch(error => {
    console.error('💥 Test script failed:', error);
    process.exit(1);
}); 