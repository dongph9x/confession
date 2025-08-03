# 💡 Confession Reminder System

## **📋 Vấn đề:**
- User có thể quên dùng `!confess` và chỉ gửi nội dung trực tiếp
- Confession channel bị spam với nội dung không đúng format
- User không biết cách sử dụng lệnh confession đúng cách

## **🔧 Giải pháp:**
Tạo hệ thống tự động phát hiện và nhắc nhở user sử dụng `!confess`

## **🎯 Logic hoạt động:**

### **1. Phát hiện confession tiềm năng:**
```javascript
// Kiểm tra xem có phải confession channel không
if (message.channel.id !== confessionChannel.id) return;

// Bỏ qua nếu message bắt đầu bằng prefix hoặc slash command
if (message.content.startsWith(config.prefix) || message.content.startsWith('/')) return;

// Kiểm tra độ dài message (có thể là confession)
if (message.content.length < 10 || message.content.length > 2000) return;

// Kiểm tra xem có phải confession thật sự không
const words = message.content.split(' ').filter(word => word.length > 0);
if (words.length < 3) return; // Ít nhất 3 từ

// Kiểm tra xem có quá nhiều emoji không
const emojiCount = (message.content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length;
if (emojiCount > 5) return; // Quá nhiều emoji
```

### **2. Tạo embed nhắc nhở:**
```javascript
const reminderEmbed = new EmbedBuilder()
    .setColor(0xFFA500)
    .setTitle("💡 Nhắc nhở sử dụng lệnh Confession")
    .setDescription(`Bạn có vẻ muốn gửi confession! Hãy sử dụng lệnh \`!confess\` để gửi confession đúng cách.`)
    .addFields(
        { name: "📝 Cách sử dụng", value: "`!confess nội dung` - Gửi confession bình thường\n`!confess anonymous nội dung` - Gửi confession ẩn danh", inline: false },
        { name: "🤖 AI Kiểm duyệt", value: "Confession sẽ được AI kiểm tra tự động để đảm bảo nội dung phù hợp", inline: false },
        { name: "⏰ Tự động xóa", value: "Tin nhắn này sẽ tự động xóa sau 10 giây", inline: false }
    )
    .setTimestamp();
```

### **3. Xử lý tự động:**
```javascript
// Xóa message gốc
await message.delete();

// Gửi embed nhắc nhở
const reminderMsg = await message.channel.send({
    content: `<@${message.author.id}>`,
    embeds: [reminderEmbed]
});

// Tự động xóa sau 10 giây
setTimeout(async () => {
    await reminderMsg.delete();
}, 10000);
```

## **📊 Kết quả:**

### **Trước khi có reminder:**
1. User gửi: "Tôi muốn chia sẻ về một ngày buồn của mình"
2. **❌ Message vẫn ở lại trong channel**
3. **❌ Không có AI kiểm tra**
4. **❌ Không có review process**

### **Sau khi có reminder:**
1. User gửi: "Tôi muốn chia sẻ về một ngày buồn của mình"
2. **✅ Message bị xóa ngay lập tức**
3. **✅ Bot gửi embed nhắc nhở với hướng dẫn**
4. **✅ User được mention và hướng dẫn cách sử dụng**
5. **✅ Reminder tự động xóa sau 10 giây**

## **🛡️ Bảo vệ thông minh:**

### **Chỉ kích hoạt khi:**
- ✅ Message trong confession channel
- ✅ Độ dài 10-2000 ký tự
- ✅ Ít nhất 3 từ
- ✅ Không quá 5 emoji
- ✅ Không bắt đầu bằng prefix hoặc slash command

### **Bỏ qua khi:**
- ❌ Bot messages
- ❌ DM messages
- ❌ Messages quá ngắn hoặc quá dài
- ❌ Spam (quá nhiều emoji)
- ❌ Commands (bắt đầu bằng prefix)

## **🎯 Lợi ích:**

### **Cho User:**
- ✅ Được hướng dẫn cách sử dụng đúng
- ✅ Biết về AI kiểm duyệt
- ✅ Hiểu về chế độ ẩn danh
- ✅ Tránh spam channel

### **Cho Admin:**
- ✅ Channel sạch sẽ, không spam
- ✅ User tự động học cách sử dụng
- ✅ Giảm công việc quản lý
- ✅ Tăng chất lượng confession

### **Cho Bot:**
- ✅ Tất cả confession đều qua AI
- ✅ Tất cả confession đều có review process
- ✅ Channel luôn sạch sẽ
- ✅ User experience tốt hơn

## **🔍 Monitoring:**
- Sử dụng `docker compose logs discord-bot | grep "reminder"` để xem reminder logs
- Kiểm tra confession channel để đảm bảo không có spam
- Theo dõi số lượng reminder để đánh giá hiệu quả

---

**🎯 Kết quả:** User giờ được nhắc nhở thông minh và tự động học cách sử dụng confession đúng cách! 