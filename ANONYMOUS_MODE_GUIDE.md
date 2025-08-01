# 🕵️ Chế độ Ẩn danh Confession Guide

## 🎯 **Tính năng Ẩn danh:**

### **1. Mô tả:**
- ✅ **Ẩn danh hoàn toàn** - Không hiển thị tên người gửi
- ✅ **Bảo mật cao** - Chỉ admin mới biết người gửi
- ✅ **Linh hoạt** - Có thể bật/tắt dễ dàng
- ✅ **Tùy chỉnh** - Mỗi server có thể cài đặt riêng

### **2. Cách hoạt động:**

#### **Khi bật chế độ ẩn danh:**
```
💝 Confession #5
Nội dung confession...

👤 Người gửi: 🕵️ Ẩn danh
⏰ Thời gian: 2 giờ trước
```

#### **Khi tắt chế độ ẩn danh:**
```
💝 Confession #5
Nội dung confession...

👤 Người gửi: @username
⏰ Thời gian: 2 giờ trước
```

## 🚀 **Cách sử dụng:**

### **1. Bật/Tắt chế độ ẩn danh:**

#### **Cách 1: Sử dụng command**
```
!setconfess anonymous
```
→ Toggle chế độ ẩn danh

#### **Cách 2: Sử dụng config menu**
```
!confessionconfig
```
→ Chọn "🕵️ Chế độ Ẩn danh" → Toggle

### **2. Kiểm tra trạng thái:**
```
!confessionconfig
```
→ Hiển thị trạng thái ẩn danh hiện tại

## 🎨 **UI/UX Features:**

### **1. Config Embed với Ẩn danh:**
```
⚙️ Cấu hình Confession Bot

📝 Kênh Confession: #confession
👨‍⚖️ Kênh Review: #review
📊 Confession Counter: 15
🕵️ Chế độ Ẩn danh: ✅ Bật

[Select Menu]
├─ 📝 Thiết lập kênh confession
├─ 👨‍⚖️ Thiết lập kênh review
├─ 🔄 Thiết lập cả hai kênh
├─ 🕵️ Chế độ Ẩn danh
└─ 📊 Xem thống kê
```

### **2. Status Embed:**
```
🕵️ Chế độ Ẩn danh Đã Bật

Confessions sẽ được đăng ẩn danh - không hiển thị tên người gửi.

🕵️ Trạng thái: ✅ Bật
📝 Ảnh hưởng: Confessions sẽ ẩn danh
```

## 🛠️ **Commands:**

### **Anonymous Mode Commands:**
```
!setconfess anonymous - Bật/tắt chế độ ẩn danh
!confessionconfig - Quản lý cấu hình (bao gồm ẩn danh)
```

### **Select Menu Actions:**
- **toggle_anonymous** - Bật/tắt chế độ ẩn danh

## 🎯 **Kết quả:**

### **Before (Hiển thị tên):**
```
💝 Confession #5
Tôi thích bạn rất nhiều...

👤 Người gửi: @username
⏰ Thời gian: 2 giờ trước
```

### **After (Ẩn danh):**
```
💝 Confession #5
Tôi thích bạn rất nhiều...

👤 Người gửi: 🕵️ Ẩn danh
⏰ Thời gian: 2 giờ trước
```

## 📈 **Benefits:**

- ✅ **Bảo mật cao** - Không ai biết ai gửi confession
- ✅ **Tự do chia sẻ** - Người dùng thoải mái hơn
- ✅ **Linh hoạt** - Có thể bật/tắt theo ý muốn
- ✅ **Admin control** - Chỉ admin mới có thể thay đổi
- ✅ **Review vẫn biết** - Admin vẫn biết ai gửi để duyệt
- ✅ **Thread ẩn danh** - Bình luận cũng ẩn danh

## 🔄 **Workflow:**

### **1. Bật Ẩn danh:**
```
Admin → !setconfess anonymous → ✅ Ẩn danh bật
```

### **2. Gửi Confession:**
```
User → !confess nội dung → Review → Duyệt → Đăng ẩn danh
```

### **3. Tắt Ẩn danh:**
```
Admin → !setconfess anonymous → ❌ Ẩn danh tắt
```

## 🎉 **Kết quả cuối cùng:**

**Chế độ ẩn danh tạo môi trường confession an toàn và tự do:**

- ✅ **Bảo mật tuyệt đối** - Không ai biết ai gửi
- ✅ **Tự do chia sẻ** - Người dùng thoải mái hơn
- ✅ **Admin vẫn kiểm soát** - Duyệt và quản lý
- ✅ **Linh hoạt** - Bật/tắt theo nhu cầu
- ✅ **UI/UX chuyên nghiệp** - Giao diện đẹp

**Chế độ ẩn danh tạo môi trường confession an toàn và tự do! 🕵️**

---

**Anonymous mode tạo môi trường confession bảo mật và tự do! 🚀** 