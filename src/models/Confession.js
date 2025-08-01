const mongoose = require('mongoose');

const confessionSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    confessionNumber: {
        type: Number,
        default: 0
    },
    messageId: {
        type: String,
        default: null
    },
    threadId: {
        type: String,
        default: null
    },
    reviewedBy: {
        type: String,
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Indexes for better performance
confessionSchema.index({ guildId: 1, status: 1 });
confessionSchema.index({ guildId: 1, confessionNumber: 1 });
confessionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Confession', confessionSchema);
