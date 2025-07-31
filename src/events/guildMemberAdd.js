const { Events, EmbedBuilder } = require("discord.js");
const { db } = require("../utils/database");

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        try {
            const guildConfig = await db.get(
                "SELECT * FROM guild_configs WHERE guild_id = ?",
                [member.guild.id]
            );

            if (
                !guildConfig ||
                !guildConfig.welcome_enabled ||
                !guildConfig.welcome_channel_id
            ) {
                return;
            }

            const welcomeMessage = guildConfig.welcome_message
                .replace("{user}", member)
                .replace("{server}", member.guild.name)
                .replace("{memberCount}", member.guild.memberCount);

            const welcomeEmbed = new EmbedBuilder()
                .setColor(guildConfig.embed_color)
                .setTitle(guildConfig.embed_title)
                .setDescription(welcomeMessage)
                .setThumbnail(
                    member.user.displayAvatarURL({ dynamic: true, size: 512 })
                );

            if (guildConfig.show_account_age) {
                welcomeEmbed.addFields({
                    name: "📅 Tài khoản được tạo",
                    value: `<t:${Math.floor(
                        member.user.createdTimestamp / 1000
                    )}:R>`,
                    inline: true,
                });
            }

            if (guildConfig.show_member_count) {
                welcomeEmbed.addFields({
                    name: "👥 Tổng thành viên",
                    value: `${member.guild.memberCount}`,
                    inline: true,
                });
            }

            if (guildConfig.banner_url) {
                welcomeEmbed.setImage(guildConfig.banner_url);
            }

            if (guildConfig.show_timestamp) {
                welcomeEmbed.setTimestamp();
            }

            welcomeEmbed.setFooter({ text: `ID: ${member.id}` });

            const welcomeChannel = member.guild.channels.cache.get(
                guildConfig.welcome_channel_id
            );
            if (welcomeChannel) {
                await welcomeChannel.send({ embeds: [welcomeEmbed] });
            }

            if (guildConfig.default_role_id) {
                try {
                    await member.roles.add(guildConfig.default_role_id);
                } catch (error) {
                    console.error("Lỗi khi gán role mặc định:", error);
                }
            }
        } catch (error) {
            console.error("Lỗi trong sự kiện guildMemberAdd:", error);
        }
    },
};
