const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require("discord.js");
const db = require("../../data/mongodb");

module.exports = {
    name: "setconfess",
    description: "Thiết lập kênh confession với select menu",
    async execute(message, args) {
        // Xóa tin nhắn gốc
        try {
            await message.delete();
        } catch (error) {
            console.log("Could not delete message:", error.message);
        }

        // Kiểm tra quyền
        if (!message.member.permissions.has("Administrator")) {
            const errorMsg = await message.channel.send(
                "❌ Bạn cần quyền Administrator để sử dụng lệnh này!"
            );
            setTimeout(() => {
                errorMsg.delete().catch(() => {});
            }, 5000);
            return;
        }

        // Kiểm tra argument cho chế độ ẩn danh
        if (args.length > 0 && (args[0] === "anonymous" || args[0] === "anon")) {
            await handleAnonymousMode(message, args);
            return;
        }

        const guildSettings = await db.getGuildSettings(message.guild.id);
        const anonymousMode = await db.getAnonymousMode(message.guild.id);

        // Tạo embed hiển thị cấu hình hiện tại
        const setupEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle("📝 Thiết lập Kênh Confession")
            .setDescription("Chọn kênh để đăng confessions đã được duyệt")
            .addFields(
                {
                    name: "📝 Kênh Confession hiện tại",
                    value: guildSettings?.confessionChannel 
                        ? `<#${guildSettings.confessionChannel}>` 
                        : "❌ Chưa thiết lập",
                    inline: true
                },
                {
                    name: "🕵️ Chế độ Ẩn danh",
                    value: anonymousMode ? "✅ Bật" : "❌ Tắt",
                    inline: true
                }
            )
            .setFooter({
                text: `Confession Bot • ${message.guild.name}`,
                iconURL: message.guild.iconURL(),
            })
            .setTimestamp();

        // Tạo select menu cho channels
        const channels = message.guild.channels.cache
            .filter(channel => channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildForum) // Text + Forum
            .map(channel => ({
                label: `#${channel.name}`,
                value: channel.id,
                description: `Kênh: ${channel.name}`
            }));

        if (channels.length === 0) {
            const errorMsg = await message.channel.send(
                "❌ Không tìm thấy kênh text nào trong server!"
            );
            setTimeout(() => {
                errorMsg.delete().catch(() => {});
            }, 5000);
            return;
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("setup_confession")
            .setPlaceholder("Chọn kênh confession...")
            .addOptions(channels.slice(0, 25)); // Discord chỉ cho phép tối đa 25 options

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const setupMsg = await message.channel.send({
            embeds: [setupEmbed],
            components: [row]
        });

        // Xóa tin nhắn sau 5 phút
        setTimeout(() => {
            setupMsg.delete().catch(() => {});
        }, 300000);
    },
};

async function handleAnonymousMode(message, args) {
    const currentMode = await db.getAnonymousMode(message.guild.id);
    const newMode = !currentMode;
    
    try {
        await db.setAnonymousMode(message.guild.id, newMode);

        const statusEmbed = new EmbedBuilder()
            .setTitle(newMode ? "🕵️ Chế độ Ẩn danh Đã Bật" : "👤 Chế độ Ẩn danh Đã Tắt")
            .setDescription(newMode 
                ? "Confessions sẽ được đăng ẩn danh - không hiển thị tên người gửi."
                : "Confessions sẽ hiển thị tên người gửi khi được đăng."
            )
            .setColor(newMode ? 0x00FF00 : 0xFF0000)
            .addFields(
                { 
                    name: "🕵️ Trạng thái", 
                    value: newMode ? "✅ Bật" : "❌ Tắt", 
                    inline: true 
                },
                { 
                    name: "📝 Ảnh hưởng", 
                    value: newMode 
                        ? "Confessions sẽ ẩn danh"
                        : "Confessions sẽ hiển thị tên", 
                    inline: true 
                }
            )
            .setFooter({ 
                text: `Confession Bot • ${message.guild.name}`,
                iconURL: message.guild.iconURL()
            })
            .setTimestamp();

        const statusMsg = await message.channel.send({ embeds: [statusEmbed] });
        setTimeout(() => {
            statusMsg.delete().catch(() => {});
        }, 10000);

    } catch (error) {
        console.error("Lỗi khi toggle anonymous mode:", error);
        const errorMsg = await message.channel.send(
            "❌ Đã xảy ra lỗi khi thay đổi chế độ ẩn danh!"
        );
        setTimeout(() => {
            errorMsg.delete().catch(() => {});
        }, 5000);
    }
}
