# 📊 Hướng dẫn Thống kê Reactions và Comments

## ✅ **Trạng thái hiện tại:**
- ✅ Thống kê reactions đã được cập nhật để tính toán thực tế
- ✅ Thống kê comments đã được cập nhật với model Comment mới
- ✅ Test thành công với dữ liệu thực tế
- ✅ Command `/detailedstats` đã được tạo

## 🎯 **Vấn đề đã được giải quyết:**

### **Trước đây:**
```javascript
// Trả về dữ liệu mặc định (0)
async getReactionStats(guildId) {
    return {
        confessions_with_reactions: 0,
        total_reactions: 0,
        unique_users_reacted: 0
    };
}
```

### **Bây giờ:**
```javascript
// Tính toán thống kê thực tế từ database
async getReactionStats(guildId) {
    const EmojiReaction = require('../models/EmojiReaction');
    
    // Tổng số reactions
    const totalReactions = await EmojiReaction.countDocuments({ guildId });
    
    // Số confession có reactions
    const confessionsWithReactions = await EmojiReaction.distinct('confessionId', { guildId });
    
    // Số users đã react
    const uniqueUsersReacted = await EmojiReaction.distinct('userId', { guildId });
    
    return {
        confessions_with_reactions: confessionsWithReactions.length,
        total_reactions: totalReactions,
        unique_users_reacted: uniqueUsersReacted.length
    };
}
```

## 📊 **Thống kê Reactions:**

### **Các chỉ số được theo dõi:**
- **Tổng reactions**: Số lượng reactions tất cả
- **Confessions có reactions**: Số confession có ít nhất 1 reaction
- **Users đã react**: Số users đã thực hiện reaction

### **Cách tính toán:**
```javascript
// Tổng reactions
const totalReactions = await EmojiReaction.countDocuments({ guildId });

// Số confession có reactions
const confessionsWithReactions = await EmojiReaction.distinct('confessionId', { guildId });

// Số users đã react
const uniqueUsersReacted = await EmojiReaction.distinct('userId', { guildId });
```

## 💬 **Thống kê Comments:**

### **Model Comment mới:**
```javascript
const commentSchema = new mongoose.Schema({
    guildId: { type: String, required: true, index: true },
    confessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Confession', required: true },
    userId: { type: String, required: true, index: true },
    username: { type: String, required: true },
    content: { type: String, required: true, maxlength: 1000 },
    messageId: { type: String, required: true },
    threadId: { type: String, required: true },
    isAnonymous: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false }
});
```

### **Các chỉ số được theo dõi:**
- **Tổng comments**: Số lượng comments tất cả
- **Confessions có comments**: Số confession có ít nhất 1 comment
- **Users đã comment**: Số users đã thực hiện comment

### **Cách tính toán:**
```javascript
// Tổng comments
const totalComments = await Comment.countDocuments({ 
    guildId, 
    isDeleted: false 
});

// Số confession có comments
const confessionsWithComments = await Comment.distinct('confessionId', { 
    guildId, 
    isDeleted: false 
});

// Số users đã comment
const uniqueUsersCommented = await Comment.distinct('userId', { 
    guildId, 
    isDeleted: false 
});
```

## 🎯 **Cách xem thống kê:**

### **1. Sử dụng command:**
```
/detailedstats
```

### **2. Sử dụng message command:**
```
!confessionstats
```

### **3. Sử dụng select menu:**
- Vào confession config
- Chọn "View Stats"

## 📈 **Kết quả test:**

```
📊 Final Summary:
   ✅ Confession Stats: 0 total confessions
   ✅ Reaction Stats: 4 total reactions
   ✅ Comment Stats: 3 total comments
   ✅ Test Reactions Added: 4
   ✅ Test Comments Added: 3
```

## 🔧 **Các methods mới được thêm:**

### **Reaction Methods:**
- `getReactionStats(guildId)` - Thống kê reactions
- `addEmojiReaction(guildId, confessionId, userId, emojiKey)` - Thêm reaction
- `removeEmojiReaction(guildId, confessionId, userId, emojiKey)` - Xóa reaction
- `getEmojiCounts(guildId, confessionId)` - Đếm reactions theo emoji
- `getUserEmojiReactions(guildId, confessionId, userId)` - Reactions của user

### **Comment Methods:**
- `getCommentStats(guildId)` - Thống kê comments
- `addComment(guildId, confessionId, userId, username, content, messageId, threadId)` - Thêm comment
- `getCommentsByConfession(guildId, confessionId, limit)` - Lấy comments của confession
- `deleteComment(commentId)` - Xóa comment
- `getCommentById(commentId)` - Lấy comment theo ID

## 🎯 **Cách sử dụng trong code:**

### **Thêm reaction:**
```javascript
const result = await db.addEmojiReaction(guildId, confessionId, userId, 'heart');
if (result) {
    console.log('✅ Reaction added successfully');
}
```

### **Thêm comment:**
```javascript
const commentId = await db.addComment(
    guildId, 
    confessionId, 
    userId, 
    username, 
    content, 
    messageId, 
    threadId
);
```

### **Lấy thống kê:**
```javascript
const reactionStats = await db.getReactionStats(guildId);
const commentStats = await db.getCommentStats(guildId);

console.log(`Total reactions: ${reactionStats.total_reactions}`);
console.log(`Total comments: ${commentStats.total_comments}`);
```

## ⚠️ **Lưu ý quan trọng:**

### **Emoji Reactions:**
- Chỉ hỗ trợ các emoji trong enum: `['heart', 'laugh', 'wow', 'sad', 'fire', 'clap', 'pray', 'love', 'like', 'dislike', 'cry', 'angry', 'cool', 'sleep', 'party', 'star', 'crown', 'gem', 'sparkles', 'rainbow', 'rocket']`
- Mỗi user chỉ có thể react 1 lần với mỗi emoji trên mỗi confession
- Reactions được lưu với `isDeleted: false` để có thể soft delete

### **Comments:**
- Comments có thể anonymous hoặc public
- Mỗi comment có `messageId` và `threadId` để liên kết với Discord
- Comments được soft delete với `isDeleted: true`

## 🚀 **Bước tiếp theo:**
1. **Deploy command**: Deploy `/detailedstats` command
2. **Test thực tế**: Test với confession thật
3. **Tối ưu**: Thêm cache cho thống kê
4. **Mở rộng**: Thêm thống kê theo thời gian

**🎯 Bây giờ bạn có thể xem thống kê chi tiết về reactions và comments trong confession config! Dữ liệu sẽ được tính toán thực tế từ database thay vì trả về 0!** 