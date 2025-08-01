const mongoose = require('mongoose');

const emojiReactionSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        index: true
    },
    confessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Confession',
        required: true,
        index: true
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    emojiKey: {
        type: String,
        required: true,
        enum: ['heart', 'laugh', 'wow', 'sad', 'fire', 'clap', 'pray', 'love']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for unique user reactions
emojiReactionSchema.index({ guildId: 1, confessionId: 1, userId: 1, emojiKey: 1 }, { unique: true });

module.exports = mongoose.model('EmojiReaction', emojiReactionSchema); 