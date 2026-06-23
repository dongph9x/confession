const { Events, EmbedBuilder } = require("discord.js");
const db = require("../data/mongodb");

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        try {
            const settings = await db.getGuildSettings(member.guild.id);
            const welcome = settings?.welcome;

            if (!welcome || !welcome.enabled || !welcome.channelId) {
                return;
            }

            const welcomeMessage = welcome.message
                .replace("{user}", member)
                .replace("{server}", member.guild.name)
                .replace("{memberCount}", member.guild.memberCount);

            const welcomeEmbed = new EmbedBuilder()
                .setColor(welcome.embedColor)
                .setTitle(welcome.embedTitle)
                .setDescription(welcomeMessage)
                .setThumbnail(
                    member.user.displayAvatarURL({ dynamic: true, size: 512 })
                );

            if (welcome.showAccountAge) {
                welcomeEmbed.addFields({
                    name: "📅 Tài khoản được tạo",
                    value: `<t:${Math.floor(
                        member.user.createdTimestamp / 1000
                    )}:R>`,
                    inline: true,
                });
            }

            if (welcome.showMemberCount) {
                welcomeEmbed.addFields({
                    name: "👥 Tổng thành viên",
                    value: `${member.guild.memberCount}`,
                    inline: true,
                });
            }

            if (welcome.bannerUrl) {
                welcomeEmbed.setImage(welcome.bannerUrl);
            }

            if (welcome.showTimestamp) {
                welcomeEmbed.setTimestamp();
            }

            welcomeEmbed.setFooter({ text: `ID: ${member.id}` });

            const welcomeChannel = member.guild.channels.cache.get(
                welcome.channelId
            );
            if (welcomeChannel) {
                await welcomeChannel.send({ embeds: [welcomeEmbed] });
            }

            if (welcome.defaultRoleId) {
                try {
                    await member.roles.add(welcome.defaultRoleId);
                } catch (error) {
                    console.error("Lỗi khi gán role mặc định:", error);
                }
            }
        } catch (error) {
            console.error("Lỗi trong sự kiện guildMemberAdd:", error);
        }
    },
};
