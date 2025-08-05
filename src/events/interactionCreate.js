const { Events, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("../data/mongodb");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Xử lý modal submission
        if (interaction.isModalSubmit()) {
            const { customId } = interaction;
            
            if (customId === 'confession_modal') {
                try {
                    await handleConfessionModal(interaction);
                } catch (error) {
                    console.error('Lỗi khi xử lý confession modal:', error);
                }
                return;
            }
        }
        
                // Chỉ xử lý modal submission, không xử lý slash commands
        return;
    },
};

// Function xử lý modal confession - sử dụng logic từ lệnh !c
async function handleConfessionModal(interaction) {
    try {
        await interaction.deferReply({ flags: 64 }); // 64 = MessageFlags.Ephemeral

        // Lấy dữ liệu từ modal
        const content = interaction.fields.getTextInputValue('confession_content');
        const typeInput = interaction.fields.getTextInputValue('confession_type');
        const isAnonymous = typeInput.toLowerCase() === 'anonymous';

        console.log(`📝 [MODAL] Confession từ ${interaction.user.tag}: ${content.substring(0, 50)}...`);
        console.log(`📝 [MODAL] Loại: ${isAnonymous ? 'Ẩn danh' : 'Công khai'}`);

        // Kiểm tra độ dài confession
        if (content.length > 2000) {
            return interaction.editReply({
                content: "❌ Confession quá dài! Tối đa 2000 ký tự.",
                flags: 64,
            });
        }

        if (content.length < 10) {
            return interaction.editReply({
                content: "❌ Confession quá ngắn! Tối thiểu 10 ký tự.",
                flags: 64,
            });
        }

        // Kiểm tra xem user đã có confession đang chờ duyệt chưa
        const pendingConfessions = await db.getUserPendingConfessions(interaction.guild.id, interaction.user.id);
        if (pendingConfessions.length > 0) {
            const oldestPending = pendingConfessions[0];
            const timeAgo = Math.floor((Date.now() - new Date(oldestPending.createdAt).getTime()) / 1000 / 60); // phút
            
            return interaction.editReply({
                content: `❌ Bạn đã có confession đang chờ duyệt!\n\n\`#${oldestPending._id}\` - ${oldestPending.content.substring(0, 50)}${oldestPending.content.length > 50 ? '...' : ''}\n\n⏰ Đã gửi ${timeAgo} phút trước\n\nVui lòng chờ confession này được duyệt hoặc từ chối trước khi gửi confession mới.`,
                flags: 64,
            });
        }

        // Lấy guild settings
        const guildSettings = await db.getGuildSettings(interaction.guild.id);
        if (!guildSettings?.reviewChannel) {
            return interaction.editReply({
                content: "❌ Kênh review confession chưa được thiết lập! Hãy nhờ Admin sử dụng lệnh `!setreview`",
                flags: 64,
            });
        }

        const reviewChannel = interaction.guild.channels.cache.get(guildSettings.reviewChannel);
        if (!reviewChannel) {
            return interaction.editReply({
                content: "❌ Không tìm thấy kênh review! Có thể kênh đã bị xóa.",
                flags: 64,
            });
        }

        // Lưu confession vào database với thông tin ẩn danh
        const confession = await db.addConfession(
            interaction.guild.id,
            interaction.user.id,
            content,
            isAnonymous
        );
        const confessionId = confession._id;

        console.log(`📝 [CONFESSION] Confession ${confessionId} được tạo bởi ${interaction.user.tag} (${isAnonymous ? 'Ẩn danh' : 'Hiển thị tên'})`);

        // Phân tích nội dung bằng AI
        let aiAnalysis = null;
        let autoAction = null;
        let needsAdminReview = true;
        let reviewReason = "Cần admin review";
        let aiEmbed = null;

        try {
            const AIContentAnalyzer = require('../utils/aiContentAnalyzer');
            aiAnalysis = await AIContentAnalyzer.analyzeContent(content);
            console.log(`🤖 [AI] Confession ${confessionId} được phân tích: ${aiAnalysis.safety_level} (${aiAnalysis.score}/10)`);

            // Quyết định tự động dựa trên AI analysis (giống lệnh !c)
            if (aiAnalysis.recommendation === 'REJECT') {
                autoAction = 'reject';
                needsAdminReview = false;
                reviewReason = "AI tự động từ chối";
            } else if (aiAnalysis.recommendation === 'APPROVE' && aiAnalysis.safety_level === 'APPROPRIATE' && aiAnalysis.score <= 3) {
                // Chỉ auto-approve khi score <= 3 (rất phù hợp)
                autoAction = 'approve';
                needsAdminReview = false;
                reviewReason = "AI tự động duyệt";
            } else if (aiAnalysis.safety_level === 'INAPPROPRIATE' || aiAnalysis.score >= 7) {
                // Tự động reject nếu INAPPROPRIATE hoặc score cao
                autoAction = 'reject';
                needsAdminReview = false;
                reviewReason = "AI tự động từ chối (inappropriate/high score)";
            } else {
                autoAction = 'review';
                needsAdminReview = true;
                reviewReason = "AI khuyến nghị review";
            }

            // Tạo AI embed
            aiEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('🤖 AI Analysis')
                .addFields(
                    { name: '📊 Score', value: `${aiAnalysis.score}/10`, inline: true },
                    { name: '🛡️ Safety Level', value: aiAnalysis.safety_level, inline: true },
                    { name: '📝 Content Type', value: aiAnalysis.content_type, inline: true },
                    { name: '💡 Recommendation', value: aiAnalysis.recommendation, inline: true },
                    { name: '📋 Reason', value: aiAnalysis.reason, inline: false }
                )
                .setTimestamp();

        } catch (aiError) {
            console.error('❌ [AI] Lỗi khi phân tích nội dung:', aiError);
            aiAnalysis = null;
            needsAdminReview = true;
            reviewReason = "Lỗi AI - Cần admin review";
        }

        // Lưu AI analysis vào database
        if (aiAnalysis) {
            await db.saveAIAnalysis(confessionId, aiAnalysis);
        }

        // Tạo embed cho review
        const reviewEmbed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle(`📝 Confession #${confessionId}`)
            .setDescription(content)
            .addFields(
                { name: "👤 Người gửi", value: isAnonymous ? "🕵️ Ẩn danh" : `<@${interaction.user.id}>`, inline: true },
                { name: "⏰ Thời gian", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                { name: "🔍 Trạng thái", value: isAnonymous ? "Ẩn danh" : "Hiển thị tên", inline: true },
                { name: "🤖 AI Analysis", value: aiAnalysis ? `${aiAnalysis.safety_level} (${aiAnalysis.score}/10)` : "Không có", inline: true },
                { name: "📋 Lý do review", value: reviewReason, inline: true }
            )
            .setFooter({
                text: `Confession Bot • ${interaction.guild.name}`,
                iconURL: interaction.guild.iconURL(),
            })
            .setTimestamp();

        // Tạo buttons
        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`confession_review_${confessionId}_approve`)
                    .setLabel("✅ Duyệt")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`confession_review_${confessionId}_reject`)
                    .setLabel("❌ Từ chối")
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId(`confession_review_${confessionId}_edit`)
                    .setLabel("✏️ Chỉnh sửa")
                    .setStyle(ButtonStyle.Secondary)
            );

        if (needsAdminReview) {
            // Gửi message với AI analysis
            const messageData = {
                content: `📝 Confession mới từ **${interaction.user.username}** (${interaction.user.tag}) cần duyệt!`,
                embeds: [reviewEmbed],
                components: [buttons]
            };

            // Thêm AI analysis embed nếu có
            if (aiEmbed) {
                messageData.embeds.push(aiEmbed);
            }

            await reviewChannel.send(messageData);
            console.log(`📝 [REVIEW] Confession ${confessionId} gửi đến review channel: ${reviewReason}`);
        } else {
            console.log(`🤖 [AUTO] Confession ${confessionId} ${autoAction === 'approve' ? 'approved' : 'rejected'} bởi AI`);
        }

        // Thông báo cho user
        let userMessage = `✅ Confession của bạn đã được gửi để duyệt! ${isAnonymous ? '🕵️ Confession sẽ được đăng ẩn danh.' : '👤 Confession sẽ hiển thị tên của bạn.'}\n\nBạn sẽ được thông báo khi confession được duyệt hoặc từ chối.`;
        
        if (autoAction === 'reject') {
            userMessage = `❌ Confession của bạn đã bị từ chối vì nội dung không phù hợp.\n\n🤖 **Lý do từ AI:** ${aiAnalysis.reason}\n📊 **Độ nghiêm trọng:** ${aiAnalysis.score}/10\n🛡️ **Loại nội dung:** ${aiAnalysis.content_type}`;
            // Cập nhật trạng thái confession thành rejected
            await db.updateConfessionStatus(confessionId, 'rejected', 'AI System');
        } else if (autoAction === 'approve') {
            userMessage = "✅ Confession của bạn đã được AI tự động duyệt!";
            // Tự động approve và gửi đến confession channel
            const confessionChannel = interaction.guild.channels.cache.get(guildSettings.confessionChannel);
            
            if (confessionChannel) {
                const approvedConfessionsCount = await db.getApprovedConfessionsCount(interaction.guild.id);
                const confessionNumber = approvedConfessionsCount + 1;
                
                const timeString = `<t:${Math.floor(Date.now() / 1000)}:R>`;
                const authorString = isAnonymous ? "🕵️ Ẩn danh" : `<@${interaction.user.id}>`;
                
                // Import forum utilities
                const { 
                    isForumChannel, 
                    createConfessionThread
                } = require("../utils/forumChannel");

                // Tạo AI review công khai
                let aiReviewEmbed = null;
                try {
                    const AIContentAnalyzer = require('../utils/aiContentAnalyzer');
                    const aiReview = await AIContentAnalyzer.createPublicReview(content);
                    aiReviewEmbed = new EmbedBuilder()
                        .setColor(0x00FF00)
                        .setTitle(`🤖 ${aiReview.review_title}`)
                        .setDescription(aiReview.review_content)
                        .addFields(
                            { name: "💡 Gợi ý", value: aiReview.suggestions || "Không có", inline: false },
                            { name: "⭐ Đánh giá", value: aiReview.rating, inline: true },
                            { name: "🎭 Tông điệu", value: aiReview.emotional_tone, inline: true }
                        )
                        .setFooter({
                            text: `AI Expert Review • ${interaction.guild.name}`,
                            iconURL: interaction.guild.iconURL(),
                        })
                        .setTimestamp();
                } catch (reviewError) {
                    console.error('❌ [AI] Lỗi khi tạo public review:', reviewError);
                }

                // Kiểm tra xem channel có phải là forum không
                if (isForumChannel(confessionChannel)) {
                    // Sử dụng forum channel
                    console.log(`📝 [FORUM] Sử dụng forum channel cho confession #${confessionNumber}`);
                    
                    // Tạo thread trong forum
                    const thread = await createConfessionThread(confessionChannel, {
                        confessionNumber,
                        content,
                        guildName: interaction.guild.name,
                        isAnonymous: isAnonymous,
                        userId: interaction.user.id,
                        aiAnalysis: aiAnalysis
                    });

                    // Gửi AI review vào thread
                    if (aiReviewEmbed) {
                        await thread.send({ embeds: [aiReviewEmbed] });
                    }

                    console.log(`✅ [FORUM] Đã tạo thread cho confession #${confessionNumber} trong forum`);
                } else {
                    // Sử dụng channel thông thường (fallback)
                    console.log(`📝 [CHANNEL] Sử dụng channel thông thường cho confession #${confessionNumber}`);
                    
                    const plainTextContent = `📢 **Confession #${confessionNumber}**\n\n${content}\n\n👤 **Người gửi:** ${authorString}\n⏰ **Thời gian:** ${timeString}\n\n*Confession Bot • ${interaction.guild.name}*`;

                    const { createEmojiButtons } = require("../utils/emojiButtons");
                    const emojiCounts = await db.getEmojiCounts(interaction.guild.id, confessionId);
                    const emojiButtons = createEmojiButtons(emojiCounts);

                    const confessionMessage = await confessionChannel.send({ 
                        content: plainTextContent,
                        components: emojiButtons
                    });

                    // Gửi AI review sau confession
                    if (aiReviewEmbed) {
                        await confessionChannel.send({ embeds: [aiReviewEmbed] });
                    }
                }

                await db.updateConfessionStatus(confessionId, 'approved', 'AI System', null, null, confessionNumber);
            }
        } else if (aiAnalysis) {
            userMessage += `\n\n🤖 AI đã phân tích: ${aiAnalysis.safety_level} (${aiAnalysis.score}/10)`;
        }

        await interaction.editReply({
            content: userMessage,
            flags: 64,
        });

    } catch (error) {
        console.error('Lỗi khi xử lý confession modal:', error);
        try {
            await interaction.editReply({
                content: "❌ Đã xảy ra lỗi khi gửi confession! Vui lòng thử lại.",
                flags: 64,
            });
        } catch (replyError) {
            console.error("Không thể reply interaction:", replyError.message);
        }
    }
}
