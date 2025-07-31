const { SlashCommandBuilder } = require("discord.js");
const Confession = require("../models/Confession");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("confess")
        .setDescription("Gửi một confession")
        .addStringOption((option) =>
            option
                .setName("content")
                .setDescription("Nội dung confession")
                .setRequired(true)
        ),

    async execute(interaction) {
        const content = interaction.options.getString("content");
        const authorId = interaction.user.id;

        try {
            const confession = new Confession({
                content,
                authorId,
                status: "pending",
            });

            await confession.save();

            // Gửi confession đến kênh kiểm duyệt
            const reviewChannel = interaction.client.config.reviewChannel;
            if (!reviewChannel) {
                return interaction.reply({
                    content: "Kênh kiểm duyệt chưa được thiết lập!",
                    ephemeral: true,
                });
            }

            const reviewMessage = await reviewChannel.send({
                embeds: [
                    {
                        title: "Confession mới",
                        description: content,
                        color: 0x0099ff,
                        fields: [
                            {
                                name: "ID",
                                value: confession._id.toString(),
                                inline: true,
                            },
                            {
                                name: "Trạng thái",
                                value: "Đang chờ duyệt",
                                inline: true,
                            },
                        ],
                        timestamp: new Date(),
                    },
                ],
            });

            // Thêm các nút để duyệt/từ chối
            await reviewMessage.react("✅");
            await reviewMessage.react("❌");

            await interaction.reply({
                content: "Confession của bạn đã được gửi và đang chờ duyệt!",
                ephemeral: true,
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "Có lỗi xảy ra khi gửi confession!",
                ephemeral: true,
            });
        }
    },
};
