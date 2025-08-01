# 📊 Stats Features Guide

Hướng dẫn chi tiết về tính năng thống kê Reactions và Comments trong Confession Bot.

## 🎯 Tổng quan

Confession Bot giờ đây có khả năng theo dõi và thống kê chi tiết về:
- **Reactions** trên confessions
- **Comments** trong threads
- **User engagement** và participation

## ❤️ Reaction Tracking

### Cách hoạt động
1. **Tự động theo dõi**: Bot tự động lưu tất cả reactions trên confessions
2. **Real-time updates**: Thống kê được cập nhật ngay lập tức
3. **Duplicate prevention**: Mỗi user chỉ có thể react một lần với mỗi emoji

### Thống kê Reactions
- **Confessions có reactions**: Số confession nhận được reactions
- **Tổng reactions**: Tổng số reactions trên tất cả confessions
- **Unique users reacted**: Số user đã react

### Database Schema
```javascript
{
  guildId: String,
  confessionId: ObjectId,
  userId: String,
  emoji: String,
  emojiId: String,
  createdAt: Date
}
```

## 💬 Comment Tracking

### Cách hoạt động
1. **Thread detection**: Bot tự động nhận diện threads của confessions
2. **Message tracking**: Tất cả messages trong threads được lưu
3. **User identification**: Theo dõi user nào comment

### Thống kê Comments
- **Confessions có comments**: Số confession có comments
- **Tổng comments**: Tổng số comments trong tất cả threads
- **Unique users commented**: Số user đã comment

### Database Schema
```javascript
{
  guildId: String,
  confessionId: ObjectId,
  userId: String,
  messageId: String,
  threadId: String,
  content: String,
  createdAt: Date
}
```

## 📊 Commands

### Message Commands
```bash
!confessionstats
```
Hiển thị thống kê chi tiết bao gồm:
- Confession statistics
- Reaction statistics  
- Comment statistics

### Slash Commands
```bash
/confessionstats
```
Tương tự như message command nhưng với UI đẹp hơn.

## 🔧 Technical Implementation

### Event Handlers

#### Reaction Events
- **`messageReactionAdd`**: Lưu reaction khi user react
- **`messageReactionRemove`**: Xóa reaction khi user bỏ react

#### Comment Events  
- **`messageCreate`**: Lưu comment khi user gửi message trong thread

### Database Methods

#### Reaction Methods
```javascript
// Thêm reaction
await db.addReaction(guildId, confessionId, userId, emoji, emojiId)

// Xóa reaction  
await db.removeReaction(guildId, confessionId, userId, emoji)

// Lấy thống kê reactions
await db.getReactionStats(guildId)
```

#### Comment Methods
```javascript
// Thêm comment
await db.addComment(guildId, confessionId, userId, messageId, threadId, content)

// Lấy thống kê comments
await db.getCommentStats(guildId)
```

## 📈 Statistics Display

### Embed Format
```javascript
{
  name: "❤️ Reactions",
  value: `Confessions có reactions: **${reactionStats.confessions_with_reactions}**\nTổng reactions: **${reactionStats.total_reactions}**\nUsers đã react: **${reactionStats.unique_users_reacted}**`
}
```

### Sample Output
```
📊 Thống Kê Confession

📝 Confessions
Tổng: 15
Đã duyệt: 12  
Chờ duyệt: 2
Bị từ chối: 1

❤️ Reactions
Confessions có reactions: 8
Tổng reactions: 25
Users đã react: 12

💬 Comments  
Confessions có comments: 5
Tổng comments: 18
Users đã comment: 8
```

## 🎯 Use Cases

### For Moderators
- **Engagement tracking**: Xem confession nào được quan tâm nhiều
- **Community insights**: Hiểu xu hướng của community
- **Content quality**: Đánh giá chất lượng confessions

### For Users
- **Social proof**: Xem confession nào được ủng hộ
- **Community interaction**: Tham gia thảo luận qua comments
- **Expression**: Thể hiện cảm xúc qua reactions

## 🔍 Advanced Features

### Reaction Analytics
- **Popular emojis**: Thống kê emoji được dùng nhiều nhất
- **User engagement**: User nào react nhiều nhất
- **Time patterns**: Thời gian reactions thường xảy ra

### Comment Analytics  
- **Thread activity**: Thread nào sôi nổi nhất
- **User participation**: User nào comment nhiều nhất
- **Content analysis**: Phân tích nội dung comments

## 🛠️ Configuration

### Environment Variables
```env
# MongoDB connection (required for stats)
MONGODB_URI=mongodb://localhost:27017/confession_bot
```

### Permissions
- **View stats**: Admin/Moderator roles
- **React**: All users
- **Comment**: All users (in threads)

## 🚀 Future Enhancements

### Planned Features
- **Reaction leaderboards**: Top users by reactions
- **Comment analytics**: Sentiment analysis
- **Export data**: CSV/JSON export
- **Custom metrics**: User-defined statistics
- **Real-time dashboard**: Web interface for stats

### API Endpoints
```javascript
// Get reaction stats
GET /api/stats/reactions/:guildId

// Get comment stats  
GET /api/stats/comments/:guildId

// Get user engagement
GET /api/stats/engagement/:guildId
```

## 🔧 Troubleshooting

### Common Issues

#### Reactions not tracking
1. Check MongoDB connection
2. Verify bot has message reaction permissions
3. Check event handlers are loaded

#### Comments not tracking  
1. Ensure threads are properly named
2. Check bot has thread permissions
3. Verify messageCreate event is working

#### Stats showing 0
1. Check database collections exist
2. Verify aggregation queries
3. Test with sample data

### Debug Commands
```bash
# Test reaction tracking
node test-stats.js

# Check database collections
mongo confession_bot --eval "db.reactions.find()"
mongo confession_bot --eval "db.comments.find()"
```

## 📚 Examples

### Sample Reaction Data
```javascript
{
  "_id": ObjectId("..."),
  "guildId": "123456789",
  "confessionId": ObjectId("..."),
  "userId": "987654321", 
  "emoji": "❤️",
  "emojiId": null,
  "createdAt": ISODate("2024-01-15T10:30:00Z")
}
```

### Sample Comment Data
```javascript
{
  "_id": ObjectId("..."),
  "guildId": "123456789",
  "confessionId": ObjectId("..."),
  "userId": "987654321",
  "messageId": "111222333",
  "threadId": "444555666", 
  "content": "Great confession! Thanks for sharing.",
  "createdAt": ISODate("2024-01-15T10:35:00Z")
}
```

---

**Note**: Tính năng thống kê yêu cầu MongoDB và các event handlers được cấu hình đúng cách. 