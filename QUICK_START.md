# 🚀 Quick Start Guide - Confession Bot

## ⚡ Setup Nhanh

### 1. Cài đặt
```bash
npm install
```

### 2. Tạo file .env
```env
BOT_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_client_id_here
LAVALINK_URL=localhost:2333
LAVALINK_AUTH=youshallnotpass
```

### 3. Deploy commands
```bash
npm run deploy
```

### 4. Chạy bot
```bash
npm start
```

## 🎯 Cách sử dụng

### Thiết lập ban đầu (Admin)
1. `/setconfessionchannel #kênh-confession` - Thiết lập kênh đăng confession
2. `/setreviewchannel #kênh-review` - Thiết lập kênh review confession

### Gửi confession (User)
- **Slash command**: `/confess noidung:Nội dung confession`
- **Message command**: `!confess Nội dung confession`

### Quản lý confession (Moderator)
- `/confessionstats` - Xem thống kê confession
- `/pendingconfessions` - Xem confession đang chờ duyệt
- Click nút **✅ Duyệt** hoặc **❌ Từ chối** trong kênh review

## 🔧 Tính năng chính

### ✅ Hệ thống Review
- Tất cả confession phải được duyệt trước khi đăng
- Button-based review dễ sử dụng
- Thông báo DM cho người gửi

### 📊 Thống kê
- Số confession đã duyệt/từ chối
- Confession đang chờ duyệt
- Số thứ tự confession

### 🎵 Music (Tùy chọn)
- `/play` - Phát nhạc
- `/skip` - Bỏ qua bài hát
- `/stop` - Dừng nhạc

## 🛠️ Troubleshooting

### Lỗi "Cannot read properties of undefined (reading 'lastID')"
- ✅ Đã được sửa trong phiên bản mới
- Restart bot nếu gặp lỗi

### Confession không hiển thị
- ✅ Kiểm tra đã thiết lập kênh review chưa
- ✅ Kiểm tra quyền bot trong kênh

### Music không hoạt động
- ✅ Cài đặt Lavalink server
- ✅ Kiểm tra cấu hình Lavalink

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra logs trong `src/logs/`
2. Restart bot
3. Kiểm tra quyền bot trong Discord

---

**Bot đã sẵn sàng sử dụng! 🎉** 