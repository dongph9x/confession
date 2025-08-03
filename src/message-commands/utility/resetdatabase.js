const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("../../data/mongodb");

module.exports = {
    name: "resetdatabase",
    description: "Reset database - Xóa tất cả dữ liệu",
    async execute(message, args) {
        // Kiểm tra quyền admin
        if (!message.member.permissions.has('Administrator')) {
            const errorMsg = await message.channel.send(
                "❌ Bạn không có quyền để reset database! Chỉ Admin mới có thể sử dụng lệnh này."
            );
            setTimeout(() => {
                errorMsg.delete().catch(() => {});
            }, 5000);
            return;
        }

        // Xóa tin nhắn gốc
        try {
            await message.delete();
        } catch (error) {
            console.log("Could not delete message:", error.message);
        }

        // Tạo embed menu
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle("🗑️ Reset Database")
            .setDescription("**⚠️ CẢNH BÁO: Hành động này sẽ xóa VĨNH VIỄN tất cả dữ liệu!**\n\nChọn bảng bạn muốn xóa:")
            .addFields(
                { name: "📊 Confessions", value: "Xóa tất cả confessions", inline: true },
                { name: "💬 Comments", value: "Xóa tất cả comments", inline: true },
                { name: "😀 Emoji Reactions", value: "Xóa tất cả emoji reactions", inline: true },
                { name: "⚙️ Guild Settings", value: "Xóa tất cả guild settings", inline: true },
                { name: "🎵 Music Settings", value: "Xóa tất cả music settings", inline: true },
                { name: "🗑️ ALL TABLES", value: "Xóa TẤT CẢ dữ liệu", inline: true }
            )
            .setFooter({
                text: "⚠️ Không thể hoàn tác sau khi xóa!",
                iconURL: message.guild.iconURL()
            })
            .setTimestamp();

        // Tạo buttons
        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('reset_confessions')
                    .setLabel('🗑️ Confessions')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('reset_comments')
                    .setLabel('🗑️ Comments')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('reset_emojireactions')
                    .setLabel('🗑️ Emoji Reactions')
                    .setStyle(ButtonStyle.Danger)
            );

        const buttons2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('reset_guildsettings')
                    .setLabel('🗑️ Guild Settings')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('reset_musicsettings')
                    .setLabel('🗑️ Music Settings')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('reset_all')
                    .setLabel('💥 RESET ALL')
                    .setStyle(ButtonStyle.Danger)
            );

        const buttons3 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('cancel_reset')
                    .setLabel('❌ Hủy')
                    .setStyle(ButtonStyle.Secondary)
            );

        const menuMsg = await message.channel.send({
            embeds: [embed],
            components: [buttons, buttons2, buttons3]
        });

        // Tạo collector để xử lý button clicks
        const collector = menuMsg.createMessageComponentCollector({
            time: 300000 // 5 phút
        });

        collector.on('collect', async (interaction) => {
            if (interaction.user.id !== message.author.id) {
                await interaction.reply({
                    content: "❌ Chỉ người tạo menu mới có thể sử dụng!",
                    flags: 64
                });
                return;
            }

            const customId = interaction.customId;
            let tableName = '';
            let action = '';

            switch (customId) {
                case 'reset_confessions':
                    tableName = 'Confessions';
                    action = 'confessions';
                    break;
                case 'reset_comments':
                    tableName = 'Comments';
                    action = 'comments';
                    break;
                case 'reset_emojireactions':
                    tableName = 'Emoji Reactions';
                    action = 'emojireactions';
                    break;
                case 'reset_guildsettings':
                    tableName = 'Guild Settings';
                    action = 'guildsettings';
                    break;
                case 'reset_musicsettings':
                    tableName = 'Music Settings';
                    action = 'musicsettings';
                    break;
                case 'reset_all':
                    tableName = 'TẤT CẢ BẢNG';
                    action = 'all';
                    break;
                case 'cancel_reset':
                    await interaction.update({
                        content: "❌ Đã hủy reset database!",
                        embeds: [],
                        components: []
                    });
                    return;
                default:
                    await interaction.reply({
                        content: "❌ Lựa chọn không hợp lệ!",
                        flags: 64
                    });
                    return;
            }

            // Xác nhận xóa
            const confirmEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle(`🗑️ Xác nhận xóa ${tableName}`)
                .setDescription(`**⚠️ Bạn có chắc chắn muốn xóa ${tableName}?**\n\nHành động này không thể hoàn tác!`)
                .setFooter({
                    text: "Nhấn 'Xác nhận' để xóa hoặc 'Hủy' để dừng",
                    iconURL: message.guild.iconURL()
                })
                .setTimestamp();

            const confirmButtons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`confirm_${action}`)
                        .setLabel('✅ Xác nhận')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('cancel_confirm')
                        .setLabel('❌ Hủy')
                        .setStyle(ButtonStyle.Secondary)
                );

            await interaction.update({
                embeds: [confirmEmbed],
                components: [confirmButtons]
            });

            // Tạo collector cho xác nhận
            const confirmCollector = menuMsg.createMessageComponentCollector({
                time: 60000 // 1 phút
            });

            confirmCollector.on('collect', async (confirmInteraction) => {
                if (confirmInteraction.user.id !== message.author.id) {
                    await confirmInteraction.reply({
                        content: "❌ Chỉ người tạo menu mới có thể sử dụng!",
                        flags: 64
                    });
                    return;
                }

                if (confirmInteraction.customId === 'cancel_confirm') {
                    await confirmInteraction.update({
                        content: "❌ Đã hủy xóa dữ liệu!",
                        embeds: [],
                        components: []
                    });
                    return;
                }

                if (confirmInteraction.customId === `confirm_${action}`) {
                    try {
                        await confirmInteraction.deferUpdate();
                        
                        let result = '';
                        const startTime = Date.now();

                        if (action === 'all') {
                            // Xóa tất cả bảng
                            result = await resetAllTables();
                        } else {
                            // Xóa bảng cụ thể
                            result = await resetSpecificTable(action);
                        }

                        const endTime = Date.now();
                        const duration = endTime - startTime;

                        const successEmbed = new EmbedBuilder()
                            .setColor(0x00FF00)
                            .setTitle(`✅ Đã xóa ${tableName} thành công!`)
                            .setDescription(result)
                            .addFields(
                                { name: "⏱️ Thời gian", value: `${duration}ms`, inline: true },
                                { name: "👤 Người thực hiện", value: `<@${message.author.id}>`, inline: true },
                                { name: "⏰ Thời gian", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
                            )
                            .setFooter({
                                text: "Database đã được reset!",
                                iconURL: message.guild.iconURL()
                            })
                            .setTimestamp();

                        await confirmInteraction.editReply({
                            embeds: [successEmbed],
                            components: []
                        });

                    } catch (error) {
                        console.error("Error resetting database:", error);
                        await confirmInteraction.editReply({
                            content: `❌ Lỗi khi xóa ${tableName}: ${error.message}`,
                            embeds: [],
                            components: []
                        });
                    }
                }
            });
        });

        collector.on('end', () => {
            // Disable buttons sau khi hết thời gian
            const disabledButtons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('reset_confessions')
                        .setLabel('🗑️ Confessions')
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('reset_comments')
                        .setLabel('🗑️ Comments')
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('reset_emojireactions')
                        .setLabel('🗑️ Emoji Reactions')
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true)
                );

            const disabledButtons2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('reset_guildsettings')
                        .setLabel('🗑️ Guild Settings')
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('reset_musicsettings')
                        .setLabel('🗑️ Music Settings')
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('reset_all')
                        .setLabel('💥 RESET ALL')
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true)
                );

            menuMsg.edit({
                embeds: [embed.setDescription("⏰ Menu đã hết hạn!")],
                components: [disabledButtons, disabledButtons2]
            }).catch(() => {});
        });
    },
};

