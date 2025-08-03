# 🔍 AI Monitoring Guide - Cách kiểm tra AI đã hoạt động

## **📋 Các cách kiểm tra AI đã phân tích nội dung:**

### **1. 🔍 Xem Logs trong Terminal:**

```bash
# Xem logs AI analysis
docker compose logs discord-bot | grep "🤖"

# Xem logs chi tiết AI
docker compose logs discord-bot | grep "\[AI\]"

# Xem logs real-time
docker compose logs discord-bot --follow | grep "🤖"
```

**Ví dụ logs:**
```
🤖 [AI] Starting analysis for confession 123...
🤖 [AI] Content: "Admin ngu quá admin ơi"
✅ [AI] Analysis completed successfully
🤖 [AI] Result: INAPPROPRIATE | INSULT | Score: 9/10
🤖 [AI] Recommendation: REJECT
🚫 [AI] Auto-rejecting confession 123
```

### **2. 📊 Sử dụng Commands:**

#### **Xem thông tin AI của confession:**
```
/aiinfo confession_id:123
```

**Kết quả:**
```
🤖 AI Analysis - Confession #123
Safety Level: INAPPROPRIATE
Content Type: INSULT
Score: 9/10
Lý do: Nội dung chứa lời xúc phạm trực tiếp đến admin
Khuyến nghị: REJECT
Độ tin cậy: 95.2%
```

#### **Xem thống kê AI:**
```
/aistats
```

**Kết quả:**
```
🤖 AI Analysis Statistics
📊 Tổng confession: 50
🤖 Đã phân tích AI: 45
📈 Tỷ lệ phân tích: 90.0%

🛡️ Safety Level:
✅ APPROPRIATE: 30
⚠️ FLAG_FOR_REVIEW: 10
🚫 INAPPROPRIATE: 5

🎯 Recommendation:
✅ APPROVE: 25
🚫 REJECT: 15
⚠️ FLAG: 5
```

### **3. 👀 Quan sát trong Discord:**

#### **Khi gửi confession:**
- **Nếu có AI:** Sẽ thấy embed AI analysis
- **Nếu auto-approve:** Thông báo "✅ Confession đã được AI tự động duyệt!"
- **Nếu auto-reject:** Thông báo "❌ Confession đã bị từ chối vì nội dung không phù hợp"
- **Nếu manual review:** Thông báo "🤖 AI đã phân tích: APPROPRIATE (2/10)"

#### **Trong review channel:**
- **AI Embed:** Hiển thị kết quả phân tích AI
- **AI Reject Button:** Nút "🤖 AI Reject" nếu AI khuyến nghị REJECT

### **4. 🗄️ Kiểm tra Database:**

```bash
# Vào MongoDB container
docker compose exec mongodb mongosh

# Xem confessions có AI analysis
db.confessions.find({aiAnalysis: {$exists: true}})

# Xem thống kê AI
db.confessions.aggregate([
  { $match: { aiAnalysis: { $exists: true } } },
  { $group: { _id: "$aiAnalysis.safety_level", count: { $sum: 1 } } }
])
```

### **5. 🔧 Test AI trực tiếp:**

```bash
# Test AI với script
docker compose exec discord-bot sh -c "export OPENAI_API_KEY='your_key' && node test-ai-content.js"
```

## **📊 Các trạng thái AI:**

### **✅ AI hoạt động bình thường:**
- Logs hiển thị `🤖 [AI] Starting analysis...`
- Logs hiển thị `✅ [AI] Analysis completed successfully`
- Có embed AI analysis trong Discord
- Database có trường `aiAnalysis`

### **⚠️ AI có vấn đề:**
- Logs hiển thị `⚠️ [AI] No OpenAI API key found`
- Logs hiển thị `❌ [AI] Analysis failed`
- Không có embed AI analysis
- Database không có trường `aiAnalysis`

### **🚫 AI không hoạt động:**
- Không có logs AI
- Không có embed AI analysis
- Thông báo "❌ Đã xảy ra lỗi khi phân tích AI"

## **🛠️ Troubleshooting:**

### **1. AI không phân tích:**
```bash
# Kiểm tra API key
docker compose exec discord-bot env | grep OPENAI

# Kiểm tra logs
docker compose logs discord-bot | grep "AI"
```

### **2. AI phân tích sai:**
- Kiểm tra prompt trong `src/utils/aiContentAnalyzer.js`
- Test với script `test-ai-content.js`
- Cập nhật system prompt nếu cần

### **3. AI chậm:**
- Kiểm tra internet connection
- Kiểm tra OpenAI API status
- Có thể tăng timeout nếu cần

## **📈 Monitoring Dashboard:**

### **Commands hữu ích:**
- `/aiinfo <confession_id>` - Xem chi tiết AI analysis
- `/aistats` - Xem thống kê AI
- `/confess` - Test gửi confession và xem AI hoạt động

### **Logs patterns:**
- `🤖 [AI] Starting` - AI bắt đầu phân tích
- `✅ [AI] Analysis completed` - AI hoàn thành
- `🚫 [AI] Auto-rejecting` - AI tự động từ chối
- `✅ [AI] Auto-approving` - AI tự động duyệt
- `⚠️ [AI] Manual review required` - Cần review thủ công

---

**🎯 Kết quả:** Bây giờ bạn có thể dễ dàng theo dõi và kiểm tra AI đã hoạt động chưa! 