const mongoose = require('mongoose');
require('dotenv').config();

class MongoDB {
    constructor() {
        this.isConnected = false;
    }

    async connect() {
        try {
            if (this.isConnected) {
                console.log('MongoDB already connected');
                return;
            }

            const uri = process.env.MONGODB_URI;
            if (!uri) {
                throw new Error('MONGODB_URI not found in environment variables');
            }

            await mongoose.connect(uri);

            this.isConnected = true;
            console.log('✅ MongoDB connected successfully');
        } catch (error) {
            console.error('❌ MongoDB connection error:', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            await mongoose.disconnect();
            this.isConnected = false;
            console.log('MongoDB disconnected');
        } catch (error) {
            console.error('MongoDB disconnect error:', error);
        }
    }

    // Guild Settings Methods
    async getGuildSettings(guildId) {
        const GuildSettings = require('../models/GuildSettings');
        return await GuildSettings.findOne({ guildId });
    }

    async setConfessionChannel(guildId, channelId) {
        const GuildSettings = require('../models/GuildSettings');
        return await GuildSettings.findOneAndUpdate(
            { guildId },
            { confessionChannel: channelId },
            { upsert: true, new: true }
        );
    }

    async setReviewChannel(guildId, channelId) {
        const GuildSettings = require('../models/GuildSettings');
        return await GuildSettings.findOneAndUpdate(
            { guildId },
            { reviewChannel: channelId },
            { upsert: true, new: true }
        );
    }

    async setPrefix(guildId, prefix) {
        const GuildSettings = require('../models/GuildSettings');
        return await GuildSettings.findOneAndUpdate(
            { guildId },
            { prefix },
            { upsert: true, new: true }
        );
    }

    async setAnonymousMode(guildId, enabled) {
        const GuildSettings = require('../models/GuildSettings');
        return await GuildSettings.findOneAndUpdate(
            { guildId },
            { anonymousMode: enabled },
            { upsert: true, new: true }
        );
    }

    async getAnonymousMode(guildId) {
        const GuildSettings = require('../models/GuildSettings');
        const settings = await GuildSettings.findOne({ guildId });
        return settings ? settings.anonymousMode : false;
    }

    // Confession Methods
    async addConfession(guildId, userId, content, isAnonymous = false) {
        const Confession = require('../models/Confession');
        const confession = new Confession({
            guildId,
            userId,
            content,
            isAnonymous
        });
        await confession.save();
        return confession._id;
    }

    async getConfession(confessionId) {
        const Confession = require('../models/Confession');
        return await Confession.findById(confessionId);
    }

    async getPendingConfessions(guildId) {
        const Confession = require('../models/Confession');
        return await Confession.find({ 
            guildId, 
            status: 'pending' 
        }).sort({ createdAt: 1 });
    }

    async updateConfessionStatus(confessionId, status, reviewedBy, messageId = null, threadId = null) {
        const Confession = require('../models/Confession');
        const GuildSettings = require('../models/GuildSettings');
        
        const confession = await Confession.findById(confessionId);
        if (!confession) return null;

        // Kiểm tra xem confession đã được xử lý chưa
        if (confession.status !== 'pending') {
            console.log(`Confession ${confessionId} already processed with status: ${confession.status}`);
            return null;
        }

        let confessionNumber = confession.confessionNumber;
        
        if (status === 'approved' && confessionNumber === 0) {
            // Tăng counter cho guild
            const settings = await GuildSettings.findOneAndUpdate(
                { guildId: confession.guildId },
                { $inc: { confessionCounter: 1 } },
                { new: true }
            );
            
            confessionNumber = settings.confessionCounter;
        }

        return await Confession.findByIdAndUpdate(confessionId, {
            status,
            reviewedBy,
            reviewedAt: new Date(),
            messageId,
            threadId,
            confessionNumber
        }, { new: true });
    }

    async getConfessions(guildId, limit = 10) {
        const Confession = require('../models/Confession');
        return await Confession.find({ 
            guildId, 
            status: 'approved' 
        })
        .sort({ confessionNumber: -1 })
        .limit(limit);
    }

    async getConfessionByNumber(guildId, confessionNumber) {
        const Confession = require('../models/Confession');
        return await Confession.findOne({ 
            guildId, 
            confessionNumber, 
            status: 'approved' 
        });
    }

    async getRecentConfessions(guildId, userId, seconds = 30) {
        const Confession = require('../models/Confession');
        const cutoffTime = new Date(Date.now() - seconds * 1000);
        
        return await Confession.find({
            guildId,
            userId,
            createdAt: { $gte: cutoffTime }
        }).sort({ createdAt: -1 });
    }

    async getConfessionStats(guildId) {
        const Confession = require('../models/Confession');
        const stats = await Confession.aggregate([
            { $match: { guildId } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
                    approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
                    rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
                }
            }
        ]);

        return stats[0] || { total: 0, pending: 0, approved: 0, rejected: 0 };
    }

