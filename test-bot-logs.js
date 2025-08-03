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
const testChannelId = '1202554844858527744'; // Thay bằng channel ID thực tế

async function testBotLogs() {
    try {
        console.log('🔍 Test Bot Logs...');
        
        // Kết nối database
        console.log('🔗 Kết nối database...');
        await db.connect();
        
        // 1. Tạo confession test
        console.log('\n📝 1. Tạo confession test...');
        const testContent = 'Đây là confession test để kiểm tra bot logs khi click emoji button';
        const confessionId = await db.addConfession(testGuildId, 'test_user_logs', testContent, true);
        const confession = await db.getConfession(confessionId);
        
        console.log(`   ✅ Confession created:`);
        console.log(`      ID: ${confession._id}`);
        console.log(`      Number: ${confession.confessionNumber}`);
        console.log(`      Status: ${confession.status}`);
        console.log(`      Content: ${confession.content}`);
        
        // 2. Login bot với token thực tế
        console.log('\n🤖 2. Login bot...');
        
        // Đọc token từ .env
        require('dotenv').config();
        const token = process.env.DISCORD_TOKEN;
        
        if (!token) {
            console.log('   ❌ DISCORD_TOKEN not found in .env');
            return;
        }
        
        await client.login(token);
        console.log('   ✅ Bot logged in');
        
        // 3. Tìm guild và channel
        const guild = client.guilds.cache.get(testGuildId);
        if (!guild) {
            console.log(`   ❌ Guild not found: ${testGuildId}`);
            console.log(`   Available guilds:`);
            client.guilds.cache.forEach(g => {
                console.log(`     - ${g.name} (${g.id})`);
            });
            return;
        }
        console.log(`   ✅ Found guild: ${guild.name}`);
        
        const channel = guild.channels.cache.get(testChannelId);
        if (!channel) {
            console.log(`   ❌ Channel not found: ${testChannelId}`);
            console.log(`   Available channels in guild:`);
            guild.channels.cache.forEach(c => {
                console.log(`     - ${c.name} (${c.id}) - ${c.type}`);
            });
            return;
        }
        console.log(`   ✅ Found channel: ${channel.name}`);
        
        // 4. Gửi confession test
        console.log('\n📤 4. Gửi confession test...');
        
        const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
        
        // Tạo emoji buttons với custom ID chứa confession number
        const emojiButtons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`emoji_heart_${confession.confessionNumber}`)
                    .setLabel('❤️ 0')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`emoji_laugh_${confession.confessionNumber}`)
                    .setLabel('😂 0')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`emoji_wow_${confession.confessionNumber}`)
                    .setLabel('😮 0')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`emoji_sad_${confession.confessionNumber}`)
                    .setLabel('😢 0')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`emoji_fire_${confession.confessionNumber}`)
                    .setLabel('🔥 0')
                    .setStyle(ButtonStyle.Secondary)
            );
        
        const confessionMessage = `📢 **Confession #${confession.confessionNumber}**\n\n${confession.content}\n\n👤 **Người gửi:** 🕵️ Ẩn danh\n⏰ **Thời gian:** <t:${Math.floor(Date.now() / 1000)}:R>\n\n*Confession Bot • Test Guild*`;
        
        try {
            const sentMessage = await channel.send({
                content: confessionMessage,
                components: [emojiButtons]
            });
            
            console.log(`   ✅ Confession sent:`);
            console.log(`      Message ID: ${sentMessage.id}`);
            console.log(`      Content: "${sentMessage.content.substring(0, 50)}..."`);
            console.log(`      Content length: ${sentMessage.content.length}`);
            console.log(`      Embeds: ${sentMessage.embeds.length}`);
            console.log(`      Components: ${sentMessage.components.length}`);
            
            // 5. Hướng dẫn test
            console.log('\n📋 5. Hướng dẫn test:');
            console.log(`   Message ID: ${sentMessage.id}`);
            console.log(`   Confession #: ${confession.confessionNumber}`);
            console.log(`   Guild ID: ${testGuildId}`);
            console.log(`   Channel ID: ${testChannelId}`);
            console.log(`   `);
            console.log(`   Bây giờ hãy:`);
            console.log(`   1. Vào Discord và tìm message trên`);
            console.log(`   2. Click vào emoji button (❤️, 😂, 😮, 😢, 🔥)`);
            console.log(`   3. Kiểm tra console logs của bot để xem debug info`);
            console.log(`   4. Nếu có lỗi "❌ Không tìm thấy confession!", check logs`);
            console.log(`   `);
            console.log(`   Debug logs sẽ hiển thị:`);
            console.log(`   - Message content và length`);
            console.log(`   - Embeds info`);
            console.log(`   - Parsing steps`);
            console.log(`   - Confession lookup results`);
            
            // 6. Test parsing logic
            console.log('\n🔍 6. Test parsing logic với message thực tế:');
            
            const messageContent = sentMessage.content;
            let confessionNumber = null;
            
            console.log(`   Message content: "${messageContent}"`);
            console.log(`   Content length: ${messageContent ? messageContent.length : 0}`);
            console.log(`   Embeds: ${sentMessage.embeds.length}`);
            
            // Method 1: Tìm từ message content
            if (messageContent) {
                const titleMatch = messageContent.match(/Confession #(\d+)/);
                if (titleMatch) {
                    confessionNumber = parseInt(titleMatch[1]);
                    console.log(`   ✅ Found confession number from content: ${confessionNumber}`);
                }
            }
            
            // Method 2: Tìm từ embeds nếu content rỗng
            if (!confessionNumber && sentMessage.embeds.length > 0) {
                const embed = sentMessage.embeds[0];
                console.log(`   Checking embed: "${embed.title}"`);
                
                if (embed.title) {
                    const titleMatch = embed.title.match(/Confession #(\d+)/);
                    if (titleMatch) {
                        confessionNumber = parseInt(titleMatch[1]);
                        console.log(`   ✅ Found confession number from embed title: ${confessionNumber}`);
                    }
                }
                
                if (!confessionNumber && embed.description) {
                    const descMatch = embed.description.match(/Confession #(\d+)/);
                    if (descMatch) {
                        confessionNumber = parseInt(descMatch[1]);
                        console.log(`   ✅ Found confession number from embed description: ${confessionNumber}`);
                    }
                }
            }
            
            // Method 3: Tìm từ custom ID của button
            if (!confessionNumber) {
                const customId = `emoji_heart_${confession.confessionNumber}`;
                const customIdParts = customId.split('_');
                if (customIdParts.length > 1) {
                    const possibleConfessionId = customIdParts[customIdParts.length - 1];
                    if (possibleConfessionId && !isNaN(possibleConfessionId)) {
                        confessionNumber = parseInt(possibleConfessionId);
                        console.log(`   ✅ Found confession number from custom ID: ${confessionNumber}`);
                    }
                }
            }
            
            if (!confessionNumber) {
                console.log(`   ❌ No confession number found`);
            } else {
                // Test tìm confession trong database
                const foundConfession = await db.getConfessionByNumberAnyStatus(testGuildId, confessionNumber);
                if (foundConfession) {
                    console.log(`   ✅ Found confession in database:`);
                    console.log(`      ID: ${foundConfession._id}`);
                    console.log(`      Status: ${foundConfession.status}`);
                    
                    // Test emoji reaction
                    console.log(`   🎨 Testing emoji reaction...`);
                    const emojiKey = 'heart';
                    const toggleResult = await db.toggleEmojiReaction(testGuildId, foundConfession._id, 'test_user_logs', emojiKey);
                    console.log(`      Toggle result:`, toggleResult);
                    
                    const emojiCounts = await db.getEmojiCounts(testGuildId, foundConfession._id);
                    console.log(`      Emoji counts:`, emojiCounts);
                    
                    console.log(`   ✅ Emoji reaction test completed`);
                    
                } else {
                    console.log(`   ❌ Confession not found in database`);
                }
            }
            
        } catch (error) {
            console.log(`   ❌ Error sending confession: ${error.message}`);
        }
        
        console.log('\n✅ Test hoàn thành!');
        
    } catch (error) {
        console.error('❌ Error trong test:', error);
    } finally {
        await db.disconnect();
        client.destroy();
    }
}

// Chạy test
testBotLogs().then(() => {
    console.log('🎯 Test script completed');
    process.exit(0);
}).catch(error => {
    console.error('💥 Test script failed:', error);
    process.exit(1);
}); 