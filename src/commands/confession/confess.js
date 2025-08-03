const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("../../data/mongodb");
const AIContentAnalyzer = require('../../utils/aiContentAnalyzer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("confess")
        .setDescription("Gửi một confession ẩn danh")
        .addStringOption((option) =>
            option
                .setName("noidung")
                .setDescription("Nội dung confession của bạn")
                .setRequired(true)
                .setMaxLength(2000)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const content = interaction.options.getString("noidung");

        // Kiểm tra xem user đã có confession đang chờ duyệt chưa
        const pendingConfessions = await db.getUserPendingConfessions(interaction.guild.id, interaction.user.id);
        if (pendingConfessions.length > 0) {
            const oldestPending = pendingConfessions[0];
            const timeAgo = Math.floor((Date.now() - new Date(oldestPending.createdAt).getTime()) / 1000 / 60); // phút
            
            return interaction.editReply({
                content: `❌ Bạn đã có confession đang chờ duyệt!\n\n\`#${oldestPending._id}\` - ${oldestPending.content.substring(0, 50)}${oldestPending.content.length > 50 ? '...' : ''}\n\n⏰ Đã gửi ${timeAgo} phút trước\n\nVui lòng chờ confession này được duyệt hoặc từ chối trước khi gửi confession mới.`,
                ephemeral: true,
            });
        }

        const guildSettings = await db.getGuildSettings(interaction.guild.id);
        if (!guildSettings?.reviewChannel) {
            return interaction.editReply({
                content:
                    "❌ Kênh review confession chưa được thiết lập! Hãy nhờ Admin sử dụng lệnh `/setreviewchannel`",
                ephemeral: true,
            });
        }

        const reviewChannel = interaction.guild.channels.cache.get(
            guildSettings.reviewChannel
        );
        if (!reviewChannel) {
            return interaction.editReply({
                content:
                    "❌ Không tìm thấy kênh review! Có thể kênh đã bị xóa.",
                ephemeral: true,
            });
        }

        try {
            // Lưu confession vào database
            const confessionId = await db.addConfession(
                interaction.guild.id,
                interaction.user.id,
                content
            );

            // AI Analysis (nếu có API key)
            let aiAnalysis = null;
            let aiEmbed = null;
            let autoAction = null;

            if (process.env.OPENAI_API_KEY) {
                try {
                    console.log(`🤖 [AI] Starting analysis for confession ${confessionId}...`);
                    console.log(`🤖 [AI] Content: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`);
                    console.log(`🤖 [AI] OpenAI API Key exists: ${process.env.OPENAI_API_KEY ? 'YES' : 'NO'}`);
                    
                    const analyzer = new AIContentAnalyzer();
                    console.log(`🤖 [AI] Analyzer created successfully`);
                    
                    const analysis = await analyzer.analyzeConfession(content, interaction.guild.name);
                    console.log(`🤖 [AI] Analysis result:`, analysis);
                    
                    if (analysis.success) {
                        console.log(`✅ [AI] Analysis completed successfully`);
                        console.log(`🤖 [AI] Result: ${analysis.analysis.safety_level} | ${analysis.analysis.content_type} | Score: ${analysis.analysis.score}/10`);
                        console.log(`🤖 [AI] Recommendation: ${analysis.analysis.recommendation}`);
                        
                        // Lưu AI analysis vào database
                        await db.saveAIAnalysis(confessionId, analysis.analysis);
                        aiAnalysis = analysis.analysis;
                        
                        // Tạo embed cho AI analysis
                        const summary = await analyzer.getAnalysisSummary(analysis);
                        aiEmbed = new EmbedBuilder()
                            .setColor(summary.color)
                            .setTitle(`${summary.emoji} ${summary.title}`)
                            .setDescription(summary.description)
                            .setTimestamp();

                        // Tự động xử lý dựa trên AI recommendation
                        if (aiAnalysis.recommendation === 'REJECT') {
                            autoAction = 'reject';
                            console.log(`🚫 [AI] Auto-rejecting confession ${confessionId}`);
                        } else if (aiAnalysis.recommendation === 'APPROVE' && aiAnalysis.safety_level === 'APPROPRIATE' && aiAnalysis.score <= 3) {
                            // Chỉ auto-approve khi score <= 3 (rất phù hợp)
                            autoAction = 'approve';
                            console.log(`✅ [AI] Auto-approving confession ${confessionId}`);
                        } else if (aiAnalysis.safety_level === 'INAPPROPRIATE' || aiAnalysis.score >= 7) {
                            // Tự động reject nếu INAPPROPRIATE hoặc score cao
                            autoAction = 'reject';
                            console.log(`🚫 [AI] Auto-rejecting confession ${confessionId} (high score or inappropriate)`);
                        } else {
                            console.log(`⚠️ [AI] Manual review required for confession ${confessionId}`);
                        }
                    } else {
                        console.log(`❌ [AI] Analysis failed: ${analysis.error}`);
                    }
                } catch (aiError) {
                    console.error('❌ [AI] Analysis error:', aiError);
                }
            } else {
                console.log(`⚠️ [AI] No OpenAI API key found - skipping AI analysis`);
            }

            // Tạo embed cho review
            const reviewEmbed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle("📝 Confession Cần Duyệt")
                .setDescription(content)
                .addFields(
                    { name: "🆔 ID Confession", value: `#${confessionId}`, inline: true },
                    { name: "👤 Người gửi", value: `<@${interaction.user.id}>`, inline: true },
                    { name: "📅 Thời gian", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
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
                        .setCustomId(`approve_${confessionId}`)
                        .setLabel("✅ Duyệt")
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`reject_${confessionId}`)
                        .setLabel("❌ Từ chối")
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId(`edit_${confessionId}`)
                        .setLabel("✏️ Chỉnh sửa")
                        .setStyle(ButtonStyle.Secondary)
                );

            // Thêm AI reject button nếu AI khuyến nghị reject
            if (aiAnalysis && aiAnalysis.recommendation === 'REJECT') {
                buttons.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`ai_reject_${confessionId}`)
                        .setLabel("🤖 AI Reject")
                        .setStyle(ButtonStyle.Secondary)
                );
            }

            // Chỉ gửi đến review channel nếu không phải auto-approve/reject
            if (autoAction !== 'approve' && autoAction !== 'reject') {
                // Gửi message với AI analysis
                const messageData = {
                    embeds: [reviewEmbed],
                    components: [buttons]
                };

                // Thêm AI analysis embed nếu có
                if (aiEmbed) {
                    messageData.embeds.push(aiEmbed);
                }

                await reviewChannel.send(messageData);
            }

            // Thông báo cho user
            let userMessage = "✅ Confession của bạn đã được gửi để duyệt!";
            
            if (autoAction === 'reject') {
                userMessage = `❌ Confession của bạn đã bị từ chối vì nội dung không phù hợp.\n\n🤖 **Lý do từ AI:** ${aiAnalysis.reason}\n📊 **Độ nghiêm trọng:** ${aiAnalysis.score}/10\n🛡️ **Loại nội dung:** ${aiAnalysis.content_type}`;
                // Cập nhật trạng thái confession thành rejected
                await db.updateConfessionStatus(confessionId, 'rejected', 'AI System');
            } else if (autoAction === 'approve') {
                userMessage = "✅ Confession của bạn đã được AI tự động duyệt!";
                // Tự động approve và gửi đến confession channel
                const guildSettings = await db.getGuildSettings(interaction.guild.id);
                const confessionChannel = interaction.guild.channels.cache.get(guildSettings.confessionChannel);
                
                if (confessionChannel) {
                    const approvedConfessionsCount = await db.getApprovedConfessionsCount(interaction.guild.id);
                    const confessionNumber = approvedConfessionsCount + 1;
                    
                    const timeString = `<t:${Math.floor(Date.now() / 1000)}:R>`;
                    const authorString = "🕵️ Ẩn danh";
                    
                    const plainTextContent = `📢 **Confession #${confessionNumber}**\n\n${content}\n\n👤 **Người gửi:** ${authorString}\n⏰ **Thời gian:** ${timeString}\n\n*Confession Bot • ${interaction.guild.name}*`;

                    const { createEmojiButtons } = require("../../utils/emojiButtons");
                    const emojiCounts = await db.getEmojiCounts(interaction.guild.id, confessionId);
                    const emojiButtons = createEmojiButtons(emojiCounts);

                    await confessionChannel.send({ 
                        content: plainTextContent,
                        components: emojiButtons
                    });

                    await db.updateConfessionStatus(confessionId, 'approved', 'AI System', null, null, confessionNumber);
                }
            } else if (aiAnalysis) {
                userMessage += `\n\n🤖 AI đã phân tích: ${aiAnalysis.safety_level} (${aiAnalysis.score}/10)`;
            }

            return interaction.editReply({
                content: userMessage,
                ephemeral: true,
            });

        } catch (error) {
            console.error("Lỗi khi gửi confession:", error);
            return interaction.editReply({
                content: "❌ Đã xảy ra lỗi khi gửi confession!",
                ephemeral: true,
            });
        }
    },
};
