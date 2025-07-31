const { Events, ActivityType } = require("discord.js");

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);

        function updateStatus() {
            const guild = client.guilds.cache.first();
            if (guild) {
                const memberCount = guild.memberCount;
                client.user.setPresence({
                    activities: [
                        {
                            name: `${memberCount} thành viên`,
                            type: ActivityType.Watching,
                        },
                    ],
                    status: "online",
                });
            }
        }

        updateStatus();
        setInterval(updateStatus, 5 * 60 * 1000);
    },
};
