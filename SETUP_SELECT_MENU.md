# 🎛️ Setup Select Menu Guide

## 🚀 **Để sử dụng Custom Select Menu:**

### **1. Setup Environment Variables:**
Tạo file `.env` trong thư mục gốc:
```env
BOT_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
```

### **2. Lấy Bot Token:**
1. Vào [Discord Developer Portal](https://discord.com/developers/applications)
2. Chọn application của bạn
3. Vào "Bot" section
4. Copy "Token"

### **3. Lấy Client ID:**
1. Vào "General Information" section
2. Copy "Application ID"

### **4. Deploy Commands:**
```bash
npm run deploy
```

## 🎯 **Sau khi setup xong:**

### **1. Setup với Select Menu:**
```
/confessionsetup action:📝 Thiết lập kênh confession
```
→ Chọn kênh từ dropdown → ✅ Done

### **2. Config với Select Menu:**
```
/confessionconfig
```
→ Chọn action → Chọn kênh → ✅ Done

## 🎨 **Features:**

### **Setup Select Menu:**
- ✅ **Chọn kênh** từ dropdown
- ✅ **Thiết lập confession** và review
- ✅ **Xem cấu hình** hiện tại
- ✅ **Thống kê** chi tiết

### **Config Select Menu:**
- ✅ **Quản lý cấu hình** với menu
- ✅ **Thiết lập từng kênh** riêng biệt
- ✅ **Xem thống kê** real-time
- ✅ **Setup cả hai** kênh cùng lúc

## 📈 **Benefits:**

- ✅ **User-friendly** - Dễ sử dụng với dropdown
- ✅ **Visual selection** - Thấy được tất cả kênh
- ✅ **No typing** - Không cần nhớ tên kênh
- ✅ **Error prevention** - Không thể chọn sai kênh
- ✅ **Quick setup** - Thiết lập nhanh chóng

## 🎉 **Kết quả:**

**Thay vì dùng lệnh thủ công:**
- ❌ `!setconfess #confession`
- ❌ `!setreview #review`
- ❌ Phải nhớ tên kênh chính xác

**Bây giờ dùng select menu:**
- ✅ `/confessionsetup` → Chọn từ dropdown
- ✅ `/confessionconfig` → Quản lý với menu
- ✅ Không cần nhớ tên kênh
- ✅ UI/UX chuyên nghiệp

**Custom select menu giúp setup dễ dàng và chuyên nghiệp! 🎛️** 