const { ButtonStyle } = require("discord.js");

// Các cấu hình emoji khác nhau
const EMOJI_CONFIGS = {
    // Basic - 4 emoji phổ biến nhất
    basic: {
        heart: { emoji: "❤️", label: "Heart", style: ButtonStyle.Secondary },
        laugh: { emoji: "😂", label: "Laugh", style: ButtonStyle.Secondary },
        wow: { emoji: "😮", label: "Wow", style: ButtonStyle.Secondary },
        sad: { emoji: "😢", label: "Sad", style: ButtonStyle.Secondary }
    },
    
    // Popular - 6 emoji phổ biến
    popular: {
        heart: { emoji: "❤️", label: "Heart", style: ButtonStyle.Secondary },
        laugh: { emoji: "😂", label: "Laugh", style: ButtonStyle.Secondary },
        wow: { emoji: "😮", label: "Wow", style: ButtonStyle.Secondary },
        sad: { emoji: "😢", label: "Sad", style: ButtonStyle.Secondary },
        fire: { emoji: "🔥", label: "Fire", style: ButtonStyle.Secondary },
        clap: { emoji: "👏", label: "Clap", style: ButtonStyle.Secondary }
    },
    
    // Full - 8 emoji (hiện tại)
    full: {
        heart: { emoji: "❤️", label: "Heart", style: ButtonStyle.Secondary },
        laugh: { emoji: "😂", label: "Laugh", style: ButtonStyle.Secondary },
        wow: { emoji: "😮", label: "Wow", style: ButtonStyle.Secondary },
        sad: { emoji: "😢", label: "Sad", style: ButtonStyle.Secondary },
        fire: { emoji: "🔥", label: "Fire", style: ButtonStyle.Secondary },
        clap: { emoji: "👏", label: "Clap", style: ButtonStyle.Secondary },
        pray: { emoji: "🙏", label: "Pray", style: ButtonStyle.Secondary },
        love: { emoji: "💕", label: "Love", style: ButtonStyle.Secondary }
    },
    
    // Minimal - 3 emoji cơ bản
    minimal: {
        heart: { emoji: "❤️", label: "Heart", style: ButtonStyle.Secondary },
        laugh: { emoji: "😂", label: "Laugh", style: ButtonStyle.Secondary },
        wow: { emoji: "😮", label: "Wow", style: ButtonStyle.Secondary }
    },
    
    // Reaction - 5 emoji phản ứng
    reaction: {
        heart: { emoji: "❤️", label: "Love", style: ButtonStyle.Secondary },
        laugh: { emoji: "😂", label: "Funny", style: ButtonStyle.Secondary },
        wow: { emoji: "😮", label: "Surprised", style: ButtonStyle.Secondary },
        sad: { emoji: "😢", label: "Sad", style: ButtonStyle.Secondary },
        fire: { emoji: "🔥", label: "Hot", style: ButtonStyle.Secondary }
    }
};

// Cấu hình mặc định
const DEFAULT_CONFIG = 'basic';

// Lấy cấu hình emoji theo tên
function getEmojiConfig(configName = DEFAULT_CONFIG) {
    return EMOJI_CONFIGS[configName] || EMOJI_CONFIGS[DEFAULT_CONFIG];
}

// Lấy danh sách tất cả cấu hình
function getAllConfigs() {
    return Object.keys(EMOJI_CONFIGS);
}

// Lấy thông tin cấu hình
function getConfigInfo(configName) {
    const config = getEmojiConfig(configName);
    const emojiCount = Object.keys(config).length;
    const rows = Math.ceil(emojiCount / 4);
    
    return {
        name: configName,
        emojiCount,
        rows,
        emojis: Object.entries(config).map(([key, value]) => ({
            key,
            emoji: value.emoji,
            label: value.label
        }))
    };
}

// Lấy thông tin tất cả cấu hình
function getAllConfigsInfo() {
    return getAllConfigs().map(configName => getConfigInfo(configName));
}

module.exports = {
    EMOJI_CONFIGS,
    getEmojiConfig,
    getAllConfigs,
    getConfigInfo,
    getAllConfigsInfo,
    DEFAULT_CONFIG
}; 