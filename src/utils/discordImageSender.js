const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

class DiscordImageSender {
    constructor() {
        this.client = null;
    }

    async initialize(token) {
        if (!this.client) {
            this.client = new Client({
                intents: [
                    GatewayIntentBits.Guilds,
                    GatewayIntentBits.GuildMessages,
                    GatewayIntentBits.MessageContent
                ]
            });

            return new Promise((resolve, reject) => {
                this.client.once('ready', () => {
                    console.log(`🤖 Logged in as ${this.client.user.tag}`);
                    resolve();
                });

                this.client.on('error', (error) => {
                    console.error('❌ Discord client error:', error);
                    reject(error);
                });

                this.client.login(token);
            });
        }
    }

    async sendConfessionImage(imageBuffer, channelId, confessionData = {}) {
        try {
            if (!this.client) {
                throw new Error('Discord client not initialized. Call initialize() first.');
            }

            // Fetch channel
            const channel = await this.client.channels.fetch(channelId);
            if (!channel) {
                throw new Error(`Channel with ID ${channelId} not found`);
            }

            // Check if we should send as text instead of image
            if (confessionData.sendAsText && confessionData.content) {
                // Send as plain text
                const message = await channel.send({
                    content: confessionData.content
                });

                console.log("✅ Text confession đã được gửi lên Discord.");
                console.log(`📝 Message ID: ${message.id}`);
                console.log(`📊 Text length: ${confessionData.content.length} characters`);

                return message;
            }

            // Create attachment from buffer
            const attachment = new AttachmentBuilder(imageBuffer, {
                name: 'confession.png',
                description: 'Confession image'
            });

            // Prepare message content
            const content = confessionData.content || "📢 Có một bài confession mới!";
            
            // Send message with image
            const message = await channel.send({
                content: content,
                files: [attachment]
            });

            console.log("✅ Ảnh confession đã được gửi lên Discord.");
            console.log(`📝 Message ID: ${message.id}`);
            console.log(`📊 Image size: ${imageBuffer.length} bytes`);

            return message;

        } catch (error) {
            console.error('❌ Error sending confession image to Discord:', error);
            throw error;
        }
    }

    async sendConfessionWithEmbed(imageBuffer, embed, channelId) {
        try {
            if (!this.client) {
                throw new Error('Discord client not initialized. Call initialize() first.');
            }

            // Fetch channel
            const channel = await this.client.channels.fetch(channelId);
            if (!channel) {
                throw new Error(`Channel with ID ${channelId} not found`);
            }

            // Create attachment from buffer
            const attachment = new AttachmentBuilder(imageBuffer, {
                name: 'confession.png',
                description: 'Confession image'
            });

            // Set image in embed
            embed.setImage('attachment://confession.png');

            // Send message with embed and image
            const message = await channel.send({
                embeds: [embed],
                files: [attachment]
            });

            console.log("✅ Ảnh confession với embed đã được gửi lên Discord.");
            console.log(`📝 Message ID: ${message.id}`);
            console.log(`📊 Image size: ${imageBuffer.length} bytes`);

            return message;

        } catch (error) {
            console.error('❌ Error sending confession with embed to Discord:', error);
            throw error;
        }
    }

    async close() {
        if (this.client) {
            await this.client.destroy();
            this.client = null;
            console.log('🔚 Discord client closed');
        }
    }
}

module.exports = new DiscordImageSender(); 