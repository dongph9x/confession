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
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('GuildSettings', guildSettingsSchema); 