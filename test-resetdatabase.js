const db = require('./src/data/mongodb.js');

async function testResetDatabase() {
    try {
        console.log('🔍 Test Reset Database Command...');
        
        // Kết nối database
        console.log('🔗 Kết nối database...');
        await db.connect();
        
        const guildId = '1005280612845891615';
        
        console.log(`\n📊 1. Kiểm tra dữ liệu hiện tại:`);
        
        // Kiểm tra số lượng bản ghi trong mỗi bảng
        const Confession = require('./src/models/Confession');
        const Comment = require('./src/models/Comment');
        const EmojiReaction = require('./src/models/EmojiReaction');
        const GuildSettings = require('./src/models/GuildSettings');
        const MusicSettings = require('./src/models/MusicSettings');
        
        const confessionCount = await Confession.countDocuments({});
        const commentCount = await Comment.countDocuments({});
        const emojiReactionCount = await EmojiReaction.countDocuments({});
        const guildSettingsCount = await GuildSettings.countDocuments({});
        const musicSettingsCount = await MusicSettings.countDocuments({});
        
        console.log(`   📊 Confessions: ${confessionCount} bản ghi`);
        console.log(`   💬 Comments: ${commentCount} bản ghi`);
        console.log(`   😀 Emoji Reactions: ${emojiReactionCount} bản ghi`);
        console.log(`   ⚙️ Guild Settings: ${guildSettingsCount} bản ghi`);
        console.log(`   🎵 Music Settings: ${musicSettingsCount} bản ghi`);
        
        // Test xóa bảng cụ thể
        console.log(`\n🔧 2. Test xóa bảng Confessions:`);
        try {
            const result = await Confession.deleteMany({});
            console.log(`   ✅ Đã xóa ${result.deletedCount} confessions`);
        } catch (error) {
            console.log(`   ❌ Lỗi xóa confessions: ${error.message}`);
        }
        
        // Test xóa tất cả bảng
        console.log(`\n🔧 3. Test xóa tất cả bảng:`);
        try {
            const results = await Promise.all([
                Confession.deleteMany({}),
                Comment.deleteMany({}),
                EmojiReaction.deleteMany({}),
                GuildSettings.deleteMany({}),
                MusicSettings.deleteMany({})
            ]);
            
            const totalDeleted = results.reduce((sum, result) => sum + result.deletedCount, 0);
            console.log(`   ✅ Đã xóa ${totalDeleted} bản ghi từ tất cả bảng:`);
            console.log(`      • Confessions: ${results[0].deletedCount} bản ghi`);
            console.log(`      • Comments: ${results[1].deletedCount} bản ghi`);
            console.log(`      • Emoji Reactions: ${results[2].deletedCount} bản ghi`);
            console.log(`      • Guild Settings: ${results[3].deletedCount} bản ghi`);
            console.log(`      • Music Settings: ${results[4].deletedCount} bản ghi`);
            
        } catch (error) {
            console.log(`   ❌ Lỗi xóa tất cả bảng: ${error.message}`);
        }
        
        // Kiểm tra sau khi xóa
        console.log(`\n📊 4. Kiểm tra sau khi xóa:`);
        const confessionCountAfter = await Confession.countDocuments({});
        const commentCountAfter = await Comment.countDocuments({});
        const emojiReactionCountAfter = await EmojiReaction.countDocuments({});
        const guildSettingsCountAfter = await GuildSettings.countDocuments({});
        const musicSettingsCountAfter = await MusicSettings.countDocuments({});
        
        console.log(`   📊 Confessions: ${confessionCountAfter} bản ghi`);
        console.log(`   💬 Comments: ${commentCountAfter} bản ghi`);
        console.log(`   😀 Emoji Reactions: ${emojiReactionCountAfter} bản ghi`);
        console.log(`   ⚙️ Guild Settings: ${guildSettingsCountAfter} bản ghi`);
        console.log(`   🎵 Music Settings: ${musicSettingsCountAfter} bản ghi`);
        
        // Tạo lại một số dữ liệu test
        console.log(`\n📝 5. Tạo lại dữ liệu test:`);
        try {
            // Tạo guild settings
            const guildSettings = new GuildSettings({
                guildId: guildId,
                confessionCounter: 0,
                confessionChannel: '1400498426072010924',
                reviewChannel: '1400516396852580464',
                prefix: '!'
            });
            await guildSettings.save();
            console.log(`   ✅ Đã tạo guild settings`);
            
            // Tạo một confession test
            const confession = new Confession({
                guildId: guildId,
                userId: 'test_user',
                content: 'Confession test sau khi reset database',
                isAnonymous: false,
                confessionNumber: 0,
                status: 'pending'
            });
            await confession.save();
            console.log(`   ✅ Đã tạo confession test`);
            
        } catch (error) {
            console.log(`   ❌ Lỗi tạo dữ liệu test: ${error.message}`);
        }
        
        console.log('\n✅ Test hoàn thành!');
        
    } catch (error) {
        console.error('❌ Error trong test:', error);
    } finally {
        await db.disconnect();
    }
}

// Chạy test
testResetDatabase().then(() => {
    console.log('🎯 Test script completed');
    process.exit(0);
}).catch(error => {
    console.error('💥 Test script failed:', error);
    process.exit(1);
}); 