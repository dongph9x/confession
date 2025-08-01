const { createEmojiButtons, updateEmojiButtons, getEmojiKeyFromCustomId } = require('./src/utils/emojiButtons');

console.log('🧪 Testing Emoji Buttons...\n');

// Test 1: Tạo emoji buttons
console.log('1. Creating emoji buttons...');
const emojiCounts = {
    heart: 5,
    laugh: 3,
    wow: 1,
    sad: 0,
    angry: 2,
    fire: 4
};

const userReactions = ['heart', 'fire'];

const buttons = createEmojiButtons(emojiCounts, userReactions);
console.log('✅ Buttons created:', buttons.length, 'rows');
buttons.forEach((row, index) => {
    console.log(`   Row ${index + 1}:`, row.components.length, 'buttons');
    row.components.forEach(button => {
        console.log(`     - ${button.data.custom_id}: ${button.data.label}`);
    });
});

// Test 2: Cập nhật emoji buttons
console.log('\n2. Updating emoji buttons...');
const newEmojiCounts = {
    heart: 6,
    laugh: 3,
    wow: 1,
    sad: 1,
    angry: 2,
    fire: 5
};

const newUserReactions = ['heart', 'fire', 'sad'];

const updatedButtons = updateEmojiButtons(buttons, newEmojiCounts, newUserReactions);
console.log('✅ Buttons updated');
updatedButtons.forEach((row, index) => {
    console.log(`   Row ${index + 1}:`, row.components.length, 'buttons');
    row.components.forEach(button => {
        console.log(`     - ${button.data.custom_id}: ${button.data.label} (style: ${button.data.style})`);
    });
});

// Test 3: Lấy emoji key từ customId
console.log('\n3. Testing emoji key extraction...');
const testCustomIds = ['emoji_heart', 'emoji_laugh', 'emoji_wow', 'invalid_id'];
testCustomIds.forEach(customId => {
    const key = getEmojiKeyFromCustomId(customId);
    console.log(`   ${customId} -> ${key}`);
});

// Test 4: Simulate button interaction
console.log('\n4. Simulating button interaction...');
const interactionData = {
    customId: 'emoji_heart',
    user: { id: '123456789' }
};

const emojiKey = getEmojiKeyFromCustomId(interactionData.customId);
console.log('✅ Emoji key extracted:', emojiKey);

// Test 5: Check emoji config
console.log('\n5. Checking emoji configuration...');
const { EMOJI_CONFIG } = require('./src/utils/emojiButtons');
Object.entries(EMOJI_CONFIG).forEach(([key, config]) => {
    console.log(`   ${key}: ${config.emoji} (${config.label})`);
});

console.log('\n🎉 Emoji buttons test completed!'); 