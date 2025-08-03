# 🎨 Puppeteer Confession Guide

Hướng dẫn sử dụng Puppeteer để tạo ảnh confession từ HTML template.

## 📋 Tổng quan

Hệ thống này cho phép bạn tạo ảnh confession đẹp mắt từ HTML template sử dụng Puppeteer thay vì Canvas. Điều này mang lại nhiều lợi ích:

- **Thiết kế linh hoạt**: Sử dụng HTML/CSS để tạo layout
- **Responsive**: Template tự động điều chỉnh theo kích thước
- **Modern UI**: Sử dụng CSS Grid, Flexbox, và các tính năng hiện đại
- **Dễ tùy chỉnh**: Chỉ cần chỉnh sửa HTML/CSS

## 🚀 Cài đặt

### 1. Cài đặt dependencies

```bash
npm install puppeteer
```

### 2. Cấu hình môi trường

Thêm vào file `.env`:

```env
# Renderer type: 'canvas' hoặc 'puppeteer'
CONFESSION_RENDERER=puppeteer
```

## 📁 Cấu trúc files

```
src/utils/
├── confessionCanvas.js      # Main canvas utility (updated)
├── puppeteerCanvas.js      # Puppeteer utility
└── confessionTemplate.html  # HTML template
```

## 🎯 Sử dụng

### 1. Sử dụng trực tiếp Puppeteer

```javascript
const puppeteerCanvas = require('./src/utils/puppeteerCanvas');

// Tạo ảnh confession
const imageBuffer = await puppeteerCanvas.createConfessionImage(
    confession, 
    guildSettings, 
    confessionAuthor
);

// Tạo confession với embed
const result = await puppeteerCanvas.createConfessionWithEmbed(
    confession, 
    guildSettings, 
    confessionAuthor
);
```

### 2. Sử dụng qua ConfessionCanvas (Recommended)

```javascript
const confessionCanvas = require('./src/utils/confessionCanvas');

// Set renderer
confessionCanvas.setRenderer('puppeteer');

// Tạo confession
const result = await confessionCanvas.createConfessionWithEmbed(
    confession, 
    guildSettings, 
    confessionAuthor
);
```

## 🎨 Tùy chỉnh Template

### 1. Chỉnh sửa HTML Template

File `src/utils/confessionTemplate.html` chứa template HTML. Bạn có thể:

- Thay đổi CSS styles
- Thêm animations
- Sử dụng custom fonts
- Thêm background images

### 2. Cập nhật JavaScript

Template có sẵn function `updateConfession(data)` để cập nhật nội dung:

```javascript
// Trong template HTML
function updateConfession(data) {
    if (data.number) {
        document.getElementById('confessionNumber').textContent = `Confession #${data.number}`;
    }
    
    if (data.content) {
        document.getElementById('confessionText').textContent = data.content;
    }
    
    // ... more updates
}
```

### 3. Data Structure

Template nhận data với cấu trúc:

```javascript
{
    number: 42,                    // Confession number
    content: "Confession text",    // Confession content
    author: {
        username: "User",          // Author username
        isAnonymous: false         // Anonymous flag
    },
    time: "2 phút trước",         // Formatted time
    serverName: "Server Name"      // Server name
}
```

## 🔧 Cấu hình Puppeteer

### Browser Options

Trong `puppeteerCanvas.js`, bạn có thể tùy chỉnh browser options:

```javascript
this.browser = await puppeteer.launch({
    headless: true,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
    ]
});
```

### Viewport Settings

```javascript
await page.setViewport({ 
    width: 800, 
    height: 600,
    deviceScaleFactor: 2 // Higher resolution
});
```

## 🧪 Testing

Chạy test để kiểm tra hệ thống:

```bash
node test-puppeteer-confession.js
```

## 📊 So sánh Renderers

| Feature | Canvas | Puppeteer |
|---------|--------|-----------|
| Performance | ⚡ Fast | 🐌 Slower |
| Flexibility | 🔒 Limited | 🎨 High |
| Setup | ✅ Simple | ⚙️ Complex |
| Customization | 🔧 Basic | 🎯 Advanced |
| File Size | 📦 Small | 📦 Large |

## 🚨 Troubleshooting

### 1. Puppeteer không cài đặt được

```bash
# Trên Ubuntu/Debian
sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

# Trên macOS
brew install chromium
```

### 2. Memory Issues

Nếu gặp lỗi memory, thêm cleanup:

```javascript
// Cleanup sau khi sử dụng
await confessionCanvas.cleanup();
```

### 3. Template không load

Kiểm tra đường dẫn file template:

```javascript
console.log('Template path:', path.join(__dirname, 'confessionTemplate.html'));
```

## 🔄 Migration từ Canvas

Để chuyển từ Canvas sang Puppeteer:

1. **Cài đặt Puppeteer**:
   ```bash
   npm install puppeteer
   ```

2. **Set environment variable**:
   ```env
   CONFESSION_RENDERER=puppeteer
   ```

3. **Code không cần thay đổi** - API giữ nguyên!

## 📝 Best Practices

1. **Cleanup**: Luôn gọi `cleanup()` sau khi sử dụng
2. **Error Handling**: Wrap trong try-catch
3. **Performance**: Sử dụng browser instance reuse
4. **Testing**: Test cả hai renderers

## 🎉 Kết luận

Puppeteer renderer cung cấp khả năng tùy chỉnh cao hơn cho confession images. Tuy nhiên, Canvas renderer vẫn là lựa chọn tốt cho performance.

Chọn renderer phù hợp với nhu cầu của bạn! 