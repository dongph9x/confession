const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '../logs');
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    getTimestamp() {
        return new Date().toISOString();
    }

    writeToFile(level, message, data = null) {
        const timestamp = this.getTimestamp();
        const logEntry = {
            timestamp,
            level,
            message,
            data
        };

        const logFile = path.join(this.logDir, `${new Date().toISOString().split('T')[0]}.log`);
        const logLine = JSON.stringify(logEntry) + '\n';
        
        fs.appendFileSync(logFile, logLine);
    }

    info(message, data = null) {
        console.log(`[INFO] ${message}`);
        this.writeToFile('INFO', message, data);
    }

    warn(message, data = null) {
        console.warn(`[WARN] ${message}`);
        this.writeToFile('WARN', message, data);
    }

    error(message, error = null) {
        console.error(`[ERROR] ${message}`, error);
        this.writeToFile('ERROR', message, error);
    }

    debug(message, data = null) {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[DEBUG] ${message}`);
            this.writeToFile('DEBUG', message, data);
        }
    }

    // Log confession events
    logConfession(guildId, userId, confessionId, action, details = null) {
        this.info(`Confession ${action}`, {
            guildId,
            userId,
            confessionId,
            action,
            details,
            timestamp: this.getTimestamp()
        });
    }

    // Log bot events
    logBotEvent(event, details = null) {
        this.info(`Bot Event: ${event}`, {
            event,
            details,
            timestamp: this.getTimestamp()
        });
    }

    // Log errors with context
    logError(context, error, additionalData = null) {
        this.error(`Error in ${context}`, {
            context,
            error: error.message,
            stack: error.stack,
            additionalData,
            timestamp: this.getTimestamp()
        });
    }
}

module.exports = new Logger(); 