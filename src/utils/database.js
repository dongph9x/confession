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
                status TEXT DEFAULT 'pending',
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

module.exports = {
    db: dbAsync,
    init: initDatabase,
};
