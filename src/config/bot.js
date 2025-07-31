module.exports = {
    // Bot Configuration
    bot: {
        name: "Confession Bot",
        version: "2.0.0",
        description: "Professional Confession Management Bot",
        author: "Your Name",
        supportServer: "https://discord.gg/yoursupport",
        website: "https://yourwebsite.com"
    },

    // Confession Settings
    confession: {
        maxLength: 2000,
        minLength: 10,
        cooldown: 300000, // 5 minutes in milliseconds
        maxPendingPerUser: 3,
        autoDeleteRejected: false,
        allowEdit: true,
        requireReview: true,
        anonymousMode: true
    },

    // Embed Colors
    colors: {
        primary: 0x0099FF,
        success: 0x00FF00,
        warning: 0xFFA500,
        error: 0xFF0000,
        info: 0x0099FF,
        neutral: 0x2F3136
    },

    // Emojis
    emojis: {
        success: "✅",
        error: "❌",
        warning: "⚠️",
        info: "ℹ️",
        loading: "⏳",
        check: "☑️",
        cross: "❌",
        heart: "💝",
        confession: "📝",
        review: "👨‍⚖️",
        stats: "📊",
        pending: "⏳"
    },

    // Permissions
    permissions: {
        reviewConfession: "ManageMessages",
        manageSettings: "Administrator",
        viewStats: "ManageMessages"
    },

    // Messages
    messages: {
        confession: {
            submitted: "✅ Confession của bạn đã được gửi để duyệt! Bạn sẽ được thông báo khi confession được duyệt hoặc từ chối.",
            approved: "🎉 Confession của bạn đã được duyệt và đăng lên server **{server}**!",
            rejected: "😔 Confession của bạn đã bị từ chối trên server **{server}**.",
            tooLong: "❌ Confession quá dài! Tối đa {maxLength} ký tự.",
            tooShort: "❌ Confession quá ngắn! Tối thiểu {minLength} ký tự.",
            cooldown: "⏳ Vui lòng đợi {time} giây trước khi gửi confession tiếp theo.",
            maxPending: "❌ Bạn đã có {count} confession đang chờ duyệt. Vui lòng đợi chúng được xử lý."
        },
        review: {
            noPermission: "❌ Bạn không có quyền để duyệt confession!",
            notFound: "❌ Không tìm thấy confession này!",
            approved: "✅ Đã duyệt confession #{id}!",
            rejected: "❌ Đã từ chối confession #{id}!",
            noConfessionChannel: "❌ Kênh confession chưa được thiết lập!"
        },
        settings: {
            reviewChannelSet: "✅ Đã thiết lập kênh review confession: {channel}",
            confessionChannelSet: "✅ Đã thiết lập kênh confession: {channel}",
            channelNotFound: "❌ Không tìm thấy kênh! Có thể kênh đã bị xóa."
        }
    },

    // Database
    database: {
        backupInterval: 24 * 60 * 60 * 1000, // 24 hours
        maxBackups: 7,
        autoVacuum: true
    },

    // Logging
    logging: {
        enabled: true,
        level: process.env.LOG_LEVEL || "info",
        maxFiles: 30,
        maxSize: "10m"
    }
}; 