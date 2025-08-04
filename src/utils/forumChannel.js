const { ChannelType } = require('discord.js');

/**
 * Tạo forum channel cho confessions
 * @param {Guild} guild - Discord guild
 * @param {string} channelName - Tên channel
 * @returns {Promise<ForumChannel>}
 */
async function createConfessionForum(guild, channelName = 'confessions') {
    try {
        // Kiểm tra xem đã có forum channel chưa
        const existingForum = guild.channels.cache.find(
            channel => channel.type === ChannelType.GuildForum && channel.name === channelName
        );

        if (existingForum) {
            console.log(`📝 [FORUM] Forum channel "${channelName}" đã tồn tại`);
            return existingForum;
        }

        // Tạo forum channel mới
        const forumChannel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildForum,
            topic: 'Nơi đăng confessions và thảo luận',
            availableTags: [
                {
                    name: 'Confession',
                    emoji: '📝',
                    moderated: false
                },
                {
                    name: 'Hot',
                    emoji: '🔥',
                    moderated: false
                },
                {
                    name: 'Discussion',
                    emoji: '💬',
                    moderated: false
                },
                {
                    name: 'Approved',
                    emoji: '✅',
                    moderated: true
                },
                {
                    name: 'AI Approved',
                    emoji: '🤖',
                    moderated: true
                }
            ],
            defaultReactionEmoji: '👍',
            defaultAutoArchiveDuration: 1440 // 24 giờ
        });

        console.log(`✅ [FORUM] Đã tạo forum channel "${channelName}"`);
        return forumChannel;
    } catch (error) {
        console.error('❌ [FORUM] Lỗi khi tạo forum channel:', error);
        throw error;
    }
}

/**
 * Tạo thread trong forum cho confession
 * @param {ForumChannel} forumChannel - Forum channel
 * @param {Object} confessionData - Dữ liệu confession
 * @returns {Promise<ThreadChannel>}
 */
async function createConfessionThread(forumChannel, confessionData) {
    try {
        const {
            confessionNumber,
            content,
            guildName,
            isAnonymous = true,
            userId = null,
            aiAnalysis = null
        } = confessionData;

        const timeString = `<t:${Math.floor(Date.now() / 1000)}:R>`;
        
        // Logic hiển thị tên người gửi
        let authorString;
        if (isAnonymous) {
            authorString = "🕵️ Ẩn danh";
        } else if (userId) {
            authorString = `<@${userId}>`;
        } else {
            authorString = "👤 Không xác định";
        }

        // Tạo nội dung thread
        let threadContent = `📢 **Confession #${confessionNumber}**\n\n${content}\n\n👤 **Người gửi:** ${authorString}\n⏰ **Thời gian:** ${timeString}\n\n*Confession Bot • ${guildName}*`;

        // Thêm thông tin AI nếu có
        if (aiAnalysis) {
            threadContent += `\n\n🤖 **AI Analysis:**\n📊 **Score:** ${aiAnalysis.score}/10\n🛡️ **Safety Level:** ${aiAnalysis.safety_level}\n📝 **Content Type:** ${aiAnalysis.content_type}`;
        }

        // Xác định tags
        const appliedTags = [];
        const confessionTag = forumChannel.availableTags.find(tag => tag.name === 'Confession');
        if (confessionTag) {
            appliedTags.push(confessionTag.id);
        }

        // Thêm tag AI Approved nếu có AI analysis
        if (aiAnalysis) {
            const aiApprovedTag = forumChannel.availableTags.find(tag => tag.name === 'AI Approved');
            if (aiApprovedTag) {
                appliedTags.push(aiApprovedTag.id);
            }
        }

        // Tạo thread
        const thread = await forumChannel.threads.create({
            name: `📝 Confession #${confessionNumber}`,
            message: {
                content: threadContent
            },
            appliedTags: appliedTags,
            autoArchiveDuration: 1440 // 24 giờ
        });

        console.log(`✅ [FORUM] Đã tạo thread "Confession #${confessionNumber}" trong forum`);
        return thread;
    } catch (error) {
        console.error('❌ [FORUM] Lỗi khi tạo thread:', error);
        throw error;
    }
}

/**
 * Kiểm tra xem channel có phải là forum không
 * @param {Channel} channel - Discord channel
 * @returns {boolean}
 */
function isForumChannel(channel) {
    return channel && channel.type === ChannelType.GuildForum;
}

/**
 * Lấy forum channel từ guild settings
 * @param {Guild} guild - Discord guild
 * @param {string} channelId - Channel ID từ settings
 * @returns {ForumChannel|null}
 */
function getForumChannel(guild, channelId) {
    if (!channelId) return null;
    
    const channel = guild.channels.cache.get(channelId);
    return isForumChannel(channel) ? channel : null;
}

module.exports = {
    createConfessionForum,
    createConfessionThread,
    isForumChannel,
    getForumChannel
}; 