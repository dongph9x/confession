# 🤖 AI Detailed Rejection Message

## **📋 Cải thiện:**
- Thêm thông báo chi tiết cho user khi confession bị AI từ chối
- Hiển thị lý do cụ thể từ AI analysis
- Hiển thị độ nghiêm trọng và loại nội dung

## **🔧 Thay đổi:**

### **Trước cải thiện:**
```javascript
userMessage = "❌ Confession của bạn đã bị từ chối vì nội dung không phù hợp.";
```

### **Sau cải thiện:**
```javascript
userMessage = `❌ Confession của bạn đã bị từ chối vì nội dung không phù hợp.

🤖 **Lý do từ AI:** ${aiAnalysis.reason}
📊 **Độ nghiêm trọng:** ${aiAnalysis.score}/10
🛡️ **Loại nội dung:** ${aiAnalysis.content_type}`;
```

## **📊 Ví dụ thông báo:**

### **Nội dung chửi bới:**
```
❌ Confession của bạn đã bị từ chối vì nội dung không phù hợp.

🤖 **Lý do từ AI:** Nội dung chứa từ ngữ xúc phạm và chửi bới đến admin, không tôn trọng
📊 **Độ nghiêm trọng:** 9/10
🛡️ **Loại nội dung:** INSULT
```

### **Nội dung bạo lực:**
```
❌ Confession của bạn đã bị từ chối vì nội dung không phù hợp.

🤖 **Lý do từ AI:** Nội dung mô tả bạo lực và hành vi đe dọa, không phù hợp.
📊 **Độ nghiêm trọng:** 9/10
🛡️ **Loại nội dung:** VIOLENT
```

## **🎯 Lợi ích:**

### **Cho User:**
- ✅ Biết chính xác lý do bị từ chối
- ✅ Hiểu độ nghiêm trọng của nội dung
- ✅ Có thể cải thiện nội dung cho lần sau
- ✅ Minh bạch trong quá trình kiểm duyệt

### **Cho Admin:**
- ✅ User hiểu rõ quy tắc
- ✅ Giảm số lượng confession không phù hợp
- ✅ Tăng chất lượng nội dung
- ✅ Giảm công việc review

## **🛡️ Bảo vệ hoàn hảo:**

### **Thông báo chi tiết cho:**
- ✅ Nội dung chửi bới, xúc phạm
- ✅ Nội dung bạo lực, đe dọa
- ✅ Nội dung spam, không có ý nghĩa
- ✅ Nội dung quấy rối, harassment
- ✅ Nội dung explicit, nhạy cảm

### **Thông tin hiển thị:**
- ✅ Lý do cụ thể từ AI
- ✅ Độ nghiêm trọng (score/10)
- ✅ Loại nội dung (INSULT, VIOLENT, etc.)
- ✅ Khuyến nghị hành động

## **📈 Kết quả:**

### **Trước cải thiện:**
- User nhận: "❌ Confession của bạn đã bị từ chối vì nội dung không phù hợp."
- ❌ Không biết lý do cụ thể
- ❌ Không biết độ nghiêm trọng
- ❌ Không biết loại nội dung

### **Sau cải thiện:**
- User nhận: Thông báo chi tiết với lý do, độ nghiêm trọng, loại nội dung
- ✅ Biết chính xác lý do bị từ chối
- ✅ Hiểu độ nghiêm trọng của nội dung
- ✅ Có thể cải thiện cho lần sau

## **🔍 Monitoring:**
- Sử dụng `docker compose logs discord-bot | grep "🤖"` để xem AI logs
- Sử dụng `/aiinfo <confession_id>` để xem chi tiết AI analysis
- Sử dụng `/aistats` để xem thống kê AI

---

**🎯 Kết quả:** User giờ nhận được thông báo chi tiết và minh bạch khi confession bị từ chối! 