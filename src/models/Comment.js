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
    messageId: {
        type: String,
        required: true,
        unique: true
    },
    threadId: {
        type: String,
        required: true,
        index: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Comment', commentSchema); 