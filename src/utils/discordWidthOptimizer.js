const { EmbedBuilder } = require('discord.js');

class DiscordWidthOptimizer {
    constructor() {
        this.maxTextLength = 2000; // Discord embed description limit
        this.maxCodeBlockLength = 1900; // Code block limit
        this.maxSpoilerLength = 1900; // Spoiler limit
    }

    /**
     * Tự động chọn format tốt nhất để bypass Discord width limitations
     */
    async sendOptimizedConfession(confession, guildSettings, author, channelId, discordSender) {
        const content = confession.content;
        const contentLength = content.length;

        console.log(`📊 Content length: ${contentLength} characters`);

        // Strategy: Use plain text for full width display (best solution)
        console.log('📝 Using plain text format for full width display');
        return await this.sendAsPlainText(confession, guildSettings, author, channelId, discordSender);
    }

    /**
     * Gửi confession dưới dạng image với ultra compact template
     */
    async sendAsImage(confession, guildSettings, author, channelId, discordSender) {
        const puppeteerCanvas = require('./puppeteerCanvas');
        
        const imageBuffer = await puppeteerCanvas.createConfessionImage(
            confession,
            guildSettings,
            author,
            { ultraCompact: true }
        );

        return await discordSender.sendConfessionImage(
            imageBuffer,
            channelId,
            { content: "📢 Confession với ultra compact template (90% width)" }
        );
    }

    /**
     * Gửi confession dưới dạng embed (full width)
     */
    async sendAsEmbed(confession, guildSettings, author, channelId, discordSender) {
        const embed = new EmbedBuilder()
            .setColor('#667eea')
            .setTitle(`💝 Confession #${guildSettings.confessionCounter + 1}`)
            .setDescription(this.truncateText(confession.content, this.maxTextLength))
            .addFields(
                { name: '👤 Author', value: author.username, inline: true },
                { name: '⏰ Posted', value: this.formatTime(confession.createdAt), inline: true }
            )
            .setFooter({ 
                text: `Confession Bot • ${guildSettings.guildName}`
            })
            .setTimestamp();

        const channel = await discordSender.client.channels.fetch(channelId);
        return await channel.send({
            embeds: [embed]
        });
    }

    /**
     * Gửi confession dưới dạng text được tối ưu hóa
     */
    async sendAsOptimizedText(confession, guildSettings, author, channelId, discordSender) {
        const content = confession.content;
        const contentLength = content.length;

        // Strategy A: Code block (bypass width limit)
        if (contentLength <= this.maxCodeBlockLength) {
            console.log('📦 Using code block format (bypass width limit)');
            return await this.sendAsCodeBlock(confession, guildSettings, author, channelId, discordSender);
        }

        // Strategy B: Quote block (bypass width limit)
        if (contentLength <= this.maxSpoilerLength) {
            console.log('💬 Using quote block format (bypass width limit)');
            return await this.sendAsQuoteBlock(confession, guildSettings, author, channelId, discordSender);
        }

        // Strategy C: Spoiler (bypass width limit)
        if (contentLength <= this.maxSpoilerLength) {
            console.log('🔒 Using spoiler format (bypass width limit)');
            return await this.sendAsSpoiler(confession, guildSettings, author, channelId, discordSender);
        }

        // Strategy D: Split content (for very long content)
        console.log('✂️ Using split content format (for very long content)');
        return await this.sendAsSplitContent(confession, guildSettings, author, channelId, discordSender);
    }

    /**
     * Gửi dưới dạng code block
     */
    async sendAsCodeBlock(confession, guildSettings, author, channelId, discordSender) {
        const formattedContent = `📢 **Confession #${guildSettings.confessionCounter + 1}**\n\n\`\`\`\n${confession.content}\n\`\`\`\n\n👤 **Author:** ${author.username}\n⏰ **Posted:** ${this.formatTime(confession.createdAt)}`;

        return await discordSender.sendConfessionImage(
            Buffer.from('dummy'),
            channelId,
            { 
                sendAsText: true,
                content: formattedContent
            }
        );
    }

    /**
     * Gửi dưới dạng quote block
     */
    async sendAsQuoteBlock(confession, guildSettings, author, channelId, discordSender) {
        const quotedContent = confession.content.replace(/\n/g, '\n> ');
        const formattedContent = `📢 **Confession #${guildSettings.confessionCounter + 1}**\n\n> ${quotedContent}\n\n👤 **Author:** ${author.username}\n⏰ **Posted:** ${this.formatTime(confession.createdAt)}`;

        return await discordSender.sendConfessionImage(
            Buffer.from('dummy'),
            channelId,
            { 
                sendAsText: true,
                content: formattedContent
            }
        );
    }

