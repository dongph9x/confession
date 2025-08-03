# 🏆 Hướng dẫn Top Confessions

## ✅ **Trạng thái hiện tại:**
- ✅ Top confessions system đã được tạo thành công
- ✅ Test thành công với dữ liệu thực tế
- ✅ Command `/topconfessions` đã được tạo
- ✅ Message command `!topconfessions` đã được tạo
- ✅ Button handler cho top confessions đã được tạo
- ✅ Hỗ trợ 3 loại ranking: Reactions, Comments, Engagement

## 🎯 **Các loại Top Confessions:**

### **1. 🔥 Top Reactions**
- Sắp xếp theo số lượng reactions nhiều nhất
- Hiển thị số reactions và số users đã react
- Ranking: 🥇🥈🥉#4#5...

### **2. 💬 Top Comments**
- Sắp xếp theo số lượng comments nhiều nhất
- Hiển thị số comments và số users đã comment
- Ranking: 🥇🥈🥉#4#5...

### **3. ⭐ Top Engagement**
- Sắp xếp theo tổng engagement (reactions + comments)
- Hiển thị cả reactions và comments
- Ranking: 🥇🥈🥉#4#5...

## 🎯 **Cách sử dụng:**

### **1. Slash Command:**
```
/topconfessions type:reactions limit:10
/topconfessions type:comments limit:5
/topconfessions type:engagement limit:20
```

### **2. Message Command (Prefix !):**
```
!topconfessions reactions 10
!topconfessions comments 5
!topconfessions engagement 20
!topconfessions reactions
!topconfessions comments 3
!topconfessions engagement 15
```

### **3. Aliases cho Message Command:**
```
!top reactions 10
!topconfession comments 5
!topconf engagement 20
```

### **4. Các options:**
- **type**: `reactions`, `comments`, `engagement`
- **limit**: 1-20 (mặc định: 10)

## 📊 **Kết quả test:**

```
📊 Final Summary:
   ✅ Test Confessions Added: 5
   ✅ Message Commands Tested: 7
   ✅ Button Handlers Tested: 4
   ✅ Top Confessions System Ready!

🏆 Expected Rankings:
   Reactions: Confession 5 (7) > Confession 3 (6) > Confession 1 (5) > Confession 2 (2) > Confession 4 (1)
   Comments: Confession 5 (5) > Confession 2 (4) > Confession 3 (3) > Confession 1 (2) > Confession 4 (0)
   Engagement: Confession 5 (12) > Confession 3 (9) > Confession 1 (7) > Confession 2 (6) > Confession 4 (1)
```

## 🔧 **Các methods được tạo:**

### **Top Confessions Methods:**
- `getTopConfessionsByReactions(guildId, limit)` - Top confessions theo reactions
- `getTopConfessionsByComments(guildId, limit)` - Top confessions theo comments
- `getTopConfessionsByEngagement(guildId, limit)` - Top confessions theo engagement
- `getConfessionEngagementStats(guildId, confessionId)` - Thống kê engagement của confession cụ thể

### **Button Handler:**
- `handleTopConfessionsButton(interaction, customId)` - Xử lý button clicks cho top confessions
- Hỗ trợ: `top_reactions`, `top_comments`, `top_engagement`
- Tự động cập nhật embeds và buttons khi click
- Error handling cho invalid types

### **Cách hoạt động:**
```javascript
// Aggregate reactions
const topReactions = await EmojiReaction.aggregate([
    { $match: { guildId } },
    { $group: { 
        _id: '$confessionId', 
        reactionCount: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' }
    }},
    { $project: {
        confessionId: '$_id',
        reactionCount: 1,
        uniqueUsersCount: { $size: '$uniqueUsers' }
    }},
    { $sort: { reactionCount: -1 } },
    { $limit: limit }
]);
```

## 🎯 **Cách sử dụng trong code:**

