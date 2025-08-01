const mongoose = require('mongoose');

const musicSettingsSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    djRole: {
        type: String,
        default: null
    },
    musicChannel: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MusicSettings', musicSettingsSchema); 