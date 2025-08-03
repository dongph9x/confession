require('dotenv').config();
const discordSender = require('./src/utils/discordImageSender');

// Test content với nhiều format khác nhau
const testContent = `Đây là một confession test để kiểm tra cách Discord hiển thị width. 

Nội dung này sẽ được test với nhiều format khác nhau:
• Plain text
• Formatted text với markdown
• Embed messages
• Image messages
• Code blocks
• Quote blocks

Mục đích là để tìm ra format nào hiển thị full width trên Discord.`;

const demoGuildSettings = {
    confessionCounter: 9999,
    guildName: "Width Test Server"
};

const demoAuthor = {
    username: "Đông",
    id: ""
};

async function demoDiscordWidth() {
    console.log('🚀 Starting Discord Width Test...');
    console.log('📋 Testing different formats to bypass 50% width limitation');
    console.log('');
    
    try {
        // Check environment
        if (!process.env.BOT_TOKEN || !process.env.CHANNEL_ID) {
            console.error('❌ Missing environment variables');
            process.exit(1);
        }
        
        // Initialize Discord client
        console.log('🔗 Initializing Discord client...');
        await discordSender.initialize(process.env.BOT_TOKEN);
        
        // Test 1: Plain text (có thể bị 50% width)
        console.log('\n📝 Test 1: Plain text (có thể bị 50% width)...');
        await discordSender.sendConfessionImage(
            Buffer.from('dummy'),
            process.env.CHANNEL_ID,
            { 
                sendAsText: true,
                content: `📢 **Confession #${demoGuildSettings.confessionCounter + 1}**\n\n${testContent}\n\n👤 **Author:** ${demoAuthor.username}\n⏰ **Posted:** Just now`
            }
        );
        
        // Test 2: Text với code block (có thể bypass width limit)
        console.log('\n📝 Test 2: Text với code block...');
        await discordSender.sendConfessionImage(
            Buffer.from('dummy'),
            process.env.CHANNEL_ID,
            { 
                sendAsText: true,
                content: `📢 **Confession #${demoGuildSettings.confessionCounter + 2}**\n\n\`\`\`\n${testContent}\n\`\`\`\n\n👤 **Author:** ${demoAuthor.username}\n⏰ **Posted:** Just now`
            }
        );
        
        // Test 3: Text với quote block
        console.log('\n📝 Test 3: Text với quote block...');
        await discordSender.sendConfessionImage(
            Buffer.from('dummy'),
            process.env.CHANNEL_ID,
            { 
                sendAsText: true,
                content: `📢 **Confession #${demoGuildSettings.confessionCounter + 3}**\n\n> ${testContent.replace(/\n/g, '\n> ')}\n\n👤 **Author:** ${demoAuthor.username}\n⏰ **Posted:** Just now`
            }
        );
        
        // Test 4: Text với spoiler (có thể bypass)
        console.log('\n📝 Test 4: Text với spoiler...');
        await discordSender.sendConfessionImage(
            Buffer.from('dummy'),
            process.env.CHANNEL_ID,
            { 
                sendAsText: true,
                content: `📢 **Confession #${demoGuildSettings.confessionCounter + 4}**\n\n||${testContent}||\n\n👤 **Author:** ${demoAuthor.username}\n⏰ **Posted:** Just now`
            }
        );
        
        // Test 5: Embed message (thường full width)
        console.log('\n📋 Test 5: Embed message...');
        const { EmbedBuilder } = require('discord.js');
        const embed = new EmbedBuilder()
            .setColor('#667eea')
            .setTitle(`💝 Confession #${demoGuildSettings.confessionCounter + 5}`)
            .setDescription(testContent)
            .addFields(
                { name: '👤 Author', value: demoAuthor.username, inline: true },
                { name: '⏰ Posted', value: 'Just now', inline: true }
            )
            .setFooter({ 
                text: `Confession Bot • ${demoGuildSettings.guildName}`
            })
            .setTimestamp();
        
        const channel = await discordSender.client.channels.fetch(process.env.CHANNEL_ID);
        await channel.send({
            embeds: [embed]
        });
        
        // Test 6: Text với nhiều dòng ngắn
        console.log('\n📝 Test 6: Text với nhiều dòng ngắn...');
        const shortLines = testContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        const formattedLines = shortLines.map(line => `• ${line}`).join('\n');
        
        await discordSender.sendConfessionImage(
            Buffer.from('dummy'),
            process.env.CHANNEL_ID,
            { 
                sendAsText: true,
                content: `📢 **Confession #${demoGuildSettings.confessionCounter + 6}**\n\n${formattedLines}\n\n👤 **Author:** ${demoAuthor.username}\n⏰ **Posted:** Just now`
            }
        );
        
        // Test 7: Text với table format
        console.log('\n📝 Test 7: Text với table format...');
        await discordSender.sendConfessionImage(
            Buffer.from('dummy'),
            process.env.CHANNEL_ID,
            { 
                sendAsText: true,
                content: `📢 **Confession #${demoGuildSettings.confessionCounter + 7}**\n\n| Content | Details |\n|---------|---------|\n| Confession | ${testContent.substring(0, 50)}... |\n| Author | ${demoAuthor.username} |\n| Posted | Just now |\n\n👤 **Author:** ${demoAuthor.username}\n⏰ **Posted:** Just now`
            }
        );
        
        // Test 8: Text với custom formatting
        console.log('\n📝 Test 8: Text với custom formatting...');
        await discordSender.sendConfessionImage(
            Buffer.from('dummy'),
            process.env.CHANNEL_ID,
            { 
                sendAsText: true,
                content: `📢 **Confession #${demoGuildSettings.confessionCounter + 8}**\n\n**Nội dung:**\n${testContent}\n\n**Thông tin:**\n• Author: ${demoAuthor.username}\n• Posted: Just now\n• Server: ${demoGuildSettings.guildName}`
            }
        );
        
        // Test 9: Image với ultra compact (để so sánh)
        console.log('\n📸 Test 9: Image với ultra compact template...');
        const puppeteerCanvas = require('./src/utils/puppeteerCanvas');
        
        const ultraImage = await puppeteerCanvas.createConfessionImage(
            {
                content: testContent,
                isAnonymous: false,
                createdAt: new Date()
            },
            demoGuildSettings,
            demoAuthor,
            { ultraCompact: true }
        );
        
        await discordSender.sendConfessionImage(
            ultraImage,
            process.env.CHANNEL_ID,
            { content: "📢 Confession với ultra compact template (90% width)" }
        );
        
        console.log(`📊 Ultra compact image: ${ultraImage.length} bytes`);
        
        // Test 10: Text với URL (có thể ảnh hưởng width)
        console.log('\n📝 Test 10: Text với URL...');
        await discordSender.sendConfessionImage(
            Buffer.from('dummy'),
            process.env.CHANNEL_ID,
            { 
                sendAsText: true,
                content: `📢 **Confession #${demoGuildSettings.confessionCounter + 10}**\n\n${testContent}\n\n🔗 Link: https://discord.com\n👤 **Author:** ${demoAuthor.username}\n⏰ **Posted:** Just now`
            }
        );
        
        console.log('\n✅ All Discord width tests completed!');
        console.log('📊 Summary:');
        console.log('   - Plain text: Có thể bị 50% width');
        console.log('   - Code block: Có thể bypass width limit');
        console.log('   - Quote block: Có thể bypass width limit');
        console.log('   - Spoiler: Có thể bypass width limit');
        console.log('   - Embed: Thường full width');
        console.log('   - Ultra compact image: 90% width');
        console.log('   - Table format: Có thể bypass width limit');
        
    } catch (error) {
        console.error('❌ Error during Discord width test:', error);
    } finally {
        await discordSender.close();
    }
}

// Run test
demoDiscordWidth().then(() => {
    console.log('\n🎉 Discord width test finished!');
    console.log('🎯 Kiểm tra các format nào bypass được 50% width limit!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Discord width test failed:', error);
    process.exit(1);
}); 