    // Music Settings Methods
    async getMusicSettings(guildId) {
        const MusicSettings = require('../models/MusicSettings');
        return await MusicSettings.findOne({ guildId });
    }

    async setMusicSettings(guildId, djRole, musicChannel) {
        const MusicSettings = require('../models/MusicSettings');
        return await MusicSettings.findOneAndUpdate(
            { guildId },
            { djRole, musicChannel },
            { upsert: true, new: true }
        );
    }

    // Reaction Methods
    async addReaction(guildId, confessionId, userId, emoji, emojiId = null) {
        const Reaction = require('../models/Reaction');
        try {
            return await Reaction.findOneAndUpdate(
                { confessionId, userId, emoji },
                { guildId, confessionId, userId, emoji, emojiId },
                { upsert: true, new: true }
            );
        } catch (error) {
            if (error.code === 11000) {
                // Duplicate reaction, return existing
                return await Reaction.findOne({ confessionId, userId, emoji });
            }
            throw error;
        }
    }

    async removeReaction(guildId, confessionId, userId, emoji) {
        const Reaction = require('../models/Reaction');
        return await Reaction.findOneAndDelete({ confessionId, userId, emoji });
    }

    // Thêm emoji reaction (cho custom emoji buttons)
    async addEmojiReaction(guildId, confessionId, userId, emojiKey) {
        const Reaction = require('../models/Reaction');
        try {
            const reaction = new Reaction({
                guildId,
                confessionId,
                userId,
                emoji: emojiKey,
                emojiId: null
            });
            await reaction.save();
            return true;
        } catch (error) {
            if (error.code === 11000) {
                // Duplicate reaction, return existing
                return true;
            }
            console.error('Error adding emoji reaction:', error);
            return false;
        }
    }

    // Xóa emoji reaction
    async removeEmojiReaction(guildId, confessionId, userId, emojiKey) {
        const Reaction = require('../models/Reaction');
        return await Reaction.findOneAndDelete({ confessionId, userId, emoji: emojiKey });
    }

    // Lấy emoji counts cho confession
    async getEmojiCounts(guildId, confessionId) {
        const Reaction = require('../models/Reaction');
        const emojiKeys = ['heart', 'laugh', 'wow', 'sad', 'fire'];
        const counts = {};

        for (const emojiKey of emojiKeys) {
            const count = await Reaction.countDocuments({ 
                guildId, 
                confessionId, 
                emoji: emojiKey 
            });
            counts[emojiKey] = count;
        }

        return counts;
    }

    // Lấy user reactions cho confession
    async getUserEmojiReactions(guildId, confessionId, userId) {
        const Reaction = require('../models/Reaction');
        const reactions = await Reaction.find({ 
            guildId, 
            confessionId, 
            userId 
        });
        
        return reactions.map(r => r.emoji);
    }

    async getReactionStats(guildId) {
        const Reaction = require('../models/Reaction');
        const Confession = require('../models/Confession');

        // Lấy thống kê reactions
        const reactionStats = await Reaction.aggregate([
            { $match: { guildId } },
            {
                $group: {
                    _id: null,
                    total_reactions: { $sum: 1 },
                    unique_users_reacted: { $addToSet: '$userId' }
                }
            }
        ]);

        // Lấy số confessions có reactions
        const confessionsWithReactions = await Reaction.aggregate([
            { $match: { guildId } },
            { $group: { _id: '$confessionId' } },
            { $count: 'count' }
        ]);

        const stats = reactionStats[0] || { total_reactions: 0, unique_users_reacted: [] };
        const confessionsCount = confessionsWithReactions[0]?.count || 0;

        return {
            confessions_with_reactions: confessionsCount,
            total_reactions: stats.total_reactions,
            unique_users_reacted: stats.unique_users_reacted.length
        };
    }

    // Comment Methods
    async addComment(guildId, confessionId, userId, messageId, threadId, content) {
        const Comment = require('../models/Comment');
        return await Comment.create({
            guildId,
            confessionId,
            userId,
            messageId,
            threadId,
            content
        });
    }

    async getCommentStats(guildId) {
        const Comment = require('../models/Comment');

        // Lấy thống kê comments
        const commentStats = await Comment.aggregate([
            { $match: { guildId } },
            {
                $group: {
                    _id: null,
                    total_comments: { $sum: 1 },
                    unique_users_commented: { $addToSet: '$userId' }
                }
            }
        ]);

        // Lấy số confessions có comments
        const confessionsWithComments = await Comment.aggregate([
            { $match: { guildId } },
            { $group: { _id: '$confessionId' } },
            { $count: 'count' }
        ]);

        const stats = commentStats[0] || { total_comments: 0, unique_users_commented: [] };
        const confessionsCount = confessionsWithComments[0]?.count || 0;

        return {
            confessions_with_comments: confessionsCount,
            total_comments: stats.total_comments,
            unique_users_commented: stats.unique_users_commented.length
        };
    }

    // Cleanup
    close() {
        this.disconnect();
    }
}

module.exports = new MongoDB(); 