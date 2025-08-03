# 🤖 Confession Bot - Professional Discord Confession Management

[![Discord.js](https://img.shields.io/badge/Discord.js-14.11.0-blue.svg)](https://discord.js.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16.0.0+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> A professional Discord bot for managing anonymous confessions with review system, statistics, and advanced moderation features.

## ✨ Features

### 🔐 Anonymous Confession System
- **User-choice anonymity** - Users can choose to be anonymous for each confession
- **Flexible submission** - Submit with or without anonymity using keywords
- **Review system** - All confessions are reviewed by moderators before being posted
- **Numbered confessions** - Each approved confession gets a unique number
- **DM notifications** - Users receive notifications when their confessions are approved/rejected

### 👨‍⚖️ Advanced Moderation
- **Button-based review** - Easy approve/reject buttons for moderators
- **Confession editing** - Moderators can edit confessions before approval
- **Pending queue** - View all confessions waiting for review
- **Permission system** - Role-based access control

### 📊 Statistics & Analytics
- **Real-time statistics** - View confession counts, approval rates, and more
- **Server analytics** - Track confession trends over time
- **User activity** - Monitor user participation

### 🎵 Music Features
- **Lavalink support** - High-quality music playback
- **Queue management** - Advanced music queue system
- **DJ role system** - Control who can manage music

### 🔧 Professional Features
- **Comprehensive logging** - Detailed logs for debugging and monitoring
- **Error handling** - Robust error handling and recovery
- **Database backup** - Automatic database backups
- **Configuration system** - Easy customization through config files
- **Puppeteer rendering** - Create beautiful confession images from HTML templates

## 🚀 Quick Start

### Prerequisites
- Node.js 16.0.0 or higher
- Discord Bot Token
- SQLite3 (included)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/confession-bot.git
   cd confession-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   BOT_TOKEN=your_discord_bot_token_here
   CLIENT_ID=your_client_id_here
   LAVALINK_URL=localhost:2333
   LAVALINK_AUTH=youshallnotpass
   ```

4. **Deploy slash commands**
   ```bash
   npm run deploy
   ```

5. **Start the bot**
   ```bash
   npm start
   ```

## 📋 Commands

### Confession Commands
- `/confess` - Submit an anonymous confession
- `/confessionstats` - View confession statistics (Moderator)
- `/pendingconfessions` - View pending confessions (Moderator)
- `!confess nội dung` - Submit confession normally
- `!confess anonymous nội dung` - Submit anonymous confession
- `!confess anon nội dung` - Submit anonymous confession
- `!confess ẩn nội dung` - Submit anonymous confession

### Setup Commands
- `/setconfessionchannel` - Set the confession channel (Admin)
- `/setreviewchannel` - Set the review channel (Admin)

### Music Commands
- `/play` - Play music from YouTube/Spotify
- `/skip` - Skip current track
- `/stop` - Stop music playback
- `/queue` - View music queue

### Utility Commands
- `/ping` - Check bot latency
- `/uptime` - View bot uptime
- `/help` - View command help

## 🛠️ Configuration

### Bot Configuration
Edit `src/config/bot.js` to customize:
- Confession settings (length limits, cooldowns)
- Embed colors and emojis
- Permission requirements
- Custom messages

### Database
The bot uses SQLite3 for data storage. Database files are stored in `src/data/`.

### Logging
Logs are stored in `src/logs/` with daily rotation. Configure logging in `src/config/bot.js`.

## 🔧 Development

### Project Structure
```
confession-bot/
├── src/
│   ├── commands/          # Slash commands
│   ├── events/            # Event handlers
│   ├── data/              # Database files
│   ├── utils/             # Utility functions
│   ├── config/            # Configuration files
│   └── logs/              # Log files
├── deploy-commands.js     # Command deployment
├── package.json
└── README.md
```

### Available Scripts
- `npm start` - Start the bot
- `npm run dev` - Start with nodemon (development)
- `npm run deploy` - Deploy slash commands
- `npm run backup` - Backup database
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Discord Server**: [Join our support server](https://discord.gg/yoursupport)
- **Documentation**: [Wiki](https://github.com/yourusername/confession-bot/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/confession-bot/issues)

## 🙏 Acknowledgments

- [Discord.js](https://discord.js.org/) - Discord API library
- [Kazagumo](https://github.com/Devoxin/Kazagumo) - Music library
- [SQLite3](https://www.sqlite.org/) - Database engine

## 📈 Version History

- **v2.0.0** - Professional release with review system
- **v1.0.0** - Initial release

---

⭐ **Star this repository if you find it helpful!** 