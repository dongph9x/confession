# 📝 Text vs Image Guide

Hướng dẫn so sánh và sử dụng text vs image cho confession trên Discord.

## 🚨 Vấn đề thực tế

### Discord Display Behavior
- **Text messages**: Hiển thị full width (100%), dễ đọc
- **Image messages**: Bị giới hạn 50% width, khó đọc
- **Bot messages**: Có thêm limitations cho images
- **Embed messages**: Full width với formatting đẹp

### So sánh chi tiết

| Format | Width | Readability | File Size | Upload Speed |
|--------|-------|-------------|-----------|--------------|
| Plain Text | 100% | Excellent | ~1KB | Instant |
| Formatted Text | 100% | Excellent | ~2KB | Instant |
| Embed Text | 100% | Excellent | ~3KB | Instant |
| Normal Image | 50% | Good | ~450KB | Slow |
| Ultra Compact Image | 90% | Excellent | ~200KB | Fast |

## 🚀 Cách sử dụng

### 1. Gửi text thông thường

```javascript
const discordSender = require('./src/utils/discordImageSender');

// Gửi text với full width
await discordSender.sendConfessionImage(
    Buffer.from('dummy'),
    channelId,
    { 
        sendAsText: true,
        content: `📢 **Confession #123**\n\n${confessionText}\n\n👤 **Author:** ${author.username}\n⏰ **Posted:** Just now`
    }
);
```

### 2. Gửi formatted text với embed

```javascript
const { EmbedBuilder } = require('discord.js');

const embed = new EmbedBuilder()
    .setColor('#667eea')
    .setTitle(`💝 Confession #${confessionNumber}`)
    .setDescription(confessionText)
    .addFields(
        { name: '👤 Author', value: author.username, inline: true },
        { name: '⏰ Posted', value: 'Just now', inline: true }
    )
    .setFooter({ 
        text: `Confession Bot • ${guildName}`,
        iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png'
    })
    .setTimestamp();

await channel.send({
    embeds: [embed]
});
```

### 3. Gửi image với template tối ưu

```javascript
const puppeteerCanvas = require('./src/utils/puppeteerCanvas');

// Gửi image với ultra compact template
const imageBuffer = await puppeteerCanvas.createConfessionImage(
    confession, 
    guildSettings, 
    author,
    { ultraCompact: true }
);

await discordSender.sendConfessionImage(
    imageBuffer,
    channelId,
    { content: "📢 Confession với ultra compact template" }
);
```

## 📊 So sánh kết quả

### Text Messages (Recommended)
```javascript
// Ưu điểm
✅ Full width display (100%)
✅ Instant upload
✅ Excellent readability
✅ No file size limits
✅ Easy to copy/paste
✅ Searchable content

// Nhược điểm
❌ No visual design
❌ Limited formatting
❌ No custom styling
```

### Image Messages
```javascript
// Ưu điểm
✅ Beautiful visual design
✅ Custom styling
✅ Professional appearance
✅ Consistent branding

// Nhược điểm
❌ Limited width (50-90%)
❌ Large file size (~200-450KB)
❌ Slow upload
❌ Not searchable
❌ Can't copy text
```

## 🎯 Best Practices

### 1. Chọn format theo nhu cầu

```javascript
function sendConfession(confession, guildSettings, author, format = 'text') {
    switch (format) {
        case 'text':
            // Gửi text cho readability
            return sendAsText(confession, guildSettings, author);
            
        case 'embed':
            // Gửi embed cho formatting
            return sendAsEmbed(confession, guildSettings, author);
            
        case 'image':
            // Gửi image cho visual design
            return sendAsImage(confession, guildSettings, author);
            
        case 'auto':
            // Tự động chọn format
            return autoSelectFormat(confession, guildSettings, author);
    }
}
```

### 2. Auto-select format

```javascript
function autoSelectFormat(confession, guildSettings, author) {
    const textLength = confession.content.length;
    
    if (textLength < 500) {
        // Short text -> use image for visual appeal
        return sendAsImage(confession, guildSettings, author, { ultraCompact: true });
    } else if (textLength < 2000) {
        // Medium text -> use embed for balance
        return sendAsEmbed(confession, guildSettings, author);
    } else {
        // Long text -> use plain text for readability
        return sendAsText(confession, guildSettings, author);
    }
}
```

### 3. User preference

```javascript
// Cho phép user chọn format
const userPreference = getUserPreference(userId);
const format = userPreference || 'auto';

