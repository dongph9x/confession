const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("../data/database");

module.exports = {
    name: "interactionCreate",
    async execute(interaction) {
        if (!interaction.isButton()) return;

        const { customId } = interaction;
        
        // Xử lý các button review confession
        if (customId.startsWith('approve_') || customId.startsWith('reject_') || customId.startsWith('edit_')) {
            await handleConfessionReview(interaction, customId);
        }
    },
};

async function handleConfessionReview(interaction, customId) {
    // Kiểm tra quyền
    if (!interaction.member.permissions.has('ManageMessages')) {
        return interaction.reply({
            content: "❌ Bạn không có quyền để duyệt confession!",
            ephemeral: true
        });
    }

    const confessionId = customId.split('_')[1];
    const action = customId.split('_')[0];

    try {
        const confession = await db.getConfession(confessionId);
        if (!confession) {
            return interaction.reply({
                content: "❌ Không tìm thấy confession này!",
                ephemeral: true
            });
        }

        const guildSettings = await db.getGuildSettings(interaction.guild.id);
        
        if (action === 'approve') {
            // Duyệt confession
            const confessionChannel = interaction.guild.channels.cache.get(guildSettings.confession_channel);
            if (!confessionChannel) {
                return interaction.reply({
                    content: "❌ Kênh confession chưa được thiết lập!",
                    ephemeral: true
                });
            }

            // Lấy thông tin người gửi confession
            const confessionAuthor = await interaction.client.users.fetch(confession.user_id);

            // Tạo embed cho confession đã duyệt
            const approvedEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle("💝 Confession #" + (await db.getGuildSettings(interaction.guild.id)).confession_counter + 1)
                .setDescription(confession.content)
                .addFields(
                    { name: "👤 Người gửi", value: `<@${confession.user_id}>`, inline: true },
                    { name: "⏰ Thời gian", value: `<t:${Math.floor(new Date(confession.created_at).getTime() / 1000)}:R>`, inline: true }
                )
                .setAuthor({
                    name: confessionAuthor.username,
                    iconURL: confessionAuthor.displayAvatarURL()
                })
                .setFooter({
                    text: `Confession Bot • ${interaction.guild.name}`,
                    iconURL: interaction.guild.iconURL(),
                })
                .setTimestamp();

            const message = await confessionChannel.send({ embeds: [approvedEmbed] });

            // Tạo thread cho confession để người dùng có thể bình luận
            const thread = await message.startThread({
                name: `💬 Bình luận Confession #${(await db.getGuildSettings(interaction.guild.id)).confession_counter}`,
                autoArchiveDuration: 1440, // 24 giờ
                reason: 'Thread cho confession'
            });

            // Gửi tin nhắn chào mừng trong thread
            await thread.send({
                content: `💬 **Bình luận Confession #${(await db.getGuildSettings(interaction.guild.id)).confession_counter}**\n\nHãy để lại cảm xúc và bình luận của bạn về confession này!`
            });

            // Cập nhật trạng thái trong database với message ID và thread ID
            await db.updateConfessionStatus(confessionId, 'approved', interaction.user.id, message.id, thread.id);

            // Cập nhật embed gốc
            const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
                .setColor(0x00FF00)
                .setTitle("✅ Confession Đã Được Duyệt")
                .addFields(
                    { name: "👨‍⚖️ Duyệt bởi", value: `<@${interaction.user.id}>`, inline: true },
                    { name: "⏰ Thời gian duyệt", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
                );

            // Disable buttons
            const disabledButtons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`approve_${confessionId}`)
                        .setLabel("✅ Đã Duyệt")
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId(`reject_${confessionId}`)
                        .setLabel("❌ Từ chối")
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId(`edit_${confessionId}`)
                        .setLabel("✏️ Chỉnh sửa")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true)
                );

            await interaction.message.edit({
                embeds: [updatedEmbed],
                components: [disabledButtons]
            });

            await interaction.reply({
                content: `✅ Đã duyệt confession #${confessionId}!`,
                ephemeral: true
            });

            // Thông báo cho người gửi
            try {
                const user = await interaction.client.users.fetch(confession.user_id);
                await user.send({
                    content: `🎉 Confession của bạn đã được duyệt và đăng lên server **${interaction.guild.name}**!`
                });
            } catch (error) {
                console.log("Không thể gửi DM cho user:", error.message);
            }

        } else if (action === 'reject') {
            // Từ chối confession
            await db.updateConfessionStatus(confessionId, 'rejected', interaction.user.id);

            const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
                .setColor(0xFF0000)
                .setTitle("❌ Confession Đã Bị Từ Chối")
                .addFields(
                    { name: "👨‍⚖️ Từ chối bởi", value: `<@${interaction.user.id}>`, inline: true },
                    { name: "⏰ Thời gian từ chối", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
                );

            const disabledButtons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`approve_${confessionId}`)
                        .setLabel("✅ Duyệt")
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId(`reject_${confessionId}`)
                        .setLabel("❌ Đã Từ Chối")
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId(`edit_${confessionId}`)
                        .setLabel("✏️ Chỉnh sửa")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true)
                );

            await interaction.message.edit({
                embeds: [updatedEmbed],
                components: [disabledButtons]
            });

            await interaction.reply({
                content: `❌ Đã từ chối confession #${confessionId}!`,
                ephemeral: true
            });

            // Thông báo cho người gửi
            try {
                const user = await interaction.client.users.fetch(confession.user_id);
                await user.send({
                    content: `😔 Confession của bạn đã bị từ chối trên server **${interaction.guild.name}**.`
                });
            } catch (error) {
                console.log("Không thể gửi DM cho user:", error.message);
            }

        } else if (action === 'edit') {
            // Hiển thị modal để chỉnh sửa
            await interaction.reply({
                content: "✏️ Tính năng chỉnh sửa sẽ được phát triển trong phiên bản tiếp theo!",
                ephemeral: true
            });
        }

    } catch (error) {
        console.error("Lỗi khi xử lý review confession:", error);
        await interaction.reply({
            content: "❌ Đã xảy ra lỗi khi xử lý review!",
            ephemeral: true
        });
    }
} 