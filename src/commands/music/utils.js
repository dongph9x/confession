// Hàm format thời lượng
function formatDuration(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));

    const parts = [];
    if (hours > 0) parts.push(hours.toString().padStart(2, "0"));
    parts.push(minutes.toString().padStart(2, "0"));
    parts.push(seconds.toString().padStart(2, "0"));

    return parts.join(":");
}

// Hàm lấy trạng thái lặp lại
function getLoopStatus(loopMode) {
    switch (loopMode) {
        case "track":
            return "Lặp lại bài hát";
        case "queue":
            return "Lặp lại danh sách";
        default:
            return "❎ Tắt";
    }
}

module.exports = {
    formatDuration,
    getLoopStatus,
};
