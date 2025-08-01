const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
require('dotenv').config();

async function checkBotPermissions() {
    console.log('🔍 Checking Bot Permissions...\n');

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.MessageContent
        ]
    });

    try {
        await client.login(process.env.BOT_TOKEN);
        console.log('✅ Bot logged in successfully');

        // Kiểm tra từng server
        client.guilds.cache.forEach(guild => {
            console.log(`\n🏠 Server: ${guild.name} (${guild.id})`);
            
            const botMember = guild.members.cache.get(client.user.id);
            if (!botMember) {
                console.log('❌ Bot not found in server');
                return;
            }

            const permissions = botMember.permissions;
            
            console.log('📋 Required Permissions:');
            console.log(`   ✅ Manage Messages: ${permissions.has('ManageMessages') ? 'YES' : 'NO'}`);
            console.log(`   ✅ Send Messages: ${permissions.has('SendMessages') ? 'YES' : 'NO'}`);
            console.log(`   ✅ Read Message History: ${permissions.has('ReadMessageHistory') ? 'YES' : 'NO'}`);
            console.log(`   ✅ Add Reactions: ${permissions.has('AddReactions') ? 'YES' : 'NO'}`);
            console.log(`   ✅ Manage Reactions: ${permissions.has('ManageMessages') ? 'YES' : 'NO'}`);

            // Kiểm tra confession channel
            const confessionChannel = guild.channels.cache.find(ch => 
                ch.name.toLowerCase().includes('confession')
            );
            
            if (confessionChannel) {
                console.log(`\n📢 Confession Channel: #${confessionChannel.name}`);
                const channelPerms = botMember.permissionsIn(confessionChannel);
                console.log(`   ✅ Send Messages: ${channelPerms.has('SendMessages') ? 'YES' : 'NO'}`);
                console.log(`   ✅ Manage Messages: ${channelPerms.has('ManageMessages') ? 'YES' : 'NO'}`);
                console.log(`   ✅ Read Message History: ${channelPerms.has('ReadMessageHistory') ? 'YES' : 'NO'}`);
            } else {
                console.log('❌ No confession channel found');
            }

            // Kiểm tra review channel
            const reviewChannel = guild.channels.cache.find(ch => 
                ch.name.toLowerCase().includes('review')
            );
            
            if (reviewChannel) {
                console.log(`\n👨‍⚖️ Review Channel: #${reviewChannel.name}`);
                const channelPerms = botMember.permissionsIn(reviewChannel);
                console.log(`   ✅ Send Messages: ${channelPerms.has('SendMessages') ? 'YES' : 'NO'}`);
                console.log(`   ✅ Manage Messages: ${channelPerms.has('ManageMessages') ? 'YES' : 'NO'}`);
                console.log(`   ✅ Read Message History: ${channelPerms.has('ReadMessageHistory') ? 'YES' : 'NO'}`);
            } else {
                console.log('❌ No review channel found');
            }
        });

        console.log('\n🎯 Summary:');
        console.log('- Bot needs "Manage Messages" permission to remove Discord reactions');
        console.log('- Bot needs "Send Messages" permission to send notifications');
        console.log('- Bot needs "Read Message History" to access message content');
        console.log('- Bot needs "Add Reactions" to add reactions (if needed)');

    } catch (error) {
        console.error('❌ Error checking permissions:', error);
    } finally {
        client.destroy();
    }
}

checkBotPermissions(); 