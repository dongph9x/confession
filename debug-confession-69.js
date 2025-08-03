const db = require('./src/data/mongodb.js');

async function debugConfession69() {
    try {
        console.log('🔍 Debug Confession #69...');
        
        // Kết nối database
        console.log('🔗 Kết nối database...');
        await db.connect();
        
        const guildId = '1005280612845891615'; // Guild ID từ logs
        const confessionNumber = 69;
        
        console.log(`\n📊 1. Kiểm tra confession #${confessionNumber} trong database:`);
        
        // Method 1: Tìm bằng getConfessionByNumberAnyStatus
        console.log(`   Method 1: getConfessionByNumberAnyStatus(${guildId}, ${confessionNumber})`);
        const confession = await db.getConfessionByNumberAnyStatus(guildId, confessionNumber);
        if (confession) {
            console.log(`   ✅ Found confession:`);
            console.log(`      ID: ${confession._id}`);
            console.log(`      Number: ${confession.confessionNumber}`);
            console.log(`      Status: ${confession.status}`);
            console.log(`      Content: ${confession.content.substring(0, 50)}...`);
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
        
        // Method 3: Tìm tất cả confessions trong guild
        console.log(`\n📊 2. Kiểm tra tất cả confessions trong guild ${guildId}:`);
        const allConfessions = await Confession.find({ guildId: guildId }).sort({ confessionNumber: -1 }).limit(10);
        console.log(`   Tổng số confessions: ${allConfessions.length}`);
        
        if (allConfessions.length > 0) {
            console.log(`   Recent confessions:`);
            allConfessions.forEach((conf, index) => {
                console.log(`   ${index + 1}. Confession #${conf.confessionNumber}: ${conf.content.substring(0, 30)}... (Status: ${conf.status})`);
            });
            
            // Kiểm tra xem có confession nào có number = 69 không
            const confession69 = allConfessions.find(c => c.confessionNumber === 69);
            if (confession69) {
                console.log(`\n   ✅ Found Confession #69 in recent confessions:`);
                console.log(`      ID: ${confession69._id}`);
                console.log(`      Status: ${confession69.status}`);
                console.log(`      Content: ${confession69.content.substring(0, 50)}...`);
            } else {
                console.log(`\n   ❌ Confession #69 not found in recent confessions`);
            }
        }
        
        // Method 4: Tìm confession với number = 69 ở bất kỳ guild nào
        console.log(`\n📊 3. Kiểm tra confession #69 ở tất cả guilds:`);
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
        
        // Method 5: Kiểm tra method getConfessionByNumberAnyStatus
        console.log(`\n📊 4. Test method getConfessionByNumberAnyStatus:`);
        
        // Test với confession có sẵn
        if (allConfessions.length > 0) {
            const testConfession = allConfessions[0];
            console.log(`   Testing với confession #${testConfession.confessionNumber}:`);
            
            const foundTest = await db.getConfessionByNumberAnyStatus(guildId, testConfession.confessionNumber);
            if (foundTest) {
                console.log(`   ✅ Method works for confession #${testConfession.confessionNumber}`);
            } else {
                console.log(`   ❌ Method failed for confession #${testConfession.confessionNumber}`);
            }
        }
        
        console.log('\n✅ Debug hoàn thành!');
        
    } catch (error) {
        console.error('❌ Error trong debug:', error);
    } finally {
        await db.disconnect();
    }
}

// Chạy debug
debugConfession69().then(() => {
    console.log('🎯 Debug script completed');
    process.exit(0);
}).catch(error => {
    console.error('💥 Debug script failed:', error);
    process.exit(1);
}); 