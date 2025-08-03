const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
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
    username: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 1000
    },
    messageId: {
        type: String,
        required: true
    },
    threadId: {
        type: String,
        required: true
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});

// Indexes for better performance
commentSchema.index({ guildId: 1, confessionId: 1 });
commentSchema.index({ guildId: 1, userId: 1 });
commentSchema.index({ guildId: 1, createdAt: -1 });

// Update updatedAt on save
commentSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Comment', commentSchema); 