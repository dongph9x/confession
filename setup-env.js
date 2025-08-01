#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Environment Variables...\n');

// Check if .env already exists
if (fs.existsSync('.env')) {
    console.log('⚠️  File .env already exists!');
    console.log('📝 Current .env content:');
    console.log('---');
    console.log(fs.readFileSync('.env', 'utf8'));
    console.log('---');
    
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    rl.question('\nDo you want to overwrite it? (y/N): ', (answer) => {
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
            createEnvFile();
        } else {
            console.log('❌ Setup cancelled.');
        }
        rl.close();
    });
} else {
    createEnvFile();
}

function createEnvFile() {
    const envContent = `# Discord Bot Configuration
BOT_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_client_id_here

# MongoDB Configuration
MONGO_USERNAME=admin
MONGO_PASSWORD=password123
MONGO_DATABASE=confession_bot
MONGO_PORT=27017
MONGODB_URI=mongodb://admin:password123@localhost:27017/confession_bot?authSource=admin

# Lavalink Music Server (Optional)
LAVALINK_URL=localhost:2333
LAVALINK_AUTH=youshallnotpass
LAVALINK_PORT=2333

# Environment
NODE_ENV=production
`;

    fs.writeFileSync('.env', envContent);
    console.log('✅ Created .env file successfully!');
    console.log('\n📝 Please edit the .env file with your actual values:');
    console.log('- BOT_TOKEN: Your Discord bot token');
    console.log('- CLIENT_ID: Your Discord application client ID');
    console.log('- MONGODB_URI: Your MongoDB connection string (optional for Docker)');
    console.log('\n🚀 After editing, run: node validate-env.js');
} 