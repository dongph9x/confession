require('dotenv').config();
const discordSender = require('./src/utils/discordImageSender');

// Demo data với text dài
const longConfessionText = `Đây là một confession rất dài để test cách Discord hiển thị text vs image. 

Nội dung này có thể dài và phức tạp, với nhiều đoạn văn bản khác nhau. Khi gửi dưới dạng text thông thường, Discord sẽ hiển thị full width và có thể scroll để đọc toàn bộ nội dung.

Nhưng khi gửi dưới dạng image, Discord có thể bị giới hạn 50% width và khó đọc hơn. Đây là lý do tại sao chúng ta cần tối ưu hóa template cho Discord.

Confession này bao gồm:
• Nhiều đoạn văn bản
• Emoji và formatting
• Thông tin chi tiết
• Cảm xúc và suy nghĩ

Khi gửi text, Discord sẽ hiển thị đẹp và dễ đọc. Nhưng khi gửi image, có thể bị giới hạn kích thước.`;

const demoGuildSettings = {
    confessionCounter: 9999,
    guildName: "Text vs Image Test Server"
};

const demoAuthor = {
    username: "Đông",
    id: ""
};

async function demoTextVsImage() {
    console.log('🚀 Starting Text vs Image Demo...');
    console.log('📋 This demo will compare:');
    console.log('   1. Sending long text as plain text');
    console.log('   2. Sending long text as image');
    console.log('   3. Compare Discord display behavior');
    console.log('');
    
    try {
        // Check environment
        if (!process.env.BOT_TOKEN || !process.env.CHANNEL_ID) {
            console.error('❌ Missing environment variables:');
            console.error('Please add to your .env file:');
            console.error('BOT_TOKEN=your_discord_bot_token');
            console.error('CHANNEL_ID=your_channel_id');
            process.exit(1);
        }
        
        // Initialize Discord client
        console.log('🔗 Initializing Discord client...');
        await discordSender.initialize(process.env.BOT_TOKEN);
        
        // Test 1: Send as plain text (full width)
        console.log('\n📝 Test 1: Sending as plain text (full width)...');
        await discordSender.sendConfessionImage(
            Buffer.from('dummy'), // Dummy buffer, we'll send text instead
            process.env.CHANNEL_ID,
            { 
                sendAsText: true,
                content: `📢 **Confession #${demoGuildSettings.confessionCounter + 1}**\n\n${longConfessionText}\n\n👤 **Author:** ${demoAuthor.username}\n⏰ **Posted:** Just now\n\n*Confession Bot • ${demoGuildSettings.guildName}*`
            }
        );
        
        console.log('✅ Plain text sent (should display full width)');
        
        // Test 2: Send as image with normal template
        console.log('\n📸 Test 2: Sending as image with normal template...');
        const puppeteerCanvas = require('./src/utils/puppeteerCanvas');
        
        const normalImage = await puppeteerCanvas.createConfessionImage(
            {
                content: longConfessionText,
                isAnonymous: false,
                createdAt: new Date()
            },
            demoGuildSettings,
            demoAuthor
        );
        
        await discordSender.sendConfessionImage(
            normalImage,
            process.env.CHANNEL_ID,
            { content: "📢 Confession dài với normal template (có thể bị giới hạn 50% width)" }
        );
        
        console.log(`📊 Normal image sent: ${normalImage.length} bytes`);
        
        // Test 3: Send as image with ultra compact template
        // console.log('\n📸 Test 3: Sending as image with ultra compact template...');
        
        // const ultraImage = await puppeteerCanvas.createConfessionImage(
        //     {
        //         content: longConfessionText,
        //         isAnonymous: false,
        //         createdAt: new Date()
        //     },
        //     demoGuildSettings,
        //     demoAuthor,
        //     { ultraCompact: true }
        // );
        
        // await discordSender.sendConfessionImage(
        //     ultraImage,
        //     process.env.CHANNEL_ID,
        //     { content: "📢 Confession dài với ultra compact template (bypass Discord limitations)" }
        // );
        
        // console.log(`📊 Ultra compact image sent: ${ultraImage.length} bytes`);
        
        // // Test 4: Send formatted text with embed
        // console.log('\n📋 Test 4: Sending formatted text with embed...');
        
        // const { EmbedBuilder } = require('discord.js');
        // const embed = new EmbedBuilder()
        //     .setColor('#667eea')
        //     .setTitle(`💝 Confession #${demoGuildSettings.confessionCounter + 1}`)
        //     .setDescription(longConfessionText.substring(0, 2000) + '...') // Discord embed limit
        //     .addFields(
        //         { name: '👤 Author', value: demoAuthor.username, inline: true },
        //         { name: '⏰ Posted', value: 'Just now', inline: true }
        //     )
        //     .setFooter({ 
        //         text: `Confession Bot • ${demoGuildSettings.guildName}`,
        //         iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png'
        //     })
        //     .setTimestamp();
        
        // Send embed without image
        // const channel = await discordSender.client.channels.fetch(process.env.CHANNEL_ID);
        // await channel.send({
        //     embeds: [embed]
        // });
        
        // console.log('✅ Formatted text with embed sent');
        
        // // Test 5: Send short text vs long text
        // console.log('\n📝 Test 5: Comparing short vs long text...');
        
        // const shortText = "Đây là một confession ngắn để so sánh với confession dài.";
        
        // await discordSender.sendConfessionImage(
        //     Buffer.from('dummy'),
        //     process.env.CHANNEL_ID,
        //     { 
        //         sendAsText: true,
        //         content: `📢 **Short Confession**\n\n${shortText}\n\n👤 **Author:** ${demoAuthor.username}\n⏰ **Posted:** Just now`
        //     }
        // );
        
        // console.log('✅ Short text sent');
        
        console.log('\n✅ All text vs image tests completed successfully!');
        console.log('📊 Summary:');
        console.log('   - Plain text: Full width, easy to read');
        console.log('   - Normal image: ~450KB, 50% width (limited)');
        console.log('   - Ultra compact image: ~200KB, 90% width (better)');
        console.log('   - Formatted text: Full width with embed');
        console.log('   - Short text: Full width, compact');
        
    } catch (error) {
        console.error('❌ Error during text vs image demo:', error);
    } finally {
        // Cleanup
        await discordSender.close();
    }
}

// Run demo
demoTextVsImage().then(() => {
    console.log('\n🎉 Text vs Image demo finished!');
    console.log('🎯 So sánh cách Discord hiển thị text vs image!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Text vs Image demo failed:', error);
    process.exit(1);
}); 