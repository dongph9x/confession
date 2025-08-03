const db = require('./src/data/mongodb.js');

async function checkMissingConfessions() {
    try {
        console.log('🔍 Check Missing Confessions...');
        
        // Kết nối database
        console.log('🔗 Kết nối database...');
        await db.connect();
        
        const guildId = '1005280612845891615';
        
        console.log(`\n📊 Kiểm tra confessions trong guild ${guildId}:`);
        
        const Confession = require('./src/models/Confession');
        const allConfessions = await Confession.find({ guildId: guildId }).sort({ confessionNumber: 1 });
        
        console.log(`   Tổng số confessions: ${allConfessions.length}`);
        
        if (allConfessions.length > 0) {
            console.log(`\n📋 Danh sách confessions:`);
            allConfessions.forEach((conf, index) => {
                console.log(`   ${index + 1}. Confession #${conf.confessionNumber}: ${conf.content.substring(0, 30)}... (Status: ${conf.status})`);
            });
            
            // Kiểm tra các confession bị thiếu
            console.log(`\n🔍 Kiểm tra confession bị thiếu:`);
            
            const confessionNumbers = allConfessions.map(c => c.confessionNumber).sort((a, b) => a - b);
            const maxNumber = Math.max(...confessionNumbers);
            const minNumber = Math.min(...confessionNumbers);
            
            console.log(`   Confession number range: ${minNumber} - ${maxNumber}`);
            
            const missingNumbers = [];
            for (let i = minNumber; i <= maxNumber; i++) {
                if (!confessionNumbers.includes(i)) {
                    missingNumbers.push(i);
                }
            }
            
            if (missingNumbers.length > 0) {
                console.log(`   ❌ Missing confession numbers: ${missingNumbers.join(', ')}`);
                
                // Kiểm tra xem có confession nào có status khác không
                console.log(`\n📊 Kiểm tra confessions với status khác nhau:`);
                
                const pendingConfessions = await Confession.find({ guildId: guildId, status: 'pending' }).sort({ confessionNumber: 1 });
                const approvedConfessions = await Confession.find({ guildId: guildId, status: 'approved' }).sort({ confessionNumber: 1 });
                const rejectedConfessions = await Confession.find({ guildId: guildId, status: 'rejected' }).sort({ confessionNumber: 1 });
                
                console.log(`   Pending confessions: ${pendingConfessions.length}`);
                pendingConfessions.forEach(conf => {
                    console.log(`     - Confession #${conf.confessionNumber}: ${conf.content.substring(0, 30)}...`);
                });
                
                console.log(`   Approved confessions: ${approvedConfessions.length}`);
                approvedConfessions.forEach(conf => {
                    console.log(`     - Confession #${conf.confessionNumber}: ${conf.content.substring(0, 30)}...`);
                });
                
                console.log(`   Rejected confessions: ${rejectedConfessions.length}`);
                rejectedConfessions.forEach(conf => {
                    console.log(`     - Confession #${conf.confessionNumber}: ${conf.content.substring(0, 30)}...`);
                });
                
                // Kiểm tra xem confession #69 có trong pending không
                const confession69Pending = pendingConfessions.find(c => c.confessionNumber === 69);
                if (confession69Pending) {
                    console.log(`\n   ✅ Found Confession #69 in pending confessions:`);
                    console.log(`      ID: ${confession69Pending._id}`);
                    console.log(`      Status: ${confession69Pending.status}`);
                    console.log(`      Content: ${confession69Pending.content.substring(0, 50)}...`);
                } else {
                    console.log(`\n   ❌ Confession #69 not found in any status`);
                }
                
            } else {
                console.log(`   ✅ No missing confession numbers`);
            }
        }
        
        // Kiểm tra tất cả confessions với number = 69 ở bất kỳ guild nào
        console.log(`\n🔍 Kiểm tra confession #69 ở tất cả guilds:`);
        const confession69AnyGuild = await Confession.findOne({ confessionNumber: 69 });
        if (confession69AnyGuild) {
            console.log(`   ✅ Found Confession #69 in any guild:`);
            console.log(`      ID: ${confession69AnyGuild._id}`);
            console.log(`      Guild ID: ${confession69AnyGuild.guildId}`);
            console.log(`      Status: ${confession69AnyGuild.status}`);
            console.log(`      Content: ${confession69AnyGuild.content.substring(0, 50)}...`);
        } else {
            console.log(`   ❌ Confession #69 not found in any guild`);
        }
        
        console.log('\n✅ Check hoàn thành!');
        
    } catch (error) {
        console.error('❌ Error trong check:', error);
    } finally {
        await db.disconnect();
    }
}

// Chạy check
checkMissingConfessions().then(() => {
    console.log('🎯 Check script completed');
    process.exit(0);
}).catch(error => {
    console.error('💥 Check script failed:', error);
    process.exit(1);
}); 