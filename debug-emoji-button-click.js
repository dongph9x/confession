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
const realGuildId = '1202554844858527744';
const testMessageId = '1202554844858527744'; // Thay bằng message ID thực tế

async function debugEmojiButtonClick() {
    try {
        console.log('🔍 Bắt đầu debug emoji button click...');
        
        // Kết nối database
        console.log('🔗 Kết nối database...');
        await db.connect();
        
        // 1. Test lấy confession từ database
        console.log('\n📊 1. Kiểm tra confessions trong database:');
        const Confession = require('./src/models/Confession');
        const allConfessions = await Confession.find({ guildId: realGuildId }).sort({ confessionNumber: -1 }).limit(5);
        console.log(`   Tổng số confessions: ${allConfessions.length}`);
        
        if (allConfessions.length > 0) {
            const latestConfession = allConfessions[0];
            console.log(`   Confession mới nhất:`);
            console.log(`     ID: ${latestConfession._id}`);
            console.log(`     Number: ${latestConfession.confessionNumber}`);
            console.log(`     Status: ${latestConfession.status}`);
            console.log(`     Content: ${latestConfession.content.substring(0, 50)}...`);
            
            // Test method getConfessionByNumberAnyStatus
            const confessionNumber = latestConfession.confessionNumber;
            const foundConfession = await db.getConfessionByNumberAnyStatus(realGuildId, confessionNumber);
            console.log(`   getConfessionByNumberAnyStatus(${confessionNumber}): ${foundConfession ? 'Found' : 'Not found'}`);
            
            if (foundConfession) {
                console.log(`     Found confession: ${foundConfession._id}`);
                console.log(`     Status: ${foundConfession.status}`);
                console.log(`     Content: ${foundConfession.content.substring(0, 50)}...`);
            }
        }
        
        // 2. Test parsing message content
        console.log('\n📝 2. Test parsing message content:');
        const testContents = [
            'Confession #123: Test confession content',
            'Confession #456: Another test',
            'Some other message without confession',
            'Confession #789: Final test'
        ];
        
        testContents.forEach((content, index) => {
            console.log(`   Test ${index + 1}: "${content}"`);
            const titleMatch = content.match(/Confession #(\d+)/);
            if (titleMatch) {
                const confessionNumber = parseInt(titleMatch[1]);
                console.log(`     ✅ Found confession number: ${confessionNumber}`);
            } else {
                console.log(`     ❌ No confession number found`);
            }
        });
        
        // 3. Test với confession thực tế
        if (allConfessions.length > 0) {
            console.log('\n🎯 3. Test với confession thực tế:');
            const testConfession = allConfessions[0];
            const testContent = `Confession #${testConfession.confessionNumber}: ${testConfession.content}`;
            console.log(`   Test content: "${testContent}"`);
            
            const titleMatch = testContent.match(/Confession #(\d+)/);
            if (titleMatch) {
                const confessionNumber = parseInt(titleMatch[1]);
                console.log(`     ✅ Parsed confession number: ${confessionNumber}`);
                
                // Test tìm confession
                const foundConfession = await db.getConfessionByNumberAnyStatus(realGuildId, confessionNumber);
                if (foundConfession) {
                    console.log(`     ✅ Found confession in database`);
                    console.log(`        ID: ${foundConfession._id}`);
                    console.log(`        Status: ${foundConfession.status}`);
                    
                    // Test emoji reactions
                    console.log('\n🎨 4. Test emoji reactions:');
                    const emojiCounts = await db.getEmojiCounts(realGuildId, foundConfession._id);
                    console.log(`   Emoji counts:`, emojiCounts);
                    
                    // Test user reactions
                    const testUserId = '123456789'; // Test user ID
                    const userReactions = await db.getUserEmojiReactions(realGuildId, foundConfession._id, testUserId);
                    console.log(`   User reactions for ${testUserId}:`, userReactions);
                    
                } else {
                    console.log(`     ❌ Confession not found in database`);
                }
            } else {
                console.log(`     ❌ Could not parse confession number`);
            }
        }
        
        // 4. Test error handling
        console.log('\n⚠️ 5. Test error handling:');
        
        // Test với confession number không tồn tại
        const nonExistentNumber = 999999;
        const nonExistentConfession = await db.getConfessionByNumberAnyStatus(realGuildId, nonExistentNumber);
        console.log(`   Test non-existent confession #${nonExistentNumber}: ${nonExistentConfession ? 'Found' : 'Not found'}`);
        
        // Test với guild ID không tồn tại
        const nonExistentGuildId = '999999999999999999';
        const nonExistentGuildConfession = await db.getConfessionByNumberAnyStatus(nonExistentGuildId, 1);
        console.log(`   Test non-existent guild ${nonExistentGuildId}: ${nonExistentGuildConfession ? 'Found' : 'Not found'}`);
        
        console.log('\n✅ Debug hoàn thành!');
        
    } catch (error) {
        console.error('❌ Error trong debug:', error);
    } finally {
        await db.disconnect();
    }
}

// Chạy debug
debugEmojiButtonClick().then(() => {
    console.log('🎯 Debug script completed');
    process.exit(0);
}).catch(error => {
    console.error('💥 Debug script failed:', error);
    process.exit(1);
}); 