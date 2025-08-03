require('dotenv').config();
const db = require('./src/data/mongodb');

async function testCheckConfession() {
    console.log('🔍 Checking Confession Number');
    console.log('============================');
    console.log('');
    
    try {
        // Connect to MongoDB
        console.log('🔗 Connecting to MongoDB...');
        await db.connect();
        
        // Test guild ID
        const testGuildId = process.env.TEST_GUILD_ID || '123456789';
        
        console.log(`🏠 Testing with Guild ID: ${testGuildId}`);
        console.log('');
        
        // Test 1: Add test confession
        console.log('📋 Test 1: Adding Test Confession');
        const confessionId = await db.addConfession(
            testGuildId,
            'test_user_456',
            'Đây là confession test để check confession number',
            false
        );
        console.log(`     Added confession: ${confessionId}`);
        console.log('');
        
        // Test 2: Get confession details
        console.log('📋 Test 2: Getting Confession Details');
        const confession = await db.getConfession(confessionId);
        if (confession) {
            console.log(`     Confession ID: ${confession._id}`);
            console.log(`     Confession Number: ${confession.confessionNumber}`);
            console.log(`     Content: ${confession.content}`);
            console.log(`     Status: ${confession.status}`);
            console.log(`     Guild ID: ${confession.guildId}`);
        } else {
            console.log('     ❌ Không tìm thấy confession');
        }
        console.log('');
        
        // Test 3: Get guild settings
        console.log('📋 Test 3: Getting Guild Settings');
        const guildSettings = await db.getGuildSettings(testGuildId);
        if (guildSettings) {
            console.log(`     Confession Counter: ${guildSettings.confessionCounter}`);
            console.log(`     Guild ID: ${guildSettings.guildId}`);
        } else {
            console.log('     ❌ Không tìm thấy guild settings');
        }
        console.log('');
        
        // Test 4: Try to get confession by number
        console.log('📋 Test 4: Getting Confession by Number');
        if (confession) {
            const confessionByNumber = await db.getConfessionByNumber(testGuildId, confession.confessionNumber);
            if (confessionByNumber) {
                console.log(`     ✅ Tìm thấy confession #${confession.confessionNumber}`);
                console.log(`     Content: ${confessionByNumber.content}`);
            } else {
                console.log(`     ❌ Không tìm thấy confession #${confession.confessionNumber}`);
            }
        }
        console.log('');
        
        // Test 5: List all confessions
        console.log('📋 Test 5: Listing All Confessions');
        const allConfessions = await db.getConfessions(testGuildId, 10);
        console.log(`     Found ${allConfessions.length} confessions:`);
        allConfessions.forEach((conf, index) => {
            console.log(`       ${index + 1}. Confession #${conf.confessionNumber}: ${conf.content.substring(0, 30)}...`);
        });
        
    } catch (error) {
        console.error('❌ Error during confession check:', error);
    } finally {
        await db.disconnect();
    }
}

// Run test
testCheckConfession().then(() => {
    console.log('\n🎉 Confession check finished!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Confession check failed:', error);
    process.exit(1);
}); 