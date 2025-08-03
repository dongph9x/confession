const { createCanvas } = require('canvas');
const { EmbedBuilder } = require('discord.js');
const puppeteerCanvas = require('./puppeteerCanvas');

class ConfessionCanvas {
    constructor() {
        // Sử dụng tỷ lệ 1:1 (square) để tối ưu cho Discord
        this.width = 1200; // 1:1 ratio (square)
        this.height = 1200; // 1:1 ratio (square)
        this.padding = 80;
        this.lineHeight = 50;
        this.fontSize = 36;
        
        // Default renderer (can be 'canvas' or 'puppeteer')
        this.renderer = process.env.CONFESSION_RENDERER || 'canvas';
    }

    // Set renderer method
    setRenderer(renderer) {
        if (['canvas', 'puppeteer'].includes(renderer)) {
            this.renderer = renderer;
        } else {
            console.warn('Invalid renderer. Using default canvas renderer.');
            this.renderer = 'canvas';
        }
    }

    async createStyledConfessionImage(confession, guildSettings, confessionAuthor) {
        if (this.renderer === 'puppeteer') {
            return await puppeteerCanvas.createConfessionImage(confession, guildSettings, confessionAuthor);
        } else {
            return await this.createCanvasImage(confession, guildSettings, confessionAuthor);
        }
    }

    async createCanvasImage(confession, guildSettings, confessionAuthor) {
        const canvas = createCanvas(this.width, this.height);
        const ctx = canvas.getContext('2d');

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, this.width, 0);
        gradient.addColorStop(0, '#2C2F33');
        gradient.addColorStop(1, '#36393F');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // Header with accent
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(0, 0, this.width, 15);
        ctx.fillStyle = '#2C2F33';
        ctx.fillRect(0, 15, this.width, 100);

        // Title with glow effect
        ctx.shadowColor = '#00FF00';
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold 72px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(`💝 Confession #${guildSettings.confessionCounter + 1}`, this.width / 2, 90);
        ctx.shadowBlur = 0;

        // Content area with border
        ctx.fillStyle = '#36393F';
        ctx.fillRect(this.padding, 130, this.width - 2 * this.padding, this.height - 300);
        
        // Border for content area
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.padding, 130, this.width - 2 * this.padding, this.height - 300);

        // Content with better formatting
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${this.fontSize}px Arial`;
        ctx.textAlign = 'left';
        
        const wrapText = (text, maxWidth) => {
            const words = text.split(' ');
            const lines = [];
            let currentLine = words[0];

            for (let i = 1; i < words.length; i++) {
                const word = words[i];
                const width = ctx.measureText(currentLine + ' ' + word).width;
                if (width < maxWidth) {
                    currentLine += ' ' + word;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
            lines.push(currentLine);
            return lines;
        };

        const maxTextWidth = this.width - 2 * this.padding - 60;
        const lines = wrapText(confession.content, maxTextWidth);
        
        let y = 170;
        for (let i = 0; i < lines.length && y < this.height - 200; i++) {
            ctx.fillText(lines[i], this.padding + 30, y);
            y += this.lineHeight;
        }

        // Decorative separator
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(this.padding, y + 80);
        ctx.lineTo(this.width - this.padding, y + 80);
        ctx.stroke();

        // Footer with better layout
        y += 150;
        ctx.fillStyle = '#99AAB5';
        ctx.font = '32px Arial';
        
        // Left side - Author
        const authorText = confession.isAnonymous ? '🕵️ Ẩn danh' : `👤 ${confessionAuthor?.username || 'Unknown'}`;
        ctx.fillText(authorText, this.padding + 30, y);

        // Right side - Time
        const timeText = `<t:${Math.floor(new Date(confession.createdAt).getTime() / 1000)}:R>`;
        const timeWidth = ctx.measureText(`⏰ ${timeText}`).width;
        ctx.fillText(`⏰ ${timeText}`, this.width - this.padding - timeWidth - 30, y);

        // Bottom footer
        ctx.fillStyle = '#7289DA';
        ctx.font = '28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Confession Bot • ${guildSettings.guildName || 'Unknown Server'}`, this.width / 2, this.height - 80);

        return canvas.toBuffer('image/png');
    }

    // Tạo embed confession thay vì chỉ ảnh
    createConfessionEmbed(confession, guildSettings, confessionAuthor, imageBuffer) {
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle(`💝 Confession #${guildSettings.confessionCounter + 1}`)
            .setDescription(confession.content)
            .setImage('attachment://confession.png')
            .setTimestamp(confession.createdAt)
            .setFooter({ 
                text: `Confession Bot • ${guildSettings.guildName || 'Unknown Server'}`,
                iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png'
            });

        // Thêm author field
        if (confession.isAnonymous) {
            embed.addFields({ name: '👤 Author', value: '🕵️ Ẩn danh', inline: true });
        } else {
            embed.addFields({ name: '👤 Author', value: confessionAuthor?.username || 'Unknown', inline: true });
        }

        // Thêm time field
        embed.addFields({ 
            name: '⏰ Posted', 
            value: `<t:${Math.floor(new Date(confession.createdAt).getTime() / 1000)}:R>`, 
            inline: true 
        });

        return embed;
    }

    // Tạo confession với cả ảnh và embed
    async createConfessionWithEmbed(confession, guildSettings, confessionAuthor) {
        let imageBuffer;
        
        if (this.renderer === 'puppeteer') {
            const result = await puppeteerCanvas.createConfessionWithEmbed(confession, guildSettings, confessionAuthor);
            return result;
        } else {
            imageBuffer = await this.createStyledConfessionImage(confession, guildSettings, confessionAuthor);
            const embed = this.createConfessionEmbed(confession, guildSettings, confessionAuthor, imageBuffer);
            
            return {
                imageBuffer,
                embed
            };
        }
    }

    // Cleanup method for Puppeteer
    async cleanup() {
        if (this.renderer === 'puppeteer') {
            await puppeteerCanvas.close();
        }
    }
}

module.exports = new ConfessionCanvas(); 