const { Client, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');
const db = require('./src/data/mongodb');
const { createEmojiButtons, getEmojiKeyFromCustomId, updateEmojiButtons, getAvailableEmojis } = require('./src/utils/emojiButtons');
require('dotenv').config();

async function testEmojiSystem() {
    console.log('🧪 Testing emoji buttons system...\n');

    try {
        await db.connect();
        console.log('✅ Connected to MongoDB');

        // Test 1: Available emojis
        console.log('\n📊 Test 1: Available Emojis');
        const availableEmojis = getAvailableEmojis();
        console.log('Available emojis:', availableEmojis);

        // Test 2: Create emoji buttons
        console.log('\n🔧 Test 2: Create Emoji Buttons');
        const emptyButtons = createEmojiButtons();
        console.log('Empty buttons created:', emptyButtons.length, 'rows');

        const buttonsWithCounts = createEmojiButtons({
            heart: 5,
            laugh: 3,
            wow: 1,
            fire: 2
        });
        console.log('Buttons with counts created:', buttonsWithCounts.length, 'rows');

        // Test 3: Get emoji key from custom ID
        console.log('\n🔑 Test 3: Get Emoji Key from Custom ID');
        const testCustomId = 'emoji_heart';
        const emojiKey = getEmojiKeyFromCustomId(testCustomId);
        console.log(`Custom ID: ${testCustomId} -> Emoji Key: ${emojiKey}`);

        // Test 4: Update emoji buttons
        console.log('\n🔄 Test 4: Update Emoji Buttons');
        const updatedButtons = updateEmojiButtons(
            buttonsWithCounts,
            { heart: 6, laugh: 4, wow: 2, fire: 3, sad: 1 },
            ['heart', 'fire']
        );
        console.log('Updated buttons created:', updatedButtons.length, 'rows');

        // Test 5: Database operations
        console.log('\n🗄️ Test 5: Database Operations');
        
        const testGuildId = 'test-guild-123';
        const testConfessionId = new mongoose.Types.ObjectId(); // Use proper ObjectId
        const testUserId = 'test-user-789';
        const testEmojiKey = 'heart';

        // Test add emoji reaction
        console.log('Testing add emoji reaction...');
        const addResult = await db.addEmojiReaction(testGuildId, testConfessionId, testUserId, testEmojiKey);
        console.log('Add reaction result:', addResult);

        // Test get emoji counts
        console.log('Testing get emoji counts...');
        const counts = await db.getEmojiCounts(testGuildId, testConfessionId);
        console.log('Emoji counts:', counts);

        // Test get user reactions
        console.log('Testing get user reactions...');
        const userReactions = await db.getUserEmojiReactions(testGuildId, testConfessionId, testUserId);
        console.log('User reactions:', userReactions);

        // Test toggle emoji reaction
        console.log('Testing toggle emoji reaction...');
        const toggleResult = await db.toggleEmojiReaction(testGuildId, testConfessionId, testUserId, testEmojiKey);
        console.log('Toggle result:', toggleResult);

        // Test remove emoji reaction
        console.log('Testing remove emoji reaction...');
        const removeResult = await db.removeEmojiReaction(testGuildId, testConfessionId, testUserId, testEmojiKey);
        console.log('Remove reaction result:', removeResult);

        console.log('\n✅ All emoji system tests completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await db.disconnect();
        console.log('\n✅ MongoDB disconnected');
    }
}

// Run the test
testEmojiSystem(); 