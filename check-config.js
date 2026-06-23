require('dotenv').config();

console.log('🔍 Checking Confession Bot Configuration...\n');

// Kiểm tra file .env
console.log('📋 Environment Variables:');
console.log(`BOT_TOKEN: ${process.env.BOT_TOKEN ? '✅ Set' : '❌ Missing'}`);
console.log(`CLIENT_ID: ${process.env.CLIENT_ID ? '✅ Set' : '❌ Missing'}`);
console.log(`MONGO_USERNAME: ${process.env.MONGO_USERNAME ? '✅ Set' : '⚠️ Dùng default (admin)'}`);
console.log(`MONGO_PASSWORD: ${process.env.MONGO_PASSWORD ? '✅ Set' : '⚠️ Dùng default'}`);
console.log(`MONGO_DATABASE: ${process.env.MONGO_DATABASE ? '✅ Set' : '⚠️ Dùng default (confession_bot)'}`);
console.log('ℹ️  MONGODB_URI: docker-compose tự dựng (chỉ cần set thủ công nếu chạy npm start)\n');

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
    require('./src/data/mongodb');
    console.log('✅ MongoDB module found');
} catch (error) {
    console.log('❌ MongoDB module not found:', error.message);
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