await sendConfession(confession, guildSettings, author, format);
```

## 🧪 Testing

### Test text vs image
```bash
node demo-text-vs-image.js
```

### Test riêng từng format
```bash
# Test text
node demo-text-only.js

# Test image
node demo-ultra-compact.js

# Test embed
node demo-embed-only.js
```

## 📱 Discord Specific Considerations

### 1. Text Messages
- **Full width**: Hiển thị 100% width
- **Instant**: Upload ngay lập tức
- **Searchable**: Có thể tìm kiếm
- **Copyable**: Có thể copy text
- **Accessible**: Dễ đọc cho screen readers

### 2. Image Messages
- **Limited width**: 50-90% width tùy template
- **Slow upload**: Cần thời gian upload
- **Not searchable**: Không thể tìm kiếm text
- **Not copyable**: Không thể copy text
- **Visual appeal**: Thiết kế đẹp mắt

### 3. Embed Messages
- **Full width**: Hiển thị 100% width
- **Formatted**: Có formatting đẹp
- **Structured**: Layout có cấu trúc
- **Interactive**: Có thể có buttons/actions
- **Professional**: Trông chuyên nghiệp

## 🎯 Recommendations

### 1. Cho short confessions (< 500 chars)
```javascript
// Sử dụng image với ultra compact template
const imageBuffer = await puppeteerCanvas.createConfessionImage(
    confession, guildSettings, author,
    { ultraCompact: true }
);
```

### 2. Cho medium confessions (500-2000 chars)
```javascript
// Sử dụng embed cho balance
const embed = createConfessionEmbed(confession, guildSettings, author);
await channel.send({ embeds: [embed] });
```

### 3. Cho long confessions (> 2000 chars)
```javascript
// Sử dụng plain text cho readability
await sendAsText(confession, guildSettings, author);
```

### 4. Cho anonymous confessions
```javascript
// Sử dụng image để ẩn danh tốt hơn
const imageBuffer = await puppeteerCanvas.createConfessionImage(
    confession, guildSettings, author,
    { ultraCompact: true }
);
```

## 🔧 API Reference

### Text Format
```javascript
{
    sendAsText: true,
    content: "Formatted text content with markdown"
}
```

### Image Format
```javascript
{
    ultraCompact: true,     // Use ultra compact template
    discordOptimized: true, // Use Discord optimized template
    content: "Image caption"
}
```

### Embed Format
```javascript
{
    embed: EmbedBuilder,
    content: "Optional additional content"
}
```

## 🚨 Troubleshooting

### 1. Text quá dài
```javascript
// Split long text
const chunks = splitText(confessionText, 2000);
for (const chunk of chunks) {
    await sendAsText({ content: chunk }, guildSettings, author);
}
```

### 2. Image quá lớn
```javascript
// Use ultra compact template
const options = { ultraCompact: true };
```

### 3. Embed bị lỗi
```javascript
// Fallback to plain text
try {
    await sendAsEmbed(confession, guildSettings, author);
} catch (error) {
    await sendAsText(confession, guildSettings, author);
}
```

## 🎉 Kết luận

### ✅ Text Messages (Recommended cho long content)
- **Best for**: Long confessions, readability
- **Display**: Full width, excellent
- **Performance**: Instant upload
- **Accessibility**: High

### ✅ Image Messages (Recommended cho visual appeal)
- **Best for**: Short confessions, visual design
- **Display**: 50-90% width (tùy template)
- **Performance**: Slow upload
- **Accessibility**: Medium

### ✅ Embed Messages (Recommended cho balance)
- **Best for**: Medium confessions, structured content
- **Display**: Full width, formatted
- **Performance**: Fast upload
- **Accessibility**: High

---

**🎯 Chọn format phù hợp với nhu cầu của confession!** 