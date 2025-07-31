const mongoose = require("mongoose");

const configSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true,
    },
    reviewChannelId: {
        type: String,
        default: null,
    },
    confessionChannelId: {
        type: String,
        default: null,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Config", configSchema);
