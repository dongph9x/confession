const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { db } = require("../../utils/database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setwelcome")
        .setDescription("Cấu hình tin nhắn chào mừng")
        .addChannelOption((option) =>
            option
                .setName("channel")
                .setDescription("Kênh để gửi tin nhắn chào mừng")
                .setRequired(true)
        )
        .addRoleOption((option) =>
            option
                .setName("role")
                .setDescription("Role mặc định cho thành viên mới")
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName("message")
                .setDescription(
                    "Tin nhắn chào mừng tùy chỉnh (sử dụng {user}, {server}, {memberCount})"
                )
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName("color")
                .setDescription("Màu của embed (mã hex)")
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName("banner")
                .setDescription("URL của ảnh banner")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            const channel = interaction.options.getChannel("channel");
            const role = interaction.options.getRole("role");
            const message = interaction.options.getString("message");
            const color = interaction.options.getString("color");
            const banner = interaction.options.getString("banner");

            let guildConfig = await db.get(
                "SELECT * FROM guild_configs WHERE guild_id = ?",
                [interaction.guild.id]
            );

            if (!guildConfig) {
                await db.run(
                    `INSERT INTO guild_configs (
                        guild_id, 
                        welcome_channel_id, 
                        default_role_id,
                        welcome_message,
                        embed_color,
                        banner_url
                    ) VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        interaction.guild.id,
                        channel.id,
                        role?.id || null,
                        message ||
                            "Chào mừng {user} đã đến với **{server}**!\nServer của chúng ta hiện có {memberCount} thành viên!",
                        color || "#00ff00",
                        banner || null,
                    ]
                );
            } else {
                await db.run(
                    `UPDATE guild_configs SET 
                        welcome_channel_id = ?,
                        default_role_id = COALESCE(?, default_role_id),
                        welcome_message = COALESCE(?, welcome_message),
                        embed_color = COALESCE(?, embed_color),
                        banner_url = COALESCE(?, banner_url)
                    WHERE guild_id = ?`,
                    [
                        channel.id,
                        role?.id,
                        message,
                        color,
                        banner,
                        interaction.guild.id,
                    ]
                );
            }

            let response = `✅ Đã thiết lập kênh chào mừng: ${channel}`;
            if (role) response += `\n✅ Role mặc định: ${role}`;
            if (message) response += `\n✅ Đã cập nhật tin nhắn chào mừng`;
            if (color) response += `\n✅ Đã cập nhật màu embed: ${color}`;
            if (banner) response += `\n✅ Đã cập nhật ảnh banner`;

            await interaction.reply({
                content: response,
                ephemeral: true,
            });
        } catch (error) {
            console.error("Lỗi trong lệnh setwelcome:", error);
            await interaction.reply({
                content: "❌ Đã xảy ra lỗi khi thực hiện lệnh!",
                ephemeral: true,
            });
        }
    },
};
