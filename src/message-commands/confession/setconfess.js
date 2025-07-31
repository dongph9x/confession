const { PermissionFlagsBits } = require("discord.js");
const db = require("../../data/database");

module.exports = {
    name: "setconfess",
    description: "Set the channel where confessions will be posted",
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            const errorMsg = await message.reply(
                '❌ You need the "Manage Server" permission to use this command!'
            );
            setTimeout(() => errorMsg.delete().catch(console.error), 5000);
            return;
        }

        const channel = message.mentions.channels.first() || message.channel;

        try {
            const botPermissions = channel.permissionsFor(message.client.user);
            if (
                !botPermissions.has([
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.EmbedLinks,
                ])
            ) {
                const errorMsg = await message.reply(
                    "❌ I need permissions to view channel, send messages, and embed links in that channel!"
                );
                setTimeout(() => errorMsg.delete().catch(console.error), 5000);
                return;
            }

            await db.setConfessionChannel(message.guild.id, channel.id);

            const successMsg = await message.reply(
                `✅ Successfully set ${channel} as the confession channel!`
            );
            setTimeout(() => successMsg.delete().catch(console.error), 5000);
        } catch (error) {
            console.error("Error setting confession channel:", error);
            const errorMsg = await message.reply(
                "❌ An error occurred while setting the confession channel!"
            );
            setTimeout(() => errorMsg.delete().catch(console.error), 5000);
        }
    },
};
