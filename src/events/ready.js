const { Events, ActivityType } = require("discord.js");
const db = require("../data/mongodb");
const logger = require("../utils/logger");

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        logger.info("=== Bot Information ===");
        logger.info(`🤖 Bot Name: ${client.user.tag}`);
        logger.info(`📝 Bot ID: ${client.user.id}`);
        logger.info(`🏠 Servers: ${client.guilds.cache.size}`);
        logger.info(`📜 Commands: ${client.commands.size}`);
        logger.info("=====================");

        // Tải cấu hình kênh cho mỗi server
        logger.info("=== Loading Channel Configuration ===");
        for (const guild of client.guilds.cache.values()) {
            const settings = await db.getGuildSettings(guild.id);
            if (!settings) continue;

            if (settings.confessionChannel) {
                const confessionChannel = guild.channels.cache.get(
                    settings.confessionChannel
                );
                if (confessionChannel) {
                    logger.info(
                        `✅ Loaded confession channel for ${guild.name}: ${confessionChannel.name}`
                    );
                }
            }
            if (settings.reviewChannel) {
                const reviewChannel = guild.channels.cache.get(
                    settings.reviewChannel
                );
                if (reviewChannel) {
                    logger.info(
                        `✅ Loaded review channel for ${guild.name}: ${reviewChannel.name}`
                    );
                }
            }
        }
        logger.info("=== Channel Configuration Complete ===");

        // Cập nhật trạng thái bot định kỳ
        const updateStatus = () => {
            const totalMembers = client.guilds.cache.reduce(
                (acc, guild) => acc + guild.memberCount,
                0
            );
            client.user.setPresence({
                activities: [
                    {
                        name: `${totalMembers} thành viên | /help`,
                        type: ActivityType.Watching,
                    },
                ],
                status: "online",
            });
        };

        updateStatus();
        setInterval(updateStatus, 5 * 60 * 1000);
    },
};
