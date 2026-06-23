const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ChannelType } = require("discord.js");
const db = require("../data/mongodb");

module.exports = {
    async execute(interaction) {
        if (!interaction.isStringSelectMenu()) return;

        const { customId } = interaction;

        // Xử lý setup select menu
        if (customId.startsWith('setup_')) {
            await handleSetupSelectMenu(interaction, customId);
        }
        
        // Xử lý config select menu
        if (customId === 'config_action') {
            await handleConfigSelectMenu(interaction);
        }
        
        // Xử lý toggle anonymous mode
        if (customId === 'toggle_anonymous') {
            await handleToggleAnonymous(interaction);
        }
    },
};

async function handleSetupSelectMenu(interaction, customId) {
    // Kiểm tra quyền
    if (!interaction.member.permissions.has("Administrator")) {
        return interaction.reply({
            content: "❌ Bạn cần quyền Administrator để sử dụng tính năng này!",
            flags: 64 // Ephemeral flag
        });
    }

    const action = customId.split('_')[1];
    const selectedChannelId = interaction.values[0];
    const selectedChannel = interaction.guild.channels.cache.get(selectedChannelId);

    if (!selectedChannel) {
        return interaction.reply({
            content: "❌ Không tìm thấy kênh đã chọn!",
            flags: 64 // Ephemeral flag
        });
    }

    try {
        if (action === "confession") {
            // Thiết lập kênh confession
            await db.setConfessionChannel(interaction.guild.id, selectedChannelId);

            const successEmbed = new EmbedBuilder()
                .setTitle("✅ Kênh Confession Đã Được Thiết Lập")
                .setDescription(`Kênh ${selectedChannel} sẽ được sử dụng để đăng confessions đã được duyệt.`)
                .setColor(0x00FF00)
                .addFields(
                    { name: "📝 Kênh Confession", value: selectedChannel.toString(), inline: true },
                    { name: "🎯 Trạng thái", value: "✅ Sẵn sàng nhận confessions", inline: true }
                )
                .setFooter({ text: "Confession Bot • Facebook Style" })
                .setTimestamp();

            await interaction.update({
                embeds: [successEmbed],
                components: []
            });

        } else if (action === "review") {
            // Thiết lập kênh review
            await db.setReviewChannel(interaction.guild.id, selectedChannelId);

            const successEmbed = new EmbedBuilder()
                .setTitle("✅ Kênh Review Đã Được Thiết Lập")
                .setDescription(`Kênh ${selectedChannel} sẽ được sử dụng để review confessions.`)
                .setColor(0x00FF00)
                .addFields(
                    { name: "👨‍⚖️ Kênh Review", value: selectedChannel.toString(), inline: true },
                    { name: "🎯 Trạng thái", value: "✅ Sẵn sàng review confessions", inline: true }
                )
                .setFooter({ text: "Confession Bot • Facebook Style" })
                .setTimestamp();

            await interaction.update({
                embeds: [successEmbed],
                components: []
            });

        } else if (action === "both") {
            // Thiết lập cả hai kênh
            await db.setConfessionChannel(interaction.guild.id, selectedChannelId);
            await db.setReviewChannel(interaction.guild.id, selectedChannelId);

            const successEmbed = new EmbedBuilder()
                .setTitle("✅ Cả Hai Kênh Đã Được Thiết Lập")
                .setDescription(`Kênh ${selectedChannel} sẽ được sử dụng cho cả confession và review.`)
                .setColor(0x00FF00)
                .addFields(
                    { name: "📝 Kênh Confession", value: selectedChannel.toString(), inline: true },
                    { name: "👨‍⚖️ Kênh Review", value: selectedChannel.toString(), inline: true },
                    { name: "🎯 Trạng thái", value: "✅ Sẵn sàng hoạt động", inline: true }
                )
                .setFooter({ text: "Confession Bot • Facebook Style" })
                .setTimestamp();

            await interaction.update({
                embeds: [successEmbed],
                components: []
            });
        }

        // Gửi thông báo thành công
        await interaction.followUp({
            content: `✅ Đã thiết lập thành công! Bây giờ bạn có thể sử dụng \`/confess\` hoặc \`!confess\` để gửi confessions.`,
            flags: 64 // Ephemeral flag
        });

    } catch (error) {
        console.error("Lỗi khi thiết lập kênh:", error);
        await interaction.reply({
            content: "❌ Đã xảy ra lỗi khi thiết lập kênh!",
            flags: 64 // Ephemeral flag
        });
    }
}

