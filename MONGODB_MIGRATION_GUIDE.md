# 🔄 MongoDB Migration Guide

## 🎯 **Chuyển đổi từ SQLite sang MongoDB**

### **1. Thay đổi chính:**

#### **Database Engine:**
- ❌ **SQLite** → ✅ **MongoDB**
- ❌ **File-based** → ✅ **Cloud-based**
- ❌ **Local storage** → ✅ **Scalable storage**

#### **Dependencies:**
```json
{
  "dependencies": {
    "sqlite3": "^5.1.7",  // ❌ Removed
    "mongoose": "^8.0.0"   // ✅ Added
  }
}
```

### **2. Cấu trúc Database:**

#### **SQLite Schema:**
```sql
CREATE TABLE guild_settings (
    guild_id TEXT PRIMARY KEY,
    confession_channel TEXT,
    review_channel TEXT,
    prefix TEXT DEFAULT '!',
    confession_counter INTEGER DEFAULT 0,
    anonymous_mode INTEGER DEFAULT 0
);

CREATE TABLE confessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT,
    user_id TEXT,
    content TEXT,
    is_anonymous INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    confession_number INTEGER DEFAULT 0
);
```

#### **MongoDB Schema:**
```javascript
// GuildSettings Model
{
  guildId: String,
  confessionChannel: String,
  reviewChannel: String,
  prefix: String,
  confessionCounter: Number,
  anonymousMode: Boolean
}

// Confession Model
{
  guildId: String,
  userId: String,
  content: String,
  isAnonymous: Boolean,
  status: String,
  confessionNumber: Number
}
```

### **3. Files đã thay đổi:**

#### **Database Files:**
- ❌ `src/data/database.js` → ✅ `src/data/mongodb.js`
- ✅ `src/models/GuildSettings.js` (Mới)
- ✅ `src/models/Confession.js` (Cập nhật)
- ✅ `src/models/MusicSettings.js` (Mới)

#### **Updated Files:**
- ✅ `src/index.js` - MongoDB connection
- ✅ `src/message-commands/confession/confess.js`
- ✅ `src/message-commands/confession/config.js`
- ✅ `src/message-commands/confession/setconfess.js`
- ✅ `src/events/buttonInteractionCreate.js`
- ✅ `src/events/selectMenuInteractionCreate.js`

### **4. Environment Variables:**

#### **Cần thêm vào .env:**
```env
MONGODB_URI=mongodb://localhost:27017/confession-bot
# hoặc
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/confession-bot
```

### **5. API Changes:**

#### **Database Methods:**
```javascript
// SQLite
await db.init();
await db.addConfession(guildId, userId, content);
const confession = await db.getConfession(id);

// MongoDB
await db.connect();
await db.addConfession(guildId, userId, content, isAnonymous);
const confession = await db.getConfession(id);
```

#### **Field Names:**
```javascript
// SQLite
confession.user_id
confession.is_anonymous
confession.created_at

// MongoDB
confession.userId
confession.isAnonymous
confession.createdAt
```

### **6. Benefits:**

#### **MongoDB Advantages:**
- ✅ **Scalable** - Xử lý nhiều server lớn
- ✅ **Flexible** - Schema linh hoạt
- ✅ **Query Power** - Aggregation pipelines
- ✅ **Cloud Ready** - MongoDB Atlas
- ✅ **JSON Native** - Dữ liệu tự nhiên

#### **Performance:**
- ✅ **Indexing** - Tối ưu query
- ✅ **Sharding** - Phân tán dữ liệu
- ✅ **Replication** - Backup tự động

### **7. Migration Steps:**

#### **1. Cài đặt MongoDB:**
```bash
npm install mongoose
```

#### **2. Cập nhật .env:**
```env
MONGODB_URI=your_mongodb_connection_string
```

#### **3. Chạy test:**
```bash
node test-mongodb.js
```

#### **4. Khởi động bot:**
```bash
npm start
```

### **8. Data Migration:**

#### **Từ SQLite sang MongoDB:**
```javascript
// Migration script (nếu cần)
const sqliteDb = require('./src/data/database');
const mongoDb = require('./src/data/mongodb');

async function migrateData() {
  // Migrate guild settings
  const guildSettings = await sqliteDb.getAllGuildSettings();
  for (const setting of guildSettings) {
    await mongoDb.setGuildSettings(setting.guild_id, setting);
  }
  
  // Migrate confessions
  const confessions = await sqliteDb.getAllConfessions();
  for (const confession of confessions) {
    await mongoDb.addConfession(
      confession.guild_id,
      confession.user_id,
      confession.content,
      confession.is_anonymous === 1
    );
  }
}
```

### **9. Testing:**

#### **Test Commands:**
```bash
# Test MongoDB connection
node test-mongodb.js

# Test confession functionality
!confess Test confession
!confess anonymous Test anonymous confession

# Test admin commands
!confessionconfig
!setconfess anonymous
```

### **10. Monitoring:**

#### **MongoDB Metrics:**
- ✅ Connection status
- ✅ Query performance
- ✅ Index usage
- ✅ Memory usage

#### **Bot Logs:**
```
✅ MongoDB connected successfully
✅ Guild settings saved
✅ Confession created
✅ Statistics generated
```

## 🎉 **Migration Complete!**

**MongoDB đã được setup thành công với:**
- ✅ Connection management
- ✅ Model schemas
- ✅ CRUD operations
- ✅ Performance optimization
- ✅ Error handling

**Bot đã sẵn sàng sử dụng MongoDB! 🚀** 