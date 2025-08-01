const db = require('./src/data/mongodb');

async function testStatsDisplay() {
    console.log('🧪 Testing Stats Display...\n');

    try {
        // Connect to MongoDB
        await db.connect();
        console.log('✅ Connected to MongoDB');

        const guildId = '123456789';

        // Test 1: Get all stats
        console.log('\n1. Getting all stats...');
        const confessionStats = await db.getConfessionStats(guildId);
        const reactionStats = await db.getReactionStats(guildId);
        const commentStats = await db.getCommentStats(guildId);
        
        console.log('✅ Confession stats:', confessionStats);
        console.log('✅ Reaction stats:', reactionStats);
        console.log('✅ Comment stats:', commentStats);

        // Test 2: Check if stats are valid
        console.log('\n2. Validating stats...');
        
        const isValidConfessionStats = confessionStats && typeof confessionStats.total === 'number';
        const isValidReactionStats = reactionStats && typeof reactionStats.confessions_with_reactions === 'number';
        const isValidCommentStats = commentStats && typeof commentStats.confessions_with_comments === 'number';
        
        console.log('✅ Confession stats valid:', isValidConfessionStats);
        console.log('✅ Reaction stats valid:', isValidReactionStats);
        console.log('✅ Comment stats valid:', isValidCommentStats);

        // Test 3: Simulate embed creation
        console.log('\n3. Simulating embed creation...');
        
        const embedData = {
            title: "📊 Thống Kê Confession",
            fields: [
                {
                    name: "📝 Confessions",
                    value: `Tổng: **${confessionStats.total || 0}**\nĐã duyệt: **${confessionStats.approved || 0}**\nChờ duyệt: **${confessionStats.pending || 0}**\nBị từ chối: **${confessionStats.rejected || 0}**`,
                    inline: true
                },
                {
                    name: "❤️ Reactions",
                    value: `Confessions có reactions: **${reactionStats.confessions_with_reactions}**\nTổng reactions: **${reactionStats.total_reactions}**\nUsers đã react: **${reactionStats.unique_users_reacted}**`,
                    inline: true
                },
                {
                    name: "💬 Comments",
                    value: `Confessions có comments: **${commentStats.confessions_with_comments}**\nTổng comments: **${commentStats.total_comments}**\nUsers đã comment: **${commentStats.unique_users_commented}**`,
                    inline: true
                }
            ]
        };

        console.log('✅ Embed data created successfully');
        console.log('📊 Embed preview:');
        console.log(`Title: ${embedData.title}`);
        embedData.fields.forEach(field => {
            console.log(`${field.name}: ${field.value}`);
        });

        // Test 4: Check database collections
        console.log('\n4. Checking database collections...');
        
        const Reaction = require('./src/models/Reaction');
        const Comment = require('./src/models/Comment');
        
        const reactionCount = await Reaction.countDocuments({ guildId });
        const commentCount = await Comment.countDocuments({ guildId });
        
        console.log('✅ Reactions in database:', reactionCount);
        console.log('✅ Comments in database:', commentCount);

        // Test 5: Check if stats match database
        console.log('\n5. Validating stats against database...');
        
        const statsMatchReactions = reactionStats.total_reactions === reactionCount;
        const statsMatchComments = commentStats.total_comments === commentCount;
        
        console.log('✅ Reaction stats match database:', statsMatchReactions);
        console.log('✅ Comment stats match database:', statsMatchComments);

        if (!statsMatchReactions) {
            console.log('⚠️  Reaction stats mismatch:');
            console.log(`   Stats: ${reactionStats.total_reactions}`);
            console.log(`   Database: ${reactionCount}`);
        }

        if (!statsMatchComments) {
            console.log('⚠️  Comment stats mismatch:');
            console.log(`   Stats: ${commentStats.total_comments}`);
            console.log(`   Database: ${commentCount}`);
        }

        console.log('\n🎉 Stats display test completed!');
        
        console.log('\n📊 Final Summary:');
        console.log(`- Confessions: ${confessionStats.total}`);
        console.log(`- Confessions with reactions: ${reactionStats.confessions_with_reactions}`);
        console.log(`- Total reactions: ${reactionStats.total_reactions}`);
        console.log(`- Unique users reacted: ${reactionStats.unique_users_reacted}`);
        console.log(`- Confessions with comments: ${commentStats.confessions_with_comments}`);
        console.log(`- Total comments: ${commentStats.total_comments}`);
        console.log(`- Unique users commented: ${commentStats.unique_users_commented}`);

    } catch (error) {
        console.error('❌ Error during stats display test:', error);
    } finally {
        await db.disconnect();
        console.log('\n✅ MongoDB disconnected');
    }
}

// Run the test
testStatsDisplay(); 