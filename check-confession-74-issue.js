const db = require('./src/data/mongodb.js');

async function checkConfession74Issue() {
    try {
        console.log('🔍 Check Confession #74 Issue...');
        
        // Kết nối database
        console.log('🔗 Kết nối database...');
        await db.connect();
        
        const guildId = '1005280612845891615';
        
        console.log(`\n📊 1. Kiểm tra guild settings:`);
        const guildSettings = await db.getGuildSettings(guildId);
        if (guildSettings) {
            console.log(`   ✅ Guild settings:`);
            console.log(`      Confession Counter: ${guildSettings.confessionCounter}`);
            console.log(`      Confession Channel: ${guildSettings.confessionChannel}`);
            console.log(`      Review Channel: ${guildSettings.reviewChannel}`);
        }
        
        console.log(`\n📊 2. Kiểm tra tất cả confessions gần đây:`);
        const Confession = require('./src/models/Confession');
        const allRecentConfessions = await Confession.find({ guildId: guildId }).sort({ confessionNumber: -1 }).limit(10);
        console.log(`   Recent confessions: ${allRecentConfessions.length}`);
        allRecentConfessions.forEach((conf, index) => {
            console.log(`   ${index + 1}. Confession #${conf.confessionNumber}: ${conf.content.substring(0, 30)}... (Status: ${conf.status})`);
        });
        
        console.log(`\n📊 3. Kiểm tra confession #74 cụ thể:`);
        const confession74 = await db.getConfessionByNumberAnyStatus(guildId, 74);
        if (confession74) {
            console.log(`   ✅ Found confession #74:`);
            console.log(`      ID: ${confession74._id}`);
            console.log(`      Number: ${confession74.confessionNumber}`);
            console.log(`      Status: ${confession74.status}`);
            console.log(`      Content: ${confession74.content.substring(0, 50)}...`);
        } else {
            console.log(`   ❌ Confession #74 not found in database`);
        }
        
        console.log(`\n📊 4. Kiểm tra confession #73:`);
        const confession73 = await db.getConfessionByNumberAnyStatus(guildId, 73);
        if (confession73) {
            console.log(`   ✅ Found confession #73:`);
            console.log(`      ID: ${confession73._id}`);
            console.log(`      Number: ${confession73.confessionNumber}`);
            console.log(`      Status: ${confession73.status}`);
            console.log(`      Content: ${confession73.content.substring(0, 50)}...`);
        } else {
            console.log(`   ❌ Confession #73 not found in database`);
        }
        
        console.log(`\n📊 5. Kiểm tra pending confessions:`);
        const pendingConfessions = await Confession.find({ guildId: guildId, status: 'pending' }).sort({ confessionNumber: -1 }).limit(5);
        console.log(`   Pending confessions: ${pendingConfessions.length}`);
        pendingConfessions.forEach(conf => {
            console.log(`     - Confession #${conf.confessionNumber}: ${conf.content.substring(0, 30)}...`);
        });
        
        console.log(`\n📊 6. Kiểm tra approved confessions:`);
        const approvedConfessions = await Confession.find({ guildId: guildId, status: 'approved' }).sort({ confessionNumber: -1 }).limit(5);
        console.log(`   Approved confessions: ${approvedConfessions.length}`);
        approvedConfessions.forEach(conf => {
            console.log(`     - Confession #${conf.confessionNumber}: ${conf.content.substring(0, 30)}...`);
        });
        
        console.log(`\n📊 7. Kiểm tra sequence gap:`);
        const allConfessions = await Confession.find({ guildId: guildId }).sort({ confessionNumber: 1 });
        console.log(`   Total confessions: ${allConfessions.length}`);
        
        // Tìm gap trong sequence
        const expectedNumbers = [];
        for (let i = 1; i <= guildSettings.confessionCounter; i++) {
            expectedNumbers.push(i);
        }
        
        const actualNumbers = allConfessions.map(c => c.confessionNumber);
        const missingNumbers = expectedNumbers.filter(num => !actualNumbers.includes(num));
        const extraNumbers = actualNumbers.filter(num => !expectedNumbers.includes(num));
        
        if (missingNumbers.length > 0) {
            console.log(`   ❌ Missing confession numbers: ${missingNumbers.join(', ')}`);
        }
        if (extraNumbers.length > 0) {
            console.log(`   ⚠️ Extra confession numbers: ${extraNumbers.join(', ')}`);
        }
        if (missingNumbers.length === 0 && extraNumbers.length === 0) {
            console.log(`   ✅ No sequence gaps found`);
        }
        
        console.log(`\n📊 8. Kiểm tra confession với content tương tự:`);
        const targetContent = "Có những ngày, lòng mình chùng xuống không vì lý do gì rõ ràng";
        const similarConfessions = await Confession.find({ 
            guildId: guildId,
            content: { $regex: targetContent.substring(0, 20), $options: 'i' }
        }).sort({ confessionNumber: -1 });
        
        console.log(`   Confessions with similar content: ${similarConfessions.length}`);
        similarConfessions.forEach(conf => {
            console.log(`     - Confession #${conf.confessionNumber}: ${conf.content.substring(0, 50)}... (Status: ${conf.status})`);
        });
        
        console.log('\n✅ Check hoàn thành!');
        
    } catch (error) {
        console.error('❌ Error trong check:', error);
    } finally {
        await db.disconnect();
    }
}

// Chạy check
checkConfession74Issue().then(() => {
    console.log('🎯 Check script completed');
    process.exit(0);
}).catch(error => {
    console.error('💥 Check script failed:', error);
    process.exit(1);
}); 