# 📏 Full Width Confession Guide

Hướng dẫn sử dụng full width rendering cho confession images với Puppeteer.

## 🚀 Cách sử dụng Full Width

### 1. Sử dụng trong puppeteerCanvas

```javascript
const puppeteerCanvas = require('./src/utils/puppeteerCanvas');

// Tạo ảnh với full width
const imageBuffer = await puppeteerCanvas.createConfessionImage(
    confession, 
    guildSettings, 
    confessionAuthor,
    { fullWidth: true } // Enable full width
);
```

### 2. Sử dụng trong confessionCanvas

```javascript
const confessionCanvas = require('./src/utils/confessionCanvas');

// Set renderer
confessionCanvas.setRenderer('puppeteer');

// Tạo confession với full width
const result = await confessionCanvas.createConfessionWithEmbed(
    confession, 
    guildSettings, 
    confessionAuthor,
    { fullWidth: true } // Enable full width
);
```

## 📊 So sánh Full Width vs Normal

| Feature | Normal | Full Width |
|---------|--------|------------|
| Viewport Width | 800px | 1400px |
| Viewport Height | 600px | 900px |
| File Size | ~450KB | ~850KB |
| Content Display | Compact | Expanded |
| Text Readability | Good | Excellent |

## 🎨 Template Customization cho Full Width

### CSS Updates cho Full Width

```css
/* Trong confessionTemplate.html */
.confession-card {
    max-width: 1000px; /* Increased for full width */
    width: 100%;
    margin: 0 auto;
}

body {
    margin: 0;
    box-sizing: border-box;
}
```

### Responsive Design

```css
/* Media queries cho different screen sizes */
@media (max-width: 1200px) {
    .confession-card {
        max-width: 90%;
    }
}

@media (max-width: 768px) {
    .confession-card {
        max-width: 95%;
        padding: 20px;
    }
}
```

## 🧪 Testing Full Width

### Test đơn giản
```bash
node demo-full-width.js
```

### Test với Discord
```bash
node demo-discord-sender.js
```

## 📋 API Reference

### puppeteerCanvas.createConfessionImage()

**Parameters:**
- `confession` (object): Confession data
- `guildSettings` (object): Guild settings
- `confessionAuthor` (object): Author information
- `options` (object): Optional configuration
  - `fullWidth` (boolean): Enable full width rendering

**Returns:** Promise<Buffer>

### Options Object

```javascript
{
    fullWidth: true,        // Enable full width
    viewport: {             // Custom viewport (optional)
        width: 1400,
        height: 900,
        deviceScaleFactor: 2
    },
    fullPage: true          // Capture full page
}
```

## 🎯 Use Cases

### 1. Long Content
```javascript
// Cho confession dài
const longConfession = {
    content: "Đây là một confession rất dài với nhiều nội dung chi tiết...",
    isAnonymous: false,
    createdAt: new Date()
};

// Sử dụng full width để hiển thị tốt hơn
const imageBuffer = await puppeteerCanvas.createConfessionImage(
    longConfession, 
    guildSettings, 
    confessionAuthor,
    { fullWidth: true }
);
```

### 2. High Quality Images
```javascript
// Cho chất lượng cao
const highQualityOptions = {
    fullWidth: true,
    viewport: {
        width: 1600,
        height: 1000,
        deviceScaleFactor: 3
    }
};
```

### 3. Discord Integration
```javascript
// Gửi lên Discord với full width
await discordSender.sendConfessionImage(
    imageBuffer,
    channelId,
    { content: "📢 Confession mới với full width!" }
);
```

## 🔧 Performance Optimization

### 1. Memory Management
```javascript
// Luôn cleanup sau khi sử dụng
await puppeteerCanvas.close();
await confessionCanvas.cleanup();
```

### 2. Caching
```javascript
// Reuse browser instance
await puppeteerCanvas.initialize();
// ... multiple operations
await puppeteerCanvas.close();
```

### 3. Error Handling
```javascript
try {
    const imageBuffer = await puppeteerCanvas.createConfessionImage(
        confession, 
        guildSettings, 
        confessionAuthor,
        { fullWidth: true }
    );
} catch (error) {
    console.error('Full width rendering failed:', error);
    // Fallback to normal width
    const fallbackBuffer = await puppeteerCanvas.createConfessionImage(
        confession, 
        guildSettings, 
        confessionAuthor
    );
}
```

## 📊 File Size Comparison

| Renderer | Normal | Full Width | Difference |
|----------|--------|------------|------------|
| Puppeteer | ~450KB | ~850KB | +89% |
| Canvas | ~126KB | ~126KB | No change |

## 🚨 Troubleshooting

### 1. Large File Size
```javascript
// Giảm quality nếu cần
const options = {
    fullWidth: true,
    viewport: {
        width: 1200,  // Giảm width
        height: 800,   // Giảm height
        deviceScaleFactor: 1 // Giảm resolution
    }
};
```

### 2. Memory Issues
```javascript
// Tăng timeout cho large images
await page.waitForTimeout(2000); // Tăng từ 1000ms
```

### 3. Discord Upload Limits
```javascript
// Discord limit: 25MB
// Full width images thường < 1MB nên an toàn
```

## 🎉 Best Practices

1. **Use full width cho long content**
2. **Test với real content trước khi deploy**
3. **Monitor file sizes và performance**
4. **Provide fallback cho error cases**
5. **Cache browser instances khi có thể**

## 🔄 Migration từ Normal Width

```javascript
// Before
const imageBuffer = await puppeteerCanvas.createConfessionImage(
    confession, guildSettings, author
);

// After
const imageBuffer = await puppeteerCanvas.createConfessionImage(
    confession, guildSettings, author, { fullWidth: true }
);
```

## 📝 Lưu ý

- Full width images lớn hơn ~89% so với normal
- Cần test performance với real content
- Discord có thể mất thời gian upload hơn
- Template CSS cần được optimize cho full width
- Memory usage cao hơn với full width

---

**🎯 Full width rendering đã sẵn sàng để sử dụng!** 