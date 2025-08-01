const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
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
    emoji: {
        type: String,
        required: true
    },
    emojiId: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index để tránh duplicate reactions
reactionSchema.index({ confessionId: 1, userId: 1, emoji: 1 }, { unique: true });

module.exports = mongoose.model('Reaction', reactionSchema); 