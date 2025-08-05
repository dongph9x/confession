const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// Đảm bảo thư mục data tồn tại
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const dbPath = path.join(dataDir, "bot.db");
const db = new sqlite3.Database(dbPath);

// Promisify các thao tác database
const dbAsync = {
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    },
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },
    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },
};

// Khởi tạo các bảng trong database
const initDatabase = async () => {
    try {
        // Bảng cấu hình server
        await dbAsync.run(`
            CREATE TABLE IF NOT EXISTS guild_configs (
                guild_id TEXT PRIMARY KEY,
                welcome_channel_id TEXT,
                default_role_id TEXT,
                welcome_message TEXT DEFAULT 'Chào mừng {user} đã đến với **{server}**!\nServer của chúng ta hiện có {memberCount} thành viên!',
                welcome_enabled INTEGER DEFAULT 1,
                embed_color TEXT DEFAULT '#00ff00',
                embed_title TEXT DEFAULT '🎉 Chào mừng thành viên mới!',
                show_timestamp INTEGER DEFAULT 1,
                show_member_count INTEGER DEFAULT 1,
                show_account_age INTEGER DEFAULT 1,
                banner_url TEXT,
                review_channel_id TEXT,
                confession_channel_id TEXT
            )
        `);

        // Bảng confession
        await dbAsync.run(`
            CREATE TABLE IF NOT EXISTS confessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                content TEXT NOT NULL,
                author_id TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                is_anonymous INTEGER DEFAULT 0,
                ai_analysis TEXT,
                message_id TEXT,
                confession_number INTEGER,
                created_at INTEGER DEFAULT (strftime('%s', 'now')),
                review_message_id TEXT,
                confession_message_id TEXT,
                FOREIGN KEY (guild_id) REFERENCES guild_configs(guild_id)
            )
        `);

        console.log("✅ Đã khởi tạo database thành công");
    } catch (error) {
        console.error("❌ Lỗi khi khởi tạo database:", error);
        throw error;
    }
};

// Helper functions cho confession
const confessionHelpers = {
    // Thêm confession mới
    async addConfession(guildId, authorId, content, isAnonymous = false) {
        const result = await dbAsync.run(
            "INSERT INTO confessions (guild_id, author_id, content, is_anonymous) VALUES (?, ?, ?, ?)",
            [guildId, authorId, content, isAnonymous ? 1 : 0]
        );
        return result.lastID;
    },

    // Lấy pending confessions của user
    async getUserPendingConfessions(guildId, userId) {
        return await dbAsync.all(
            "SELECT * FROM confessions WHERE guild_id = ? AND author_id = ? AND status = 'pending' ORDER BY created_at ASC",
            [guildId, userId]
        );
    },

    // Lấy guild settings
    async getGuildSettings(guildId) {
        return await dbAsync.get(
            "SELECT * FROM guild_configs WHERE guild_id = ?",
            [guildId]
        );
    },

    // Cập nhật trạng thái confession
    async updateConfessionStatus(confessionId, status, reviewerId = null, messageId = null, threadId = null, confessionNumber = null) {
        const updates = [];
        const params = [];
        
        updates.push("status = ?");
        params.push(status);
        
        if (messageId) {
            updates.push("message_id = ?");
            params.push(messageId);
        }
        
        if (confessionNumber) {
            updates.push("confession_number = ?");
            params.push(confessionNumber);
        }
        
        params.push(confessionId);
        
        await dbAsync.run(
            `UPDATE confessions SET ${updates.join(", ")} WHERE id = ?`,
            params
        );
    },

    // Lấy số lượng confessions đã approved
    async getApprovedConfessionsCount(guildId) {
        const result = await dbAsync.get(
            "SELECT COUNT(*) as count FROM confessions WHERE guild_id = ? AND status = 'approved'",
            [guildId]
        );
        return result ? result.count : 0;
    },

    // Lấy emoji counts
    async getEmojiCounts(guildId, confessionId) {
        // Placeholder - có thể implement sau
        return {};
    },

    // Lưu AI analysis
    async saveAIAnalysis(confessionId, aiAnalysis) {
        await dbAsync.run(
            "UPDATE confessions SET ai_analysis = ? WHERE id = ?",
            [JSON.stringify(aiAnalysis), confessionId]
        );
    }
};

module.exports = {
    db: dbAsync,
    init: initDatabase,
    ...confessionHelpers,
};
