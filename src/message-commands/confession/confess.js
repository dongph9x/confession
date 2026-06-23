const db = require("../../data/mongodb");
const { submitConfessionForReview } = require("../../utils/confessionFlow");

module.exports = {
    name: "confess",
    description: "Gửi một confession",
    cooldown: 5, // 5 giây cooldown
    async execute(message, args) {
        // Xóa tin nhắn gốc để ẩn người gửi
        try {
            await message.delete();
        } catch (error) {
            console.log("Could not delete message:", error.message);
        }

        // Gửi phản hồi tạm rồi tự xóa
        const reply = async (text, ms = 6000) => {
            const m = await message.channel.send(text);
            setTimeout(() => m.delete().catch(() => {}), ms);
        };

        // Kiểm tra flag ẩn danh
        let isAnonymous = false;
        let content = args.join(" ");
        if (args.length > 0 && (args[0] === "anonymous" || args[0] === "anon" || args[0] === "ẩn")) {
            isAnonymous = true;
            content = args.slice(1).join(" ");
        }

        if (!content) {
            return reply(
                "❌ Vui lòng nhập nội dung confession!\n" +
                    "`!confess <nội dung>` — hiện tên\n" +
                    "`!confess anon <nội dung>` — ẩn danh",
                8000
            );
        }

        // Chống gửi trùng trong 30 giây
        const recent = await db.getRecentConfessions(message.guild.id, message.author.id, 30);
        const duplicate = recent.find(
            (c) =>
                c.content === content &&
                c.isAnonymous === isAnonymous &&
                Date.now() - new Date(c.createdAt).getTime() < 30000
        );
        if (duplicate) {
            return reply("⚠️ Bạn vừa gửi confession tương tự! Vui lòng đợi một chút hoặc đổi nội dung.");
        }

        const result = await submitConfessionForReview({
            guild: message.guild,
            user: message.author,
            content,
            isAnonymous,
            client: message.client,
        });

        if (!result.ok) {
            return reply(`❌ ${result.error}`);
        }

        const modeNote = isAnonymous ? "🕵️ Ẩn danh." : "👤 Hiển thị tên.";
        return reply(
            result.requireReview
                ? `✅ Confession của bạn đã được gửi để duyệt! ${modeNote}`
                : `✅ Confession của bạn đã được đăng! ${modeNote}`,
            8000
        );
    },
};
