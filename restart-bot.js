const { spawn } = require('child_process');
const path = require('path');

console.log('🔄 Restarting Discord Bot...');
console.log('============================');
console.log('');

// Kill existing bot process if running
console.log('📋 Step 1: Checking for existing bot process...');
const killProcess = spawn('pkill', ['-f', 'node.*src/index.js']);

killProcess.on('close', (code) => {
    if (code === 0) {
        console.log('✅ Existing bot process killed');
    } else {
        console.log('ℹ️  No existing bot process found');
    }
    
    // Wait a moment then start new bot
    setTimeout(() => {
        console.log('');
        console.log('📋 Step 2: Starting new bot process...');
        
        const botProcess = spawn('node', ['src/index.js'], {
            stdio: 'inherit',
            cwd: process.cwd()
        });
        
        botProcess.on('error', (error) => {
            console.error('❌ Error starting bot:', error.message);
        });
        
        botProcess.on('close', (code) => {
            console.log(`Bot process exited with code ${code}`);
        });
        
        console.log('✅ Bot started successfully!');
        console.log('📝 Check the bot logs above for any errors');
        console.log('');
        console.log('🎯 Now try clicking emoji buttons on confessions');
        console.log('✅ The fix should be working now!');
        
    }, 2000);
});

console.log('⏳ Waiting for restart to complete...'); 