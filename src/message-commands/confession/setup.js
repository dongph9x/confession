const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ChannelType } = require("discord.js");
const db = require("../../data/mongodb");

module.exports = {
    name: "confessionsetup",
    description: "Thiết lập kênh confession và review với select menu",
    async execute(message, args) {
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

        // Xóa tin nhắn gốc
        try {
            await message.delete();
        } catch (error) {
            console.log("Could not delete message:", error.message);
        }

        const action = args[0] || "config";

        if (action === "config") {
            // Hiển thị cấu hình hiện tại
            const settings = await db.getGuildSettings(message.guild.id);
            const confessionChannel = settings?.confessionChannel ? `<#${settings.confessionChannel}>` : "❌ Chưa thiết lập";
            const reviewChannel = settings?.reviewChannel ? `<#${settings.reviewChannel}>` : "❌ Chưa thiết lập";

            const configEmbed = new EmbedBuilder()
                .setTitle("⚙️ Cấu hình Confession Bot")
                .setColor(0x1877F2)
                .addFields(
                    { name: "📝 Kênh Confession", value: confessionChannel, inline: true },
                    { name: "👨‍⚖️ Kênh Review", value: reviewChannel, inline: true },
                    { name: "📊 Confession Counter", value: `${settings?.confessionCounter || 0}`, inline: true }
                )
                .setFooter({ text: "Confession Bot • Facebook Style" })
                .setTimestamp();

            return message.channel.send({ embeds: [configEmbed] });
        }

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

        // Tạo select menu
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`setup_${action}`)
            .setPlaceholder("Chọn kênh...")
            .addOptions(channels.slice(0, 25)); // Discord chỉ cho phép tối đa 25 options

        const row = new ActionRowBuilder().addComponents(selectMenu);

        let title, description;
        switch (action) {
            case "confession":
                title = "📝 Thiết lập kênh Confession";
                description = "Chọn kênh để đăng confessions đã được duyệt:";
                break;
            case "review":
                title = "👨‍⚖️ Thiết lập kênh Review";
                description = "Chọn kênh để review confessions:";
                break;
            case "both":
                title = "🔄 Thiết lập cả hai kênh";
                description = "Chọn kênh cho cả confession và review:";
                break;
            default:
                title = "⚙️ Thiết lập Confession Bot";
                description = "Chọn hành động:";
                break;
        }

        const setupEmbed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(0x1877F2)
            .setFooter({ text: "Confession Bot • Facebook Style" })
            .setTimestamp();

        await message.channel.send({
            embeds: [setupEmbed],
            components: [row]
        });
    },
}; 