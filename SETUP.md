# 🔧 Hướng dẫn cấu hình Confession Bot

## 📋 Bước 1: Tạo Discord Bot

1. Vào [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Đặt tên cho bot
4. Vào mục "Bot" và copy **Token**
5. Vào mục "General Information" và copy **Application ID**

## 📋 Bước 2: Tạo file .env

Tạo file `.env` trong thư mục gốc với nội dung:

```env
# Discord Bot Configuration
BOT_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_client_id_here

# Lavalink Configuration (Optional)
LAVALINK_URL=localhost:2333
LAVALINK_AUTH=youshallnotpass

# Logging Configuration
LOG_LEVEL=info
```

**Thay thế:**
- `your_discord_bot_token_here` = Token từ Discord Developer Portal
- `your_client_id_here` = Application ID từ Discord Developer Portal

## 📋 Bước 3: Mời bot vào server

1. Vào Discord Developer Portal > OAuth2 > URL Generator
2. Chọn scopes: `bot`, `applications.commands`
3. Chọn permissions:
   - Send Messages
   - Embed Links
   - Manage Messages
   - Connect
   - Speak
   - Use Slash Commands
4. Copy URL và mở trong trình duyệt

## 📋 Bước 4: Deploy commands

```bash
npm run deploy
```

## 📋 Bước 5: Chạy bot

```bash
npm start
```

## 📋 Bước 6: Thiết lập kênh

### Tạo kênh review:
1. Tạo kênh mới (ví dụ: `#review-confession`)
2. Đảm bảo bot có quyền xem và gửi tin nhắn

### Thiết lập kênh:
```
/setreviewchannel #review-confession
/setconfessionchannel #kênh-confession
```

## 🔍 Kiểm tra cấu hình

Sử dụng lệnh `/confessionconfig` để xem cấu hình hiện tại.

## 🚨 Troubleshooting

### Lỗi "CLIENT_ID is not a snowflake"
- ✅ Kiểm tra CLIENT_ID trong file .env
- ✅ Đảm bảo CLIENT_ID là số (không phải text)

### Lỗi "Invalid token"
- ✅ Kiểm tra BOT_TOKEN trong file .env
- ✅ Đảm bảo token đúng và chưa hết hạn

### Bot không phản hồi
- ✅ Kiểm tra bot đã online chưa
- ✅ Kiểm tra quyền bot trong server
- ✅ Kiểm tra logs trong console

---

**Sau khi hoàn thành, bot sẽ sẵn sàng nhận confession! 🎉** 