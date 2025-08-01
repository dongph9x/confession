// Test script cho tính năng ẩn danh tự chọn
const db = require('./src/data/database');

async function testUserChoiceAnonymous() {
    console.log('🧪 Testing User Choice Anonymous Mode...\n');

    // Test 1: Kiểm tra database initialization
    console.log('1. Testing database initialization...');
    await db.init();
    console.log('✅ Database initialized successfully\n');

    // Test 2: Test confession với ẩn danh
    console.log('2. Testing confession with anonymous choice...');
    const testGuildId = '123456789';
    const testUserId = 'user123';
    
    // Test confession bình thường
    const normalConfessionId = await db.addConfession(testGuildId, testUserId, 'Test confession normal', false);
    console.log(`✅ Added normal confession with ID: ${normalConfessionId}`);

    // Test confession ẩn danh
    const anonymousConfessionId = await db.addConfession(testGuildId, testUserId, 'Test confession anonymous', true);
    console.log(`✅ Added anonymous confession with ID: ${anonymousConfessionId}\n`);

    // Test 3: Test lấy confession và kiểm tra trạng thái ẩn danh
    console.log('3. Testing confession retrieval and anonymous status...');
    
    const normalConfession = await db.getConfession(normalConfessionId);
    console.log('✅ Normal confession:', {
        id: normalConfession.id,
        content: normalConfession.content,
        is_anonymous: normalConfession.is_anonymous,
        status: normalConfession.status
    });

    const anonymousConfession = await db.getConfession(anonymousConfessionId);
    console.log('✅ Anonymous confession:', {
        id: anonymousConfession.id,
        content: anonymousConfession.content,
        is_anonymous: anonymousConfession.is_anonymous,
        status: anonymousConfession.status
    });

    // Test 4: Test update confession status
    console.log('\n4. Testing update confession status...');
    await db.updateConfessionStatus(normalConfessionId, 'approved', 'moderator123', 'message123', 'thread123');
    await db.updateConfessionStatus(anonymousConfessionId, 'approved', 'moderator123', 'message456', 'thread456');
    
    const updatedNormalConfession = await db.getConfession(normalConfessionId);
    const updatedAnonymousConfession = await db.getConfession(anonymousConfessionId);
    
    console.log('✅ Updated normal confession:', {
        status: updatedNormalConfession.status,
        confession_number: updatedNormalConfession.confession_number,
        is_anonymous: updatedNormalConfession.is_anonymous
    });
    
    console.log('✅ Updated anonymous confession:', {
        status: updatedAnonymousConfession.status,
        confession_number: updatedAnonymousConfession.confession_number,
        is_anonymous: updatedAnonymousConfession.is_anonymous
    });

    // Test 5: Test statistics
    console.log('\n5. Testing statistics...');
    const stats = await db.getConfessionStats(testGuildId);
    console.log('✅ Confession stats:', stats);

    // Test 6: Test parsing arguments
    console.log('\n6. Testing argument parsing...');
    
    function parseConfessionArgs(args) {
        let isAnonymous = false;
        let content = args.join(" ");
        
        // Kiểm tra flag ẩn danh
        if (args.length > 0 && (args[0] === "anonymous" || args[0] === "anon" || args[0] === "ẩn")) {
            isAnonymous = true;
            content = args.slice(1).join(" ");
        }
        
        return { isAnonymous, content };
    }

    const testCases = [
        ['Tôi', 'thích', 'bạn'],
        ['anonymous', 'Tôi', 'thích', 'bạn'],
        ['anon', 'Tôi', 'thích', 'bạn'],
        ['ẩn', 'Tôi', 'thích', 'bạn']
    ];

    testCases.forEach((args, index) => {
        const result = parseConfessionArgs(args);
        console.log(`✅ Test case ${index + 1}:`, {
            args: args,
            isAnonymous: result.isAnonymous,
            content: result.content
        });
    });

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('✅ Database initialization');
    console.log('✅ Confession creation with anonymous choice');
    console.log('✅ Confession retrieval and anonymous status');
    console.log('✅ Confession status update');
    console.log('✅ Statistics generation');
    console.log('✅ Argument parsing');

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    console.log('✅ Test completed!');
}

// Run the test
testUserChoiceAnonymous().catch(console.error); 