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

    async getUserPendingConfessions(guildId, userId) {
        const Confession = require('../models/Confession');
        return await Confession.find({ 
            guildId, 
            userId, 
            status: 'pending' 
        }).sort({ createdAt: 1 });
    }

    async updateConfessionStatus(confessionId, status, reviewedBy, messageId = null, threadId = null) {
        const Confession = require('../models/Confession');
        const GuildSettings = require('../models/GuildSettings');
        
        const confession = await Confession.findById(confessionId);
        if (!confession) return null;

        let confessionNumber = confession.confessionNumber;
        
        if (status === 'approved' && confessionNumber === 0) {
            // Tăng counter cho guild
            const settings = await GuildSettings.findOneAndUpdate(
                { guildId: confession.guildId },
                { $inc: { confessionCounter: 1 } },
                { new: true, upsert: true }
            );
            
            confessionNumber = settings ? settings.confessionCounter : 1;
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

    // Placeholder methods for compatibility
    async getReactionStats(guildId) {
        const EmojiReaction = require('../models/EmojiReaction');
        const Confession = require('../models/Confession');
        
        try {
            // Tổng số reactions
            const totalReactions = await EmojiReaction.countDocuments({ guildId });
            
            // Số confession có reactions
            const confessionsWithReactions = await EmojiReaction.distinct('confessionId', { guildId });
            
            // Số users đã react
            const uniqueUsersReacted = await EmojiReaction.distinct('userId', { guildId });
            
            return {
                confessions_with_reactions: confessionsWithReactions.length,
                total_reactions: totalReactions,
                unique_users_reacted: uniqueUsersReacted.length
            };
        } catch (error) {
            console.error('❌ getReactionStats error:', error);
            return {
                confessions_with_reactions: 0,
                total_reactions: 0,
                unique_users_reacted: 0
            };
        }
    }

    async getCommentStats(guildId) {
        const Comment = require('../models/Comment');
        const Confession = require('../models/Confession');
        
        try {
            // Tổng số comments
            const totalComments = await Comment.countDocuments({ 
                guildId, 
                isDeleted: false 
            });
            
            // Số confession có comments
            const confessionsWithComments = await Comment.distinct('confessionId', { 
                guildId, 
                isDeleted: false 
            });
            
            // Số users đã comment
            const uniqueUsersCommented = await Comment.distinct('userId', { 
                guildId, 
                isDeleted: false 
            });
            
            return {
                confessions_with_comments: confessionsWithComments.length,
                total_comments: totalComments,
                unique_users_commented: uniqueUsersCommented.length
            };
        } catch (error) {
            console.error('❌ getCommentStats error:', error);
            return {
                confessions_with_comments: 0,
                total_comments: 0,
                unique_users_commented: 0
            };
        }
    }

    // Comment Methods
    async addComment(guildId, confessionId, userId, username, content, messageId, threadId, isAnonymous = false) {
        const Comment = require('../models/Comment');
        
        const comment = new Comment({
            guildId,
            confessionId,
            userId,
            username,
            content,
            messageId,
            threadId,
            isAnonymous
        });
        
        await comment.save();
        return comment._id;
    }

    async getCommentsByConfession(guildId, confessionId, limit = 50) {
        const Comment = require('../models/Comment');
        
        return await Comment.find({
            guildId,
            confessionId,
            isDeleted: false
        })
        .sort({ createdAt: 1 })
        .limit(limit);
    }

    async deleteComment(commentId) {
        const Comment = require('../models/Comment');
        
        return await Comment.findByIdAndUpdate(commentId, {
            isDeleted: true,
            updatedAt: new Date()
        });
    }

    async getCommentById(commentId) {
        const Comment = require('../models/Comment');
        
        return await Comment.findById(commentId);
    }

    // Emoji Reaction Methods
    async addEmojiReaction(guildId, confessionId, userId, emojiKey) {
        const EmojiReaction = require('../models/EmojiReaction');
        
        // Check if user already reacted with this emoji
        const existingReaction = await EmojiReaction.findOne({
            guildId,
            confessionId,
            userId,
            emojiKey
        });
        
        if (existingReaction) {
            return false; // Already reacted
        }
        
        const reaction = new EmojiReaction({
            guildId,
            confessionId,
            userId,
            emojiKey
        });
        
        await reaction.save();
        return true;
    }
    
    async removeEmojiReaction(guildId, confessionId, userId, emojiKey) {
        const EmojiReaction = require('../models/EmojiReaction');
        
        const result = await EmojiReaction.deleteOne({
            guildId,
            confessionId,
            userId,
            emojiKey
        });
        
        return result.deletedCount > 0;
    }
    
    async getEmojiCounts(guildId, confessionId) {
        const EmojiReaction = require('../models/EmojiReaction');
        const mongoose = require('mongoose');
        
        try {
            // Convert string confessionId to ObjectId if needed
            const objectId = mongoose.Types.ObjectId.isValid(confessionId) 
                ? confessionId 
                : new mongoose.Types.ObjectId(confessionId);
            
            // Get all reactions and count manually
            const allReactions = await EmojiReaction.find({ guildId, confessionId: objectId });
            
            if (allReactions.length === 0) {
                return {};
            }
            
            const counts = {};
            allReactions.forEach(reaction => {
                if (!counts[reaction.emojiKey]) {
                    counts[reaction.emojiKey] = 0;
                }
                counts[reaction.emojiKey]++;
            });
            
            return counts;
        } catch (error) {
            console.error('❌ getEmojiCounts error:', error);
            return {};
        }
    }
    
    async getUserEmojiReactions(guildId, confessionId, userId) {
        const EmojiReaction = require('../models/EmojiReaction');
        const mongoose = require('mongoose');
        
        try {
            // Convert string confessionId to ObjectId if needed
            const objectId = mongoose.Types.ObjectId.isValid(confessionId) 
                ? confessionId 
                : new mongoose.Types.ObjectId(confessionId);
            
            const reactions = await EmojiReaction.find({
                guildId,
                confessionId: objectId,
                userId
            });
            
            return reactions.map(reaction => reaction.emojiKey);
        } catch (error) {
            console.error('❌ getUserEmojiReactions error:', error);
            return [];
        }
    }
    
    async toggleEmojiReaction(guildId, confessionId, userId, emojiKey) {
        const EmojiReaction = require('../models/EmojiReaction');
        const mongoose = require('mongoose');
        
        try {
            // Convert string confessionId to ObjectId if needed
            const objectId = mongoose.Types.ObjectId.isValid(confessionId) 
                ? confessionId 
                : new mongoose.Types.ObjectId(confessionId);
            
            // Check if user already reacted
            const existingReaction = await EmojiReaction.findOne({
                guildId,
                confessionId: objectId,
                userId,
                emojiKey
            });
            
            if (existingReaction) {
                // Remove reaction
                await EmojiReaction.deleteOne({
                    guildId,
                    confessionId: objectId,
                    userId,
                    emojiKey
                });
                return { action: 'removed', success: true };
            } else {
                // Add reaction
                const reaction = new EmojiReaction({
                    guildId,
                    confessionId: objectId,
                    userId,
                    emojiKey
                });
                await reaction.save();
                return { action: 'added', success: true };
            }
        } catch (error) {
            console.error('❌ toggleEmojiReaction error:', error);
            return { action: 'error', success: false };
        }
    }

    // Cleanup
    close() {
        this.disconnect();
    }
}

module.exports = new MongoDB(); 