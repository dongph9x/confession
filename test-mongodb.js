// Test script cho MongoDB
const db = require('./src/data/mongodb');

async function testMongoDB() {
    console.log('🧪 Testing MongoDB...\n');

    // Test 1: Kết nối MongoDB
    console.log('1. Testing MongoDB connection...');
    try {
        await db.connect();
        console.log('✅ MongoDB connected successfully\n');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        return;
    }

    // Test 2: Test Guild Settings
    console.log('2. Testing Guild Settings...');
    const testGuildId = '123456789';
    
    // Test set confession channel
    await db.setConfessionChannel(testGuildId, 'confession-channel-id');
    console.log('✅ Set confession channel');

    // Test set review channel
    await db.setReviewChannel(testGuildId, 'review-channel-id');
    console.log('✅ Set review channel');

    // Test set anonymous mode
    await db.setAnonymousMode(testGuildId, true);
    console.log('✅ Set anonymous mode');

    // Test get guild settings
    const guildSettings = await db.getGuildSettings(testGuildId);
    console.log('✅ Guild settings:', {
        guildId: guildSettings.guildId,
        confessionChannel: guildSettings.confessionChannel,
        reviewChannel: guildSettings.reviewChannel,
        anonymousMode: guildSettings.anonymousMode,
        confessionCounter: guildSettings.confessionCounter
    });

    // Test 3: Test Confession
    console.log('\n3. Testing Confession...');
    const testUserId = 'user123';
    
    // Test confession bình thường
    const normalConfessionId = await db.addConfession(testGuildId, testUserId, 'Test confession normal', false);
    console.log(`✅ Added normal confession with ID: ${normalConfessionId}`);

    // Test confession ẩn danh
    const anonymousConfessionId = await db.addConfession(testGuildId, testUserId, 'Test confession anonymous', true);
    console.log(`✅ Added anonymous confession with ID: ${anonymousConfessionId}`);

    // Test 4: Test lấy confession
    console.log('\n4. Testing confession retrieval...');
    
    const normalConfession = await db.getConfession(normalConfessionId);
    console.log('✅ Normal confession:', {
        id: normalConfession._id,
        content: normalConfession.content,
        isAnonymous: normalConfession.isAnonymous,
        status: normalConfession.status
    });

    const anonymousConfession = await db.getConfession(anonymousConfessionId);
    console.log('✅ Anonymous confession:', {
        id: anonymousConfession._id,
        content: anonymousConfession.content,
        isAnonymous: anonymousConfession.isAnonymous,
        status: anonymousConfession.status
    });

    // Test 5: Test update confession status
    console.log('\n5. Testing update confession status...');
    await db.updateConfessionStatus(normalConfessionId, 'approved', 'moderator123', 'message123', 'thread123');
    await db.updateConfessionStatus(anonymousConfessionId, 'approved', 'moderator123', 'message456', 'thread456');
    
    const updatedNormalConfession = await db.getConfession(normalConfessionId);
    const updatedAnonymousConfession = await db.getConfession(anonymousConfessionId);
    
    console.log('✅ Updated normal confession:', {
        status: updatedNormalConfession.status,
        confessionNumber: updatedNormalConfession.confessionNumber,
        isAnonymous: updatedNormalConfession.isAnonymous
    });
    
    console.log('✅ Updated anonymous confession:', {
        status: updatedAnonymousConfession.status,
        confessionNumber: updatedAnonymousConfession.confessionNumber,
        isAnonymous: updatedAnonymousConfession.isAnonymous
    });

    // Test 6: Test statistics
    console.log('\n6. Testing statistics...');
    const stats = await db.getConfessionStats(testGuildId);
    console.log('✅ Confession stats:', stats);

    // Test 7: Test pending confessions
    console.log('\n7. Testing pending confessions...');
    const pendingConfessions = await db.getPendingConfessions(testGuildId);
    console.log(`✅ Found ${pendingConfessions.length} pending confessions`);

    console.log('\n🎉 All MongoDB tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('✅ MongoDB connection');
    console.log('✅ Guild settings operations');
    console.log('✅ Confession creation');
    console.log('✅ Confession retrieval');
    console.log('✅ Confession status update');
    console.log('✅ Statistics generation');
    console.log('✅ Pending confessions');

    // Cleanup
    console.log('\n🧹 Cleaning up...');
    await db.disconnect();
    console.log('✅ MongoDB disconnected');
    console.log('✅ Test completed!');
}

// Run the test
testMongoDB().catch(console.error); 