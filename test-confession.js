const db = require('./src/data/database');

async function testConfessionSystem() {
    try {
        console.log('🧪 Testing Confession System...\n');
        
        // Test database connection
        await db.init();
        console.log('✅ Database connected');
        
        // Test guild settings
        const testGuildId = 'test-guild-123';
        const settings = await db.getGuildSettings(testGuildId);
        console.log('📋 Current settings:', settings);
        
        // Test adding confession
        const confessionId = await db.addConfession(testGuildId, 'test-user-123', 'Test confession content');
        console.log('✅ Added confession with ID:', confessionId);
        
        // Test getting confession
        const confession = await db.getConfession(confessionId);
        console.log('✅ Retrieved confession:', confession);
        
        // Test pending confessions
        const pending = await db.getPendingConfessions(testGuildId);
        console.log('✅ Pending confessions:', pending.length);
        
        // Test stats
        const stats = await db.getConfessionStats(testGuildId);
        console.log('✅ Stats:', stats);
        
        console.log('\n🎉 Confession system is working!');
        console.log('\n📋 To see buttons:');
        console.log('1. Set up review channel: !setreview #review-confession');
        console.log('2. Set up confession channel: !setconfess #confession');
        console.log('3. Send confession: !confess <content>');
        console.log('4. Check review channel for buttons');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        db.close();
        process.exit(0);
    }
}

testConfessionSystem(); 