require('dotenv').config();
const db = require('./src/data/mongodb');

async function testRealGuildDebug() {
    console.log('🔍 Debug Real Guild Emoji Button Issue');
    console.log('======================================');
    console.log('');
    
    try {
        // Connect to MongoDB
        console.log('🔗 Connecting to MongoDB...');
        await db.connect();
        
        // Test with real guild ID from environment
        const realGuildId = process.env.GUILD_ID || process.env.TEST_GUILD_ID || '123456789';
        
        console.log(`🏠 Testing with Real Guild ID: ${realGuildId}`);
        console.log('');
        
        // Test 1: Check all confessions in real guild
        console.log('📋 Test 1: Check All Confessions in Real Guild');
        const Confession = require('./src/models/Confession');
        const allConfessions = await Confession.find({ guildId: realGuildId }).sort({ confessionNumber: -1 });
        
        console.log(`     Found ${allConfessions.length} confessions in guild`);
        
        if (allConfessions.length === 0) {
            console.log('❌ No confessions found in this guild!');
            console.log('   This might be the issue - no confessions to react to.');
            return;
        }
        
        // Show recent confessions
        const recentConfessions = allConfessions.slice(0, 5);
        console.log(`     Recent confessions:`);
        recentConfessions.forEach((conf, index) => {
            console.log(`       ${index + 1}. Confession #${conf.confessionNumber}: ${conf.content.substring(0, 30)}... (Status: ${conf.status})`);
        });
        console.log('');
        
        // Test 2: Test confession lookup with real data
        console.log('📋 Test 2: Test Confession Lookup with Real Data');
        const testConfession = allConfessions[0]; // Most recent
        
        console.log(`     Testing with Confession #${testConfession.confessionNumber}`);
        console.log(`     Confession ID: ${testConfession._id}`);
        console.log(`     Status: ${testConfession.status}`);
        console.log(`     Content: ${testConfession.content.substring(0, 50)}...`);
        console.log('');
        
        // Test both lookup methods
        const byNumber = await db.getConfessionByNumber(realGuildId, testConfession.confessionNumber);
        const byNumberAnyStatus = await db.getConfessionByNumberAnyStatus(realGuildId, testConfession.confessionNumber);
        
        console.log(`     getConfessionByNumber: ${byNumber ? 'Found' : 'Not found'}`);
        console.log(`     getConfessionByNumberAnyStatus: ${byNumberAnyStatus ? 'Found' : 'Not found'}`);
        
        if (byNumberAnyStatus) {
            console.log(`     ✅ Confession found: ${byNumberAnyStatus._id}`);
            console.log(`     Status: ${byNumberAnyStatus.status}`);
            console.log(`     Content: ${byNumberAnyStatus.content.substring(0, 30)}...`);
        } else {
            console.log(`     ❌ No confession found for number ${testConfession.confessionNumber}`);
        }
        console.log('');
        
        // Test 3: Test message content parsing with real confession
        console.log('📋 Test 3: Test Message Content Parsing with Real Confession');
        const messageContent = `📢 **Confession #${testConfession.confessionNumber}**\n\n${testConfession.content}\n\n👤 **Người gửi:** 🕵️ Ẩn danh\n⏰ **Thời gian:** <t:1234567890:R>\n\n*Confession Bot • Test Guild*`;
        
        console.log(`     Message content: "${messageContent.substring(0, 100)}..."`);
        
        // Test regex parsing
        const titleMatch = messageContent.match(/Confession #(\d+)/);
        if (titleMatch) {
            const confessionNumber = parseInt(titleMatch[1]);
            console.log(`     ✅ Found confession number: ${confessionNumber}`);
            
            // Test getting confession by number
            const foundConfession = await db.getConfessionByNumberAnyStatus(realGuildId, confessionNumber);
            if (foundConfession) {
                console.log(`     ✅ Found confession: ${foundConfession._id}`);
                console.log(`     Status: ${foundConfession.status}`);
                console.log(`     Content: ${foundConfession.content.substring(0, 30)}...`);
            } else {
                console.log(`     ❌ No confession found for number ${confessionNumber}`);
            }
        } else {
            console.log(`     ❌ No confession number found in content`);
        }
        console.log('');
        
        // Test 4: Test emoji reaction with real confession
        console.log('📋 Test 4: Test Emoji Reaction with Real Confession');
        try {
            const result = await db.toggleEmojiReaction(
                realGuildId,
                testConfession._id,
                'test_user_real_guild',
                'heart'
            );
            console.log(`     Emoji reaction result: ${result ? 'Success' : 'Failed'}`);
            
            // Get emoji counts
            const emojiCounts = await db.getEmojiCounts(realGuildId, testConfession._id);
            console.log(`     Emoji counts:`, emojiCounts);
            
            // Get user reactions
            const userReactions = await db.getUserEmojiReactions(realGuildId, testConfession._id, 'test_user_real_guild');
            console.log(`     User reactions:`, userReactions);
            
        } catch (error) {
            console.log(`     ❌ Error with emoji reaction: ${error.message}`);
            console.log(`     Error stack:`, error.stack);
        }
        console.log('');
        
        // Test 5: Check guild settings
        console.log('📋 Test 5: Check Guild Settings');
        const guildSettings = await db.getGuildSettings(realGuildId);
        if (guildSettings) {
            console.log(`     Confession Counter: ${guildSettings.confessionCounter}`);
            console.log(`     Guild ID: ${guildSettings.guildId}`);
            console.log(`     Confession Channel: ${guildSettings.confessionChannel}`);
            console.log(`     Review Channel: ${guildSettings.reviewChannel}`);
        } else {
            console.log('     ❌ No guild settings found');
        }
        console.log('');
        
        // Test 6: Check for confessions with number = 0
        console.log('📋 Test 6: Check for Confessions with Number = 0');
        const confessionsWithZero = await Confession.find({ 
            guildId: realGuildId, 
            confessionNumber: 0 
        });
        
        console.log(`     Found ${confessionsWithZero.length} confessions with number = 0`);
        if (confessionsWithZero.length > 0) {
            console.log(`     ❌ These confessions will cause emoji button issues!`);
            confessionsWithZero.forEach((conf, index) => {
                console.log(`       ${index + 1}. Confession ID: ${conf._id} (Status: ${conf.status})`);
            });
        } else {
            console.log(`     ✅ No confessions with number = 0`);
        }
        console.log('');
        
        console.log('📊 Debug Summary:');
        console.log(`   ✅ Total Confessions: ${allConfessions.length}`);
        console.log(`   ✅ Confessions with number > 0: ${allConfessions.filter(c => c.confessionNumber > 0).length}`);
        console.log(`   ✅ Confessions with number = 0: ${confessionsWithZero.length}`);
        console.log(`   ✅ Guild Settings: ${guildSettings ? 'Found' : 'Not found'}`);
        
        if (confessionsWithZero.length > 0) {
            console.log(`   ⚠️  ISSUE: Found confessions with number = 0`);
            console.log(`   🔧 SOLUTION: Run fix-confession-numbers.js to fix them`);
        }
        
    } catch (error) {
        console.error('❌ Error during real guild debug test:', error);
        console.error('Error stack:', error.stack);
    } finally {
        await db.disconnect();
    }
}

// Run test
testRealGuildDebug().then(() => {
    console.log('\n🎉 Real guild debug test finished!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Real guild debug test failed:', error);
    process.exit(1);
}); 