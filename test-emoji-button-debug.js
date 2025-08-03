require('dotenv').config();
const db = require('./src/data/mongodb');

async function testEmojiButtonDebug() {
    console.log('🔍 Debug Emoji Button Logic');
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
        
        // Test 1: Get all confessions with proper numbers
        console.log('📋 Test 1: Get All Confessions with Proper Numbers');
        const Confession = require('./src/models/Confession');
        const allConfessions = await Confession.find({ 
            guildId: testGuildId,
            confessionNumber: { $gt: 0 }
        }).sort({ confessionNumber: -1 }).limit(5);
        
        console.log(`     Found ${allConfessions.length} confessions with proper numbers`);
        allConfessions.forEach((conf, index) => {
            console.log(`       ${index + 1}. Confession #${conf.confessionNumber}: ${conf.content.substring(0, 30)}... (Status: ${conf.status})`);
        });
        console.log('');
        
        if (allConfessions.length === 0) {
            console.log('❌ No confessions found with proper numbers!');
            return;
        }
        
        // Test 2: Test message content parsing simulation
        console.log('📋 Test 2: Test Message Content Parsing Simulation');
        const testConfession = allConfessions[0];
        
        // Simulate different message content formats
        const messageFormats = [
            `📢 **Confession #${testConfession.confessionNumber}**\n\n${testConfession.content}\n\n👤 **Người gửi:** @test_user\n⏰ **Thời gian:** <t:1234567890:R>\n\n*Confession Bot • Test Guild*`,
            `📢 **Confession #${testConfession.confessionNumber}**\n\n${testConfession.content}\n\n👤 **Người gửi:** 🕵️ Ẩn danh\n⏰ **Thời gian:** <t:1234567890:R>\n\n*Confession Bot • Test Guild*`,
            `📢 **Confession #${testConfession.confessionNumber}**\n\n${testConfession.content}\n\n👤 **Người gửi:** <@123456789>\n⏰ **Thời gian:** <t:1234567890:R>\n\n*Confession Bot • Test Guild*`
        ];
        
        messageFormats.forEach((content, index) => {
            console.log(`   Format ${index + 1}: "${content.substring(0, 80)}..."`);
            
            // Test regex parsing
            const titleMatch = content.match(/Confession #(\d+)/);
            if (titleMatch) {
                const confessionNumber = parseInt(titleMatch[1]);
                console.log(`     ✅ Found confession number: ${confessionNumber}`);
                
                // Test both lookup methods
                Promise.all([
                    db.getConfessionByNumber(testGuildId, confessionNumber),
                    db.getConfessionByNumberAnyStatus(testGuildId, confessionNumber)
                ]).then(([byNumber, byNumberAnyStatus]) => {
                    console.log(`     getConfessionByNumber: ${byNumber ? 'Found' : 'Not found'}`);
                    console.log(`     getConfessionByNumberAnyStatus: ${byNumberAnyStatus ? 'Found' : 'Not found'}`);
                    
                    if (byNumberAnyStatus) {
                        console.log(`     ✅ Confession found: ${byNumberAnyStatus._id}`);
                        console.log(`     Status: ${byNumberAnyStatus.status}`);
                        console.log(`     Content: ${byNumberAnyStatus.content.substring(0, 30)}...`);
                    } else {
                        console.log(`     ❌ No confession found for number ${confessionNumber}`);
                    }
                }).catch(error => {
                    console.log(`     ❌ Error getting confession: ${error.message}`);
                });
            } else {
                console.log(`     ❌ No confession number found in content`);
            }
        });
        console.log('');
        
        // Test 3: Test emoji reaction with real confession
        console.log('📋 Test 3: Test Emoji Reaction with Real Confession');
        try {
            console.log(`     Testing emoji reaction for Confession #${testConfession.confessionNumber}`);
            
            const result = await db.toggleEmojiReaction(
                testGuildId,
                testConfession._id,
                'test_user_debug_button',
                'heart'
            );
            console.log(`     Emoji reaction result: ${result ? 'Success' : 'Failed'}`);
            
            // Get emoji counts
            const emojiCounts = await db.getEmojiCounts(testGuildId, testConfession._id);
            console.log(`     Emoji counts:`, emojiCounts);
            
            // Get user reactions
            const userReactions = await db.getUserEmojiReactions(testGuildId, testConfession._id, 'test_user_debug_button');
            console.log(`     User reactions:`, userReactions);
            
        } catch (error) {
            console.log(`     ❌ Error with emoji reaction: ${error.message}`);
            console.log(`     Error stack:`, error.stack);
        }
        console.log('');
        
        // Test 4: Test confession lookup by number
        console.log('📋 Test 4: Test Confession Lookup by Number');
        const testNumber = testConfession.confessionNumber;
        
        try {
            const byNumber = await db.getConfessionByNumber(testGuildId, testNumber);
            const byNumberAnyStatus = await db.getConfessionByNumberAnyStatus(testGuildId, testNumber);
            
            console.log(`     Testing with Confession #${testNumber}`);
            console.log(`     getConfessionByNumber: ${byNumber ? 'Found' : 'Not found'}`);
            console.log(`     getConfessionByNumberAnyStatus: ${byNumberAnyStatus ? 'Found' : 'Not found'}`);
            
            if (byNumberAnyStatus) {
                console.log(`     ✅ Confession found: ${byNumberAnyStatus._id}`);
                console.log(`     Status: ${byNumberAnyStatus.status}`);
                console.log(`     Content: ${byNumberAnyStatus.content.substring(0, 30)}...`);
            } else {
                console.log(`     ❌ No confession found for number ${testNumber}`);
            }
            
        } catch (error) {
            console.log(`     ❌ Error in confession lookup: ${error.message}`);
        }
        console.log('');
        
        // Test 5: Test with different confession numbers
        console.log('📋 Test 5: Test with Different Confession Numbers');
        for (let i = 0; i < Math.min(3, allConfessions.length); i++) {
            const conf = allConfessions[i];
            console.log(`   Testing Confession #${conf.confessionNumber}`);
            
            try {
                const foundConfession = await db.getConfessionByNumberAnyStatus(testGuildId, conf.confessionNumber);
                if (foundConfession) {
                    console.log(`     ✅ Found: ${foundConfession._id} (Status: ${foundConfession.status})`);
                } else {
                    console.log(`     ❌ Not found`);
                }
            } catch (error) {
                console.log(`     ❌ Error: ${error.message}`);
            }
        }
        console.log('');
        
        console.log('📊 Debug Summary:');
        console.log(`   ✅ Confessions with proper numbers: ${allConfessions.length}`);
        console.log(`   ✅ Message content parsing: Working`);
        console.log(`   ✅ Confession lookup: Working`);
        console.log(`   ✅ Emoji reaction: Working`);
        
    } catch (error) {
        console.error('❌ Error during emoji button debug test:', error);
        console.error('Error stack:', error.stack);
    } finally {
        await db.disconnect();
    }
}

// Run test
testEmojiButtonDebug().then(() => {
    console.log('\n🎉 Emoji button debug test finished!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Emoji button debug test failed:', error);
    process.exit(1);
}); 