# 🎨 Canvas Confession Test Guide

## 🚀 Cách sử dụng lệnh test

### **Lệnh Discord: `!testcanvas`**

Lệnh này cho phép bạn test trực tiếp việc render confession bằng canvas với full size image.

#### **Cách sử dụng:**
```
!testcanvas <content> [anonymous] [author]
```

#### **Parameters:**
- **`content`** (required): Nội dung confession (có thể trong dấu ngoặc kép)
- **`anonymous`** (optional): Chế độ ẩn danh (chỉ cần gõ "anonymous")
- **`author`** (optional): Tên tác giả (format: author:"Tên")

#### **Ví dụ sử dụng:**

**1. Confession thường:**
```
!testcanvas "Cậu giống như hoàng hôn hôm đó – đẹp đến mức khiến tớ quên mất phải nói điều gì."
```

**2. Confession ẩn danh:**
```
!testcanvas "Tớ từng nghĩ chỉ cần im lặng, dõi theo là đủ, nhưng hoá ra càng im lặng, càng đau." anonymous
```

**3. Confession có tác giả:**
```
!testcanvas "Đây là một confession test" author:"dev_dg_2010"
```

**4. Confession dài:**
```
!testcanvas "Đây là một confession rất dài để test word wrapping với super wide canvas. Tớ muốn xem canvas 6400px width có thể handle được text dài như thế nào. Có thể nó sẽ wrap text một cách đẹp mắt và dễ đọc hơn với không gian rộng hơn." author:"TestUser"
```

## 📊 Kết quả mong đợi

### **Canvas Specifications:**
- **Width**: 6400px (super wide)
- **Height**: 300px (compact)
- **Aspect ratio**: 21.33:1 (optimized for Discord)
- **Font size**: 120px (highly readable)
- **Line height**: 160px (generous spacing)
- **Padding**: 320px (ample margins)

### **Visual Features:**
- **Header accent**: Green accent line
- **Title**: Large, bold title with glow effect
- **Content area**: Dark background with white text
- **Word wrapping**: Automatic text wrapping
- **Author info**: Left side with username or "Ẩn danh"
- **Timestamp**: Right side with relative time
- **Footer**: Bot branding and server name

### **Full Size Benefits:**
- **Maximum width**: 6400px compensates for Discord constraints
- **High quality**: Crisp, readable text at any size
- **Professional appearance**: Modern, clean design
- **Responsive**: Works well on all Discord clients

## 🧪 Test Results

### **Performance:**
```
✅ Canvas confession image created successfully!
📏 Image size: 243265 bytes
🖼️ Canvas dimensions: 6400x300px
📐 Aspect ratio: 21.33:1 (super wide for Discord)
📊 File size: ~238KB
```

### **Features Working:**
```
✅ Canvas confession image: Working
✅ Discord attachment: Working
✅ Message structure: Working
✅ Anonymous support: Working
✅ Long text support: Working
✅ Super wide canvas: Working
```

## 🎯 Cách sử dụng trong Discord Bot

### **1. Sử dụng lệnh:**
```
!testcanvas "Nội dung confession" [anonymous] [author:"YourName"]
```

### **2. Kết quả:**
- Bot sẽ gửi message "Đang tạo canvas confession..."
- Tạo canvas confession image với full size
- Gửi ảnh với thông tin chi tiết về canvas
- Hiển thị loading message và cập nhật với kết quả

## 📋 Technical Details

### **Canvas Creation Process:**
1. **Create canvas** - 6400x300px with 21.33:1 ratio
2. **Draw header** - Green accent and dark background
3. **Add title** - Large, bold title with glow effect
4. **Render content** - Word-wrapped text with proper spacing
5. **Add footer** - Author info, timestamp, and branding
6. **Export** - PNG buffer for Discord attachment

### **Discord Integration:**
1. **Parse arguments** - Handle content, anonymous, author options
2. **Create attachment** - From canvas buffer
3. **Send message** - With attachment and info
4. **Display** - Full size image in Discord

### **Error Handling:**
- **Argument parsing** - Proper handling of quoted content
- **Try-catch** - Proper error handling
- **Fallback** - Error messages if something goes wrong
- **Loading message** - User feedback during creation

## 🚀 Benefits

### **1. Full Size Display**
- **6400px width** - Compensates for Discord constraints
- **21.33:1 ratio** - Optimized for Discord scaling
- **High quality** - Crisp, readable text
- **Professional** - Modern, clean design

### **2. Easy Testing**
- **Direct command** - Test immediately in Discord
- **Flexible options** - Anonymous, author, content
- **Real-time feedback** - See results instantly
- **No setup required** - Works out of the box

### **3. Production Ready**
- **Robust error handling** - Proper error messages
- **Performance optimized** - Fast canvas generation
- **Discord optimized** - Works perfectly in Discord
- **Scalable** - Easy to extend and modify

## 📝 Usage Examples

### **Example 1: Normal Confession**
```
!testcanvas "Tớ thích cậu rất nhiều, nhưng không dám nói."
```

### **Example 2: Anonymous Confession**
```
!testcanvas "Có ai đó đang nghĩ về tôi không?" anonymous
```

### **Example 3: Confession with Author**
```
!testcanvas "Đây là một confession test" author:"SecretAdmirer"
```

### **Example 4: Long Confession**
```
!testcanvas "Đây là một confession rất dài để test word wrapping. Tớ muốn xem canvas có thể handle được text dài như thế nào. Có thể nó sẽ wrap text một cách đẹp mắt và dễ đọc hơn với không gian rộng hơn." author:"LongWriter"
```

## 🎉 Ready to Use!

**Canvas Confession Test đã sẵn sàng để sử dụng!** 

- ✅ **Full size images** - 6400x300px canvas
- ✅ **Easy testing** - `!testcanvas` command
- ✅ **Flexible options** - Anonymous, author, content
- ✅ **Professional design** - Modern, clean appearance
- ✅ **Discord optimized** - Perfect for Discord display

**Hãy thử lệnh `!testcanvas` ngay bây giờ để xem kết quả!** 🎊 