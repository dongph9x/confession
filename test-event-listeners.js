const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

async function testEventListeners() {
    console.log('🧪 Testing event listeners...\n');

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ]
    });

    try {
        await client.login(process.env.BOT_TOKEN);
        console.log('✅ Bot logged in successfully');

        // Check messageCreate listeners
        console.log('\n📊 Event Listeners Count:');
        console.log('messageCreate listeners:', client.listenerCount('messageCreate'));
        console.log('interactionCreate listeners:', client.listenerCount('interactionCreate'));
        console.log('buttonInteractionCreate listeners:', client.listenerCount('buttonInteractionCreate'));
        console.log('selectMenuInteractionCreate listeners:', client.listenerCount('selectMenuInteractionCreate'));

        // Get all event names
        console.log('\n📋 All Registered Events:');
        const eventNames = client.eventNames();
        eventNames.forEach(eventName => {
            const count = client.listenerCount(eventName);
            console.log(`  ${eventName}: ${count} listeners`);
        });

        // Check if there are multiple messageCreate handlers
        console.log('\n🔍 MessageCreate Event Details:');
        const messageCreateListeners = client.listeners('messageCreate');
        console.log('Number of messageCreate listeners:', messageCreateListeners.length);
        
        messageCreateListeners.forEach((listener, index) => {
            console.log(`  Listener ${index + 1}:`, listener.name || 'Anonymous function');
        });

        console.log('\n✅ Event listeners test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await client.destroy();
        console.log('\n✅ Cleanup completed');
    }
}

// Run the test
testEventListeners(); 