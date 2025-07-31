# 🎭 CFS Bot - Discord Confession & Music Bot

Một bot Discord đa năng với tính năng confession ẩn danh và phát nhạc, được viết bằng Node.js và Discord.js.

## 📋 Tính năng chính

- 🎭 **Hệ thống Confession Ẩn danh** - Cho phép người dùng gửi confession ẩn danh
- 🎵 **Music Bot** - Phát nhạc từ YouTube với Lavalink
- 🛠️ **Utility Commands** - Các lệnh tiện ích (ping, uptime, help)
- 👋 **Welcome System** - Tin nhắn chào mừng thành viên mới
- 📊 **Database SQLite** - Lưu trữ dữ liệu local
- 🔧 **Dual Command System** - Hỗ trợ cả Slash Commands và Message Commands

## 🚀 Cài đặt

### Yêu cầu hệ thống
- Node.js 16.0.0 trở lên
- npm hoặc yarn
- Discord Bot Token

### Bước 1: Clone repository
```bash
git clone <repository-url>
cd cfs-bot
```

### Bước 2: Cài đặt dependencies
```bash
npm install
```

### Bước 3: Tạo file .env
Tạo file `.env` trong thư mục gốc:
```env
# Discord Bot Token (Bắt buộc)
BOT_TOKEN=your_discord_bot_token_here

# Lavalink Configuration (Tùy chọn - cho music)
LAVALINK_URL=localhost:2333
LAVALINK_AUTH=youshallnotpass
```

