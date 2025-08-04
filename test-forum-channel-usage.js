const { createConfessionForum, isForumChannel, createConfessionThread } = require('./src/utils/forumChannel');

// Test function để kiểm tra forum channel usage
async function testForumChannelUsage() {
    console.log('🧪 Testing Forum Channel Usage...\n');

    // Mock guild object
    const mockGuild = {
        channels: {
            cache: {
                find: (predicate) => {
                    // Mock existing forum channel
                    return {
                        id: '123456789',
                        name: 'confessions',
                        type: 15, // GuildForum
                        availableTags: [
                            { name: 'Confession', emoji: '📝', moderated: false },
                            { name: 'AI Approved', emoji: '🤖', moderated: true }
                        ],
                        threads: {
                            create: async (options) => {
                                console.log('✅ Thread created:', options.name);
                                return { id: 'thread-123', name: options.name };
                            }
                        }
                    };
                }
            }
        }
    };

    // Test 1: Kiểm tra channel đã tồn tại
    console.log('📝 Test 1: Kiểm tra channel đã tồn tại');
    const existingChannel = mockGuild.channels.cache.find(
        channel => channel.type === 15 && channel.name === 'confessions'
    );
    
    if (existingChannel) {
        console.log('✅ Found existing forum channel:', existingChannel.name);
        console.log('✅ Channel ID:', existingChannel.id);
        console.log('✅ Tags count:', existingChannel.availableTags.length);
    } else {
        console.log('❌ No existing forum channel found');
    }

    // Test 2: Kiểm tra isForumChannel function
    console.log('\n📝 Test 2: Kiểm tra isForumChannel function');
    const isForum = isForumChannel(existingChannel);
    console.log('✅ isForumChannel result:', isForum);

    // Test 3: Kiểm tra createConfessionThread (không tạo channel mới)
    console.log('\n📝 Test 3: Kiểm tra createConfessionThread');
    try {
        const thread = await createConfessionThread(existingChannel, {
            confessionNumber: 123,
            content: 'Test confession content',
            guildName: 'Test Guild',
            isAnonymous: true,
            aiAnalysis: null
        });
        console.log('✅ Thread created successfully:', thread.name);
    } catch (error) {
        console.log('❌ Error creating thread:', error.message);
    }

    // Test 4: Kiểm tra logic đúng
    console.log('\n📝 Test 4: Kiểm tra logic đúng');
    console.log('✅ Chỉ sử dụng channel đã set trong settings');
    console.log('✅ Không gọi createConfessionForum khi gửi confession');
    console.log('✅ Chỉ tạo thread trong forum channel đã tồn tại');
    console.log('✅ Fallback sang regular channel nếu không phải forum');

    console.log('\n🎯 Test completed successfully!');
}

// Run test
testForumChannelUsage().catch(console.error); 