// Hàm xóa bảng cụ thể
async function resetSpecificTable(tableName) {
    const Confession = require('../../models/Confession');
    const Comment = require('../../models/Comment');
    const EmojiReaction = require('../../models/EmojiReaction');
    const GuildSettings = require('../../models/GuildSettings');
    const MusicSettings = require('../../models/MusicSettings');

    let deletedCount = 0;
    let tableDisplayName = '';

    switch (tableName) {
        case 'confessions':
            const confessions = await Confession.deleteMany({});
            deletedCount = confessions.deletedCount;
            tableDisplayName = 'Confessions';
            break;
        case 'comments':
            const comments = await Comment.deleteMany({});
            deletedCount = comments.deletedCount;
            tableDisplayName = 'Comments';
            break;
        case 'emojireactions':
            const emojiReactions = await EmojiReaction.deleteMany({});
            deletedCount = emojiReactions.deletedCount;
            tableDisplayName = 'Emoji Reactions';
            break;
        case 'guildsettings':
            const guildSettings = await GuildSettings.deleteMany({});
            deletedCount = guildSettings.deletedCount;
            tableDisplayName = 'Guild Settings';
            break;
        case 'musicsettings':
            const musicSettings = await MusicSettings.deleteMany({});
            deletedCount = musicSettings.deletedCount;
            tableDisplayName = 'Music Settings';
            break;
        default:
            throw new Error(`Bảng ${tableName} không tồn tại!`);
    }

    return `✅ Đã xóa **${deletedCount}** bản ghi từ bảng **${tableDisplayName}**`;
}

// Hàm xóa tất cả bảng
async function resetAllTables() {
    const Confession = require('../../models/Confession');
    const Comment = require('../../models/Comment');
    const EmojiReaction = require('../../models/EmojiReaction');
    const GuildSettings = require('../../models/GuildSettings');
    const MusicSettings = require('../../models/MusicSettings');

    const results = await Promise.all([
        Confession.deleteMany({}),
        Comment.deleteMany({}),
        EmojiReaction.deleteMany({}),
        GuildSettings.deleteMany({}),
        MusicSettings.deleteMany({})
    ]);

    const totalDeleted = results.reduce((sum, result) => sum + result.deletedCount, 0);

    return `✅ Đã xóa **${totalDeleted}** bản ghi từ tất cả bảng:\n\n` +
           `• **Confessions**: ${results[0].deletedCount} bản ghi\n` +
           `• **Comments**: ${results[1].deletedCount} bản ghi\n` +
           `• **Emoji Reactions**: ${results[2].deletedCount} bản ghi\n` +
           `• **Guild Settings**: ${results[3].deletedCount} bản ghi\n` +
           `• **Music Settings**: ${results[4].deletedCount} bản ghi`;
} 