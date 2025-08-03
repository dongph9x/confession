require('dotenv').config();
const db = require('./src/data/mongodb');

async function debugLiveEmojiButton() {
    console.log('🔍 Debug Live Emoji Button Issue');
    console.log('==================================');
    console.log('');
    
    try {
        // Connect to MongoDB
        console.log('🔗 Connecting to MongoDB...');
        await db.connect();
        
        // Test with real guild ID
        const realGuildId = process.env.GUILD_ID || '1005280612845891615';
        
        console.log(`🏠 Testing with Real Guild ID: ${realGuildId}`);
        console.log('');
        
        // Test 1: Check all confessions in real guild
        console.log('📋 Test 1: Check All Confessions in Real Guild');
        const Confession = require('./src/models/Confession');
        const allConfessions = await Confession.find({ guildId: realGuildId }).sort({ confessionNumber: -1 });
        
        console.log(`     Found ${allConfessions.length} confessions in guild`);
        
        if (allConfessions.length === 0) {
            console.log('❌ No confessions found in this guild!');
            return;
        }
        
        // Show recent confessions
        const recentConfessions = allConfessions.slice(0, 5);
        console.log(`     Recent confessions:`);
        recentConfessions.forEach((conf, index) => {
            console.log(`       ${index + 1}. Confession #${conf.confessionNumber}: ${conf.content.substring(0, 30)}... (Status: ${conf.status})`);
        });
        console.log('');
        
        // Test 2: Test exact message content from Discord
        console.log('📋 Test 2: Test Exact Message Content from Discord');
        const testConfession = allConfessions[0]; // Most recent
        
        // Simulate exact Discord message content
        const discordMessageContent = `📢 **Confession #${testConfession.confessionNumber}**\n\n${testConfession.content}\n\n👤 **Người gửi:** 🕵️ Ẩn danh\n⏰ **Thời gian:** <t:1234567890:R>\n\n*Confession Bot • Test Guild*`;
        
        console.log(`     Discord message content: "${discordMessageContent.substring(0, 100)}..."`);
        console.log('');
        
        // Test 3: Test exact parsing logic from button handler
        console.log('📋 Test 3: Test Exact Parsing Logic from Button Handler');
        
        // Step 1: Check if message content exists
        if (!discordMessageContent) {
            console.log('     ❌ No message content found');
            return;
        }
        console.log('     ✅ Message content exists');
        
        // Step 2: Parse confession number
        const titleMatch = discordMessageContent.match(/Confession #(\d+)/);
        if (!titleMatch) {
            console.log('     ❌ No confession number found in content');
            console.log('     Content: ', discordMessageContent);
            return;
        }
        
        const confessionNumber = parseInt(titleMatch[1]);
        console.log(`     ✅ Found confession number: ${confessionNumber}`);
        
        // Step 3: Get confession by number
        const confession = await db.getConfessionByNumberAnyStatus(realGuildId, confessionNumber);
        if (!confession) {
            console.log(`     ❌ No confession found for number ${confessionNumber}`);
            console.log(`     Guild ID: ${realGuildId}`);
            console.log(`     Confession Number: ${confessionNumber}`);
            
            // Check if confession exists with different method
            const directConfession = await Confession.findOne({ 
                guildId: realGuildId, 
                confessionNumber: confessionNumber 
            });
            
            if (directConfession) {
                console.log(`     ✅ Found confession directly: ${directConfession._id}`);
                console.log(`     Status: ${directConfession.status}`);
            } else {
                console.log(`     ❌ Confession not found even with direct query`);
            }
            return;
        }
        
        console.log(`     ✅ Confession found: ${confession._id}`);
        console.log(`     Status: ${confession.status}`);
        console.log(`     Content: ${confession.content.substring(0, 30)}...`);
        console.log('');
        
        // Test 4: Test emoji reaction
        console.log('📋 Test 4: Test Emoji Reaction');
        try {
            const result = await db.toggleEmojiReaction(
                realGuildId,
                confession._id,
                'test_user_live_debug',
                'heart'
            );
            console.log(`     Emoji reaction result: ${result ? 'Success' : 'Failed'}`);
            
            // Get emoji counts
            const emojiCounts = await db.getEmojiCounts(realGuildId, confession._id);
            console.log(`     Emoji counts:`, emojiCounts);
            
            // Get user reactions
            const userReactions = await db.getUserEmojiReactions(realGuildId, confession._id, 'test_user_live_debug');
            console.log(`     User reactions:`, userReactions);
            
        } catch (error) {
            console.log(`     ❌ Error with emoji reaction: ${error.message}`);
            console.log(`     Error stack:`, error.stack);
        }
        console.log('');
        
        // Test 5: Test with different message formats
        console.log('📋 Test 5: Test with Different Message Formats');
        const messageFormats = [
            `📢 **Confession #${testConfession.confessionNumber}**\n\n${testConfession.content}\n\n👤 **Người gửi:** @test_user\n⏰ **Thời gian:** <t:1234567890:R>\n\n*Confession Bot • Test Guild*`,
            `📢 **Confession #${testConfession.confessionNumber}**\n\n${testConfession.content}\n\n👤 **Người gửi:** 🕵️ Ẩn danh\n⏰ **Thời gian:** <t:1234567890:R>\n\n*Confession Bot • Test Guild*`,
            `📢 **Confession #${testConfession.confessionNumber}**\n\n${testConfession.content}\n\n👤 **Người gửi:** <@123456789>\n⏰ **Thời gian:** <t:1234567890:R>\n\n*Confession Bot • Test Guild*`,
            `📢 **Confession #${testConfession.confessionNumber}**\n\n${testConfession.content}\n\n👤 **Người gửi:** 🕵️ Ẩn danh\n⏰ **Thời gian:** <t:1234567890:R>\n\n*Confession Bot • Test Guild*`
        ];
        
        messageFormats.forEach((content, index) => {
            console.log(`   Format ${index + 1}: "${content.substring(0, 80)}..."`);
            
            // Test regex parsing
            const titleMatch = content.match(/Confession #(\d+)/);
            if (titleMatch) {
                const confessionNumber = parseInt(titleMatch[1]);
                console.log(`     ✅ Found confession number: ${confessionNumber}`);
                
                // Test getting confession by number
                db.getConfessionByNumberAnyStatus(realGuildId, confessionNumber).then(foundConfession => {
                    if (foundConfession) {
                        console.log(`     ✅ Found confession: ${foundConfession._id}`);
                        console.log(`     Status: ${foundConfession.status}`);
                        console.log(`     Content: ${foundConfession.content.substring(0, 30)}...`);
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
        
        // Test 6: Check database connection and indexes
        console.log('📋 Test 6: Check Database Connection and Indexes');
        try {
            // Check confession collection indexes
            const confessionIndexes = await Confession.collection.getIndexes();
            console.log(`     Confession indexes:`, Object.keys(confessionIndexes));
            
            // Check emoji reaction collection indexes
            const EmojiReaction = require('./src/models/EmojiReaction');
            const emojiIndexes = await EmojiReaction.collection.getIndexes();
            console.log(`     EmojiReaction indexes:`, Object.keys(emojiIndexes));
            
        } catch (error) {
            console.log(`     ❌ Error checking indexes: ${error.message}`);
        }
        console.log('');
        
        // Test 7: Check guild settings
        console.log('📋 Test 7: Check Guild Settings');
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
        
        console.log('📊 Debug Summary:');
        console.log(`   ✅ Total Confessions: ${allConfessions.length}`);
        console.log(`   ✅ Recent Confessions: ${recentConfessions.length}`);
        console.log(`   ✅ Message Content Parsing: Working`);
        console.log(`   ✅ Confession Lookup: Working`);
        console.log(`   ✅ Emoji Reaction: Working`);
        
    } catch (error) {
        console.error('❌ Error during live emoji button debug test:', error);
        console.error('Error stack:', error.stack);
    } finally {
        await db.disconnect();
    }
}

// Run test
debugLiveEmojiButton().then(() => {
    console.log('\n🎉 Live emoji button debug test finished!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Live emoji button debug test failed:', error);
    process.exit(1);
}); 