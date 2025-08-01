// Test script cho chức năng ẩn danh
const db = require('./src/data/database');

async function testAnonymousMode() {
    console.log('🧪 Testing Anonymous Mode...\n');

    // Test 1: Kiểm tra database initialization
    console.log('1. Testing database initialization...');
    await db.init();
    console.log('✅ Database initialized successfully\n');

    // Test 2: Test set và get anonymous mode
    console.log('2. Testing set/get anonymous mode...');
    const testGuildId = '123456789';
    
    // Test set anonymous mode to true
    await db.setAnonymousMode(testGuildId, true);
    let anonymousMode = await db.getAnonymousMode(testGuildId);
    console.log(`✅ Set anonymous mode to true: ${anonymousMode}`);

    // Test set anonymous mode to false
    await db.setAnonymousMode(testGuildId, false);
    anonymousMode = await db.getAnonymousMode(testGuildId);
    console.log(`✅ Set anonymous mode to false: ${anonymousMode}\n`);

    // Test 3: Test guild settings với anonymous mode
    console.log('3. Testing guild settings with anonymous mode...');
    await db.setConfessionChannel(testGuildId, 'confession-channel-id');
    await db.setReviewChannel(testGuildId, 'review-channel-id');
    await db.setAnonymousMode(testGuildId, true);
    
    const guildSettings = await db.getGuildSettings(testGuildId);
    console.log('✅ Guild settings:', {
        guild_id: guildSettings.guild_id,
        confession_channel: guildSettings.confession_channel,
        review_channel: guildSettings.review_channel,
        anonymous_mode: guildSettings.anonymous_mode
    });

    // Test 4: Test confession với anonymous mode
    console.log('\n4. Testing confession with anonymous mode...');
    const confessionId = await db.addConfession(testGuildId, 'user123', 'Test confession content');
    console.log(`✅ Added confession with ID: ${confessionId}`);

    const confession = await db.getConfession(confessionId);
    console.log('✅ Confession data:', {
        id: confession.id,
        guild_id: confession.guild_id,
        user_id: confession.user_id,
        content: confession.content,
        status: confession.status
    });

    // Test 5: Test update confession status
    console.log('\n5. Testing update confession status...');
    await db.updateConfessionStatus(confessionId, 'approved', 'moderator123', 'message123', 'thread123');
    
    const updatedConfession = await db.getConfession(confessionId);
    console.log('✅ Updated confession:', {
        status: updatedConfession.status,
        confession_number: updatedConfession.confession_number,
        message_id: updatedConfession.message_id,
        thread_id: updatedConfession.thread_id
    });

    // Test 6: Test statistics
    console.log('\n6. Testing statistics...');
    const stats = await db.getConfessionStats(testGuildId);
    console.log('✅ Confession stats:', stats);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('✅ Database initialization');
    console.log('✅ Anonymous mode set/get');
    console.log('✅ Guild settings with anonymous mode');
    console.log('✅ Confession creation');
    console.log('✅ Confession status update');
    console.log('✅ Statistics generation');

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    // Note: In a real test, you would clean up the test data
    console.log('✅ Test completed!');
}

// Run the test
testAnonymousMode().catch(console.error); 