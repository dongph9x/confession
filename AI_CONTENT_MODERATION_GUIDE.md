# 🤖 AI Content Moderation Guide - Confession Bot

## **📋 Tổng quan**

Tích hợp ChatGPT để tự động kiểm duyệt nội dung confession trước khi gửi cho admin review, giúp giảm tải công việc cho admin và đảm bảo chất lượng nội dung.

## **🔧 Tính năng AI Moderation**

### **1. Tự động phân tích nội dung:**
- **Safety Level:** APPROPRIATE / INAPPROPRIATE / FLAG_FOR_REVIEW
- **Content Type:** NORMAL / SENSITIVE / EXPLICIT / VIOLENT / HARASSMENT
- **Score:** 1-10 (điểm đánh giá)
- **Recommendation:** APPROVE / REJECT / FLAG
- **Confidence:** 0.0-1.0 (độ tin cậy)

### **2. Tự động xử lý:**
- ✅ **Auto-approve:** Nội dung phù hợp (APPROPRIATE + APPROVE)
- 🚫 **Auto-reject:** Nội dung không phù hợp (REJECT)
- ⚠️ **Flag for review:** Nội dung cần review thêm (FLAG_FOR_REVIEW)

### **3. AI Analysis Embed:**
- 📊 Hiển thị kết quả phân tích AI
- 🤖 Nút "AI Reject" cho nội dung không phù hợp
- 💾 Lưu trữ kết quả AI vào database

## **🚀 Setup**

### **1. Cài đặt OpenAI API Key:**

```bash
# Thêm vào file .env
OPENAI_API_KEY=your_openai_api_key_here
```

### **2. Lấy OpenAI API Key:**
1. Truy cập [OpenAI Platform](https://platform.openai.com/)
2. Tạo account và verify
3. Vào **API Keys** → **Create new secret key**
4. Copy key và paste vào `.env`

### **3. Restart Bot:**
```bash
docker compose restart discord-bot
```

## **📝 Cách hoạt động**

### **1. Khi user gửi confession:**
```
/confess noidung:"Nội dung confession"
```

### **2. Quy trình xử lý:**
1. **User gửi confession** → Bot nhận
2. **AI phân tích** → ChatGPT đánh giá nội dung
3. **Tự động xử lý:**
   - **Auto-approve:** Nội dung phù hợp → Gửi thẳng đến confession channel
   - **Auto-reject:** Nội dung không phù hợp → Từ chối ngay
   - **Flag for review:** Nội dung cần review → Gửi cho admin review
4. **Thông báo cho user** → Kết quả AI analysis

### **3. AI Analysis Embed:**
```
🤖 AI Analysis: APPROPRIATE
Score: 2/10
Type: NORMAL
Reason: Nội dung phù hợp, không có vấn đề
Recommendation: APPROVE
Confidence: 95.2%
```

## **⚙️ Cấu hình AI**

### **1. Model Settings:**
```javascript
model: "gpt-3.5-turbo"
temperature: 0.3  // Độ chính xác cao
max_tokens: 500   // Giới hạn response
```

### **2. Safety Levels:**
- **APPROPRIATE:** ✅ Nội dung phù hợp
- **FLAG_FOR_REVIEW:** ⚠️ Cần review thêm
- **INAPPROPRIATE:** 🚫 Nội dung không phù hợp

### **3. Content Types:**
- **NORMAL:** Nội dung bình thường
- **SENSITIVE:** Nội dung nhạy cảm
- **EXPLICIT:** Nội dung rõ ràng không phù hợp
- **VIOLENT:** Bạo lực
- **HARASSMENT:** Quấy rối

## **🔍 Database Schema**

### **Confession Model:**
```javascript
aiAnalysis: {
    safety_level: String,    // APPROPRIATE/INAPPROPRIATE/FLAG_FOR_REVIEW
    content_type: String,    // NORMAL/SENSITIVE/EXPLICIT/VIOLENT/HARASSMENT
    score: Number,           // 1-10
    reason: String,          // Lý do đánh giá
    recommendation: String,  // APPROVE/REJECT/FLAG
    confidence: Number,      // 0.0-1.0
    analyzedAt: Date        // Thời gian phân tích
}
```

## **📊 Monitoring**

### **1. Logs:**
```bash
# Xem logs AI analysis
docker compose logs discord-bot | grep "🤖"
```

### **2. Error Handling:**
- AI API error → Fallback to manual review
- Parse error → Log và bỏ qua AI
- Timeout → Continue without AI

## **🛠️ Troubleshooting**

### **1. AI không hoạt động:**
```bash
# Kiểm tra API key
echo $OPENAI_API_KEY

# Kiểm tra logs
docker compose logs discord-bot | grep "AI"
```

### **2. AI Analysis Failed:**
- Kiểm tra OpenAI API key
- Kiểm tra internet connection
- Kiểm tra OpenAI account balance

### **3. Performance Issues:**
- AI analysis có thể mất 2-5 giây
- Sử dụng `deferReply()` để tránh timeout
- Có thể disable AI nếu cần

## **🔒 Privacy & Security**

### **1. Data Handling:**
- Nội dung confession được gửi đến OpenAI
- Không lưu trữ dữ liệu cá nhân
- Tuân thủ OpenAI Privacy Policy

### **2. Rate Limiting:**
- OpenAI có rate limits
- Bot có error handling cho rate limits
- Fallback to manual review

## **📈 Future Enhancements**

### **1. Advanced Features:**
- Custom AI prompts per guild
- AI training on guild-specific content
- Sentiment analysis
- Language detection

### **2. Admin Controls:**
- Enable/disable AI per guild
- Custom AI thresholds
- AI analysis history
- Bulk AI analysis

---

**🎯 Kết quả:** Bot giờ đây có thể tự động kiểm duyệt confession với AI, giúp admin giảm tải công việc và đảm bảo chất lượng nội dung! 