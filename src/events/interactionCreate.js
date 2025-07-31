const { Events, PermissionFlagsBits } = require("discord.js");
const { db } = require("../utils/database");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const { commandName } = interaction;

        try {
            let config = await db.get(
                "SELECT * FROM guild_configs WHERE guild_id = ?",
                [interaction.guild.id]
            );

            if (!config) {
                await db.run(
                    "INSERT INTO guild_configs (guild_id) VALUES (?)",
                    [interaction.guild.id]
                );
                config = await db.get(
                    "SELECT * FROM guild_configs WHERE guild_id = ?",
                    [interaction.guild.id]
                );
            }

            switch (commandName) {
                case "confess":
                    const content = interaction.options.getString("content");

                    const result = await db.run(
                        "INSERT INTO confessions (guild_id, content, author_id, status) VALUES (?, ?, ?, ?)",
                        [
                            interaction.guild.id,
                            content,
                            interaction.user.id,
                            "pending",
                        ]
                    );

                    const confessionId = result.lastID;

                    const targetReviewChannel =
                        interaction.guild.channels.cache.get(
                            config.review_channel_id
                        );
                    if (!targetReviewChannel) {
                        await interaction.reply({
                            content: "Kênh kiểm duyệt chưa được thiết lập!",
                            ephemeral: true,
                        });
                        return;
                    }

                    const currentTime = Math.floor(Date.now() / 1000);
                    const reviewMessage = await targetReviewChannel.send({
                        embeds: [
                            {
                                title: "Confession mới",
                                description: content,
                                color: 0xffff00,
                                fields: [
                                    {
                                        name: "👤 Người gửi",
                                        value: `<@${interaction.user.id}>`,
                                        inline: true,
                                    },
                                    {
                                        name: "📅 Thời gian",
                                        value: `<t:${currentTime}:F> (<t:${currentTime}:R>)`,
                                        inline: true,
                                    },
                                    {
                                        name: "ID",
                                        value: `#${confessionId}`,
                                        inline: false,
                                    },
                                    {
                                        name: "Trạng thái",
                                        value: "⏳ Đang chờ duyệt",
                                        inline: false,
                                    },
                                ],
                                timestamp: new Date(),
                            },
                        ],
                    });

                    await reviewMessage.react("✅");
                    await reviewMessage.react("❌");

                    await db.run(
                        "UPDATE confessions SET review_message_id = ? WHERE id = ?",
                        [reviewMessage.id, confessionId]
                    );

                    await interaction.reply({
                        content:
                            "✅ Confession của bạn đã được gửi và đang chờ duyệt!",
                        ephemeral: true,
                    });
                    break;

                case "setreviewchannel":
                    if (
                        !interaction.member.permissions.has(
                            PermissionFlagsBits.Administrator
                        )
                    ) {
                        await interaction.reply({
                            content: "Bạn không có quyền sử dụng lệnh này!",
                            ephemeral: true,
                        });
                        return;
                    }

                    const newReviewChannel =
                        interaction.options.getChannel("channel");

                    await db.run(
                        "UPDATE guild_configs SET review_channel_id = ? WHERE guild_id = ?",
                        [newReviewChannel.id, interaction.guild.id]
                    );

                    await interaction.reply({
                        content: `✅ Đã cập nhật kênh kiểm duyệt thành ${newReviewChannel}`,
                        ephemeral: true,
                    });
                    break;

                case "setconfessionchannel":
                    if (
                        !interaction.member.permissions.has(
                            PermissionFlagsBits.Administrator
                        )
                    ) {
                        await interaction.reply({
                            content: "Bạn không có quyền sử dụng lệnh này!",
                            ephemeral: true,
                        });
                        return;
                    }

                    const confessionChannel =
                        interaction.options.getChannel("channel");

                    await db.run(
                        "UPDATE guild_configs SET confession_channel_id = ? WHERE guild_id = ?",
                        [confessionChannel.id, interaction.guild.id]
                    );

                    await interaction.reply({
                        content: `✅ Đã cập nhật kênh hiển thị confession thành ${confessionChannel}`,
                        ephemeral: true,
                    });
                    break;

                case "help":
                    const embed = {
                        title: "📝 Danh sách lệnh của Confession Bot",
                        color: 0x00ff00,
                        description: "Dưới đây là danh sách các lệnh có sẵn:",
                        fields: [
                            {
                                name: "🤫 Lệnh Confession",
                                value: "`/confess content:<nội dung>` - Gửi một confession mới\n`cf!confess <nội dung>` - Gửi confession (Prefix Command)",
                                inline: false,
                            },
                            {
                                name: "⚙️ Lệnh Admin",
                                value: "`/setreviewchannel` - Thiết lập kênh kiểm duyệt\n`/setconfessionchannel` - Thiết lập kênh hiển thị\n`cf!setreview #kênh` - Thiết lập kênh kiểm duyệt (Prefix Command)\n`cf!setconfess #kênh` - Thiết lập kênh hiển thị (Prefix Command)",
                                inline: false,
                            },
                            {
                                name: "❓ Lệnh Trợ giúp",
                                value: "`/help` - Hiển thị danh sách lệnh này\n`cf!help` - Hiển thị danh sách lệnh (Prefix Command)",
                                inline: false,
                            },
                        ],
                        footer: {
                            text: "Confession Bot - Made with ❤️",
                        },
                        timestamp: new Date(),
                    };

                    await interaction.reply({
                        embeds: [embed],
                        ephemeral: true,
                    });
                    break;
            }
        } catch (error) {
            console.error("Error handling slash command:", error);
            await interaction.reply({
                content: "Có lỗi xảy ra khi thực hiện lệnh!",
                ephemeral: true,
            });
        }
    },
};
