const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Định nghĩa các emoji có sẵn
const EMOJI_CONFIG = {
    heart: {
        emoji: '❤️',
        label: 'Love',
        style: ButtonStyle.Secondary,
        customId: 'emoji_heart'
    },
    laugh: {
        emoji: '😂',
        label: 'Laugh',
        style: ButtonStyle.Secondary,
        customId: 'emoji_laugh'
    },
    wow: {
        emoji: '😮',
        label: 'Wow',
        style: ButtonStyle.Secondary,
        customId: 'emoji_wow'
    },
    sad: {
        emoji: '😢',
        label: 'Sad',
        style: ButtonStyle.Secondary,
        customId: 'emoji_sad'
    },

    fire: {
        emoji: '🔥',
        label: 'Fire',
        style: ButtonStyle.Secondary,
        customId: 'emoji_fire'
    }
};

/**
 * Tạo emoji buttons cho confession
 * @param {Object} emojiCounts - Object chứa số lượng của từng emoji
 * @param {Array} userReactions - Array chứa emoji mà user đã click
 * @returns {Array} Array các ActionRow chứa buttons
 */
function createEmojiButtons(emojiCounts = {}, userReactions = []) {
    const rows = [];
    const buttonsPerRow = 3;
    const emojiEntries = Object.entries(EMOJI_CONFIG);
    
    for (let i = 0; i < emojiEntries.length; i += buttonsPerRow) {
        const row = new ActionRowBuilder();
        const rowEmojis = emojiEntries.slice(i, i + buttonsPerRow);
        
        rowEmojis.forEach(([key, config]) => {
            const count = emojiCounts[key] || 0;
            const isUserReacted = userReactions.includes(key);
            
            const button = new ButtonBuilder()
                .setCustomId(`emoji_${key}`)
                .setLabel(`${config.emoji} ${count}`)
                .setStyle(isUserReacted ? ButtonStyle.Primary : config.style);
            
            row.addComponents(button);
        });
        
        if (row.components.length > 0) {
            rows.push(row);
        }
    }
    
    return rows;
}

/**
 * Cập nhật emoji buttons với số lượng mới
 * @param {Array} components - Components hiện tại
 * @param {Object} emojiCounts - Số lượng emoji mới
 * @param {Array} userReactions - Emoji mà user đã click
 * @returns {Array} Components đã được cập nhật
 */
function updateEmojiButtons(components, emojiCounts, userReactions = []) {
    return components.map(row => {
        const newRow = new ActionRowBuilder();
        
        row.components.forEach(button => {
            const emojiKey = getEmojiKeyFromCustomId(button.data.custom_id);
            if (emojiKey && EMOJI_CONFIG[emojiKey]) {
                const config = EMOJI_CONFIG[emojiKey];
                const count = emojiCounts[emojiKey] || 0;
                const isUserReacted = userReactions.includes(emojiKey);
                
                const newButton = new ButtonBuilder()
                    .setCustomId(`emoji_${emojiKey}`)
                    .setLabel(`${config.emoji} ${count}`)
                    .setStyle(isUserReacted ? ButtonStyle.Primary : config.style);
                
                newRow.addComponents(newButton);
            }
        });
        
        return newRow;
    });
}

/**
 * Lấy emoji key từ customId
 * @param {string} customId - Custom ID của button
 * @returns {string|null} Emoji key hoặc null
 */
function getEmojiKeyFromCustomId(customId) {
    if (customId && customId.startsWith('emoji_')) {
        return customId.replace('emoji_', '');
    }
    return null;
}

/**
 * Lấy emoji config từ key
 * @param {string} key - Emoji key
 * @returns {Object|null} Emoji config hoặc null
 */
function getEmojiConfig(key) {
    return EMOJI_CONFIG[key] || null;
}

/**
 * Lấy tất cả emoji keys
 * @returns {Array} Array các emoji keys
 */
function getAllEmojiKeys() {
    return Object.keys(EMOJI_CONFIG);
}

module.exports = {
    createEmojiButtons,
    updateEmojiButtons,
    getEmojiKeyFromCustomId,
    getEmojiConfig,
    getAllEmojiKeys,
    EMOJI_CONFIG
}; 