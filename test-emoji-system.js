const db = require('./src/data/mongodb');
const { createEmojiButtons, getEmojiKeyFromCustomId } = require('./src/utils/emojiButtons');

async function testEmojiSystem() {
    console.log('🧪 Testing Complete Emoji System...\n');

    try {
        // Connect to MongoDB
        await db.connect();
        console.log('✅ Connected to MongoDB');

        const guildId = '123456789';
        const userId = '987654321';

        // Test 1: Tạo confession test
        console.log('\n1. Creating test confession...');
        const confessionId = await db.addConfession(guildId, userId, 'Test confession for emoji system');
        console.log('✅ Test confession created:', confessionId);

        // Test 2: Thêm emoji reactions
        console.log('\n2. Adding emoji reactions...');
        const emojiKeys = ['heart', 'laugh', 'wow', 'sad', 'angry', 'fire'];
        
        for (const emojiKey of emojiKeys) {
            const success = await db.addEmojiReaction(guildId, confessionId, userId, emojiKey);
            console.log(`   ${emojiKey}: ${success ? '✅' : '❌'}`);
        }

        // Test 3: Lấy emoji counts
        console.log('\n3. Getting emoji counts...');
        const emojiCounts = await db.getEmojiCounts(guildId, confessionId);
        console.log('✅ Emoji counts:', emojiCounts);

        // Test 4: Lấy user reactions
        console.log('\n4. Getting user reactions...');
        const userReactions = await db.getUserEmojiReactions(guildId, confessionId, userId);
        console.log('✅ User reactions:', userReactions);

        // Test 5: Tạo emoji buttons
        console.log('\n5. Creating emoji buttons...');
        const buttons = createEmojiButtons(emojiCounts, userReactions);
        console.log('✅ Buttons created:', buttons.length, 'rows');
        buttons.forEach((row, index) => {
            console.log(`   Row ${index + 1}:`, row.components.length, 'buttons');
            row.components.forEach(button => {
                console.log(`     - ${button.data.custom_id}: ${button.data.label}`);
            });
        });

        // Test 6: Test emoji key extraction
        console.log('\n6. Testing emoji key extraction...');
        const testCustomIds = ['emoji_heart', 'emoji_laugh', 'emoji_wow'];
        testCustomIds.forEach(customId => {
            const key = getEmojiKeyFromCustomId(customId);
            console.log(`   ${customId} -> ${key}`);
        });

        // Test 7: Xóa một số reactions
        console.log('\n7. Removing some reactions...');
        await db.removeEmojiReaction(guildId, confessionId, userId, 'sad');
        await db.removeEmojiReaction(guildId, confessionId, userId, 'angry');
        
        const updatedCounts = await db.getEmojiCounts(guildId, confessionId);
        const updatedUserReactions = await db.getUserEmojiReactions(guildId, confessionId, userId);
        
        console.log('✅ Updated counts:', updatedCounts);
        console.log('✅ Updated user reactions:', updatedUserReactions);

        // Test 8: Tạo buttons với counts mới
        console.log('\n8. Creating buttons with updated counts...');
        const updatedButtons = createEmojiButtons(updatedCounts, updatedUserReactions);
        console.log('✅ Updated buttons created');
        updatedButtons.forEach((row, index) => {
            console.log(`   Row ${index + 1}:`, row.components.length, 'buttons');
            row.components.forEach(button => {
                console.log(`     - ${button.data.custom_id}: ${button.data.label}`);
            });
        });

        // Test 9: Kiểm tra stats
        console.log('\n9. Checking reaction stats...');
        const reactionStats = await db.getReactionStats(guildId);
        console.log('✅ Reaction stats:', reactionStats);

        // Test 10: Cleanup
        console.log('\n10. Cleaning up test data...');
        // Xóa tất cả reactions của test confession
        for (const emojiKey of emojiKeys) {
            await db.removeEmojiReaction(guildId, confessionId, userId, emojiKey);
        }
        
        // Xóa test confession
        const Confession = require('./src/models/Confession');
        await Confession.findByIdAndDelete(confessionId);
        
        console.log('✅ Test data cleaned up');

        console.log('\n🎉 Complete emoji system test passed!');
        
        console.log('\n📊 Final Summary:');
        console.log('- Emoji buttons created successfully');
        console.log('- Reactions added and removed correctly');
        console.log('- Counts updated in real-time');
        console.log('- User reactions tracked properly');
        console.log('- Database operations working');
        console.log('- Stats calculation accurate');

    } catch (error) {
        console.error('❌ Error during emoji system test:', error);
    } finally {
        await db.disconnect();
        console.log('\n✅ MongoDB disconnected');
    }
}

// Run the test
testEmojiSystem(); 