# 🚫 Block Discord Reactions Guide

## 🎯 Mục tiêu
Chặn việc sử dụng Discord reactions trên confession posts và chỉ cho phép sử dụng emoji buttons tùy chỉnh.

## 🔧 Cách triển khai

### 1. Bot Permissions
Bot cần có các permissions sau:
- **Manage Messages** - Để xóa Discord reactions
- **Send Messages** - Để gửi thông báo
- **Read Message History** - Để đọc message content
- **Add Reactions** - Để thêm reactions (nếu cần)

### 2. Setup Bot Permissions
1. Vào Discord Server Settings
2. Chọn "Roles" → Bot role
3. Bật các permissions:
   - ✅ Manage Messages
   - ✅ Send Messages  
   - ✅ Read Message History
   - ✅ Add Reactions

### 3. Channel Permissions
Đảm bảo bot có permissions trong các channels:
- **Confession Channel**: Manage Messages, Send Messages
- **Review Channel**: Manage Messages, Send Messages

## 🛠️ Code Implementation

### Event Handler: `src/events/messageReactionAdd.js`
```javascript
// Tự động xóa Discord reactions
if (embed.title.includes('Confession #')) {
    await reaction.remove();
    // Gửi thông báo cho user
}
```

### Event Handler: `src/events/messageReactionRemove.js`
```javascript
// Log việc xóa Discord reactions
console.log(`🗑️ Discord reaction removed: ${reaction.emoji.name}`);
```

## 🎮 Cách hoạt động

### Khi user thêm Discord reaction:
1. **Bot phát hiện**: Reaction được thêm vào confession post
2. **Xóa ngay lập tức**: Bot xóa Discord reaction
3. **Thông báo**: Gửi message nhắc user sử dụng emoji buttons
4. **Tự động xóa**: Thông báo tự động xóa sau 5 giây

### Khi user xóa Discord reaction:
1. **Bot log**: Ghi log việc xóa reaction
2. **Không can thiệp**: Không làm gì thêm

## 📊 Benefits

### ✅ Advantages
- **Consistent UX**: Chỉ sử dụng emoji buttons tùy chỉnh
- **Better tracking**: Reactions được lưu trong database
- **Custom analytics**: Thống kê chi tiết reactions
- **Visual feedback**: Button styles thay đổi khi react
- **Real-time updates**: Counter cập nhật ngay lập tức

### ❌ Discord Reactions Issues
- **Limited tracking**: Không thể track chi tiết
- **No custom analytics**: Không có thống kê tùy chỉnh
- **Inconsistent UX**: Không có visual feedback
- **No database**: Reactions không được lưu trữ

## 🧪 Testing

### Test Script: `check-permissions.js`
```bash
node check-permissions.js
```

### Manual Testing
1. Thêm Discord reaction vào confession post
2. Bot sẽ xóa reaction ngay lập tức
3. Bot gửi thông báo nhắc user
4. User sử dụng emoji buttons thay thế

## 🐛 Troubleshooting

### Bot không xóa được reactions
- **Check permissions**: Đảm bảo bot có "Manage Messages"
- **Check channel permissions**: Bot cần permissions trong confession channel
- **Check bot role**: Bot role phải cao hơn user role

### Bot không gửi được thông báo
- **Check "Send Messages"**: Bot cần permission này
- **Check channel permissions**: Bot cần permissions trong channel

### Reactions vẫn xuất hiện
- **Check event handler**: Đảm bảo `messageReactionAdd.js` được load
- **Check intents**: Bot cần `GuildMessageReactions` intent
- **Check bot permissions**: Bot cần đủ permissions

## 📝 Configuration

### Bot Intents (trong `src/index.js`)
```javascript
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions, // Cần thiết
        GatewayIntentBits.MessageContent
    ]
});
```

### Event Loading
Đảm bảo các events được load:
- `messageReactionAdd.js`
- `messageReactionRemove.js`

## 🎯 Kết quả mong đợi

### ✅ Success
- Discord reactions bị xóa ngay lập tức
- User nhận thông báo nhắc nhở
- Chỉ emoji buttons được sử dụng
- Database tracking hoạt động
- Analytics chính xác

### 📊 Metrics
- **Reactions blocked**: Số Discord reactions bị xóa
- **Notifications sent**: Số thông báo gửi cho users
- **Emoji button usage**: Số lần sử dụng emoji buttons
- **User compliance**: Tỷ lệ user tuân thủ

---

**🎉 Discord reactions đã được chặn thành công!** 