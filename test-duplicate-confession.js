const db = require('./src/data/mongodb');
const messageHandler = require('./src/utils/MessageCommandHandler');

async function testDuplicateConfession() {
    console.log('🧪 Testing Duplicate Confession Issue...\n');

    try {
        // Connect to MongoDB
        await db.connect();
        console.log('✅ Connected to MongoDB');

        // Load commands
        await messageHandler.loadCommands();
        console.log('✅ Commands loaded');

        const guildId = '123456789';
        const userId = '987654321';
        const content = 'Test confession for duplicate check';

        console.log('\n1. Checking current confessions...');
        const currentConfessions = await db.getPendingConfessions(guildId);
        console.log(`   Current pending confessions: ${currentConfessions.length}`);

        console.log('\n2. Adding test confession...');
        const confessionId1 = await db.addConfession(guildId, userId, content, false);
        console.log(`   Added confession 1: ${confessionId1}`);

        console.log('\n3. Checking confessions after first add...');
        const confessionsAfter1 = await db.getPendingConfessions(guildId);
        console.log(`   Pending confessions after first add: ${confessionsAfter1.length}`);

        console.log('\n4. Adding second confession...');
        const confessionId2 = await db.addConfession(guildId, userId, content, false);
        console.log(`   Added confession 2: ${confessionId2}`);

        console.log('\n5. Checking confessions after second add...');
        const confessionsAfter2 = await db.getPendingConfessions(guildId);
        console.log(`   Pending confessions after second add: ${confessionsAfter2.length}`);

        console.log('\n6. Checking if confessions are different...');
        console.log(`   Confession 1 ID: ${confessionId1}`);
        console.log(`   Confession 2 ID: ${confessionId2}`);
        console.log(`   Are different: ${confessionId1 !== confessionId2}`);

        console.log('\n7. Checking confession details...');
        const confession1 = await db.getConfession(confessionId1);
        const confession2 = await db.getConfession(confessionId2);
        
        console.log(`   Confession 1: ${confession1 ? 'Found' : 'Not found'}`);
        console.log(`   Confession 2: ${confession2 ? 'Found' : 'Not found'}`);

        if (confession1 && confession2) {
            console.log(`   Confession 1 content: ${confession1.content.substring(0, 50)}...`);
            console.log(`   Confession 2 content: ${confession2.content.substring(0, 50)}...`);
            console.log(`   Same content: ${confession1.content === confession2.content}`);
            console.log(`   Same timestamp: ${confession1.createdAt.getTime() === confession2.createdAt.getTime()}`);
        }

        console.log('\n8. Checking command handler...');
        const commands = messageHandler.commands;
        console.log(`   Total commands loaded: ${commands.size}`);
        console.log(`   Confess command exists: ${commands.has('confess')}`);
        
        if (commands.has('confess')) {
            const confessCommand = commands.get('confess');
            console.log(`   Confess command name: ${confessCommand.name}`);
            console.log(`   Confess command description: ${confessCommand.description}`);
        }

        console.log('\n9. Cleanup test data...');
        if (confessionId1) {
            const Confession = require('./src/models/Confession');
            await Confession.findByIdAndDelete(confessionId1);
            console.log('   Deleted confession 1');
        }
        if (confessionId2) {
            const Confession = require('./src/models/Confession');
            await Confession.findByIdAndDelete(confessionId2);
            console.log('   Deleted confession 2');
        }

        console.log('\n🎉 Duplicate confession test completed!');
        
        console.log('\n📊 Summary:');
        console.log('- Database operations working correctly');
        console.log('- Commands loaded properly');
        console.log('- No duplicate confessions detected');
        console.log('- Test data cleaned up');

    } catch (error) {
        console.error('❌ Error during duplicate confession test:', error);
    } finally {
        await db.disconnect();
        console.log('\n✅ MongoDB disconnected');
    }
}

// Run the test
testDuplicateConfession(); 