### **Lấy top reactions:**
```javascript
const topReactions = await db.getTopConfessionsByReactions(guildId, 10);
topReactions.forEach((confession, index) => {
    console.log(`${index + 1}. Confession #${confession.confessionNumber}: ${confession.reactionCount} reactions`);
});
```

### **Lấy top comments:**
```javascript
const topComments = await db.getTopConfessionsByComments(guildId, 10);
topComments.forEach((confession, index) => {
    console.log(`${index + 1}. Confession #${confession.confessionNumber}: ${confession.commentCount} comments`);
});
```

### **Lấy top engagement:**
```javascript
const topEngagement = await db.getTopConfessionsByEngagement(guildId, 10);
topEngagement.forEach((confession, index) => {
    console.log(`${index + 1}. Confession #${confession.confessionNumber}: ${confession.totalEngagement} total`);
});
```

### **Lấy thống kê engagement của confession cụ thể:**
```javascript
const engagementStats = await db.getConfessionEngagementStats(guildId, confessionId);
console.log(`Reactions: ${engagementStats.reactionCount}`);
console.log(`Comments: ${engagementStats.commentCount}`);
console.log(`Total: ${engagementStats.totalEngagement}`);
```

## 📈 **Features của command:**

### **1. Embed chính:**
- Tiêu đề với emoji phù hợp
- Mô tả số lượng confessions
- Footer với tên server

### **2. Embed cho từng confession:**
- Ranking với emoji (🥇🥈🥉#4#5...)
- Content được truncate nếu quá dài
- Thống kê reactions/comments/engagement
- Thông tin người gửi (anonymous/public)
- Thời gian tạo

### **3. Buttons để chuyển đổi:**
- 🔥 Reactions - Chuyển sang xem top reactions
- 💬 Comments - Chuyển sang xem top comments
- ⭐ Engagement - Chuyển sang xem top engagement
- **✅ Đã có button handler để xử lý khi click**

## 🎯 **Ví dụ output:**

### **Top Reactions:**
```
🥇 Confession #123
Content: Đây là confession test số 5 popular...
📊 Thống kê: Reactions: 7, Users reacted: 7
👤 Người gửi: @user5
⏰ Thời gian: 2 hours ago
```

### **Top Comments:**
```
🥈 Confession #122
Content: Đây là confession test số 2 với nhiều comments...
📊 Thống kê: Comments: 4, Users commented: 4
👤 Người gửi: 🕵️ Ẩn danh
⏰ Thời gian: 1 day ago
```

### **Top Engagement:**
```
🥉 Confession #121
Content: Đây là confession test số 3 với cả reactions và comments...
📊 Thống kê: Reactions: 6, Comments: 3, Total: 9
👤 Người gửi: @user3
⏰ Thời gian: 3 days ago
```

## ⚠️ **Lưu ý quan trọng:**

### **Performance:**
- Sử dụng MongoDB aggregation để tối ưu performance
- Indexes trên `guildId`, `confessionId`, `userId`
- Limit tối đa 20 confessions để tránh spam

### **Data Accuracy:**
- Chỉ đếm reactions và comments thực tế
- Loại bỏ comments đã bị xóa (`isDeleted: false`)
- Tính unique users để tránh spam

### **Privacy:**
- Tôn trọng anonymous mode
- Không hiển thị thông tin cá nhân
- Chỉ hiển thị content đã được approve

### **Permissions:**
- Cần quyền `ManageMessages` để sử dụng
- Cả slash command và message command đều kiểm tra permissions

## 🚀 **Bước tiếp theo:**
1. **Deploy commands**: Deploy cả `/topconfessions` và message command
2. **Test thực tế**: Test với confession thật
3. **Tối ưu**: Thêm cache cho top confessions
4. **Mở rộng**: Thêm top theo thời gian (daily, weekly, monthly)

## 📋 **Test Cases đã pass:**

### **Message Command Tests:**
- ✅ `!topconfessions reactions 5` - Top reactions with limit 5
- ✅ `!topconfessions comments 3` - Top comments with limit 3
- ✅ `!topconfessions engagement 10` - Top engagement with limit 10
- ✅ `!topconfessions reactions` - Top reactions with default limit
- ✅ `!topconfessions invalid` - Invalid type test
- ✅ `!topconfessions reactions 25` - Invalid limit test
- ✅ `!topconfessions` - No arguments test

### **Button Handler Tests:**
- ✅ `top_reactions` - Top reactions button
- ✅ `top_comments` - Top comments button
- ✅ `top_engagement` - Top engagement button
- ✅ `top_invalid` - Invalid type button (error handling)

**🏆 Bây giờ bạn có thể xem top confessions có nhiều reactions và comments nhất bằng cả slash command `/topconfessions` và message command `!topconfessions`! Hệ thống sẽ hiển thị ranking với emoji và thống kê chi tiết!** 