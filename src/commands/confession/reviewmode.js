const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const db = require("../../data/mongodb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reviewmode")
        .setDescription("Bật/tắt chế độ kiểm duyệt confession")
        .addBooleanOption((option) =>
            option
                .setName("bat")
                .setDescription("true = cần mod duyệt | false = đăng thẳng không duyệt")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const enabled = interaction.options.getBoolean("bat");

        await db.setRequireReview(interaction.guild.id, enabled);

        const embed = new EmbedBuilder()
            .setColor(enabled ? 0x00ff00 : 0xffa500)
            .setTitle(enabled ? "✅ Đã BẬT kiểm duyệt" : "⚡ Đã TẮT kiểm duyệt")
            .setDescription(
                enabled
                    ? "Confession sẽ được gửi vào **kênh review** để mod duyệt trước khi đăng."
                    : "Confession sẽ được **đăng thẳng** vào kênh confession, **không qua duyệt**."
            )
            .setFooter({
                text: enabled
                    ? "Cần thiết lập kênh review (/setreviewchannel)."
                    : "Cần thiết lập kênh confession (/setconfess).",
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], flags: 64 });
    },
};
