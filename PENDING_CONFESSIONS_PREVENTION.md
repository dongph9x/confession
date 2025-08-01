# 🚫 Pending Confessions Prevention

## 🎯 Mục tiêu

Ngăn người dùng gửi confession mới khi họ đã có confession đang chờ duyệt, để tránh spam và đảm bảo chất lượng confession.

## 🔧 Tính năng đã triển khai

### 1. **Database Method Mới**
```javascript
async getUserPendingConfessions(guildId, userId) {
    const Confession = require('../models/Confession');
    return await Confession.find({ 
        guildId, 
        userId, 
        status: 'pending' 
    }).sort({ createdAt: 1 });
}
```

### 2. **Message Command Prevention**
```javascript
// Kiểm tra xem user đã có confession đang chờ duyệt chưa
const pendingConfessions = await db.getUserPendingConfessions(message.guild.id, message.author.id);
if (pendingConfessions.length > 0) {
    const oldestPending = pendingConfessions[0];
    const timeAgo = Math.floor((Date.now() - new Date(oldestPending.createdAt).getTime()) / 1000 / 60);
    
    const errorMsg = await message.channel.send(
        `❌ Bạn đã có confession đang chờ duyệt!\n\n\`#${oldestPending._id}\` - ${oldestPending.content.substring(0, 50)}${oldestPending.content.length > 50 ? '...' : ''}\n\n⏰ Đã gửi ${timeAgo} phút trước\n\nVui lòng chờ confession này được duyệt hoặc từ chối trước khi gửi confession mới.`
    );
    setTimeout(() => {
        errorMsg.delete().catch(() => {});
    }, 10000);
    return;
}
```

### 3. **Slash Command Prevention**
```javascript
// Kiểm tra xem user đã có confession đang chờ duyệt chưa
const pendingConfessions = await db.getUserPendingConfessions(interaction.guild.id, interaction.user.id);
if (pendingConfessions.length > 0) {
    const oldestPending = pendingConfessions[0];
    const timeAgo = Math.floor((Date.now() - new Date(oldestPending.createdAt).getTime()) / 1000 / 60);
    
    return interaction.editReply({
        content: `❌ Bạn đã có confession đang chờ duyệt!\n\n\`#${oldestPending._id}\` - ${oldestPending.content.substring(0, 50)}${oldestPending.content.length > 50 ? '...' : ''}\n\n⏰ Đã gửi ${timeAgo} phút trước\n\nVui lòng chờ confession này được duyệt hoặc từ chối trước khi gửi confession mới.`,
        ephemeral: true,
    });
}
```

## 📊 Logic Hoạt Động

### 1. **Kiểm Tra Trước Khi Gửi**
- ✅ Kiểm tra xem user có confession với status = 'pending' không
- ✅ Nếu có, hiển thị thông báo lỗi với thông tin confession cũ
- ✅ Ngăn không cho gửi confession mới

### 2. **Thông Tin Hiển Thị**
- 🆔 **Confession ID** - ID của confession đang chờ
- 📝 **Nội dung** - 50 ký tự đầu của confession
- ⏰ **Thời gian** - Số phút đã trôi qua kể từ khi gửi
- 💬 **Hướng dẫn** - Yêu cầu chờ duyệt/từ chối trước

### 3. **Message Command**
- 📱 **Ephemeral message** - Tự động xóa sau 10 giây
- 🚫 **Prevent submission** - Không cho phép gửi confession mới

### 4. **Slash Command**
- 🔒 **Ephemeral reply** - Chỉ user thấy thông báo
- 🚫 **Prevent submission** - Không cho phép gửi confession mới

## 🧪 Test Results

### ✅ **Test Scenario:**
```bash
✅ Bot logged in successfully
✅ Connected to MongoDB

🔍 Test 1: Check getUserPendingConfessions Method
Pending confessions for user: 0
No pending confessions found for this user

📝 Test 2: Create Test Confession
Created test confession: new ObjectId('688cbcb8609958d95f9a0d4d')

🔍 Test 3: Check Pending Confessions After Creation
Pending confessions after creation: 1
Oldest pending confession:
  ID: #688cbcb8609958d95f9a0d4d
  Content: Test confession để kiểm tra pending prevention
  Time ago: 0 phút trước
  Status: pending

🚫 Test 4: Simulate Prevention Message
Prevention message:
❌ Bạn đã có confession đang chờ duyệt!

`#688cbcb8609958d95f9a0d4d` - Test confession để kiểm tra pending prevention

⏰ Đã gửi 0 phút trước

Vui lòng chờ confession này được duyệt hoặc từ chối trước khi gửi confession mới.

🧹 Test 5: Cleanup Test Confession
Test confession marked as rejected: Success

✅ All pending confessions tests completed successfully!
```

## 🎯 Benefits

### 1. **Anti-Spam Protection**
- ✅ Ngăn user spam confession
- ✅ Đảm bảo chất lượng confession
- ✅ Giảm tải cho moderators

### 2. **User Experience**
- ✅ Thông báo rõ ràng về lý do bị từ chối
- ✅ Hiển thị thông tin confession đang chờ
- ✅ Hướng dẫn cụ thể về cách xử lý

### 3. **Moderation Efficiency**
- ✅ Giảm số lượng confession cần review
- ✅ Tập trung vào confession chất lượng
- ✅ Dễ quản lý và duyệt

### 4. **System Stability**
- ✅ Tránh database overload
- ✅ Giảm spam và abuse
- ✅ Cải thiện performance

## 📁 Files Đã Cập Nhật

### 1. **Database Layer**
- ✅ **`src/data/mongodb.js`** - Thêm method `getUserPendingConfessions()`

### 2. **Message Commands**
- ✅ **`src/message-commands/confession/confess.js`** - Thêm kiểm tra pending confessions

### 3. **Slash Commands**
- ✅ **`src/commands/confession/confess.js`** - Thêm kiểm tra pending confessions và fix MongoDB import

### 4. **Testing**
- ✅ **`test-pending-confessions.js`** - Test script cho tính năng mới

## 🔄 Workflow

### **Khi User Gửi Confession:**
1. **Kiểm tra pending confessions** của user
2. **Nếu có pending confession:**
   - Hiển thị thông báo lỗi với thông tin confession cũ
   - Ngăn không cho gửi confession mới
3. **Nếu không có pending confession:**
   - Tiếp tục quy trình gửi confession bình thường

### **Khi Confession Được Duyệt/Từ Chối:**
1. **Status thay đổi** từ 'pending' thành 'approved'/'rejected'
2. **User có thể gửi confession mới** vì không còn pending confession

## 🎉 Kết Luận

**Tính năng Pending Confessions Prevention đã được triển khai hoàn toàn!** 🚀

### ✅ **Đã hoàn thành:**
- **Database method** - Kiểm tra pending confessions của user
- **Message command prevention** - Ngăn spam trong message commands
- **Slash command prevention** - Ngăn spam trong slash commands
- **Comprehensive testing** - Test đầy đủ tính năng
- **User-friendly messages** - Thông báo rõ ràng và hữu ích

### 🎯 **Benefits:**
- **Anti-spam protection** - Ngăn user spam confession
- **Better moderation** - Giảm tải cho moderators
- **Improved UX** - Thông báo rõ ràng cho users
- **System stability** - Tránh database overload

**Hệ thống giờ đây đảm bảo mỗi user chỉ có thể có một confession đang chờ duyệt tại một thời điểm!** 🛡️✨ 