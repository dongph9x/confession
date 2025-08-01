#!/bin/bash

# Confession Bot Startup Script
# Prevents multiple bot instances from running

echo "🚀 Starting Confession Bot..."

# Check if bot is already running
if pgrep -f "node src/index.js" > /dev/null; then
    echo "❌ Bot is already running!"
    echo "Running processes:"
    ps aux | grep "node src/index.js" | grep -v grep
    echo ""
    echo "To stop all bot instances, run: pkill -f 'node src/index.js'"
    exit 1
fi

# Start the bot
echo "✅ Starting bot..."
node src/index.js 