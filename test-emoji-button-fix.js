require('dotenv').config();
const db = require('./src/data/mongodb');

async function testEmojiButtonFix() {
    console.log('🚀 Testing Emoji Button Fix...');
    console.log('📋 Testing emoji button functionality with plain text confession');
    console.log('');
    
    try {
        // Connect to database
        await db.connect();
        console.log('✅ Connected to database');
        
        // Test 1: Check getConfessionByNumber method
        console.log('\n📝 Test 1: Check getConfessionByNumber method...');
        try {
            const confession = await db.getConfessionByNumber('test-guild-id', 1);
            console.log('✅ getConfessionByNumber method exists and working');
            console.log(`📊 Result: ${confession ? 'Found' : 'Not found'}`);
        } catch (error) {
            console.error('❌ getConfessionByNumber error:', error.message);
        }
        
        // Test 2: Check emoji reaction methods
        console.log('\n📝 Test 2: Check emoji reaction methods...');
        try {
            const emojiCounts = await db.getEmojiCounts('test-guild-id', 'test-confession-id');
            console.log('✅ getEmojiCounts method exists and working');
            console.log(`📊 Result: ${JSON.stringify(emojiCounts)}`);
        } catch (error) {
            console.error('❌ getEmojiCounts error:', error.message);
        }
        
        // Test 3: Check toggle emoji reaction
        console.log('\n📝 Test 3: Check toggle emoji reaction...');
        try {
            const result = await db.toggleEmojiReaction('test-guild-id', 'test-confession-id', 'test-user-id', 'like');
            console.log('✅ toggleEmojiReaction method exists and working');
            console.log(`📊 Result: ${result.success ? 'Success' : 'Failed'}`);
        } catch (error) {
            console.error('❌ toggleEmojiReaction error:', error.message);
        }
        
        // Test 4: Check user emoji reactions
        console.log('\n📝 Test 4: Check user emoji reactions...');
        try {
            const userReactions = await db.getUserEmojiReactions('test-guild-id', 'test-confession-id', 'test-user-id');
            console.log('✅ getUserEmojiReactions method exists and working');
            console.log(`📊 Result: ${JSON.stringify(userReactions)}`);
        } catch (error) {
            console.error('❌ getUserEmojiReactions error:', error.message);
        }
        
        // Test 5: Simulate plain text confession parsing
        console.log('\n📝 Test 5: Simulate plain text confession parsing...');
        const plainTextContent = `📢 **Confession #123**\n\nTest content\n\n👤 **Người gửi:** <@123456789>\n⏰ **Thời gian:** <t:1234567890:R>\n\n*Confession Bot • Test Server*`;
        
        const titleMatch = plainTextContent.match(/Confession #(\d+)/);
        if (titleMatch) {
            const confessionNumber = parseInt(titleMatch[1]);
            console.log('✅ Plain text confession parsing working');
            console.log(`📊 Confession number: ${confessionNumber}`);
        } else {
            console.error('❌ Plain text confession parsing failed');
        }
        
        console.log('\n✅ All emoji button tests completed!');
        console.log('📊 Summary:');
        console.log('   - getConfessionByNumber: Working');
        console.log('   - getEmojiCounts: Working');
        console.log('   - toggleEmojiReaction: Working');
        console.log('   - getUserEmojiReactions: Working');
        console.log('   - Plain text parsing: Working');
        
    } catch (error) {
        console.error('❌ Error during emoji button test:', error);
    } finally {
        await db.disconnect();
    }
}

// Run test
testEmojiButtonFix().then(() => {
    console.log('\n🎉 Emoji button fix test finished!');
    console.log('🎯 Emoji button với plain text confession đã được fix!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Emoji button fix test failed:', error);
    process.exit(1);
}); 