    /**
     * Gửi dưới dạng spoiler
     */
    async sendAsSpoiler(confession, guildSettings, author, channelId, discordSender) {
        const formattedContent = `📢 **Confession #${guildSettings.confessionCounter + 1}**\n\n||${confession.content}||\n\n👤 **Author:** ${author.username}\n⏰ **Posted:** ${this.formatTime(confession.createdAt)}`;

        return await discordSender.sendConfessionImage(
            Buffer.from('dummy'),
            channelId,
            { 
                sendAsText: true,
                content: formattedContent
            }
        );
    }

    /**
     * Gửi content dài bằng cách split thành nhiều message
     */
    async sendAsSplitContent(confession, guildSettings, author, channelId, discordSender) {
        const chunks = this.splitContent(confession.content, this.maxTextLength);
        const messages = [];

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const isFirst = i === 0;
            const isLast = i === chunks.length - 1;

            let content = '';
            if (isFirst) {
                content = `📢 **Confession #${guildSettings.confessionCounter + 1}** (Part ${i + 1}/${chunks.length})\n\n${chunk}`;
            } else if (isLast) {
                content = `${chunk}\n\n👤 **Author:** ${author.username}\n⏰ **Posted:** ${this.formatTime(confession.createdAt)}`;
            } else {
                content = `**Part ${i + 1}/${chunks.length}**\n\n${chunk}`;
            }

            const message = await discordSender.sendConfessionImage(
                Buffer.from('dummy'),
                channelId,
                { 
                    sendAsText: true,
                    content: content
                }
            );
            messages.push(message);
        }

        return messages;
    }

    /**
     * Split content thành chunks
     */
    splitContent(content, maxLength) {
        const chunks = [];
        let currentChunk = '';

        const lines = content.split('\n');
        for (const line of lines) {
            if ((currentChunk + line).length > maxLength) {
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                    currentChunk = line + '\n';
                } else {
                    // Line quá dài, split theo từ
                    const words = line.split(' ');
                    for (const word of words) {
                        if ((currentChunk + word + ' ').length > maxLength) {
                            if (currentChunk) {
                                chunks.push(currentChunk.trim());
                                currentChunk = word + ' ';
                            } else {
                                chunks.push(word);
                            }
                        } else {
                            currentChunk += word + ' ';
                        }
                    }
                }
            } else {
                currentChunk += line + '\n';
            }
        }

        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }

    /**
     * Truncate text với ellipsis
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength - 3) + '...';
    }

    /**
     * Format time
     */
    formatTime(date) {
        if (!date) return 'Just now';
        
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    }

    /**
     * Test các format khác nhau
     */
    async testFormats(confession, guildSettings, author, channelId, discordSender) {
        console.log('🧪 Testing different formats...');

        const results = [];

        // Test 1: Plain text
        try {
            const result1 = await this.sendAsPlainText(confession, guildSettings, author, channelId, discordSender);
            results.push({ format: 'Plain Text', success: true, message: result1 });
        } catch (error) {
            results.push({ format: 'Plain Text', success: false, error: error.message });
        }

        // Test 2: Code block
        try {
            const result2 = await this.sendAsCodeBlock(confession, guildSettings, author, channelId, discordSender);
            results.push({ format: 'Code Block', success: true, message: result2 });
        } catch (error) {
            results.push({ format: 'Code Block', success: false, error: error.message });
        }

        // Test 3: Quote block
        try {
            const result3 = await this.sendAsQuoteBlock(confession, guildSettings, author, channelId, discordSender);
            results.push({ format: 'Quote Block', success: true, message: result3 });
        } catch (error) {
            results.push({ format: 'Quote Block', success: false, error: error.message });
        }

        return results;
    }

    /**
     * Gửi dưới dạng plain text
     */
    async sendAsPlainText(confession, guildSettings, author, channelId, discordSender) {
        const formattedContent = `📢 **Confession #${guildSettings.confessionCounter + 1}**\n\n${confession.content}\n\n👤 **Author:** ${author.username}\n⏰ **Posted:** ${this.formatTime(confession.createdAt)}`;

        return await discordSender.sendConfessionImage(
            Buffer.from('dummy'),
            channelId,
            { 
                sendAsText: true,
                content: formattedContent
            }
        );
    }
}

module.exports = new DiscordWidthOptimizer(); 