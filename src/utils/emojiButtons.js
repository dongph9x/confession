const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

// Emoji configuration
const EMOJIS = {
    heart: { emoji: "❤️", label: "Heart", style: ButtonStyle.Secondary },
    laugh: { emoji: "😂", label: "Laugh", style: ButtonStyle.Secondary },
    wow: { emoji: "😮", label: "Wow", style: ButtonStyle.Secondary },
    sad: { emoji: "😢", label: "Sad", style: ButtonStyle.Secondary },
    fire: { emoji: "🔥", label: "Fire", style: ButtonStyle.Secondary },
    clap: { emoji: "👏", label: "Clap", style: ButtonStyle.Secondary },
    pray: { emoji: "🙏", label: "Pray", style: ButtonStyle.Secondary },
    love: { emoji: "💕", label: "Love", style: ButtonStyle.Secondary }
};

// Create emoji buttons
function createEmojiButtons(counts = {}) {
    const rows = [];
    const emojiEntries = Object.entries(EMOJIS);
    
    // Chia thành 2 rows, mỗi row 4 buttons
    for (let i = 0; i < emojiEntries.length; i += 4) {
        const row = new ActionRowBuilder();
        const rowEmojis = emojiEntries.slice(i, i + 4);
        
        rowEmojis.forEach(([key, config]) => {
            const count = counts[key] || 0;
            const button = new ButtonBuilder()
                .setCustomId(`emoji_${key}`)
                .setLabel(`${config.emoji} ${count}`)
                .setStyle(config.style);
            
            row.addComponents(button);
        });
        
        rows.push(row);
    }
    
    return rows;
}

// Get emoji key from custom ID
function getEmojiKeyFromCustomId(customId) {
    if (!customId || !customId.startsWith('emoji_')) {
        return null;
    }
    return customId.replace('emoji_', '');
}

// Update emoji buttons with new counts
function updateEmojiButtons(components, counts, userReactions = []) {
    if (!components || components.length === 0) {
        return createEmojiButtons(counts);
    }
    
    const rows = [];
    const emojiEntries = Object.entries(EMOJIS);
    
    // Chia thành 2 rows, mỗi row 4 buttons
    for (let i = 0; i < emojiEntries.length; i += 4) {
        const row = new ActionRowBuilder();
        const rowEmojis = emojiEntries.slice(i, i + 4);
        
        rowEmojis.forEach(([key, config]) => {
            const count = counts[key] || 0;
            const isUserReacted = userReactions.includes(key);
            
            const button = new ButtonBuilder()
                .setCustomId(`emoji_${key}`)
                .setLabel(`${config.emoji} ${count}`)
                .setStyle(isUserReacted ? ButtonStyle.Primary : config.style);
            
            row.addComponents(button);
        });
        
        rows.push(row);
    }
    
    return rows;
}

// Get all available emoji keys
function getAvailableEmojis() {
    return Object.keys(EMOJIS);
}

module.exports = {
    createEmojiButtons,
    getEmojiKeyFromCustomId,
    updateEmojiButtons,
    getAvailableEmojis,
    EMOJIS
}; 