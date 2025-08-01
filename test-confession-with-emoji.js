const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const db = require('./src/data/mongodb');
const { createEmojiButtons } = require('./src/utils/emojiButtons');
require('dotenv').config();

async function testConfessionWithEmoji() {
    console.log('🧪 Testing confession approval with emoji buttons...\n');

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

        await db.connect();
        console.log('✅ Connected to MongoDB');

        // Test 1: Create emoji buttons
        console.log('\n🔧 Test 1: Create Emoji Buttons');
        const emojiButtons = createEmojiButtons();
        console.log('Emoji buttons created:', emojiButtons.length, 'rows');
        emojiButtons.forEach((row, index) => {
            console.log(`Row ${index + 1}:`, row.components.length, 'buttons');
        });

        // Test 2: Create emoji buttons with counts
        console.log('\n📊 Test 2: Create Emoji Buttons with Counts');
        const buttonsWithCounts = createEmojiButtons({
            heart: 5,
            laugh: 3,
            wow: 1,
            fire: 2,
            clap: 4,
            pray: 1,
            love: 2
        });
        console.log('Buttons with counts created:', buttonsWithCounts.length, 'rows');

        // Test 3: Create confession embed
        console.log('\n📝 Test 3: Create Confession Embed');
        const confessionEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle("💝 Confession #123")
            .setDescription("This is a test confession for emoji buttons!")
            .addFields(
                { 
                    name: "👤 Người gửi", 
                    value: "🕵️ Ẩn danh", 
                    inline: true 
                },
                { 
                    name: "⏰ Thời gian", 
                    value: "<t:1704067200:R>", 
                    inline: true 
                }
            )
            .setFooter({
                text: "Confession Bot • Test Server",
                iconURL: "https://cdn.discordapp.com/embed/avatars/0.png"
            })
            .setTimestamp();

        console.log('Confession embed created successfully');

        // Test 4: Simulate message structure
        console.log('\n📋 Test 4: Message Structure');
        const messageStructure = {
            embeds: [confessionEmbed],
            components: emojiButtons
        };
        console.log('Message structure:', {
            embedCount: messageStructure.embeds.length,
            componentRows: messageStructure.components.length,
            totalButtons: messageStructure.components.reduce((sum, row) => sum + row.components.length, 0)
        });

        // Test 5: Button layout
        console.log('\n🎨 Test 5: Button Layout');
        emojiButtons.forEach((row, rowIndex) => {
            console.log(`Row ${rowIndex + 1}:`);
            row.components.forEach((button, buttonIndex) => {
                console.log(`  Button ${buttonIndex + 1}: ${button.data.label} (${button.data.custom_id})`);
            });
        });

        console.log('\n✅ All confession with emoji tests completed successfully!');
        console.log('🎉 Emoji buttons are ready for confession posts!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await db.disconnect();
        await client.destroy();
        console.log('\n✅ Cleanup completed');
    }
}

// Run the test
testConfessionWithEmoji(); 