### Bước 4: Lấy Bot Token
1. Vào [Discord Developer Portal](https://discord.com/developers/applications)
2. Tạo ứng dụng mới
3. Vào mục "Bot" và copy token
4. Thay `your_discord_bot_token_here` bằng token thật

### Bước 5: Mời bot vào server
1. Trong Discord Developer Portal, vào mục "OAuth2" > "URL Generator"
2. Chọn scopes: `bot`, `applications.commands`
3. Chọn permissions:
   - Send Messages
   - Embed Links
   - Connect
   - Speak
   - Manage Channels
4. Copy URL và mở trong trình duyệt để mời bot

## 🎯 Cách sử dụng

### Khởi động bot
```bash
# Development mode (với nodemon)
npm run dev

# Production mode
npm start
```

## 📜 Danh sách lệnh

### 🎭 Confession Commands

#### `/confess` - Gửi confession ẩn danh
```
/confess noidung:Tôi muốn thú nhận điều gì đó...
```
- Gửi confession ẩn danh đến kênh đã thiết lập
- Chỉ admin mới thấy người gửi

#### `/setconfess` - Thiết lập kênh confession (Admin only)
```
/setconfess #kênh-confession
```
- Thiết lập kênh để nhận confession
- Thay `#kênh-confession` bằng mention kênh thật

### 🎵 Music Commands (Cần Lavalink)

#### `/play` - Phát nhạc
```
/play query:tên bài hát hoặc URL
```
- Phát nhạc từ YouTube
- Hỗ trợ cả single track và playlist

#### `/skip` - Bỏ qua bài hát hiện tại
```
/skip
```

#### `/stop` - Dừng phát nhạc
```
/stop
```

#### `/repeat` - Lặp lại bài hát
```
/repeat
```

### 🛠️ Utility Commands

#### `/help` - Xem danh sách lệnh
```
/help
```
- Hiển thị tất cả lệnh có sẵn

#### `/ping` - Kiểm tra độ trễ
```
/ping
```
- Kiểm tra bot có hoạt động không

#### `/uptime` - Xem thời gian hoạt động
```
/uptime
```
- Hiển thị thời gian bot đã chạy

### 👋 Welcome Commands

#### `/setwelcome` - Thiết lập kênh welcome (Admin only)
```
/setwelcome #kênh-welcome
```

#### `/testwelcome` - Test tin nhắn welcome
```
/testwelcome
```

## 💬 Message Commands (Prefix: !)

Bot cũng hỗ trợ lệnh text với prefix `!`:

```
!confess <nội dung>     - Gửi confession
!play <tên bài hát>     - Phát nhạc
!skip                   - Bỏ qua bài hát
!stop                   - Dừng nhạc
!help                   - Xem lệnh
!ping                   - Kiểm tra ping
!uptime                 - Xem uptime
```

## 🗄️ Database Schema

Bot sử dụng SQLite với 3 bảng chính:

### `guild_settings`
- `guild_id` - ID server
- `confession_channel` - ID kênh confession
- `prefix` - Prefix cho message commands
- `created_at` - Thời gian tạo

### `confessions`
- `id` - ID confession
- `guild_id` - ID server
- `user_id` - ID người gửi
- `content` - Nội dung confession
- `created_at` - Thời gian gửi

### `music_settings`
- `guild_id` - ID server
- `dj_role` - Role DJ
- `music_channel` - Kênh music

## ⚙️ Cấu hình Lavalink (Tùy chọn)

Để sử dụng tính năng music, bạn cần Lavalink server:

### Cài đặt Lavalink
1. Tải Lavalink.jar từ [GitHub](https://github.com/lavalink-devs/Lavalink/releases)
2. Tạo file `application.yml`:
```yaml
server:
  port: 2333
  address: 127.0.0.1
lavalink:
  server:
    password: "youshallnotpass"
    sources:
      youtube: true
      bandcamp: true
      soundcloud: true
      twitch: true
      vimeo: true
      http: true
    bufferDurationMs: 400
    youtubeSearchEnabled: true
    soundcloudSearchEnabled: true
    gc-warnings: true
```

### Chạy Lavalink
```bash
java -jar Lavalink.jar
```

## 🔧 Troubleshooting

### Bot không khởi động
- ✅ Kiểm tra `BOT_TOKEN` trong `.env`
- ✅ Đảm bảo bot có quyền cần thiết
- ✅ Kiểm tra Node.js version (>= 16.0.0)

### Confession không hoạt động
- ✅ Kiểm tra đã thiết lập kênh confession chưa (`/setconfess`)
- ✅ Đảm bảo bot có quyền gửi tin nhắn trong kênh
- ✅ Kiểm tra bot có quyền Embed Links

### Music không hoạt động
- ✅ Cài đặt và chạy Lavalink server
- ✅ Kiểm tra cấu hình Lavalink trong `.env`
- ✅ Đảm bảo bot có quyền Connect và Speak

### Lỗi "nodes is not iterable"
- ✅ Đã được sửa trong phiên bản hiện tại
- ✅ Nếu gặp lỗi này, hãy restart bot

## 📁 Cấu trúc thư mục

```
cfs-bot/
├── src/
│   ├── commands/           # Slash commands
│   │   ├── confession/     # Confession commands
│   │   ├── music/         # Music commands
│   │   ├── utility/       # Utility commands
│   │   └── welcome/       # Welcome commands
│   ├── message-commands/   # Message commands
│   ├── events/            # Discord events
│   ├── data/              # Database
│   ├── utils/             # Utilities
│   └── models/            # Data models
├── package.json
├── .env                   # Environment variables
└── README.md
```

## 🎨 Tính năng nổi bật

- **🔄 Auto-reconnect** - Tự động kết nối lại khi mất kết nối
- **🛡️ Error Handling** - Xử lý lỗi tốt với try-catch
- **🌐 Multi-language** - Hỗ trợ tiếng Việt
- **📊 Modular Design** - Code được tổ chức theo modules
- **🔐 Security** - Confession ẩn danh, chỉ admin thấy người gửi
- **🎵 Rich Music** - Hỗ trợ playlist, queue, volume control

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

ISC License

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy:
1. Kiểm tra phần Troubleshooting
2. Tạo issue trên GitHub
3. Liên hệ developer

---

**Made with ❤️ by CAPTAIN BOY** 