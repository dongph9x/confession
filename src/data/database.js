const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const { promisify } = require("util");

class Database {
    constructor() {
        this.db = new sqlite3.Database(path.join(__dirname, "bot.db"));
        this.run = promisify(this.db.run.bind(this.db));
        this.get = promisify(this.db.get.bind(this.db));
        this.all = promisify(this.db.all.bind(this.db));
    }

    async init() {
        await this.run(`CREATE TABLE IF NOT EXISTS guild_settings (
            guild_id TEXT PRIMARY KEY,
            confession_channel TEXT,
            review_channel TEXT,
            prefix TEXT DEFAULT '!',
            confession_counter INTEGER DEFAULT 0,
            anonymous_mode INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        await this.run(`CREATE TABLE IF NOT EXISTS confessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id TEXT,
            user_id TEXT,
            content TEXT,
            is_anonymous INTEGER DEFAULT 0,
            status TEXT DEFAULT 'pending',
            confession_number INTEGER DEFAULT 0,
            message_id TEXT,
            thread_id TEXT,
            reviewed_by TEXT,
            reviewed_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (guild_id) REFERENCES guild_settings(guild_id)
        )`);

        await this.run(`CREATE TABLE IF NOT EXISTS music_settings (
            guild_id TEXT PRIMARY KEY,
            dj_role TEXT,
            music_channel TEXT,
            FOREIGN KEY (guild_id) REFERENCES guild_settings(guild_id)
        )`);

        // Thêm các cột mới nếu chưa tồn tại
        try {
            await this.run("ALTER TABLE confessions ADD COLUMN status TEXT DEFAULT 'pending'");
        } catch (error) {
            // Cột đã tồn tại, bỏ qua
        }

        try {
            await this.run("ALTER TABLE confessions ADD COLUMN confession_number INTEGER DEFAULT 0");
        } catch (error) {
            // Cột đã tồn tại, bỏ qua
        }

        try {
            await this.run("ALTER TABLE confessions ADD COLUMN message_id TEXT");
        } catch (error) {
            // Cột đã tồn tại, bỏ qua
        }

        try {
            await this.run("ALTER TABLE confessions ADD COLUMN thread_id TEXT");
        } catch (error) {
            // Cột đã tồn tại, bỏ qua
        }

        try {
            await this.run("ALTER TABLE confessions ADD COLUMN reviewed_by TEXT");
        } catch (error) {
            // Cột đã tồn tại, bỏ qua
        }

        try {
            await this.run("ALTER TABLE confessions ADD COLUMN reviewed_at DATETIME");
        } catch (error) {
            // Cột đã tồn tại, bỏ qua
        }

        try {
            await this.run("ALTER TABLE confessions ADD COLUMN is_anonymous INTEGER DEFAULT 0");
        } catch (error) {
            // Cột đã tồn tại, bỏ qua
        }

        try {
            await this.run("ALTER TABLE guild_settings ADD COLUMN review_channel TEXT");
        } catch (error) {
            // Cột đã tồn tại, bỏ qua
        }

        try {
            await this.run("ALTER TABLE guild_settings ADD COLUMN confession_counter INTEGER DEFAULT 0");
        } catch (error) {
            // Cột đã tồn tại, bỏ qua
        }

        try {
            await this.run("ALTER TABLE guild_settings ADD COLUMN anonymous_mode INTEGER DEFAULT 0");
        } catch (error) {
            // Cột đã tồn tại, bỏ qua
        }
    }

    // Guild Settings Methods
    async getGuildSettings(guildId) {
        return await this.get(
            "SELECT * FROM guild_settings WHERE guild_id = ?",
            [guildId]
        );
    }

    async setConfessionChannel(guildId, channelId) {
        await this.run(
            "INSERT INTO guild_settings (guild_id, confession_channel) VALUES (?, ?) " +
                "ON CONFLICT(guild_id) DO UPDATE SET confession_channel = ?",
            [guildId, channelId, channelId]
        );
    }

    async setReviewChannel(guildId, channelId) {
        await this.run(
            "INSERT INTO guild_settings (guild_id, review_channel) VALUES (?, ?) " +
                "ON CONFLICT(guild_id) DO UPDATE SET review_channel = ?",
            [guildId, channelId, channelId]
        );
    }

    async setPrefix(guildId, prefix) {
        await this.run(
            "INSERT INTO guild_settings (guild_id, prefix) VALUES (?, ?) " +
                "ON CONFLICT(guild_id) DO UPDATE SET prefix = ?",
            [guildId, prefix, prefix]
        );
    }

    async setAnonymousMode(guildId, enabled) {
        await this.run(
            "INSERT INTO guild_settings (guild_id, anonymous_mode) VALUES (?, ?) " +
                "ON CONFLICT(guild_id) DO UPDATE SET anonymous_mode = ?",
            [guildId, enabled ? 1 : 0, enabled ? 1 : 0]
        );
    }

    async getAnonymousMode(guildId) {
        const settings = await this.getGuildSettings(guildId);
        return settings ? settings.anonymous_mode === 1 : false;
    }

    // Confession Methods
    async addConfession(guildId, userId, content, isAnonymous = false) {
        const result = await this.run(
            "INSERT INTO confessions (guild_id, user_id, content, is_anonymous) VALUES (?, ?, ?, ?)",
            [guildId, userId, content, isAnonymous ? 1 : 0]
        );
        
        // Lấy ID của confession vừa thêm vào
        const insertedConfession = await this.get(
            "SELECT id FROM confessions WHERE guild_id = ? AND user_id = ? AND content = ? ORDER BY created_at DESC LIMIT 1",
            [guildId, userId, content]
        );
        
        return insertedConfession ? insertedConfession.id : null;
    }

    async getConfession(confessionId) {
        return await this.get(
            "SELECT * FROM confessions WHERE id = ?",
            [confessionId]
        );
    }

    async getPendingConfessions(guildId) {
        return await this.all(
            "SELECT * FROM confessions WHERE guild_id = ? AND status = 'pending' ORDER BY created_at ASC",
            [guildId]
        );
    }

    async updateConfessionStatus(confessionId, status, reviewedBy, messageId = null, threadId = null) {
        const confession = await this.getConfession(confessionId);
        let confessionNumber = confession.confession_number;
        
        if (status === 'approved' && confessionNumber === 0) {
            // Tăng counter cho guild
            await this.run(
                "UPDATE guild_settings SET confession_counter = confession_counter + 1 WHERE guild_id = ?",
                [confession.guild_id]
            );
            
            // Lấy counter mới
            const settings = await this.getGuildSettings(confession.guild_id);
            confessionNumber = settings.confession_counter;
        }

        await this.run(
            "UPDATE confessions SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, message_id = ?, thread_id = ?, confession_number = ? WHERE id = ?",
            [status, reviewedBy, messageId, threadId, confessionNumber, confessionId]
        );
    }

    async getConfessions(guildId, limit = 10) {
        return await this.all(
            "SELECT * FROM confessions WHERE guild_id = ? AND status = 'approved' ORDER BY confession_number DESC LIMIT ?",
            [guildId, limit]
        );
    }

    async getConfessionByNumber(guildId, confessionNumber) {
        return await this.get(
            "SELECT * FROM confessions WHERE guild_id = ? AND confession_number = ? AND status = 'approved'",
            [guildId, confessionNumber]
        );
    }

    async getConfessionStats(guildId) {
        const stats = await this.get(
            "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending, SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved, SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected FROM confessions WHERE guild_id = ?",
            [guildId]
        );
        return stats;
    }

    // Reaction Methods (Placeholder - sẽ implement sau)
    async getReactionStats(guildId) {
        // Placeholder cho reaction stats
        return {
            confessions_with_reactions: 0,
            total_reactions: 0,
            unique_users_reacted: 0
        };
    }

    // Comment Methods (Placeholder - sẽ implement sau)
    async getCommentStats(guildId) {
        // Placeholder cho comment stats
        return {
            confessions_with_comments: 0,
            total_comments: 0,
            unique_users_commented: 0
        };
    }

    // Music Settings Methods
    async getMusicSettings(guildId) {
        return await this.get(
            "SELECT * FROM music_settings WHERE guild_id = ?",
            [guildId]
        );
    }

    async setMusicSettings(guildId, djRole, musicChannel) {
        await this.run(
            "INSERT INTO music_settings (guild_id, dj_role, music_channel) VALUES (?, ?, ?) " +
                "ON CONFLICT(guild_id) DO UPDATE SET dj_role = ?, music_channel = ?",
            [guildId, djRole, musicChannel, djRole, musicChannel]
        );
    }

    // Cleanup
    close() {
        this.db.close();
    }
}

module.exports = new Database();
