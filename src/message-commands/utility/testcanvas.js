const { AttachmentBuilder } = require('discord.js');
const confessionCanvas = require('../../utils/confessionCanvas');

module.exports = {
    name: 'testcanvas',
    description: 'Test render confession bằng canvas với full size image',
    usage: '!testcanvas <content> [anonymous] [author]',
    examples: [
        '!testcanvas "Cậu giống như hoàng hôn hôm đó – đẹp đến mức khiến tớ quên mất phải nói điều gì."',
        '!testcanvas "Tớ từng nghĩ chỉ cần im lặng, dõi theo là đủ" anonymous',
        '!testcanvas "Đây là một confession test" author:"dev_dg_2010"'
    ],

    async execute(message, args) {
        try {
            // Kiểm tra xem có content không
            if (args.length === 0) {
                return message.reply('❌ **Cách sử dụng:**\n`!testcanvas <content> [anonymous] [author]`\n\n**Ví dụ:**\n`!testcanvas "Nội dung confession của bạn"`\n`!testcanvas "Confession ẩn danh" anonymous`\n`!testcanvas "Confession có tác giả" author:"YourName"`');
            }

            // Lấy content (có thể có dấu ngoặc kép)
            let content = '';
            let isAnonymous = false;
            let authorName = message.author.username;

            // Parse arguments
            let i = 0;
            while (i < args.length) {
                const arg = args[i];
                
                if (arg === 'anonymous') {
                    isAnonymous = true;
                    i++;
                } else if (arg.startsWith('author:')) {
                    authorName = arg.substring(7); // Bỏ "author:"
                    i++;
                } else if (content === '' && arg.startsWith('"')) {
                    // Content trong dấu ngoặc kép
                    let fullContent = arg.substring(1);
                    i++;
                    while (i < args.length && !args[i].endsWith('"')) {
                        fullContent += ' ' + args[i];
                        i++;
                    }
                    if (i < args.length && args[i].endsWith('"')) {
                        fullContent += ' ' + args[i].slice(0, -1);
                        i++;
                    }
                    content = fullContent;
                } else if (content === '') {
                    // Content không có dấu ngoặc kép
                    content = arg;
                    i++;
                } else {
                    i++;
                }
            }

            // Kiểm tra content
            if (!content) {
                return message.reply('❌ **Vui lòng nhập nội dung confession!**\n\n**Cách sử dụng:**\n`!testcanvas <content> [anonymous] [author]`');
            }

            // Gửi message "đang tạo..."
            const loadingMsg = await message.reply('🎨 **Đang tạo canvas confession...**');

            console.log('🎨 Creating canvas confession image...');
            console.log(`📝 Content: ${content.substring(0, 50)}...`);
            console.log(`🕵️ Anonymous: ${isAnonymous}`);
            console.log(`👤 Author: ${authorName}`);

            // Tạo test confession data
            const testConfession = {
                content: content,
                isAnonymous: isAnonymous,
                createdAt: new Date(),
                userId: message.author.id
            };

            const testGuildSettings = {
                confessionCounter: 999, // Số test
                guildName: message.guild.name
            };

            const testAuthor = {
                username: authorName,
                id: message.author.id
            };

            // Tạo canvas confession image
            const imageBuffer = await confessionCanvas.createStyledConfessionImage(
                testConfession,
                testGuildSettings,
                testAuthor
            );

            console.log('✅ Canvas confession image created successfully!');
            console.log(`📏 Image size: ${imageBuffer.length} bytes`);
            console.log(`🖼️ Canvas dimensions: 6400x300px`);
            console.log(`📐 Aspect ratio: 21.33:1 (super wide for Discord)`);
            console.log(`📊 File size: ~${Math.round(imageBuffer.length / 1024)}KB`);

            // Tạo Discord attachment
            const attachment = new AttachmentBuilder(imageBuffer, { 
                name: 'confession.png',
                description: `Test Confession - ${isAnonymous ? 'Anonymous' : authorName}`
            });

            // Gửi chỉ ảnh thuần túy (không dùng embed)
            await loadingMsg.edit({
                content: `🎨 **Canvas Confession Test**\n\n📝 **Content:** ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}\n🕵️ **Anonymous:** ${isAnonymous ? 'Yes' : 'No'}\n👤 **Author:** ${authorName}\n📏 **Canvas:** 1200x1200px (1:1 square ratio)\n📊 **File size:** ~${Math.round(imageBuffer.length / 1024)}KB\n\n💡 **Pure image mode** - Square format for maximum Discord compatibility`,
                files: [attachment]
            });

            console.log('✅ Canvas confession sent successfully!');
            console.log('🎯 Full size image displayed in Discord');

        } catch (error) {
            console.error('❌ Error in testcanvas command:', error);
            
            try {
                await message.reply({
                    content: `❌ **Error occurred while creating canvas confession:**\n\`\`\`${error.message}\`\`\``
                });
            } catch (followUpError) {
                console.error('❌ Could not send error message:', followUpError.message);
            }
        }
    },
}; 