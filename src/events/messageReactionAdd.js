const { Events, PermissionsBitField } = require("discord.js");
const { db } = require("../utils/database");

module.exports = {
    name: Events.MessageReactionAdd,
    async execute(reaction, user) {
        try {
            if (user.bot) return;

            console.log("Reaction received:", {
                emoji: reaction.emoji.name,
                user: user.tag,
                channel: reaction.message.channel.name,
            });

            if (reaction.partial) {
                try {
                    await reaction.fetch();
                    console.log("Fetched partial reaction");
                } catch (error) {
                    console.error("Error fetching reaction:", error);
                    return;
                }
            }
            const config = await db.get(
                "SELECT * FROM guild_configs WHERE guild_id = ?",
                [reaction.message.guild.id]
            );
            if (!config) {
                console.log(
                    "No config found for guild:",
                    reaction.message.guild.id
                );
                return;
            }

            console.log("Guild config:", {
                reviewChannelId: config.review_channel_id,
                confessionChannelId: config.confession_channel_id,
            });

            if (reaction.message.channel.id !== config.review_channel_id) {
                console.log("Reaction not in review channel");
                return;
            }

            const confessionIdField = reaction.message.embeds[0]?.fields.find(
                (field) => field.name === "ID"
            )?.value;
            if (!confessionIdField) {
                console.log("No confession ID found in message");
                return;
            }

            const confessionId = confessionIdField.replace("#", "");
            console.log("Processing confession:", confessionId);

            const confession = await db.get(
                "SELECT * FROM confessions WHERE id = ?",
                [confessionId]
            );
            if (!confession) {
                console.log("Confession not found in database");
                return;
            }

            if (reaction.emoji.name === "✅") {
                console.log("Approving confession:", confessionId);

                const lastConfession = await db.get(
                    "SELECT confession_number FROM confessions WHERE status = 'approved' ORDER BY confession_number DESC LIMIT 1"
                );
                const nextConfessionNumber =
                    (lastConfession?.confession_number || 0) + 1;

                await db.run(
                    "UPDATE confessions SET status = 'approved', confession_number = ? WHERE id = ?",
                    [nextConfessionNumber, confessionId]
                );

                const confessionChannel =
                    reaction.message.guild.channels.cache.get(
                        config.confession_channel_id
                    );
                if (!confessionChannel) {
                    console.error(
                        "Confession channel not found:",
                        config.confession_channel_id
                    );
                    return;
                }

                const botMember = reaction.message.guild.members.cache.get(
                    reaction.client.user.id
                );
                const botPermissions =
                    botMember.permissionsIn(confessionChannel);

                console.log("Bot permissions in confession channel:", {
                    sendMessages: botPermissions.has(
                        PermissionsBitField.Flags.SendMessages
                    ),
                    embedLinks: botPermissions.has(
                        PermissionsBitField.Flags.EmbedLinks
                    ),
                    createPublicThreads: botPermissions.has(
                        PermissionsBitField.Flags.CreatePublicThreads
                    ),
                    sendMessagesInThreads: botPermissions.has(
                        PermissionsBitField.Flags.SendMessagesInThreads
                    ),
                    readMessageHistory: botPermissions.has(
                        PermissionsBitField.Flags.ReadMessageHistory
                    ),
                    viewChannel: botPermissions.has(
                        PermissionsBitField.Flags.ViewChannel
                    ),
                });

                const channelPermissions =
                    confessionChannel.permissionsFor(botMember);
                console.log("Channel specific permissions:", {
                    sendMessages: channelPermissions.has(
                        PermissionsBitField.Flags.SendMessages
                    ),
                    embedLinks: channelPermissions.has(
                        PermissionsBitField.Flags.EmbedLinks
                    ),
                    createPublicThreads: channelPermissions.has(
                        PermissionsBitField.Flags.CreatePublicThreads
                    ),
                    sendMessagesInThreads: channelPermissions.has(
                        PermissionsBitField.Flags.SendMessagesInThreads
                    ),
                    readMessageHistory: channelPermissions.has(
                        PermissionsBitField.Flags.ReadMessageHistory
                    ),
                    viewChannel: channelPermissions.has(
                        PermissionsBitField.Flags.ViewChannel
                    ),
                });

                if (
                    !botPermissions.has(
                        PermissionsBitField.Flags.SendMessages
                    ) ||
                    !botPermissions.has(PermissionsBitField.Flags.EmbedLinks) ||
                    !botPermissions.has(
                        PermissionsBitField.Flags.CreatePublicThreads
                    )
                ) {
                    console.error(
                        "Bot missing required permissions in confession channel"
                    );
                    return;
                }

                console.log(
                    "Sending confession to channel:",
                    confessionChannel.name
                );

                const currentTime = Math.floor(Date.now() / 1000);
                const confessionMessage = await confessionChannel.send({
                    embeds: [
                        {
                            title: `Confession #${nextConfessionNumber}`,
                            description: confession.content,
                            color: 0x00ff00,
                            fields: [
                                {
                                    name: "📅 Thời gian",
                                    value: `<t:${currentTime}:F> (<t:${currentTime}:R>)`,
                                    inline: true,
                                },
                            ],
                            timestamp: new Date(),
                        },
                    ],
                });

                console.log(
                    "Created confession message:",
                    confessionMessage.id
                );

                const thread = await confessionMessage.startThread({
                    name: `Bình luận Confession #${nextConfessionNumber}`,
                    autoArchiveDuration: 1440,
                });

                console.log("Created thread:", thread.id);

                await db.run(
                    "UPDATE confessions SET message_id = ?, thread_id = ? WHERE id = ?",
                    [confessionMessage.id, thread.id, confessionId]
                );

                const reviewEmbed = reaction.message.embeds[0];
                reviewEmbed.fields.find(
                    (field) => field.name === "Trạng thái"
                ).value = "✅ Đã duyệt";
                reviewEmbed.color = 0x00ff00;

                await reaction.message.edit({ embeds: [reviewEmbed] });
            }
            // Handle rejection
            else if (reaction.emoji.name === "❌") {
                console.log("Rejecting confession:", confessionId);

                await db.run(
                    "UPDATE confessions SET status = 'rejected' WHERE id = ?",
                    [confessionId]
                );

                const reviewEmbed = reaction.message.embeds[0];
                reviewEmbed.fields.find(
                    (field) => field.name === "Trạng thái"
                ).value = "❌ Đã từ chối";
                reviewEmbed.color = 0xff0000;

                await reaction.message.edit({ embeds: [reviewEmbed] });
            }
        } catch (error) {
            console.error("Error handling reaction:", error);
        }
    },
};
