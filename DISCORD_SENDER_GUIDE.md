# 📤 Discord Sender Guide

Hướng dẫn sử dụng Discord Sender để gửi ảnh confession lên Discord channel.

## 🚀 Setup

### 1. Cấu hình môi trường

Thêm vào file `.env`:

```env
BOT_TOKEN=your_discord_bot_token_here
CHANNEL_ID=your_channel_id_here
```

### 2. Bot Permissions

Đảm bảo bot có các permissions sau:
- `Send Messages`
- `Attach Files`
- `Embed Links`
- `Read Message History`

## 🎯 Sử dụng

### 1. Import và Initialize

```javascript
const discordSender = require('./src/utils/discordImageSender');

// Initialize Discord client
await discordSender.initialize(process.env.BOT_TOKEN);
```

### 2. Gửi ảnh đơn giản

```javascript
const puppeteerCanvas = require('./src/utils/puppeteerCanvas');

// Tạo ảnh confession
const imageBuffer = await puppeteerCanvas.createConfessionImage(
    confession, 
    guildSettings, 
    confessionAuthor
);

// Gửi lên Discord
await discordSender.sendConfessionImage(
    imageBuffer,
    process.env.CHANNEL_ID,
    { content: "📢 Có một bài confession mới!" }
);
```

### 3. Gửi với Embed

```javascript
const confessionCanvas = require('./src/utils/confessionCanvas');

// Tạo confession với embed
const result = await confessionCanvas.createConfessionWithEmbed(
    confession, 
    guildSettings, 
    confessionAuthor
);

// Gửi lên Discord với embed
await discordSender.sendConfessionWithEmbed(
    result.imageBuffer,
    result.embed,
    process.env.CHANNEL_ID
);
```

## 🧪 Testing

### Test đơn giản
```bash
node demo-discord-sender.js
```

### Test toàn diện
```bash
node test-discord-sender.js
```

## 📋 API Reference

### `discordSender.initialize(token)`
Khởi tạo Discord client.

**Parameters:**
- `token` (string): Discord bot token

**Returns:** Promise

### `discordSender.sendConfessionImage(imageBuffer, channelId, options)`
Gửi ảnh confession đơn giản.

**Parameters:**
- `imageBuffer` (Buffer): Image buffer
- `channelId` (string): Discord channel ID
- `options` (object): Optional configuration
  - `content` (string): Message content

**Returns:** Promise<Message>

### `discordSender.sendConfessionWithEmbed(imageBuffer, embed, channelId)`
Gửi ảnh confession với embed.

**Parameters:**
- `imageBuffer` (Buffer): Image buffer
- `embed` (EmbedBuilder): Discord embed
- `channelId` (string): Discord channel ID

**Returns:** Promise<Message>

### `discordSender.close()`
Đóng Discord client.

**Returns:** Promise

## 🔧 Integration với Confession Bot

### Trong confession command:

```javascript
const discordSender = require('../utils/discordImageSender');
const confessionCanvas = require('../utils/confessionCanvas');

// Trong confession handler
async function handleConfession(confession, guildSettings, author) {
    try {
        // Initialize Discord sender
        await discordSender.initialize(process.env.BOT_TOKEN);
        
        // Create confession image
        const result = await confessionCanvas.createConfessionWithEmbed(
            confession, 
            guildSettings, 
            author
        );
        
        // Send to confession channel
        await discordSender.sendConfessionWithEmbed(
            result.imageBuffer,
            result.embed,
            guildSettings.confessionChannelId
        );
        
        // Notify user
        await interaction.reply({
            content: "✅ Confession của bạn đã được gửi!",
            ephemeral: true
        });
        
    } catch (error) {
        console.error('Error sending confession:', error);
        await interaction.reply({
            content: "❌ Có lỗi xảy ra khi gửi confession.",
            ephemeral: true
        });
    } finally {
        await discordSender.close();
    }
}
```

## 🚨 Error Handling

### Common Errors:

1. **"Discord client not initialized"**
   ```javascript
   // Solution: Call initialize() first
   await discordSender.initialize(process.env.BOT_TOKEN);
   ```

2. **"Channel not found"**
   ```javascript
   // Solution: Check channel ID
   console.log('Channel ID:', process.env.CHANNEL_ID);
   ```

3. **"Missing permissions"**
   ```javascript
   // Solution: Check bot permissions in Discord
   // Bot needs: Send Messages, Attach Files, Embed Links
   ```

## 📊 Performance Tips

1. **Reuse Discord client**:
   ```javascript
   // Initialize once, reuse many times
   await discordSender.initialize(process.env.BOT_TOKEN);
   
   // Send multiple images
   for (const confession of confessions) {
       await discordSender.sendConfessionImage(imageBuffer, channelId);
   }
   
   // Close at the end
   await discordSender.close();
   ```

2. **Error handling**:
   ```javascript
   try {
       await discordSender.sendConfessionImage(imageBuffer, channelId);
   } catch (error) {
       console.error('Failed to send confession:', error);
       // Handle error appropriately
   }
   ```

## 🎉 Kết quả

Sau khi setup thành công, bạn sẽ có:
- ✅ Gửi ảnh confession lên Discord channel
- ✅ Hỗ trợ cả ảnh đơn giản và embed
- ✅ Error handling tốt
- ✅ Performance tối ưu
- ✅ Integration dễ dàng với confession bot

## 📝 Lưu ý

- Luôn gọi `close()` sau khi sử dụng để tránh memory leak
- Kiểm tra permissions của bot trong Discord server
- Xử lý lỗi network và Discord API limits
- Test với channel ID thực tế trước khi deploy 