async function handleConfigSelectMenu(interaction) {
    // Kiểm tra quyền
    if (!interaction.member.permissions.has("Administrator")) {
        return interaction.reply({
            content: "❌ Bạn cần quyền Administrator để sử dụng tính năng này!",
            flags: 64 // Ephemeral flag
        });
    }

    const action = interaction.values[0];

    if (action === "view_stats") {
        // Hiển thị thống kê
        const confessionStats = await db.getConfessionStats(interaction.guild.id);
        const reactionStats = await db.getReactionStats(interaction.guild.id);
        const commentStats = await db.getCommentStats(interaction.guild.id);

        const statsEmbed = new EmbedBuilder()
            .setTitle("📊 Thống Kê Confession")
            .setColor(0x1877F2)
            .addFields(
                { name: "📝 Confessions", value: `Tổng: **${confessionStats.total}**\nĐã duyệt: **${confessionStats.approved}**\nChờ duyệt: **${confessionStats.pending}**\nBị từ chối: **${confessionStats.rejected}**`, inline: true },
                { name: "❤️ Reactions", value: `Confessions có reactions: **${reactionStats.confessions_with_reactions}**\nTổng reactions: **${reactionStats.total_reactions}**\nUsers đã react: **${reactionStats.unique_users_reacted}**`, inline: true },
                { name: "💬 Comments", value: `Confessions có comments: **${commentStats.confessions_with_comments}**\nTổng comments: **${commentStats.total_comments}**\nUsers đã comment: **${commentStats.unique_users_commented}**`, inline: true }
            )
            .setFooter({ text: "Confession Bot • Facebook Style" })
            .setTimestamp();

        await interaction.update({
            embeds: [statsEmbed],
            components: []
        });

            } else if (action === "toggle_anonymous") {
            // Xử lý toggle anonymous mode
            await handleToggleAnonymous(interaction);
        } else {
            // Tạo select menu cho channels
            const channels = interaction.guild.channels.cache
                .filter(channel => channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildForum) // Text + Forum
                .map(channel => ({
                    label: `#${channel.name}`,
                    value: channel.id,
                    description: `Kênh: ${channel.name}`
                }));

                    if (channels.length === 0) {
            return interaction.reply({
                content: "❌ Không tìm thấy kênh text nào trong server!",
                flags: 64 // Ephemeral flag
            });
        }

            // Tạo select menu cho channels
            const channelSelectMenu = new StringSelectMenuBuilder()
                .setCustomId(`setup_${action.split('_')[1]}`)
                .setPlaceholder("Chọn kênh...")
                .addOptions(channels.slice(0, 25)); // Discord chỉ cho phép tối đa 25 options

            const row = new ActionRowBuilder().addComponents(channelSelectMenu);

            let title, description;
            switch (action) {
                case "setup_confession":
                    title = "📝 Thiết lập kênh Confession";
                    description = "Chọn kênh để đăng confessions đã được duyệt:";
                    break;
                case "setup_review":
                    title = "👨‍⚖️ Thiết lập kênh Review";
                    description = "Chọn kênh để review confessions:";
                    break;
                case "setup_both":
                    title = "🔄 Thiết lập cả hai kênh";
                    description = "Chọn kênh cho cả confession và review:";
                    break;
            }

            const setupEmbed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor(0x1877F2)
                .setFooter({ text: "Confession Bot • Facebook Style" })
                .setTimestamp();

                         await interaction.update({
                 embeds: [setupEmbed],
                 components: [row]
             });
         }
 }

async function handleToggleAnonymous(interaction) {
    // Kiểm tra quyền
    if (!interaction.member.permissions.has("Administrator")) {
        return interaction.reply({
            content: "❌ Bạn cần quyền Administrator để sử dụng tính năng này!",
            ephemeral: true
        });
    }

    try {
        const currentMode = await db.getAnonymousMode(interaction.guild.id);
        const newMode = !currentMode;
        
        await db.setAnonymousMode(interaction.guild.id, newMode);

        const statusEmbed = new EmbedBuilder()
            .setTitle(newMode ? "🕵️ Chế độ Ẩn danh Đã Bật" : "👤 Chế độ Ẩn danh Đã Tắt")
            .setDescription(newMode 
                ? "Confessions sẽ được đăng ẩn danh - không hiển thị tên người gửi."
                : "Confessions sẽ hiển thị tên người gửi khi được đăng."
            )
            .setColor(newMode ? 0x00FF00 : 0xFF0000)
            .addFields(
                { 
                    name: "🕵️ Trạng thái", 
                    value: newMode ? "✅ Bật" : "❌ Tắt", 
                    inline: true 
                },
                { 
                    name: "📝 Ảnh hưởng", 
                    value: newMode 
                        ? "Confessions sẽ ẩn danh"
                        : "Confessions sẽ hiển thị tên", 
                    inline: true 
                }
            )
            .setFooter({ 
                text: `Confession Bot • ${interaction.guild.name}`,
                iconURL: interaction.guild.iconURL()
            })
            .setTimestamp();

        await interaction.update({
            embeds: [statusEmbed],
            components: []
        });

        // Gửi thông báo thành công
        await interaction.followUp({
            content: `✅ Đã ${newMode ? 'bật' : 'tắt'} chế độ ẩn danh thành công!`,
            flags: 64 // Ephemeral flag
        });

    } catch (error) {
        console.error("Lỗi khi toggle anonymous mode:", error);
        await interaction.reply({
            content: "❌ Đã xảy ra lỗi khi thay đổi chế độ ẩn danh!",
            flags: 64 // Ephemeral flag
        });
    }
} 