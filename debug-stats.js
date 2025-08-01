const db = require('./src/data/mongodb');

async function debugStats() {
    console.log('🔍 Debugging Stats Display...\n');

    try {
        await db.connect();
        console.log('✅ Connected to MongoDB');

        const guildId = '123456789';

        // Test 1: Check if methods exist
        console.log('\n1. Checking if methods exist...');
        console.log('✅ getConfessionStats exists:', typeof db.getConfessionStats === 'function');
        console.log('✅ getReactionStats exists:', typeof db.getReactionStats === 'function');
        console.log('✅ getCommentStats exists:', typeof db.getCommentStats === 'function');

        // Test 2: Call methods individually
        console.log('\n2. Calling methods individually...');
        
        try {
            const confessionStats = await db.getConfessionStats(guildId);
            console.log('✅ getConfessionStats result:', confessionStats);
        } catch (error) {
            console.error('❌ getConfessionStats error:', error.message);
        }

        try {
            const reactionStats = await db.getReactionStats(guildId);
            console.log('✅ getReactionStats result:', reactionStats);
        } catch (error) {
            console.error('❌ getReactionStats error:', error.message);
        }

        try {
            const commentStats = await db.getCommentStats(guildId);
            console.log('✅ getCommentStats result:', commentStats);
        } catch (error) {
            console.error('❌ getCommentStats error:', error.message);
        }

        // Test 3: Check database collections directly
        console.log('\n3. Checking database collections...');
        
        const Reaction = require('./src/models/Reaction');
        const Comment = require('./src/models/Comment');
        
        try {
            const reactions = await Reaction.find({ guildId });
            console.log('✅ Reactions found:', reactions.length);
            console.log('✅ Sample reaction:', reactions[0] || 'No reactions');
        } catch (error) {
            console.error('❌ Error querying reactions:', error.message);
        }

        try {
            const comments = await Comment.find({ guildId });
            console.log('✅ Comments found:', comments.length);
            console.log('✅ Sample comment:', comments[0] || 'No comments');
        } catch (error) {
            console.error('❌ Error querying comments:', error.message);
        }

        // Test 4: Test aggregation queries manually
        console.log('\n4. Testing aggregation queries...');
        
        try {
            const reactionAggregation = await Reaction.aggregate([
                { $match: { guildId } },
                {
                    $group: {
                        _id: null,
                        total_reactions: { $sum: 1 },
                        unique_users_reacted: { $addToSet: '$userId' }
                    }
                }
            ]);
            console.log('✅ Reaction aggregation result:', reactionAggregation);
        } catch (error) {
            console.error('❌ Reaction aggregation error:', error.message);
        }

        try {
            const commentAggregation = await Comment.aggregate([
                { $match: { guildId } },
                {
                    $group: {
                        _id: null,
                        total_comments: { $sum: 1 },
                        unique_users_commented: { $addToSet: '$userId' }
                    }
                }
            ]);
            console.log('✅ Comment aggregation result:', commentAggregation);
        } catch (error) {
            console.error('❌ Comment aggregation error:', error.message);
        }

        // Test 5: Check if guildId is correct
        console.log('\n5. Checking guildId...');
        console.log('✅ Using guildId:', guildId);
        
        // Check if there are any reactions/comments with different guildId
        const allReactions = await Reaction.find({});
        const allComments = await Comment.find({});
        
        console.log('✅ Total reactions in database:', allReactions.length);
        console.log('✅ Total comments in database:', allComments.length);
        
        if (allReactions.length > 0) {
            console.log('✅ Sample reaction guildId:', allReactions[0].guildId);
        }
        
        if (allComments.length > 0) {
            console.log('✅ Sample comment guildId:', allComments[0].guildId);
        }

        console.log('\n🎉 Debug completed!');

    } catch (error) {
        console.error('❌ Debug error:', error);
    } finally {
        await db.disconnect();
        console.log('\n✅ MongoDB disconnected');
    }
}

debugStats(); 