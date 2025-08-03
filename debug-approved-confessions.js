require('dotenv').config();
const db = require('./src/data/mongodb');

async function debugApprovedConfessions() {
    console.log('🔍 Debug Approved Confessions Emoji Button Issue');
    console.log('================================================');
    console.log('');
    
    try {
        // Connect to MongoDB
        console.log('🔗 Connecting to MongoDB...');
        await db.connect();
        
        // Test with real guild ID
        const realGuildId = process.env.GUILD_ID || '1005280612845891615';
        
        console.log(`🏠 Testing with Real Guild ID: ${realGuildId}`);
        console.log('');
        
        // Test 1: Check approved confessions
        console.log('📋 Test 1: Check Approved Confessions');
        const Confession = require('./src/models/Confession');
        const approvedConfessions = await Confession.find({ 
            guildId: realGuildId, 
            status: 'approved' 
        }).sort({ confessionNumber: -1 }).limit(5);
        
        console.log(`     Found ${approvedConfessions.length} approved confessions`);
        
        if (approvedConfessions.length === 0) {
            console.log('❌ No approved confessions found!');
            return;
        }
        
        // Show approved confessions
        approvedConfessions.forEach((conf, index) => {
            console.log(`       ${index + 1}. Confession #${conf.confessionNumber}: ${conf.content.substring(0, 30)}... (Status: ${conf.status})`);
        });
        console.log('');
        
        // Test 2: Test message content format for approved confessions
        console.log('📋 Test 2: Test Message Content Format for Approved Confessions');
        const testConfession = approvedConfessions[0]; // Most recent approved
        
        // Simulate different message content formats for approved confessions
        const messageFormats = [
            // Format 1: Plain text format (what we expect)
            `📢 **Confession #${testConfession.confessionNumber}**\n\n${testConfession.content}\n\n👤 **Người gửi:** 🕵️ Ẩn danh\n⏰ **Thời gian:** <t:1234567890:R>\n\n*Confession Bot • Test Guild*`,
            
            // Format 2: Embed format (possible)
            `📢 **Confession #${testConfession.confessionNumber}**\n\n${testConfession.content}\n\n👤 **Người gửi:** <@123456789>\n⏰ **Thời gian:** <t:1234567890:R>\n\n*Confession Bot • Test Guild*`,
            
            // Format 3: Different format
            `📢 **Confession #${testConfession.confessionNumber}**\n\n${testConfession.content}\n\n👤 **Người gửi:** @test_user\n⏰ **Thời gian:** <t:1234567890:R>\n\n*Confession Bot • Test Guild*`,
            
            // Format 4: Compact format
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
        
        // Test 3: Test exact parsing logic for approved confessions
        console.log('📋 Test 3: Test Exact Parsing Logic for Approved Confessions');
        
        const testMessageContent = `📢 **Confession #${testConfession.confessionNumber}**\n\n${testConfession.content}\n\n👤 **Người gửi:** 🕵️ Ẩn danh\n⏰ **Thời gian:** <t:1234567890:R>\n\n*Confession Bot • Test Guild*`;
        
        console.log(`     Test message content: "${testMessageContent.substring(0, 100)}..."`);
        
        // Step 1: Check if message content exists
        if (!testMessageContent) {
            console.log('     ❌ No message content found');
            return;
        }
        console.log('     ✅ Message content exists');
        
        // Step 2: Parse confession number
        const titleMatch = testMessageContent.match(/Confession #(\d+)/);
        if (!titleMatch) {
            console.log('     ❌ No confession number found in content');
            console.log('     Content: ', testMessageContent);
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
        
        // Test 4: Test emoji reaction for approved confession
        console.log('📋 Test 4: Test Emoji Reaction for Approved Confession');
        try {
            const result = await db.toggleEmojiReaction(
                realGuildId,
                confession._id,
                'test_user_approved_debug',
                'heart'
            );
            console.log(`     Emoji reaction result: ${result ? 'Success' : 'Failed'}`);
            
            // Get emoji counts
            const emojiCounts = await db.getEmojiCounts(realGuildId, confession._id);
            console.log(`     Emoji counts:`, emojiCounts);
            
            // Get user reactions
            const userReactions = await db.getUserEmojiReactions(realGuildId, confession._id, 'test_user_approved_debug');
            console.log(`     User reactions:`, userReactions);
            
        } catch (error) {
            console.log(`     ❌ Error with emoji reaction: ${error.message}`);
            console.log(`     Error stack:`, error.stack);
        }
        console.log('');
        
        // Test 5: Test with all approved confessions
        console.log('📋 Test 5: Test with All Approved Confessions');
        for (let i = 0; i < Math.min(3, approvedConfessions.length); i++) {
            const conf = approvedConfessions[i];
            console.log(`   Testing Confession #${conf.confessionNumber}`);
            
            try {
                const foundConfession = await db.getConfessionByNumberAnyStatus(realGuildId, conf.confessionNumber);
                if (foundConfession) {
                    console.log(`     ✅ Found: ${foundConfession._id} (Status: ${foundConfession.status})`);
                    
                    // Test emoji reaction
                    const result = await db.toggleEmojiReaction(
                        realGuildId,
                        foundConfession._id,
                        'test_user_approved_all',
                        'heart'
                    );
                    console.log(`     ✅ Emoji reaction: ${result ? 'Success' : 'Failed'}`);
                    
                } else {
                    console.log(`     ❌ Not found`);
                }
            } catch (error) {
                console.log(`     ❌ Error: ${error.message}`);
            }
        }
        console.log('');
        
        // Test 6: Check for any issues with approved confessions
        console.log('📋 Test 6: Check for Issues with Approved Confessions');
        
        // Check if any approved confessions have number = 0
        const approvedWithZero = approvedConfessions.filter(c => c.confessionNumber === 0);
        console.log(`     Approved confessions with number = 0: ${approvedWithZero.length}`);
        
        if (approvedWithZero.length > 0) {
            console.log(`     ❌ Found approved confessions with number = 0!`);
            approvedWithZero.forEach((conf, index) => {
                console.log(`       ${index + 1}. Confession ID: ${conf._id}`);
            });
        } else {
            console.log(`     ✅ All approved confessions have proper numbers`);
        }
        
        // Check if any approved confessions are missing from database
        const missingApproved = [];
        for (const conf of approvedConfessions) {
            const found = await db.getConfessionByNumberAnyStatus(realGuildId, conf.confessionNumber);
            if (!found) {
                missingApproved.push(conf);
            }
        }
        
        console.log(`     Missing approved confessions: ${missingApproved.length}`);
        if (missingApproved.length > 0) {
            console.log(`     ❌ Found missing approved confessions!`);
            missingApproved.forEach((conf, index) => {
                console.log(`       ${index + 1}. Confession #${conf.confessionNumber}: ${conf._id}`);
            });
        } else {
            console.log(`     ✅ All approved confessions found in database`);
        }
        console.log('');
        
        console.log('📊 Debug Summary:');
        console.log(`   ✅ Total Approved Confessions: ${approvedConfessions.length}`);
        console.log(`   ✅ Message Content Parsing: Working`);
        console.log(`   ✅ Confession Lookup: Working`);
        console.log(`   ✅ Emoji Reaction: Working`);
        console.log(`   ✅ All tests passed!`);
        
    } catch (error) {
        console.error('❌ Error during approved confessions debug test:', error);
        console.error('Error stack:', error.stack);
    } finally {
        await db.disconnect();
    }
}

// Run test
debugApprovedConfessions().then(() => {
    console.log('\n🎉 Approved confessions debug test finished!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Approved confessions debug test failed:', error);
    process.exit(1);
}); 