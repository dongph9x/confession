require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

async function checkBotGuild() {
    console.log('🔍 Checking Bot Guild Configuration');
    console.log('===================================');
    console.log('');
    
    try {
        // Create client
        const client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        });
        
        console.log('🔗 Connecting to Discord...');
        
        client.once('ready', async () => {
            console.log(`✅ Bot logged in as ${client.user.tag}`);
            console.log(`📝 Bot ID: ${client.user.id}`);
            console.log('');
            
            // Check guilds
            console.log('📋 Bot Guilds:');
            client.guilds.cache.forEach((guild, guildId) => {
                console.log(`   Guild ID: ${guildId}`);
                console.log(`   Guild Name: ${guild.name}`);
                console.log(`   Member Count: ${guild.memberCount}`);
                console.log('');
            });
            
            // Check environment variables
            console.log('📋 Environment Variables:');
            console.log(`   GUILD_ID: ${process.env.GUILD_ID || 'Not set'}`);
            console.log(`   TEST_GUILD_ID: ${process.env.TEST_GUILD_ID || 'Not set'}`);
            console.log('');
            
            // Check if bot is in the correct guild
            const targetGuildId = process.env.GUILD_ID || '1005280612845891615';
            const targetGuild = client.guilds.cache.get(targetGuildId);
            
            if (targetGuild) {
                console.log(`✅ Bot is in target guild: ${targetGuild.name}`);
                console.log(`   Guild ID: ${targetGuild.id}`);
                console.log(`   Member Count: ${targetGuild.memberCount}`);
                
                // Check bot permissions
                const botMember = targetGuild.members.cache.get(client.user.id);
                if (botMember) {
                    console.log(`   Bot Permissions: ${botMember.permissions.toArray().join(', ')}`);
                }
                
            } else {
                console.log(`❌ Bot is NOT in target guild: ${targetGuildId}`);
                console.log('   Available guilds:');
                client.guilds.cache.forEach((guild, guildId) => {
                    console.log(`     - ${guild.name} (${guildId})`);
                });
            }
            
            console.log('');
            console.log('📊 Summary:');
            console.log(`   ✅ Bot Status: Online`);
            console.log(`   ✅ Guilds: ${client.guilds.cache.size}`);
            console.log(`   ✅ Target Guild: ${targetGuild ? 'Found' : 'Not Found'}`);
            
            // Disconnect
            client.destroy();
            process.exit(0);
        });
        
        client.on('error', (error) => {
            console.error('❌ Discord client error:', error);
            process.exit(1);
        });
        
        // Login
        await client.login(process.env.BOT_TOKEN);
        
    } catch (error) {
        console.error('❌ Error checking bot guild:', error);
        process.exit(1);
    }
}

// Run check
checkBotGuild().catch(error => {
    console.error('💥 Bot guild check failed:', error);
    process.exit(1);
}); 