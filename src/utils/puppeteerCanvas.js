const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

class PuppeteerCanvas {
    constructor() {
        this.templatePath = path.join(__dirname, 'confessionTemplate.html');
        this.discordTemplatePath = path.join(__dirname, 'discordOptimizedTemplate.html');
        this.ultraCompactTemplatePath = path.join(__dirname, 'ultraCompactTemplate.html');
        this.browser = null;
    }

    async initialize() {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: "new",
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            });
        }
    }

    async createConfessionImage(confession, guildSettings, confessionAuthor, options = {}) {
        await this.initialize();
        
        const page = await this.browser.newPage();
        
        try {
            // Choose template based on options
            let templatePath = this.templatePath;
            if (options.ultraCompact) {
                templatePath = this.ultraCompactTemplatePath;
            } else if (options.discordOptimized) {
                templatePath = this.discordTemplatePath;
            }
            
            // Load template HTML
            await page.goto(`file://${templatePath}`, {
                waitUntil: 'networkidle0',
            });

            // Set viewport based on options
            const viewport = options.fullWidth ? {
                width: 1400,  // Wide viewport for full width
                height: 900,   // Taller for full content
                deviceScaleFactor: 2
            } : options.ultraCompact ? {
                width: 500,   // Ultra compact for Discord limitations
                height: 300,  // Very compact height
                deviceScaleFactor: 2
            } : options.discordOptimized ? {
                width: 600,   // Optimized for bot messages
                height: 400,  // Compact height for bot messages
                deviceScaleFactor: 2
            } : {
                width: 800, 
                height: 600,
                deviceScaleFactor: 2
            };
            
            await page.setViewport(viewport);

            // Prepare data for template
            const templateData = {
                number: guildSettings.confessionCounter + 1,
                content: confession.content,
                author: {
                    username: confessionAuthor?.username || 'Unknown',
                    isAnonymous: confession.isAnonymous
                },
                time: this.formatTime(confession.createdAt),
                serverName: guildSettings.guildName || 'Unknown Server'
            };

            // Update template with data
            await page.evaluate((data) => {
                if (window.updateConfession) {
                    window.updateConfession(data);
                }
            }, templateData);

            // Wait for any animations or transitions
            await page.waitForTimeout(1000);

            // Take screenshot based on options
            const screenshot = await page.screenshot({
                type: 'png',
                fullPage: options.fullWidth || false,
                omitBackground: false
            });

            return screenshot;

        } catch (error) {
            console.error('Error creating confession image with Puppeteer:', error);
            throw error;
        } finally {
            await page.close();
        }
    }

    formatTime(date) {
        const now = new Date();
        const confessionDate = new Date(date);
        const diffInSeconds = Math.floor((now - confessionDate) / 1000);

        if (diffInSeconds < 60) {
            return 'Vừa xong';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} phút trước`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} giờ trước`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} ngày trước`;
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    // Method to create confession with embed (similar to original canvas)
    async createConfessionWithEmbed(confession, guildSettings, confessionAuthor) {
        const { EmbedBuilder } = require('discord.js');
        
        const imageBuffer = await this.createConfessionImage(confession, guildSettings, confessionAuthor);
        
        const embed = new EmbedBuilder()
            .setColor('#667eea')
            .setTitle(`💝 Confession #${guildSettings.confessionCounter + 1}`)
            .setDescription(confession.content)
            .setImage('attachment://confession.png')
            .setTimestamp(confession.createdAt)
            .setFooter({ 
                text: `Confession Bot • ${guildSettings.guildName || 'Unknown Server'}`,
                iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png'
            });

        // Add author field
        if (confession.isAnonymous) {
            embed.addFields({ name: '👤 Author', value: '🕵️ Ẩn danh', inline: true });
        } else {
            embed.addFields({ name: '👤 Author', value: confessionAuthor?.username || 'Unknown', inline: true });
        }

        // Add time field
        embed.addFields({ 
            name: '⏰ Posted', 
            value: `<t:${Math.floor(new Date(confession.createdAt).getTime() / 1000)}:R>`, 
            inline: true 
        });

        return {
            imageBuffer,
            embed
        };
    }
}

module.exports = new PuppeteerCanvas(); 