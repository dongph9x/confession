# 📝 Hướng Dẫn Sử Dụng Button Confession

## 🎯 Tổng Quan
Hệ thống button confession cho phép người dùng tạo confession thông qua button và modal form, với logic xử lý giống hệt lệnh `!c`.

## 🚀 Cách Sử Dụng

### 1. Tạo Button Confession
**Lệnh:** `!createconfession`

**Quyền cần thiết:** `ManageMessages`

**Chức năng:**
- Tạo button "📝 Tạo Confession" trong channel
- Button sẽ hiển thị embed với hướng dẫn sử dụng

### 2. Sử Dụng Button
**Bước 1:** Click vào button "📝 Tạo Confession"

**Bước 2:** Modal form sẽ mở ra với 2 trường:
- **Nội dung confession:** Nhập nội dung (tối đa 2000 ký tự)
- **Loại confession:** Nhập `public` hoặc `anonymous`

**Bước 3:** Click "Submit" để gửi

### 3. Quy Trình Xử Lý (Giống lệnh !c)

#### 🔍 Validation
- ✅ Kiểm tra độ dài nội dung (10-2000 ký tự)
- ✅ Kiểm tra pending confessions
- ✅ Kiểm tra guild settings
- ✅ Kiểm tra review channel

#### 🤖 AI Analysis
- Nội dung sẽ được AI phân tích tự động
- AI sẽ đánh giá:
  - **Safety Level:** APPROPRIATE/INAPPROPRIATE
  - **Score:** 1-10 (1 = phù hợp nhất)
  - **Recommendation:** APPROVE/REJECT
  - **Content Type:** Loại nội dung
  - **Reason:** Lý do đánh giá

#### ✅ Auto-Decision Logic (Từ lệnh !c)
```javascript
if (aiAnalysis.recommendation === 'REJECT') {
    autoAction = 'reject';
} else if (aiAnalysis.recommendation === 'APPROVE' && 
           aiAnalysis.safety_level === 'APPROPRIATE' && 
           aiAnalysis.score <= 3) {
    // Chỉ auto-approve khi score <= 3 (rất phù hợp)
    autoAction = 'approve';
} else if (aiAnalysis.safety_level === 'INAPPROPRIATE' || 
           aiAnalysis.score >= 7) {
    autoAction = 'reject';
} else {
    autoAction = 'review';
}
```

**Kết quả:**
- ✅ **Auto-Approve:** Gửi thẳng đến forum với AI review
- ❌ **Auto-Reject:** Từ chối với lý do từ AI
- ⏳ **Manual Review:** Gửi đến review channel

### 4. Kết Quả

#### ✅ Khi Auto-Approve
**User nhận được:**
```
✅ Confession của bạn đã được AI tự động duyệt!
```

**Forum/Channel nhận được:**
1. **Confession Message:**
   - Tiêu đề: `📢 Confession #X`
   - Nội dung confession
   - Tác giả (công khai/ẩn danh)
   - Thời gian
   - Emoji buttons

2. **AI Review Embed:**
   - Tiêu đề: `🤖 AI Review - [Tiêu đề]`
   - Đánh giá chi tiết
   - Gợi ý cải thiện
   - Rating và tông điệu

#### ❌ Khi Auto-Reject
**User nhận được:**
```
❌ Confession của bạn đã bị từ chối vì nội dung không phù hợp.

🤖 Lý do từ AI: [Lý do]
📊 Độ nghiêm trọng: X/10
🛡️ Loại nội dung: [Loại]
```

#### ⏳ Khi Manual Review
**User nhận được:**
```
✅ Confession của bạn đã được gửi để duyệt! 
🕵️ Confession sẽ được đăng ẩn danh.
👤 Confession sẽ hiển thị tên của bạn.

Bạn sẽ được thông báo khi confession được duyệt hoặc từ chối.
```

**Review Channel nhận được:**
- Confession embed với thông tin chi tiết
- AI analysis embed
- Buttons approve/reject/edit

## 🔧 Cài Đặt

