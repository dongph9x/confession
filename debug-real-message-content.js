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

async function debugRealMessageContent() {
    try {
        console.log('🔍 Debug Real Message Content...');
        
        // Kết nối database
        console.log('🔗 Kết nối database...');
        await db.connect();
        
        // 1. Kiểm tra confessions trong database
        console.log('\n📊 1. Kiểm tra confessions trong database:');
        const Confession = require('./src/models/Confession');
        const allConfessions = await Confession.find({ guildId: realGuildId }).sort({ confessionNumber: -1 }).limit(5);
        console.log(`   Tổng số confessions: ${allConfessions.length}`);
        
        if (allConfessions.length > 0) {
            allConfessions.forEach((conf, index) => {
                console.log(`   ${index + 1}. Confession #${conf.confessionNumber}: ${conf.content.substring(0, 30)}... (Status: ${conf.status})`);
            });
        }
        
        // 2. Test các format message content khác nhau
        console.log('\n📝 2. Test các format message content:');
        const testFormats = [
            // Format 1: Plain text
            'Confession #2: Đây là confession test',
            
            // Format 2: Discord embed format
            '📢 **Confession #2**\n\nĐây là confession test\n\n👤 **Người gửi:** 🕵️ Ẩn danh\n⏰ **Thời gian:** <t:1234567890:R>\n\n*Confession Bot • Test Guild*',
            
            // Format 3: Compact format
            '📢 Confession #2\n\nĐây là confession test\n\n👤 Người gửi: 🕵️ Ẩn danh\n⏰ Thời gian: <t:1234567890:R>\n\n*Confession Bot • Test Guild*',
            
            // Format 4: Ultra compact
            '📢 Confession #2\nĐây là confession test\n👤 🕵️ Ẩn danh • <t:1234567890:R>',
            
            // Format 5: Image format (không có text)
            '',
            
            // Format 6: Mixed content
            '📢 **Confession #2**\n\nĐây là confession test với emoji 🎉\n\n👤 **Người gửi:** 🕵️ Ẩn danh\n⏰ **Thời gian:** <t:1234567890:R>\n\n*Confession Bot • Test Guild*'
        ];
        
        testFormats.forEach((content, index) => {
            console.log(`\n   Test ${index + 1}:`);
            console.log(`     Content: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`);
            console.log(`     Length: ${content.length}`);
            console.log(`     Is empty: ${!content}`);
            
            if (!content) {
                console.log(`     ❌ Empty content - sẽ gây lỗi "Không tìm thấy confession!"`);
            } else {
                const titleMatch = content.match(/Confession #(\d+)/);
                if (titleMatch) {
                    const confessionNumber = parseInt(titleMatch[1]);
                    console.log(`     ✅ Found confession number: ${confessionNumber}`);
                    
                    // Test tìm confession
                    db.getConfessionByNumberAnyStatus(realGuildId, confessionNumber).then(foundConfession => {
                        if (foundConfession) {
                            console.log(`     ✅ Found confession in database`);
                            console.log(`        ID: ${foundConfession._id}`);
                            console.log(`        Status: ${foundConfession.status}`);
                        } else {
                            console.log(`     ❌ Confession not found in database`);
                        }
                    });
                } else {
                    console.log(`     ❌ No confession number found`);
                    console.log(`     ❌ Sẽ gây lỗi "Không thể xác định confession!"`);
                }
            }
        });
        
        // 3. Test với confession thực tế
        if (allConfessions.length > 0) {
            console.log('\n🎯 3. Test với confession thực tế:');
            const testConfession = allConfessions[0];
            
            // Tạo các format khác nhau cho confession thực tế
            const realFormats = [
                `Confession #${testConfession.confessionNumber}: ${testConfession.content}`,
                `📢 **Confession #${testConfession.confessionNumber}**\n\n${testConfession.content}\n\n👤 **Người gửi:** 🕵️ Ẩn danh\n⏰ **Thời gian:** <t:1234567890:R>\n\n*Confession Bot • Test Guild*`,
                `📢 Confession #${testConfession.confessionNumber}\n\n${testConfession.content}\n\n👤 Người gửi: 🕵️ Ẩn danh\n⏰ Thời gian: <t:1234567890:R>\n\n*Confession Bot • Test Guild*`
            ];
            
            realFormats.forEach((content, index) => {
                console.log(`\n   Real Format ${index + 1}:`);
                console.log(`     Content: "${content.substring(0, 100)}..."`);
                
                const titleMatch = content.match(/Confession #(\d+)/);
                if (titleMatch) {
                    const confessionNumber = parseInt(titleMatch[1]);
                    console.log(`     ✅ Parsed confession number: ${confessionNumber}`);
                    
                    // Test tìm confession
                    db.getConfessionByNumberAnyStatus(realGuildId, confessionNumber).then(foundConfession => {
                        if (foundConfession) {
                            console.log(`     ✅ Found confession in database`);
                            console.log(`        ID: ${foundConfession._id}`);
                            console.log(`        Status: ${foundConfession.status}`);
                        } else {
                            console.log(`     ❌ Confession not found in database`);
                        }
                    });
                } else {
                    console.log(`     ❌ Could not parse confession number`);
                }
            });
        }
        
        // 4. Test error scenarios
        console.log('\n⚠️ 4. Test error scenarios:');
        
        // Test với message content rỗng
        console.log('\n   Test empty content:');
        const emptyContent = '';
        if (!emptyContent) {
            console.log(`     ❌ Empty content - sẽ gây lỗi "Không tìm thấy confession!"`);
        }
        
        // Test với message content không có confession number
        console.log('\n   Test content without confession number:');
        const noConfessionContent = 'Đây là message bình thường không phải confession';
        const titleMatch = noConfessionContent.match(/Confession #(\d+)/);
        if (!titleMatch) {
            console.log(`     ❌ No confession number found - sẽ gây lỗi "Không thể xác định confession!"`);
        }
        
        // Test với confession number không tồn tại
        console.log('\n   Test non-existent confession number:');
        const nonExistentNumber = 999999;
        const nonExistentConfession = await db.getConfessionByNumberAnyStatus(realGuildId, nonExistentNumber);
        if (!nonExistentConfession) {
            console.log(`     ❌ Confession #${nonExistentNumber} not found - sẽ gây lỗi "Không tìm thấy confession!"`);
        }
        
        console.log('\n✅ Debug hoàn thành!');
        
    } catch (error) {
        console.error('❌ Error trong debug:', error);
    } finally {
        await db.disconnect();
    }
}

// Chạy debug
debugRealMessageContent().then(() => {
    console.log('🎯 Debug script completed');
    process.exit(0);
}).catch(error => {
    console.error('💥 Debug script failed:', error);
    process.exit(1);
}); 