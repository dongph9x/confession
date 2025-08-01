#!/bin/bash

# Confession Bot Manager Script

case "$1" in
    "start")
        echo "🚀 Starting Confession Bot..."
        if pgrep -f "node src/index.js" > /dev/null; then
            echo "❌ Bot is already running!"
            echo "Running processes:"
            ps aux | grep "node src/index.js" | grep -v grep
            exit 1
        fi
        node src/index.js
        ;;
    "stop")
        echo "🛑 Stopping Confession Bot..."
        if pgrep -f "node src/index.js" > /dev/null; then
            pkill -f "node src/index.js"
            echo "✅ Bot stopped successfully"
        else
            echo "ℹ️  No bot instances found"
        fi
        ;;
    "restart")
        echo "🔄 Restarting Confession Bot..."
        ./bot-manager.sh stop
        sleep 2
        ./bot-manager.sh start
        ;;
    "status")
        echo "📊 Confession Bot Status:"
        if pgrep -f "node src/index.js" > /dev/null; then
            echo "✅ Bot is running"
            echo "Running processes:"
            ps aux | grep "node src/index.js" | grep -v grep
        else
            echo "❌ Bot is not running"
        fi
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the bot (prevents duplicate instances)"
        echo "  stop    - Stop all bot instances"
        echo "  restart - Restart the bot"
        echo "  status  - Show bot status"
        exit 1
        ;;
esac 