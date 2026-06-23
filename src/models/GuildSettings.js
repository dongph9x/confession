const mongoose = require('mongoose');

const guildSettingsSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    confessionChannel: {
        type: String,
        default: null
    },
    reviewChannel: {
        type: String,
        default: null
    },
    prefix: {
        type: String,
        default: '!'
    },
    confessionCounter: {
        type: Number,
        default: 0
    },
    anonymousMode: {
        type: Boolean,
        default: false
    },
    welcome: {
        enabled: { type: Boolean, default: true },
        channelId: { type: String, default: null },
        defaultRoleId: { type: String, default: null },
        message: {
            type: String,
            default: 'Chào mừng {user} đã đến với **{server}**!\nServer của chúng ta hiện có {memberCount} thành viên!'
        },
        embedColor: { type: String, default: '#00ff00' },
        embedTitle: { type: String, default: '🎉 Chào mừng thành viên mới!' },
        bannerUrl: { type: String, default: null },
        showTimestamp: { type: Boolean, default: true },
        showMemberCount: { type: Boolean, default: true },
        showAccountAge: { type: Boolean, default: true }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('GuildSettings', guildSettingsSchema); 