### 1. Database Schema
Hệ thống sử dụng **MongoDB** với các collection:

**GuildSettings Collection:**
```javascript
{
  guildId: String,
  confessionChannel: String,
  reviewChannel: String,
  anonymousMode: Boolean,
  prefix: String
}
```

**Confession Collection:**
```javascript
{
  _id: ObjectId,
  guildId: String,
  content: String,
  authorId: String,
  status: String, // 'pending', 'approved', 'rejected'
  isAnonymous: Boolean,
  aiAnalysis: Object,
  messageId: String,
  confessionNumber: Number,
  createdAt: Date
}
```

### 2. Thiết Lập Channels
**Lệnh setup:**
- `!setconfessionchannel #channel` - Thiết lập channel confession
- `!setreviewchannel #channel` - Thiết lập channel review

## 📋 Files Liên Quan

### Commands
- `src/message-commands/confession/createconfession.js` - Command tạo button

### Events
- `src/events/buttonInteractionCreate.js` - Xử lý button click
- `src/events/interactionCreate.js` - Xử lý modal submission

### Utils
- `src/utils/aiContentAnalyzer.js` - AI analysis và review
- `src/utils/forumChannel.js` - Forum channel utilities
- `src/utils/emojiButtons.js` - Emoji button system
- `src/data/mongodb.js` - MongoDB database operations

## 🎨 Features

### ✅ Đã Hoàn Thành
- ✅ Button tạo confession
- ✅ Modal form với 2 trường input
- ✅ Validation đầy đủ (giống !c)
- ✅ AI analysis tự động
- ✅ Auto-approve/reject logic (giống !c)
- ✅ Forum channel support
- ✅ Text channel fallback
- ✅ AI review embed
- ✅ Emoji buttons
- ✅ Error handling đầy đủ
- ✅ Logging chi tiết

### 🔄 Workflow
1. **User click button** → Modal mở
2. **User nhập nội dung** → Submit
3. **Validation** → Kiểm tra độ dài, pending confessions
4. **AI phân tích** → Quyết định auto-approve/reject
5. **Gửi kết quả** → User nhận thông báo
6. **Auto-approve** → Gửi đến forum với AI review
7. **Manual review** → Gửi đến review channel

## 🚨 Lưu Ý

### Quyền Cần Thiết
- **Tạo button:** `ManageMessages`
- **Sử dụng button:** Tất cả users

### Giới Hạn
- **Nội dung:** Tối đa 2000 ký tự, tối thiểu 10 ký tự
- **Loại confession:** `public` hoặc `anonymous`
- **AI API:** Cần OpenAI API key (có fallback)

### Error Handling
- ✅ Modal creation errors
- ✅ Database errors
- ✅ AI analysis errors
- ✅ Channel sending errors
- ✅ Permission errors
- ✅ Validation errors

## 🎯 So Sánh Với Lệnh !c

| Tính Năng | Button Confession | Lệnh !c |
|-----------|------------------|---------|
| **Cách sử dụng** | Click button → Modal | Gõ lệnh |
| **Validation** | ✅ Giống hệt | ✅ |
| **AI Analysis** | ✅ Giống hệt | ✅ |
| **Auto-Decision** | ✅ Giống hệt | ✅ |
| **Forum Support** | ✅ Giống hệt | ✅ |
| **Error Handling** | ✅ Giống hệt | ✅ |
| **User Experience** | 🎨 Tốt hơn | 📝 Cơ bản |

## 🎯 Kết Luận

Hệ thống button confession đã được thiết kế để:
- **Tương thích:** Sử dụng logic giống hệt lệnh `!c`
- **Thân thiện:** UI/UX tốt hơn với button và modal
- **Thông minh:** AI tự động kiểm tra và đánh giá
- **Nhanh chóng:** Auto-approve cho nội dung phù hợp
- **An toàn:** Từ chối nội dung không phù hợp
- **Chuyên nghiệp:** AI review với gợi ý cải thiện

**🎉 Sẵn sàng sử dụng với logic giống hệt lệnh !c!** 