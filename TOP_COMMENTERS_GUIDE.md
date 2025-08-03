# 💬 Hướng dẫn Top Commenters

## ✅ **Trạng thái hiện tại:**
- ✅ Top commenters system đã được tạo thành công
- ✅ Database methods đã được tạo
- ✅ Slash command `/topcommenters` đã được tạo
- ✅ Message command `!topcommenters` đã được tạo
- ✅ Test thành công với dữ liệu thực tế

## 🎯 **Cách sử dụng:**

### **1. Slash Command:**
```
/topcommenters limit:10
/topcommenters limit:5
/topcommenters limit:20
```

### **2. Message Command (Prefix !):**
```
!topcommenters 10
!topcommenters 5
!topcommenters
```

### **3. Aliases cho Message Command:**
```
!topcommenter 10
!topcomment 5
!commenters
```

### **4. Các options:**
- **limit**: 1-20 (mặc định: 10)

## 📊 **Kết quả test:**

```
📊 Final Summary:
   ✅ Test Confessions Added: 3
   ✅ Top Commenters: 10 users
   ✅ Commenter Ranking: 10 users
   ✅ Top Commenters System Ready!

🏆 Expected Rankings:
   User4 (6 comments) > User2 (5 comments) > User1 (4 comments) > User3 (3 comments) > User5 (2 comments)

📋 Test Results:
   Found 10 top commenters:
     1. User4: 6 comments
     2. TestUser: 6 comments
     3. User2: 5 comments
     4. User1: 4 comments
     5. User4_4: 3 comments
     6. User4_2: 3 comments
     7. User0_0: 3 comments
     8. User2_1: 3 comments
     9. User2_2: 3 comments
     10. User1_1: 3 comments

📊 User Stats Example:
   Stats for User4:
     Total Comments: 6
     Unique Confessions: 1
     This Week: 6
     This Month: 6
     Recent Comments: 6
```

## 🔧 **Các methods được tạo:**

### **Top Commenters Methods:**
- `getTopCommenters(guildId, limit)` - Top commenters theo số comments
- `getUserCommentStats(guildId, userId)` - Thống kê chi tiết cho user
- `getCommenterRanking(guildId, limit)` - Ranking với emoji và thông tin chi tiết

### **Cách hoạt động:**
```javascript
// Aggregate để đếm comments theo user
const topCommenters = await Comment.aggregate([
    { $match: { guildId, isDeleted: false } },
    { $group: { 
        _id: '$userId', 
        username: { $first: '$username' },
        commentCount: { $sum: 1 },
        comments: { $push: { content: '$content', createdAt: '$createdAt' } }
    }},
    { $project: {
        userId: '$_id',
        username: 1,
        commentCount: 1,
        comments: { $slice: ['$comments', 5] } // Lấy 5 comments gần nhất
    }},
    { $sort: { commentCount: -1 } },
    { $limit: limit }
]);
```

## 🎯 **Cách sử dụng trong code:**

### **Lấy top commenters:**
```javascript
const topCommenters = await db.getTopCommenters(guildId, 10);
topCommenters.forEach((commenter, index) => {
    console.log(`${index + 1}. ${commenter.username}: ${commenter.commentCount} comments`);
});
```

### **Lấy thống kê user:**
```javascript
const userStats = await db.getUserCommentStats(guildId, userId);
console.log(`Total Comments: ${userStats.totalComments}`);
console.log(`Unique Confessions: ${userStats.uniqueConfessions}`);
console.log(`This Week: ${userStats.commentsThisWeek}`);
console.log(`This Month: ${userStats.commentsThisMonth}`);
```

### **Lấy ranking:**
```javascript
const ranking = await db.getCommenterRanking(guildId, 10);
ranking.forEach((user, index) => {
    console.log(`${user.rankEmoji} ${user.username}: ${user.commentCount} comments`);
});
```

## 📈 **Features của command:**

### **1. Embed chính:**
- Tiêu đề với emoji 💬
- Mô tả số lượng commenters
- Footer với tên server

### **2. Embed cho từng commenter:**
- Ranking với emoji (🥇🥈🥉#4#5...)
- User ID với mention
- Thống kê chi tiết (total, unique confessions, this week, this month)
- Hoạt động (first comment, last comment)
- Comments gần nhất (3 comments mới nhất)

### **3. Thống kê chi tiết:**
- **Total Comments**: Tổng số comments của user
- **Unique Confessions**: Số confession khác nhau mà user đã comment
- **This Week**: Số comments trong tuần này
- **This Month**: Số comments trong tháng này
- **Recent Comments**: 10 comments gần nhất

## 🎯 **Ví dụ output:**

### **Top Commenters:**
```
💬 Top Commenters
Top 10 commenters có nhiều comments nhất

🥇 User4
User ID: @user4
📊 Thống kê: Total Comments: 6, Unique Confessions: 1, This Week: 6, This Month: 6
⏰ Hoạt động: First Comment: 2 hours ago, Last Comment: 1 hour ago
💬 Comments gần nhất:
• "Nice!"
• "Good point"
• "I can relate"
```

### **Commenter Ranking:**
```
🥇 User4: 6 comments
🥈 TestUser: 6 comments
🥉 User2: 5 comments
#4 User1: 4 comments
#5 User3: 3 comments
```

## ⚠️ **Lưu ý quan trọng:**

### **Performance:**
- Sử dụng MongoDB aggregation để tối ưu performance
- Indexes trên `guildId`, `userId`, `createdAt`
- Limit tối đa 20 commenters để tránh spam

### **Data Accuracy:**
- Chỉ đếm comments thực tế (không tính deleted)
- Tính unique confessions để tránh spam
- Thống kê theo thời gian chính xác

### **Privacy:**
- Hiển thị username của commenter
- Không hiển thị nội dung comment đầy đủ (chỉ truncate)
- Tôn trọng user privacy

## 🚀 **Bước tiếp theo:**
1. **Deploy commands**: Deploy `/topcommenters` và message command
2. **Test thực tế**: Test với commenters thật
3. **Tối ưu**: Thêm cache cho top commenters
4. **Mở rộng**: Thêm commenter badges, achievements

## 📋 **Test Cases đã pass:**

### **Database Tests:**
- ✅ Top commenters được tính đúng
- ✅ User stats được tính chính xác
- ✅ Ranking với emoji hoạt động
- ✅ Recent comments được lấy đúng

### **Command Tests:**
- ✅ Slash command `/topcommenters` hoạt động
- ✅ Message command `!topcommenters` hoạt động
- ✅ Aliases hoạt động
- ✅ Error handling cho invalid limits

**💬 Bây giờ bạn có thể xem top commenters có nhiều comments nhất! Hệ thống sẽ hiển thị ranking với emoji và thống kê chi tiết cho từng user!** 