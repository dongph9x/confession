const db = require('./src/data/mongodb.js');

async function checkConfession70() {
    try {
        console.log('🔍 Check Confession #70...');
        
        // Kết nối database
        console.log('🔗 Kết nối database...');
        await db.connect();
        
        const guildId = '1005280612845891615';
        const confessionNumber = 70;
        
        console.log(`\n📊 1. Kiểm tra confession #${confessionNumber}:`);
        
        // Method 1: Tìm bằng getConfessionByNumberAnyStatus
        console.log(`   Method 1: getConfessionByNumberAnyStatus(${guildId}, ${confessionNumber})`);
        const confession = await db.getConfessionByNumberAnyStatus(guildId, confessionNumber);
        if (confession) {
            console.log(`   ✅ Found confession:`);
            console.log(`      ID: ${confession._id}`);
            console.log(`      Number: ${confession.confessionNumber}`);
            console.log(`      Status: ${confession.status}`);
            console.log(`      Content: ${confession.content.substring(0, 50)}...`);
            console.log(`      Anonymous: ${confession.isAnonymous}`);
            console.log(`      Created At: ${confession.createdAt}`);
        } else {
            console.log(`   ❌ Confession not found with getConfessionByNumberAnyStatus`);
        }
        
        // Method 2: Tìm trực tiếp bằng Mongoose
        console.log(`\n   Method 2: Direct Mongoose query`);
        const Confession = require('./src/models/Confession');
        const directConfession = await Confession.findOne({ 
            guildId: guildId, 
            confessionNumber: confessionNumber 
        });
        
        if (directConfession) {
            console.log(`   ✅ Found confession with direct query:`);
            console.log(`      ID: ${directConfession._id}`);
            console.log(`      Number: ${directConfession.confessionNumber}`);
            console.log(`      Status: ${directConfession.status}`);
            console.log(`      Content: ${directConfession.content.substring(0, 50)}...`);
        } else {
            console.log(`   ❌ Confession not found with direct query`);
        }
        
        // Method 3: Tìm confession với status khác nhau
        console.log(`\n📊 2. Kiểm tra confessions với status khác nhau:`);
        
        const pendingConfessions = await Confession.find({ guildId: guildId, status: 'pending' }).sort({ confessionNumber: -1 }).limit(5);
        const approvedConfessions = await Confession.find({ guildId: guildId, status: 'approved' }).sort({ confessionNumber: -1 }).limit(5);
        const rejectedConfessions = await Confession.find({ guildId: guildId, status: 'rejected' }).sort({ confessionNumber: -1 }).limit(5);
        
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
        
        // Method 4: Kiểm tra confession #70 có trong pending không
        const confession70Pending = pendingConfessions.find(c => c.confessionNumber === 70);
        if (confession70Pending) {
            console.log(`\n   ✅ Found Confession #70 in pending confessions:`);
            console.log(`      ID: ${confession70Pending._id}`);
            console.log(`      Status: ${confession70Pending.status}`);
            console.log(`      Content: ${confession70Pending.content.substring(0, 50)}...`);
            console.log(`      Created At: ${confession70Pending.createdAt}`);
        } else {
            console.log(`\n   ❌ Confession #70 not found in pending confessions`);
        }
        
        // Method 5: Kiểm tra tất cả confessions gần đây
        console.log(`\n📊 3. Kiểm tra tất cả confessions gần đây:`);
        const allRecentConfessions = await Confession.find({ guildId: guildId }).sort({ confessionNumber: -1 }).limit(10);
        console.log(`   Recent confessions: ${allRecentConfessions.length}`);
        allRecentConfessions.forEach((conf, index) => {
            console.log(`   ${index + 1}. Confession #${conf.confessionNumber}: ${conf.content.substring(0, 30)}... (Status: ${conf.status})`);
        });
        
        // Method 6: Kiểm tra guild settings
        console.log(`\n📊 4. Kiểm tra guild settings:`);
        const guildSettings = await db.getGuildSettings(guildId);
        if (guildSettings) {
            console.log(`   ✅ Guild settings:`);
            console.log(`      Confession Counter: ${guildSettings.confessionCounter}`);
            console.log(`      Confession Channel: ${guildSettings.confessionChannel}`);
            console.log(`      Review Channel: ${guildSettings.reviewChannel}`);
        }
        
        console.log('\n✅ Check hoàn thành!');
        
    } catch (error) {
        console.error('❌ Error trong check:', error);
    } finally {
        await db.disconnect();
    }
}

// Chạy check
checkConfession70().then(() => {
    console.log('🎯 Check script completed');
    process.exit(0);
}).catch(error => {
    console.error('💥 Check script failed:', error);
    process.exit(1);
}); 