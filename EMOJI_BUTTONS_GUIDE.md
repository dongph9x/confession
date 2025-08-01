# 🎭 Emoji Buttons System

## 🎯 Tổng quan

Hệ thống emoji buttons cho phép người dùng tương tác với confession posts bằng cách click vào các emoji buttons thay vì sử dụng Discord reactions.

## 📊 Available Emojis

### 8 Emoji Buttons:
- **❤️ Heart** - Thể hiện tình yêu, thích thú
- **😂 Laugh** - Thể hiện vui vẻ, hài hước
- **😮 Wow** - Thể hiện ngạc nhiên, ấn tượng
- **😢 Sad** - Thể hiện buồn bã, thương cảm
- **🔥 Fire** - Thể hiện nóng bỏng, tuyệt vời
- **👏 Clap** - Thể hiện khen ngợi, tán thưởng
- **🙏 Pray** - Thể hiện cầu nguyện, chúc phúc
- **💕 Love** - Thể hiện tình yêu, trái tim

## 🔧 Cách hoạt động

### 1. **Button Creation**
```javascript
const { createEmojiButtons } = require("../utils/emojiButtons");
const emojiButtons = createEmojiButtons(counts);
```

### 2. **User Interaction**
- User click vào emoji button
- System toggle reaction (thêm/xóa)
- Update button count và style
- Highlight button nếu user đã react

### 3. **Visual Feedback**
- **Normal Style**: ButtonStyle.Secondary
- **Reacted Style**: ButtonStyle.Primary (highlighted)
- **Count Display**: `❤️ 5` (emoji + số lượng)

## 📁 Files Structure

### Core Files:
- **`src/utils/emojiButtons.js`** - Emoji button utilities
- **`src/models/EmojiReaction.js`** - Database model
- **`src/data/mongodb.js`** - Database methods
- **`src/events/buttonInteractionCreate.js`** - Event handler

### Database Schema:
```javascript
{
    guildId: String,
    confessionId: ObjectId,
    userId: String,
    emojiKey: String, // 'heart', 'laugh', etc.
    createdAt: Date
}
```

## 🎮 Usage

### 1. **Tạo Emoji Buttons**
```javascript
// Empty buttons
const buttons = createEmojiButtons();

// With counts
const buttons = createEmojiButtons({
    heart: 5,
    laugh: 3,
    fire: 2
});
```

### 2. **Xử lý Button Click**
```javascript
// Trong buttonInteractionCreate.js
if (customId.startsWith('emoji_')) {
    await handleEmojiButton(interaction, customId);
}
```

### 3. **Database Operations**
```javascript
// Add reaction
await db.addEmojiReaction(guildId, confessionId, userId, emojiKey);

// Toggle reaction
const result = await db.toggleEmojiReaction(guildId, confessionId, userId, emojiKey);

// Get counts
const counts = await db.getEmojiCounts(guildId, confessionId);

// Get user reactions
const userReactions = await db.getUserEmojiReactions(guildId, confessionId, userId);
```

## 🔄 Workflow

### 1. **Confession Approval**
1. Admin approve confession
2. Bot tạo embed với emoji buttons
3. Gửi message đến confession channel
4. Buttons hiển thị với count = 0

### 2. **User Reaction**
1. User click emoji button
2. Bot defer update
3. Toggle reaction trong database
4. Update button counts và style
5. Edit message với buttons mới

### 3. **Visual Updates**
1. **Count Update**: `❤️ 0` → `❤️ 1`
2. **Style Update**: Secondary → Primary (nếu user reacted)
3. **Real-time**: Buttons update ngay lập tức

## 🎨 Features

### ✅ **Real-time Updates**
- Counts update ngay lập tức
- Button style thay đổi theo user reaction
- No page refresh needed

### ✅ **Toggle Functionality**
- Click lần đầu: thêm reaction
- Click lần nữa: xóa reaction
- Visual feedback rõ ràng

### ✅ **User-specific Highlighting**
- Buttons user đã react sẽ highlighted
- Primary style cho reacted buttons
- Secondary style cho unreacted buttons

### ✅ **Database Integrity**
- Unique constraint: mỗi user chỉ react 1 lần per emoji
- Proper indexing cho performance
- Atomic operations

## 🧪 Testing

### Test Script:
```bash
node test-emoji-system.js
```

### Test Cases:
1. ✅ Available emojis
2. ✅ Create emoji buttons
3. ✅ Get emoji key from custom ID
4. ✅ Update emoji buttons
5. ✅ Database operations

## 🚀 Benefits

### 1. **User Experience**
- **Intuitive**: Click buttons thay vì reactions
- **Visual**: Clear counts và highlighting
- **Responsive**: Real-time updates
- **Accessible**: Works on mobile

### 2. **Admin Control**
- **Customizable**: Dễ thêm/bớt emojis
- **Trackable**: Database tracking
- **Analytics**: Reaction statistics
- **Moderation**: Full control

### 3. **Technical**
- **Scalable**: Database-backed
- **Reliable**: Error handling
- **Maintainable**: Clean code structure
- **Extensible**: Easy to add features

## 🎯 Future Enhancements

### 1. **Custom Emojis**
- Server-specific emojis
- Custom emoji uploads
- Emoji categories

### 2. **Advanced Features**
- Reaction analytics
- Popular reactions
- Reaction trends
- User reaction history

### 3. **UI Improvements**
- Animated reactions
- Sound effects
- Hover effects
- Mobile optimization

## 🎉 Kết luận

**Emoji Buttons System** cung cấp trải nghiệm tương tác tuyệt vời cho confession posts:

- ✅ **8 emoji buttons** đa dạng
- ✅ **Real-time updates** mượt mà
- ✅ **Toggle functionality** thông minh
- ✅ **Visual feedback** rõ ràng
- ✅ **Database tracking** đầy đủ
- ✅ **Mobile-friendly** responsive

**Người dùng giờ đây có thể tương tác với confession posts một cách trực quan và thú vị!** 🚀 