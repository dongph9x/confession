# 🗑️ Reset Database Command Guide

## 📋 **Tổng quan**

Command `!resetdatabase` cho phép Admin xóa tất cả dữ liệu trong database với menu tương tác an toàn.

## 🚀 **Cách sử dụng**

### **1. Lệnh cơ bản:**
```
!resetdatabase
```

### **2. Quyền yêu cầu:**
- ✅ **Administrator** - Chỉ Admin mới có thể sử dụng
- ❌ **User thường** - Sẽ nhận thông báo lỗi

## 🎯 **Các bảng có thể xóa:**

### **📊 Confessions**
- Xóa tất cả confessions
- Bao gồm: pending, approved, rejected
- **⚠️ Không thể hoàn tác!**

### **💬 Comments**
- Xóa tất cả comments
- Bao gồm: comments trên confessions
- **⚠️ Không thể hoàn tác!**

### **😀 Emoji Reactions**
- Xóa tất cả emoji reactions
- Bao gồm: heart, laugh, cry, angry, etc.
- **⚠️ Không thể hoàn tác!**

### **⚙️ Guild Settings**
- Xóa tất cả guild settings
- Bao gồm: confession channel, review channel, prefix
- **⚠️ Không thể hoàn tác!**

### **🎵 Music Settings**
- Xóa tất cả music settings
- Bao gồm: DJ role, music channel
- **⚠️ Không thể hoàn tác!**

### **💥 ALL TABLES**
- Xóa **TẤT CẢ** dữ liệu từ tất cả bảng
- **⚠️ NGUY HIỂM - Không thể hoàn tác!**

## 🔧 **Quy trình sử dụng:**

### **Bước 1: Gọi lệnh**
```
!resetdatabase
```

### **Bước 2: Chọn bảng**
- Menu hiển thị với các buttons
- Chọn bảng bạn muốn xóa
- Hoặc chọn "💥 RESET ALL" để xóa tất cả

### **Bước 3: Xác nhận**
- Menu xác nhận hiển thị
- Nhấn "✅ Xác nhận" để xóa
- Hoặc "❌ Hủy" để dừng

### **Bước 4: Kết quả**
- Thông báo thành công với số lượng bản ghi đã xóa
- Thời gian thực hiện
- Người thực hiện

## ⚠️ **Cảnh báo quan trọng:**

### **1. Không thể hoàn tác**
- Dữ liệu bị xóa **VĨNH VIỄN**
- Không có backup tự động
- Không thể khôi phục

### **2. Chỉ Admin mới được sử dụng**
- Kiểm tra quyền Administrator
- User thường sẽ bị từ chối

### **3. Thời gian timeout**
- Menu chính: 5 phút
- Menu xác nhận: 1 phút
- Sau đó buttons bị disable

## 📊 **Thống kê test:**

### **Dữ liệu trước khi xóa:**
```
📊 Confessions: 94 bản ghi
💬 Comments: 76 bản ghi
😀 Emoji Reactions: 116 bản ghi
⚙️ Guild Settings: 4 bản ghi
🎵 Music Settings: 0 bản ghi
```

### **Kết quả sau khi xóa:**
```
✅ Đã xóa 196 bản ghi từ tất cả bảng:
• Confessions: 0 bản ghi
• Comments: 0 bản ghi
• Emoji Reactions: 0 bản ghi
• Guild Settings: 0 bản ghi
• Music Settings: 0 bản ghi
```

## 🛡️ **Tính năng bảo mật:**

### **1. Kiểm tra quyền**
```javascript
if (!message.member.permissions.has('Administrator')) {
    // Từ chối access
}
```

### **2. Xác nhận 2 lần**
- Lần 1: Chọn bảng
- Lần 2: Xác nhận xóa

### **3. Chỉ người tạo menu mới sử dụng**
```javascript
if (interaction.user.id !== message.author.id) {
    // Từ chối access
}
```

### **4. Timeout tự động**
- Menu tự động disable sau khi hết thời gian
- Tránh sử dụng nhầm

## 🎨 **Giao diện:**

### **Menu chính:**
```
🗑️ Reset Database
⚠️ CẢNH BÁO: Hành động này sẽ xóa VĨNH VIỄN tất cả dữ liệu!

Chọn bảng bạn muốn xóa:
📊 Confessions    💬 Comments    😀 Emoji Reactions
⚙️ Guild Settings 🎵 Music Settings 💥 RESET ALL
❌ Hủy
```

### **Menu xác nhận:**
```
🗑️ Xác nhận xóa Confessions
⚠️ Bạn có chắc chắn muốn xóa Confessions?
Hành động này không thể hoàn tác!
✅ Xác nhận ❌ Hủy
```

### **Kết quả thành công:**
```
✅ Đã xóa Confessions thành công!
✅ Đã xóa 94 bản ghi từ bảng Confessions
⏱️ Thời gian: 150ms
👤 Người thực hiện: @User
⏰ Thời gian: 2 phút trước
```

## 🚨 **Lưu ý quan trọng:**

1. **Backup trước khi sử dụng** - Luôn backup database trước khi reset
2. **Kiểm tra kỹ** - Đảm bảo bạn đang xóa đúng bảng
3. **Thông báo team** - Thông báo cho team trước khi reset
4. **Test môi trường** - Test trên môi trường dev trước
5. **Monitoring** - Theo dõi sau khi reset

## 🔄 **Sau khi reset:**

1. **Tạo lại guild settings** - Cần setup lại confession channel, review channel
2. **Test bot** - Kiểm tra bot hoạt động bình thường
3. **Thông báo users** - Cho users biết về việc reset
4. **Monitor logs** - Theo dõi logs để đảm bảo không có lỗi

---

**⚠️ Lưu ý: Command này rất nguy hiểm, chỉ sử dụng khi thực sự cần thiết!** 