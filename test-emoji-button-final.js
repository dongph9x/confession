require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const db = require('./src/data/mongodb.js');

// Cấu hình bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// Thông tin test
const testGuildId = '1202554844858527744';
const testUserId = '123456789';

async function testEmojiButtonFinal() {
    try {
        console.log('🔍 Test Emoji Button Final...');
        
        // Kết nối database
        console.log('🔗 Kết nối database...');
        await db.connect();
        
        // 1. Tạo confession test
        console.log('\n📝 1. Tạo confession test...');
        const testContent = 'Đây là confession test để test emoji button click';
        const confessionId = await db.addConfession(testGuildId, testUserId, testContent, true);
        const confession = await db.getConfession(confessionId);
        
        console.log(`   ✅ Confession created:`);
        console.log(`      ID: ${confession._id}`);
        console.log(`      Number: ${confession.confessionNumber}`);
        console.log(`      Status: ${confession.status}`);
        console.log(`      Content: ${confession.content}`);
        
        // 2. Test các trường hợp message content khác nhau
        console.log('\n📝 2. Test các trường hợp message content:');
        
        const testCases = [
            {
                name: 'Plain text content',
                content: `Confession #${confession.confessionNumber}: ${confession.content}`,
                embeds: []
            },
            {
                name: 'Empty content with embed',
                content: '',
                embeds: [{
                    title: `📢 **Confession #${confession.confessionNumber}**`,
                    description: `${confession.content}\n\n👤 **Người gửi:** 🕵️ Ẩn danh\n⏰ **Thời gian:** <t:1234567890:R>`
                }]
            },
            {
                name: 'Empty content with embed description only',
                content: '',
                embeds: [{
                    title: 'Confession',
                    description: `Confession #${confession.confessionNumber}: ${confession.content}`
                }]
            },
            {
                name: 'Mixed content',
                content: `Some prefix text Confession #${confession.confessionNumber}: ${confession.content}`,
                embeds: []
            }
        ];
        
                 for (let index = 0; index < testCases.length; index++) {
             const testCase = testCases[index];
            console.log(`\n   Test Case ${index + 1}: ${testCase.name}`);
            console.log(`     Content: "${testCase.content}"`);
            console.log(`     Content length: ${testCase.content.length}`);
            console.log(`     Embeds: ${testCase.embeds.length}`);
            
            // Simulate the parsing logic
            let confessionNumber = null;
            
            // Method 1: Tìm từ message content
            if (testCase.content) {
                const titleMatch = testCase.content.match(/Confession #(\d+)/);
                if (titleMatch) {
                    confessionNumber = parseInt(titleMatch[1]);
                    console.log(`     ✅ Found confession number from content: ${confessionNumber}`);
                }
            }
            
            // Method 2: Tìm từ embeds nếu content rỗng
            if (!confessionNumber && testCase.embeds.length > 0) {
                const embed = testCase.embeds[0];
                console.log(`     Checking embed: "${embed.title}"`);
                
                if (embed.title) {
                    const titleMatch = embed.title.match(/Confession #(\d+)/);
                    if (titleMatch) {
                        confessionNumber = parseInt(titleMatch[1]);
                        console.log(`     ✅ Found confession number from embed title: ${confessionNumber}`);
                    }
                }
                
                if (!confessionNumber && embed.description) {
                    const descMatch = embed.description.match(/Confession #(\d+)/);
                    if (descMatch) {
                        confessionNumber = parseInt(descMatch[1]);
                        console.log(`     ✅ Found confession number from embed description: ${confessionNumber}`);
                    }
                }
            }
            
                         if (!confessionNumber) {
                 console.log(`     ❌ No confession number found`);
             } else {
                 // Test tìm confession trong database
                 try {
                     const foundConfession = await db.getConfessionByNumberAnyStatus(testGuildId, confessionNumber);
                     if (foundConfession) {
                         console.log(`     ✅ Found confession in database:`);
                         console.log(`        ID: ${foundConfession._id}`);
                         console.log(`        Status: ${foundConfession.status}`);
                         
                         // Test emoji reaction
                         await testEmojiReaction(foundConfession._id, confessionNumber);
                     } else {
                         console.log(`     ❌ Confession not found in database`);
                     }
                 } catch (error) {
                     console.log(`     ❌ Error finding confession: ${error.message}`);
                 }
                          }
         }
        
        console.log('\n✅ Test hoàn thành!');
        
    } catch (error) {
        console.error('❌ Error trong test:', error);
    } finally {
        await db.disconnect();
    }
}

async function testEmojiReaction(confessionId, confessionNumber) {
    try {
        console.log(`\n🎨 Testing emoji reaction for confession #${confessionNumber}:`);
        
        const emojiKey = 'heart';
        console.log(`   Testing emoji: ${emojiKey}`);
        
        // Test toggle emoji reaction
        const toggleResult = await db.toggleEmojiReaction(testGuildId, confessionId, testUserId, emojiKey);
        console.log(`   Toggle result:`, toggleResult);
        
        // Test emoji counts
        const emojiCounts = await db.getEmojiCounts(testGuildId, confessionId);
        console.log(`   Emoji counts:`, emojiCounts);
        
        // Test user reactions
        const userReactions = await db.getUserEmojiReactions(testGuildId, confessionId, testUserId);
        console.log(`   User reactions:`, userReactions);
        
        console.log(`   ✅ Emoji reaction test completed for confession #${confessionNumber}`);
        
    } catch (error) {
        console.error(`   ❌ Error testing emoji reaction:`, error);
    }
}

// Chạy test
testEmojiButtonFinal().then(() => {
    console.log('🎯 Test script completed');
    process.exit(0);
}).catch(error => {
    console.error('💥 Test script failed:', error);
    process.exit(1);
}); 