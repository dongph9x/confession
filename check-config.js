require('dotenv').config();

console.log('🔍 Checking Confession Bot Configuration...\n');

// Kiểm tra file .env
console.log('📋 Environment Variables:');
console.log(`BOT_TOKEN: ${process.env.BOT_TOKEN ? '✅ Set' : '❌ Missing'}`);
console.log(`CLIENT_ID: ${process.env.CLIENT_ID ? '✅ Set' : '❌ Missing'}`);
console.log(`LAVALINK_URL: ${process.env.LAVALINK_URL ? '✅ Set' : '⚠️ Optional'}`);
console.log(`LAVALINK_AUTH: ${process.env.LAVALINK_AUTH ? '✅ Set' : '⚠️ Optional'}\n`);

// Kiểm tra dependencies
console.log('📦 Dependencies:');
try {
    require('./package.json');
    console.log('✅ package.json found');
} catch (error) {
    console.log('❌ package.json not found');
}

// Kiểm tra database
console.log('\n🗄️ Database:');
try {
    const db = require('./src/data/database');
    console.log('✅ Database module found');
} catch (error) {
    console.log('❌ Database module not found:', error.message);
}

// Kiểm tra commands
console.log('\n⚙️ Commands:');
try {
    const fs = require('fs');
    const path = require('path');
    const commandsPath = path.join(__dirname, 'src/commands');
    const commandFolders = fs.readdirSync(commandsPath);
    console.log(`✅ Found ${commandFolders.length} command folders`);
} catch (error) {
    console.log('❌ Commands not found:', error.message);
}

// Hướng dẫn tiếp theo
console.log('\n📋 Next Steps:');
if (!process.env.BOT_TOKEN || !process.env.CLIENT_ID) {
    console.log('1. ❌ Create .env file with BOT_TOKEN and CLIENT_ID');
    console.log('2. 📝 See SETUP.md for detailed instructions');
} else {
    console.log('1. ✅ Environment variables configured');
    console.log('2. 🚀 Run: npm run deploy');
    console.log('3. 🎯 Run: npm start');
    console.log('4. 📢 Setup channels with /setreviewchannel and /setconfessionchannel');
}

console.log('\n🎉 Configuration check complete!'); 