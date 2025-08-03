require('dotenv').config();
const db = require('./src/data/mongodb');

async function fixRealGuildConfessions() {
    console.log('🔧 Fixing Real Guild Confessions');
    console.log('=================================');
    console.log('');
    
    try {
        // Connect to MongoDB
        console.log('🔗 Connecting to MongoDB...');
        await db.connect();
        
        // Use real guild ID
        const realGuildId = process.env.GUILD_ID || '1005280612845891615';
        
        console.log(`🏠 Fixing confessions for Real Guild ID: ${realGuildId}`);
        console.log('');
        
        // Get all confessions with number = 0
        const Confession = require('./src/models/Confession');
        const GuildSettings = require('./src/models/GuildSettings');
        
        const confessionsWithZero = await Confession.find({ 
            guildId: realGuildId, 
            confessionNumber: 0 
        }).sort({ createdAt: 1 });
        
        console.log(`📋 Found ${confessionsWithZero.length} confessions with number = 0`);
        console.log('');
        
        if (confessionsWithZero.length === 0) {
            console.log('✅ No confessions to fix!');
            return;
        }
        
        // Show confessions to fix
        confessionsWithZero.forEach((conf, index) => {
            console.log(`   ${index + 1}. Confession ID: ${conf._id}`);
            console.log(`      Status: ${conf.status}`);
            console.log(`      Content: ${conf.content.substring(0, 50)}...`);
            console.log(`      Created: ${conf.createdAt}`);
            console.log('');
        });
        
        // Get current guild settings
        let guildSettings = await GuildSettings.findOne({ guildId: realGuildId });
        if (!guildSettings) {
            console.log('❌ No guild settings found!');
            return;
        }
        
        console.log(`📊 Current confession counter: ${guildSettings.confessionCounter}`);
        console.log('');
        
        // Fix each confession
        let fixedCount = 0;
        for (let i = 0; i < confessionsWithZero.length; i++) {
            const confession = confessionsWithZero[i];
            
            // Increment counter
            guildSettings.confessionCounter += 1;
            await guildSettings.save();
            
            // Update confession with new number
            await Confession.findByIdAndUpdate(confession._id, {
                confessionNumber: guildSettings.confessionCounter
            });
            
            console.log(`✅ Fixed Confession #${guildSettings.confessionCounter}: ${confession.content.substring(0, 50)}...`);
            console.log(`   Status: ${confession.status}`);
            console.log(`   ID: ${confession._id}`);
            console.log('');
            fixedCount++;
        }
        
        console.log(`📊 Fix Summary:`);
        console.log(`   ✅ Fixed confessions: ${fixedCount}`);
        console.log(`   ✅ New confession counter: ${guildSettings.confessionCounter}`);
        console.log('');
        
        // Test emoji button with fixed confessions
        console.log('🧪 Testing Emoji Button with Fixed Confessions');
        const recentFixedConfession = await Confession.findOne({ 
            guildId: realGuildId, 
            confessionNumber: { $gt: 0 } 
        }).sort({ confessionNumber: -1 });
        
        if (recentFixedConfession) {
            console.log(`   Testing with Confession #${recentFixedConfession.confessionNumber}`);
            
            // Test confession lookup
            const foundConfession = await db.getConfessionByNumberAnyStatus(realGuildId, recentFixedConfession.confessionNumber);
            if (foundConfession) {
                console.log(`   ✅ Confession lookup: Success`);
                console.log(`   Status: ${foundConfession.status}`);
                console.log(`   Content: ${foundConfession.content.substring(0, 30)}...`);
                
                // Test emoji reaction
                try {
                    const result = await db.toggleEmojiReaction(
                        realGuildId,
                        foundConfession._id,
                        'test_user_fix_real',
                        'heart'
                    );
                    console.log(`   ✅ Emoji reaction: ${result ? 'Success' : 'Failed'}`);
                    
                    const emojiCounts = await db.getEmojiCounts(realGuildId, foundConfession._id);
                    console.log(`   Emoji counts:`, emojiCounts);
                    
                } catch (error) {
                    console.log(`   ❌ Emoji reaction error: ${error.message}`);
                }
            } else {
                console.log(`   ❌ Confession lookup: Failed`);
            }
        }
        console.log('');
        
        // Final check
        console.log('📋 Final Check');
        const remainingConfessionsWithZero = await Confession.find({ 
            guildId: realGuildId, 
            confessionNumber: 0 
        });
        
        console.log(`   Confessions with number = 0: ${remainingConfessionsWithZero.length}`);
        if (remainingConfessionsWithZero.length === 0) {
            console.log(`   ✅ All confessions fixed!`);
        } else {
            console.log(`   ❌ Still have confessions with number = 0`);
        }
        console.log('');
        
        console.log('🎉 Real guild confession fix completed!');
        console.log('✅ All confessions now have proper numbers');
        console.log('✅ Emoji buttons should work correctly');
        
    } catch (error) {
        console.error('❌ Error during real guild confession fix:', error);
        console.error('Error stack:', error.stack);
    } finally {
        await db.disconnect();
    }
}

// Run fix
fixRealGuildConfessions().then(() => {
    console.log('\n🎉 Fix completed successfully!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Fix failed:', error);
    process.exit(1);
}); 