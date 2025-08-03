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
        const GuildSettings = require('../models/GuildSettings');
        
        // Lấy guild settings để tăng confession counter
        let guildSettings = await GuildSettings.findOne({ guildId });
        if (!guildSettings) {
            guildSettings = new GuildSettings({ guildId, confessionCounter: 0 });
        }
        
        // Tăng confession counter
        guildSettings.confessionCounter += 1;
        await guildSettings.save();
        
        const confession = new Confession({
            guildId,
            userId,
            content,
            isAnonymous,
            confessionNumber: guildSettings.confessionCounter
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
            confessionNumber
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

    async getCommentByMessageId(messageId) {
        const Comment = require('../models/Comment');
        
        return await Comment.findOne({ messageId });
    }

    // Top Commenters Methods
    async getTopCommenters(guildId, limit = 10) {
        const Comment = require('../models/Comment');
        
        try {
            // Aggregate để đếm comments theo user
            const topCommenters = await Comment.aggregate([
                { $match: { guildId, isDeleted: false } },
                { $group: { 
                    _id: '$userId', 
                    username: { $first: '$username' },
                    commentCount: { $sum: 1 },
                    comments: { $push: { content: '$content', createdAt: '$createdAt' } }
                }},
                { $project: {
                    userId: '$_id',
                    username: 1,
                    commentCount: 1,
                    comments: { $slice: ['$comments', 5] } // Lấy 5 comments gần nhất
                }},
                { $sort: { commentCount: -1 } },
                { $limit: limit }
            ]);

            return topCommenters;
        } catch (error) {
            console.error('❌ getTopCommenters error:', error);
            return [];
        }
    }

    async getUserCommentStats(guildId, userId) {
        const Comment = require('../models/Comment');
        
        try {
            // Tổng số comments của user
            const totalComments = await Comment.countDocuments({ 
                guildId, 
                userId, 
                isDeleted: false 
            });

            // Số confession khác nhau mà user đã comment
            const uniqueConfessions = await Comment.distinct('confessionId', { 
                guildId, 
                userId, 
                isDeleted: false 
            });

            // Comments gần nhất
            const recentComments = await Comment.find({ 
                guildId, 
                userId, 
                isDeleted: false 
            })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('content createdAt confessionId');

            // Thống kê theo thời gian
            const now = new Date();
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

            const commentsThisWeek = await Comment.countDocuments({
                guildId,
                userId,
                isDeleted: false,
                createdAt: { $gte: oneWeekAgo }
            });

            const commentsThisMonth = await Comment.countDocuments({
                guildId,
                userId,
                isDeleted: false,
                createdAt: { $gte: oneMonthAgo }
            });

            return {
                totalComments,
                uniqueConfessions: uniqueConfessions.length,
                commentsThisWeek,
                commentsThisMonth,
                recentComments
            };
        } catch (error) {
            console.error('❌ getUserCommentStats error:', error);
            return {
                totalComments: 0,
                uniqueConfessions: 0,
                commentsThisWeek: 0,
                commentsThisMonth: 0,
                recentComments: []
            };
        }
    }

    async getCommenterRanking(guildId, limit = 20) {
        const Comment = require('../models/Comment');
        
        try {
            // Aggregate để tạo ranking
            const ranking = await Comment.aggregate([
                { $match: { guildId, isDeleted: false } },
                { $group: { 
                    _id: '$userId', 
                    username: { $first: '$username' },
                    commentCount: { $sum: 1 },
                    firstComment: { $min: '$createdAt' },
                    lastComment: { $max: '$createdAt' }
                }},
                { $project: {
                    userId: '$_id',
                    username: 1,
                    commentCount: 1,
                    firstComment: 1,
                    lastComment: 1
                }},
                { $sort: { commentCount: -1, lastComment: -1 } },
                { $limit: limit }
            ]);

            // Thêm rank cho mỗi user
            ranking.forEach((user, index) => {
                user.rank = index + 1;
                user.rankEmoji = user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `#${user.rank}`;
            });

            return ranking;
        } catch (error) {
            console.error('❌ getCommenterRanking error:', error);
            return [];
        }
    }

    // Top Confessions Methods
    async getTopConfessionsByReactions(guildId, limit = 10) {
        const EmojiReaction = require('../models/EmojiReaction');
        const Confession = require('../models/Confession');
        
        try {
            // Aggregate để đếm reactions theo confession
            const topReactions = await EmojiReaction.aggregate([
                { $match: { guildId } },
                { $group: { 
                    _id: '$confessionId', 
                    reactionCount: { $sum: 1 },
                    uniqueUsers: { $addToSet: '$userId' }
                }},
                { $project: {
                    confessionId: '$_id',
                    reactionCount: 1,
                    uniqueUsersCount: { $size: '$uniqueUsers' }
                }},
                { $sort: { reactionCount: -1 } },
                { $limit: limit }
            ]);

            // Lấy thông tin confession cho mỗi top reaction
            const topConfessions = [];
            for (const reaction of topReactions) {
                const confession = await Confession.findById(reaction.confessionId);
                if (confession) {
                    topConfessions.push({
                        confessionId: reaction.confessionId,
                        confessionNumber: confession.confessionNumber || 'Unknown',
                        content: confession.content,
                        userId: confession.userId,
                        isAnonymous: confession.isAnonymous,
                        createdAt: confession.createdAt,
                        reactionCount: reaction.reactionCount,
                        uniqueUsersCount: reaction.uniqueUsersCount
                    });
                }
            }

            return topConfessions;
        } catch (error) {
            console.error('❌ getTopConfessionsByReactions error:', error);
            return [];
        }
    }

    async getTopConfessionsByComments(guildId, limit = 10) {
        const Comment = require('../models/Comment');
        const Confession = require('../models/Confession');
        
        try {
            // Aggregate để đếm comments theo confession
            const topComments = await Comment.aggregate([
                { $match: { guildId, isDeleted: false } },
                { $group: { 
                    _id: '$confessionId', 
                    commentCount: { $sum: 1 },
                    uniqueUsers: { $addToSet: '$userId' }
                }},
                { $project: {
                    confessionId: '$_id',
                    commentCount: 1,
                    uniqueUsersCount: { $size: '$uniqueUsers' }
                }},
                { $sort: { commentCount: -1 } },
                { $limit: limit }
            ]);

            // Lấy thông tin confession cho mỗi top comment
            const topConfessions = [];
            for (const comment of topComments) {
                const confession = await Confession.findById(comment.confessionId);
                if (confession) {
                    topConfessions.push({
                        confessionId: comment.confessionId,
                        confessionNumber: confession.confessionNumber || 'Unknown',
                        content: confession.content,
                        userId: confession.userId,
                        isAnonymous: confession.isAnonymous,
                        createdAt: confession.createdAt,
                        commentCount: comment.commentCount,
                        uniqueUsersCount: comment.uniqueUsersCount
                    });
                }
            }

            return topConfessions;
        } catch (error) {
            console.error('❌ getTopConfessionsByComments error:', error);
            return [];
        }
    }

    async getTopConfessionsByEngagement(guildId, limit = 10) {
        const EmojiReaction = require('../models/EmojiReaction');
        const Comment = require('../models/Comment');
        const Confession = require('../models/Confession');
        
        try {
            // Aggregate reactions
            const reactionStats = await EmojiReaction.aggregate([
                { $match: { guildId } },
                { $group: { 
                    _id: '$confessionId', 
                    reactionCount: { $sum: 1 }
                }}
            ]);

            // Aggregate comments
            const commentStats = await Comment.aggregate([
                { $match: { guildId, isDeleted: false } },
                { $group: { 
                    _id: '$confessionId', 
                    commentCount: { $sum: 1 }
                }}
            ]);

            // Combine và tính tổng engagement
            const engagementMap = new Map();
            
            // Add reactions
            reactionStats.forEach(stat => {
                engagementMap.set(stat._id.toString(), {
                    confessionId: stat._id,
                    reactionCount: stat.reactionCount,
                    commentCount: 0,
                    totalEngagement: stat.reactionCount
                });
            });

            // Add comments
            commentStats.forEach(stat => {
                const confessionId = stat._id.toString();
                if (engagementMap.has(confessionId)) {
                    const existing = engagementMap.get(confessionId);
                    existing.commentCount = stat.commentCount;
                    existing.totalEngagement += stat.commentCount;
                } else {
                    engagementMap.set(confessionId, {
                        confessionId: stat._id,
                        reactionCount: 0,
                        commentCount: stat.commentCount,
                        totalEngagement: stat.commentCount
                    });
                }
            });

            // Sort by total engagement
            const topEngagement = Array.from(engagementMap.values())
                .sort((a, b) => b.totalEngagement - a.totalEngagement)
                .slice(0, limit);

            // Lấy thông tin confession
            const topConfessions = [];
            for (const engagement of topEngagement) {
                const confession = await Confession.findById(engagement.confessionId);
                if (confession) {
                    topConfessions.push({
                        confessionId: engagement.confessionId,
                        confessionNumber: confession.confessionNumber || 'Unknown',
                        content: confession.content,
                        userId: confession.userId,
                        isAnonymous: confession.isAnonymous,
                        createdAt: confession.createdAt,
                        reactionCount: engagement.reactionCount,
                        commentCount: engagement.commentCount,
                        totalEngagement: engagement.totalEngagement
                    });
                }
            }

            return topConfessions;
        } catch (error) {
            console.error('❌ getTopConfessionsByEngagement error:', error);
            return [];
        }
    }

    async getConfessionEngagementStats(guildId, confessionId) {
        const EmojiReaction = require('../models/EmojiReaction');
        const Comment = require('../models/Comment');
        
        try {
            // Count reactions
            const reactionCount = await EmojiReaction.countDocuments({
                guildId,
                confessionId
            });

            // Count unique users who reacted
            const uniqueUsersReacted = await EmojiReaction.distinct('userId', {
                guildId,
                confessionId
            });

            // Count comments
            const commentCount = await Comment.countDocuments({
                guildId,
                confessionId,
                isDeleted: false
            });

            // Count unique users who commented
            const uniqueUsersCommented = await Comment.distinct('userId', {
                guildId,
                confessionId,
                isDeleted: false
            });

            // Get reaction breakdown
            const reactionBreakdown = await EmojiReaction.aggregate([
                { $match: { guildId, confessionId } },
                { $group: { 
                    _id: '$emojiKey', 
                    count: { $sum: 1 }
                }},
                { $sort: { count: -1 } }
            ]);

            return {
                reactionCount,
                uniqueUsersReacted: uniqueUsersReacted.length,
                commentCount,
                uniqueUsersCommented: uniqueUsersCommented.length,
                totalEngagement: reactionCount + commentCount,
                reactionBreakdown
            };
        } catch (error) {
            console.error('❌ getConfessionEngagementStats error:', error);
            return {
                reactionCount: 0,
                uniqueUsersReacted: 0,
                commentCount: 0,
                uniqueUsersCommented: 0,
                totalEngagement: 0,
                reactionBreakdown: []
            };
        }
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