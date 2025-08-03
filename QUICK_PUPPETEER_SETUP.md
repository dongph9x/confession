# ⚡ Quick Puppeteer Setup Guide

Hướng dẫn nhanh để setup và sử dụng Puppeteer cho confession bot.

## 🚀 Setup nhanh

### 1. Cài đặt dependencies
```bash
npm install puppeteer canvas
```

### 2. Cấu hình môi trường
Thêm vào file `.env`:
```env
CONFESSION_RENDERER=puppeteer
```

### 3. Test hệ thống
```bash
# Test toàn diện
node test-puppeteer-confession.js

# Demo đơn giản
node demo-puppeteer.js
```

## 🎯 Sử dụng trong code

### Cách 1: Sử dụng trực tiếp
```javascript
const puppeteerCanvas = require('./src/utils/puppeteerCanvas');

const result = await puppeteerCanvas.createConfessionWithEmbed(
    confession, 
    guildSettings, 
    confessionAuthor
);
```

### Cách 2: Sử dụng qua ConfessionCanvas (Recommended)
```javascript
const confessionCanvas = require('./src/utils/confessionCanvas');

// Set renderer
confessionCanvas.setRenderer('puppeteer');

// Tạo confession (API giữ nguyên!)
const result = await confessionCanvas.createConfessionWithEmbed(
    confession, 
    guildSettings, 
    confessionAuthor
);
```

## 🎨 Tùy chỉnh template

Chỉnh sửa file `src/utils/confessionTemplate.html` để thay đổi:
- Màu sắc và gradient
- Font chữ
- Layout và spacing
- Animations và effects

## 📊 So sánh kết quả

| Renderer | File Size | Quality | Performance |
|----------|-----------|---------|-------------|
| Canvas | ~126KB | Basic | ⚡ Fast |
| Puppeteer | ~450KB | High | 🐌 Slower |

## 🔧 Troubleshooting

### Lỗi "Cannot find module 'canvas'"
```bash
npm install canvas
```

### Lỗi Puppeteer không cài đặt được
```bash
# macOS
brew install chromium

# Ubuntu/Debian
sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
```

### Memory issues
```javascript
// Cleanup sau khi sử dụng
await confessionCanvas.cleanup();
```

## 🎉 Kết quả

Sau khi setup thành công, bạn sẽ có:
- ✅ Ảnh confession đẹp mắt với HTML template
- ✅ Responsive design
- ✅ Modern UI với gradient và effects
- ✅ API tương thích với code hiện tại
- ✅ Khả năng tùy chỉnh cao

## 📝 Lưu ý

- Puppeteer renderer chậm hơn Canvas nhưng cho chất lượng cao hơn
- File ảnh lớn hơn (~450KB vs ~126KB)
- Cần cleanup sau khi sử dụng để tránh memory leak
- Template HTML có thể tùy chỉnh dễ dàng

## 🔄 Chuyển đổi renderer

```javascript
// Chuyển sang Puppeteer
confessionCanvas.setRenderer('puppeteer');

// Chuyển về Canvas
confessionCanvas.setRenderer('canvas');
``` 