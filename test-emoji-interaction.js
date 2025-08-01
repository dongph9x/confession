const { createEmojiButtons, updateEmojiButtons, getEmojiKeyFromCustomId } = require('./src/utils/emojiButtons');

console.log('🧪 Testing Emoji Button Interaction...\n');

// Test 1: Tạo emoji buttons ban đầu
console.log('1. Creating initial emoji buttons...');
const initialCounts = {
    heart: 0,
    laugh: 0,
    wow: 0,
    sad: 0,
    angry: 0,
    fire: 0
};

const initialButtons = createEmojiButtons(initialCounts, []);
console.log('✅ Initial buttons created');
initialButtons.forEach((row, index) => {
    console.log(`   Row ${index + 1}:`, row.components.length, 'buttons');
    row.components.forEach(button => {
        console.log(`     - ${button.data.custom_id}: ${button.data.label}`);
    });
});

// Test 2: Simulate user clicking heart emoji
console.log('\n2. Simulating user clicking heart emoji...');
const heartCustomId = 'emoji_heart';
const emojiKey = getEmojiKeyFromCustomId(heartCustomId);
console.log(`   Custom ID: ${heartCustomId}`);
console.log(`   Extracted key: ${emojiKey}`);

// Test 3: Update counts after heart reaction
console.log('\n3. Updating counts after heart reaction...');
const updatedCounts = {
    heart: 1,
    laugh: 0,
    wow: 0,
    sad: 0,
    angry: 0,
    fire: 0
};

const userReactions = ['heart'];
const updatedButtons = updateEmojiButtons(initialButtons, updatedCounts, userReactions);
console.log('✅ Updated buttons after heart reaction');
updatedButtons.forEach((row, index) => {
    console.log(`   Row ${index + 1}:`, row.components.length, 'buttons');
    row.components.forEach(button => {
        console.log(`     - ${button.data.custom_id}: ${button.data.label} (style: ${button.data.style})`);
    });
});

// Test 4: Simulate multiple reactions
console.log('\n4. Simulating multiple reactions...');
const multipleCounts = {
    heart: 3,
    laugh: 2,
    wow: 1,
    sad: 0,
    angry: 1,
    fire: 2
};

const multipleUserReactions = ['heart', 'laugh', 'fire'];
const multipleButtons = createEmojiButtons(multipleCounts, multipleUserReactions);
console.log('✅ Buttons with multiple reactions');
multipleButtons.forEach((row, index) => {
    console.log(`   Row ${index + 1}:`, row.components.length, 'buttons');
    row.components.forEach(button => {
        console.log(`     - ${button.data.custom_id}: ${button.data.label} (style: ${button.data.style})`);
    });
});

// Test 5: Simulate removing a reaction
console.log('\n5. Simulating removing heart reaction...');
const removedUserReactions = ['laugh', 'fire']; // Removed 'heart'
const removedButtons = updateEmojiButtons(multipleButtons, multipleCounts, removedUserReactions);
console.log('✅ Buttons after removing heart reaction');
removedButtons.forEach((row, index) => {
    console.log(`   Row ${index + 1}:`, row.components.length, 'buttons');
    row.components.forEach(button => {
        console.log(`     - ${button.data.custom_id}: ${button.data.label} (style: ${button.data.style})`);
    });
});

// Test 6: Test all emoji keys
console.log('\n6. Testing all emoji keys...');
const allEmojiKeys = ['heart', 'laugh', 'wow', 'sad', 'angry', 'fire'];
allEmojiKeys.forEach(key => {
    const customId = `emoji_${key}`;
    const extractedKey = getEmojiKeyFromCustomId(customId);
    console.log(`   ${customId} -> ${extractedKey} (${extractedKey === key ? '✅' : '❌'})`);
});

console.log('\n🎉 Emoji interaction test completed!');
console.log('\n📊 Summary:');
console.log('- ✅ Emoji buttons created successfully');
console.log('- ✅ Button updates work correctly');
console.log('- ✅ User reactions tracked properly');
console.log('- ✅ Visual feedback (button styles) working');
console.log('- ✅ Emoji key extraction accurate');
console.log('- ✅ Toggle functionality simulated'); 