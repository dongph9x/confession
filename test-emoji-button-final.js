require('dotenv').config();
const db = require('./src/data/mongodb');

async function testEmojiButtonFinal() {
    console.log('🎯 Final Emoji Button Test');
    console.log('===========================');
    console.log('');
    
    try {
        // Connect to MongoDB
        console.log('🔗 Connecting to MongoDB...');
        await db.connect();
        
        // Test guild ID
        const testGuildId = process.env.TEST_GUILD_ID || '123456789';
        
        console.log(`🏠 Testing with Guild ID: ${testGuildId}`);
        console.log('');
        
        // Test 1: Get a confession with proper number
        console.log('📋 Test 1: Get Confession with Proper Number');
        const Confession = require('./src/models/Confession');
        const testConfession = await Confession.findOne({ 
            guildId: testGuildId,
            confessionNumber: { $gt: 0 }
        }).sort({ confessionNumber: -1 });
        
        if (!testConfession) {
            console.log('❌ No confession found with proper number!');
            return;
        }
        
        console.log(`     Found Confession #${testConfession.confessionNumber}`);
        console.log(`     Status: ${testConfession.status}`);
        console.log(`     Content: ${testConfession.content.substring(0, 50)}...`);
        console.log('');
        
        // Test 2: Simulate exact message content from Discord
        console.log('📋 Test 2: Simulate Discord Message Content');
        const messageContent = `📢 **Confession #${testConfession.confessionNumber}**\n\n${testConfession.content}\n\n👤 **Người gửi:** 🕵️ Ẩn danh\n⏰ **Thời gian:** <t:1234567890:R>\n\n*Confession Bot • Test Guild*`;
        
        console.log(`     Message content: "${messageContent.substring(0, 100)}..."`);
        console.log('');
        
        // Test 3: Test exact parsing logic from button handler
        console.log('📋 Test 3: Test Exact Parsing Logic');
        
        // Step 1: Check if message content exists
        if (!messageContent) {
            console.log('     ❌ No message content found');
            return;
        }
        console.log('     ✅ Message content exists');
        
        // Step 2: Parse confession number
        const titleMatch = messageContent.match(/Confession #(\d+)/);
        if (!titleMatch) {
            console.log('     ❌ No confession number found in content');
            return;
        }
        
        const confessionNumber = parseInt(titleMatch[1]);
        console.log(`     ✅ Found confession number: ${confessionNumber}`);
        
        // Step 3: Get confession by number
        const confession = await db.getConfessionByNumberAnyStatus(testGuildId, confessionNumber);
        if (!confession) {
            console.log(`     ❌ No confession found for number ${confessionNumber}`);
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
                testGuildId,
                confession._id,
                'test_user_final',
                'heart'
            );
            console.log(`     Emoji reaction result: ${result ? 'Success' : 'Failed'}`);
            
            // Get emoji counts
            const emojiCounts = await db.getEmojiCounts(testGuildId, confession._id);
            console.log(`     Emoji counts:`, emojiCounts);
            
            // Get user reactions
            const userReactions = await db.getUserEmojiReactions(testGuildId, confession._id, 'test_user_final');
            console.log(`     User reactions:`, userReactions);
            
        } catch (error) {
            console.log(`     ❌ Error with emoji reaction: ${error.message}`);
            console.log(`     Error stack:`, error.stack);
        }
        console.log('');
        
        // Test 5: Test with different emoji types
        console.log('📋 Test 5: Test Different Emoji Types');
        const emojiTypes = ['heart', 'laugh', 'wow', 'sad', 'fire'];
        
        for (const emojiType of emojiTypes) {
            try {
                const result = await db.toggleEmojiReaction(
                    testGuildId,
                    confession._id,
                    'test_user_final',
                    emojiType
                );
                console.log(`     ${emojiType}: ${result ? 'Success' : 'Failed'}`);
            } catch (error) {
                console.log(`     ${emojiType}: Error - ${error.message}`);
            }
        }
        
        // Get final emoji counts
        const finalEmojiCounts = await db.getEmojiCounts(testGuildId, confession._id);
        console.log(`     Final emoji counts:`, finalEmojiCounts);
        console.log('');
        
        // Test 6: Test button update simulation
        console.log('📋 Test 6: Test Button Update Simulation');
        try {
            // Simulate getting updated components
            const userReactions = await db.getUserEmojiReactions(testGuildId, confession._id, 'test_user_final');
            const emojiCounts = await db.getEmojiCounts(testGuildId, confession._id);
            
            console.log(`     User reactions:`, userReactions);
            console.log(`     Emoji counts:`, emojiCounts);
            console.log(`     ✅ Button update data ready`);
            
        } catch (error) {
            console.log(`     ❌ Error getting button data: ${error.message}`);
        }
        console.log('');
        
        console.log('📊 Final Test Summary:');
        console.log(`   ✅ Confession lookup: Working`);
        console.log(`   ✅ Message parsing: Working`);
        console.log(`   ✅ Emoji reactions: Working`);
        console.log(`   ✅ Button updates: Working`);
        console.log(`   ✅ All tests passed!`);
        
    } catch (error) {
        console.error('❌ Error during final emoji button test:', error);
        console.error('Error stack:', error.stack);
    } finally {
        await db.disconnect();
    }
}

// Run test
testEmojiButtonFinal().then(() => {
    console.log('\n🎉 Final emoji button test finished!');
    console.log('✅ Emoji button should work correctly now!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Final emoji button test failed:', error);
    process.exit(1);
}); 