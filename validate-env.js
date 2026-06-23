#!/usr/bin/env node

require('dotenv').config();

console.log('🔍 Validating Environment Variables...\n');

const requiredVars = [
    'BOT_TOKEN',
    'CLIENT_ID'
];

const optionalVars = [
    'NODE_ENV',
    'MONGO_USERNAME',
    'MONGO_PASSWORD', 
    'MONGO_DATABASE',
    'MONGO_PORT',
    'MONGODB_URI'
];

let hasErrors = false;

// Check required variables
console.log('📋 Required Variables:');
requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
        console.log(`❌ ${varName}: Missing`);
        hasErrors = true;
    } else {
        console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
    }
});

console.log('\n📋 Optional Variables:');
optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
        console.log(`⚠️  ${varName}: Not set (using default)`);
    } else {
        console.log(`✅ ${varName}: ${value}`);
    }
});

// Validate specific values
console.log('\n🔍 Validation Checks:');

// Check BOT_TOKEN format
const botToken = process.env.BOT_TOKEN;
if (botToken && botToken.length < 50) {
    console.log('❌ BOT_TOKEN: Too short (should be longer)');
    hasErrors = true;
} else if (botToken) {
    console.log('✅ BOT_TOKEN: Valid format');
}

// Check CLIENT_ID format
const clientId = process.env.CLIENT_ID;
if (clientId && !clientId.match(/^\d{17,19}$/)) {
    console.log('❌ CLIENT_ID: Invalid format (should be 17-19 digits)');
    hasErrors = true;
} else if (clientId) {
    console.log('✅ CLIENT_ID: Valid format');
}

// Check MongoDB URI
const mongoUri = process.env.MONGODB_URI;
if (mongoUri && !mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    console.log('❌ MONGODB_URI: Invalid format');
    hasErrors = true;
} else if (mongoUri) {
    console.log('✅ MONGODB_URI: Valid format');
}

// Check ports
const mongoPort = process.env.MONGO_PORT;
if (mongoPort && (isNaN(mongoPort) || mongoPort < 1 || mongoPort > 65535)) {
    console.log('❌ MONGO_PORT: Invalid port number');
    hasErrors = true;
} else if (mongoPort) {
    console.log('✅ MONGO_PORT: Valid port');
}

console.log('\n📊 Summary:');
if (hasErrors) {
    console.log('❌ Environment validation failed. Please fix the errors above.');
    process.exit(1);
} else {
    console.log('✅ All environment variables are valid!');
    console.log('\n🚀 Ready to run with Docker!');
}

// Show Docker commands
console.log('\n🐳 Docker Commands:');
console.log('docker compose up -d                      # Run bot with MongoDB');
console.log('docker compose logs -f bot               # View bot logs');
console.log('docker compose down                      # Stop all services'); 