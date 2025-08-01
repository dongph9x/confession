# 🎯 Emoji Buttons Guide

## Tổng quan
Tính năng Emoji Buttons cho phép người dùng tương tác với confessions thông qua các emoji tùy chỉnh thay vì sử dụng reactions có sẵn của Discord.

## ✨ Tính năng

### 🎨 Emoji có sẵn
- **❤️ Love** - Thể hiện tình yêu, thích thú
- **😂 Laugh** - Thể hiện sự hài hước, vui vẻ
- **😮 Wow** - Thể hiện sự ngạc nhiên, ấn tượng
- **😢 Sad** - Thể hiện sự buồn bã, đồng cảm
- **😠 Angry** - Thể hiện sự tức giận, không đồng ý
- **🔥 Fire** - Thể hiện sự nóng bỏng, ấn tượng

### 🔄 Cách hoạt động
1. **Hiển thị**: Mỗi confession được duyệt sẽ có 6 emoji buttons
2. **Tương tác**: Người dùng click vào emoji để react
3. **Counter**: Số lượng reactions được hiển thị trên mỗi button
4. **Visual Feedback**: Button sẽ đổi màu khi user đã react
5. **Toggle**: Click lại để bỏ reaction

## 🛠️ Cài đặt

### 1. Cấu trúc file
```
src/
├── utils/
│   └── emojiButtons.js          # Utility cho emoji buttons
├── events/
│   └── buttonInteractionCreate.js # Xử lý emoji button clicks
└── data/
    └── mongodb.js               # Database methods cho emoji reactions
```

### 2. Database Schema
```javascript
// Reaction Model
{
    guildId: String,
    confessionId: ObjectId,
    userId: String,
    emoji: String,        // 'heart', 'laugh', 'wow', etc.
    emojiId: String,      // null for custom emojis
    createdAt: Date
}
```

### 3. API Methods
```javascript
// Thêm emoji reaction
await db.addEmojiReaction(guildId, confessionId, userId, emojiKey);

// Xóa emoji reaction
await db.removeEmojiReaction(guildId, confessionId, userId, emojiKey);

// Lấy emoji counts
const counts = await db.getEmojiCounts(guildId, confessionId);

// Lấy user reactions
const reactions = await db.getUserEmojiReactions(guildId, confessionId, userId);
```

## 🎮 Sử dụng

### Cho Users
1. **Xem confession**: Confession được duyệt sẽ hiển thị 6 emoji buttons
2. **React**: Click vào emoji để thể hiện cảm xúc
3. **Unreact**: Click lại để bỏ reaction
4. **Xem số lượng**: Số lượng reactions hiển thị trên mỗi button

### Cho Admins
1. **Duyệt confession**: Khi duyệt confession, emoji buttons sẽ tự động được thêm
2. **Theo dõi**: Có thể xem thống kê reactions trong lệnh stats

## 📊 Thống kê

### Emoji Stats
- **Confessions có reactions**: Số confession có ít nhất 1 reaction
- **Tổng reactions**: Tổng số reactions trên tất cả confessions
- **Users đã react**: Số lượng unique users đã react

### Lệnh xem stats
```
!confessionstats
/confessionstats
```

## 🔧 Tùy chỉnh

### Thêm emoji mới
1. Mở `src/utils/emojiButtons.js`
2. Thêm vào `EMOJI_CONFIG`:
```javascript
newEmoji: {
    emoji: '🎉',
    label: 'Celebrate',
    style: ButtonStyle.Secondary,
    customId: 'emoji_newEmoji'
}
```

### Thay đổi layout
- **Buttons per row**: Thay đổi `buttonsPerRow` trong `createEmojiButtons()`
- **Button style**: Thay đổi `style` trong `EMOJI_CONFIG`

## 🐛 Troubleshooting

### Vấn đề thường gặp
1. **Buttons không hiển thị**: Kiểm tra Discord permissions
2. **Reactions không lưu**: Kiểm tra MongoDB connection
3. **Counter không cập nhật**: Kiểm tra database queries

### Debug
```bash
# Test emoji buttons
node test-emoji-buttons.js

# Test database
node test-stats-display.js
```

## 📝 Changelog

### v1.0.0
- ✅ Thêm 6 emoji buttons cơ bản
- ✅ Hỗ trợ toggle reactions
- ✅ Counter real-time
- ✅ Visual feedback
- ✅ Database integration
- ✅ Stats tracking

## 🚀 Tính năng tương lai

### Planned Features
- [ ] Custom emoji support
- [ ] Emoji categories
- [ ] Reaction history
- [ ] Top reactors
- [ ] Emoji analytics

### Enhancement Ideas
- [ ] Animated emojis
- [ ] Sound effects
- [ ] Reaction streaks
- [ ] Emoji challenges

## 📞 Hỗ trợ

Nếu gặp vấn đề với emoji buttons:
1. Kiểm tra console logs
2. Chạy test scripts
3. Verify database connection
4. Check Discord permissions

---

**🎯 Emoji Buttons** - Tương tác thông minh với confessions! 