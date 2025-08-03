const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("../../data/mongodb");
const config = require("../../config/bot");
const AIContentAnalyzer = require('../../utils/aiContentAnalyzer');

module.exports = {
    name: "confess",
    description: "Gửi một confession ẩn danh",
    async execute(message, args) {
        // Xóa tin nhắn gốc với error handling
        try {
            await message.delete();
        } catch (error) {
            // Bỏ qua lỗi nếu không thể xóa tin nhắn
            console.log("Could not delete message:", error.message);
        }

        // Kiểm tra argument cho chế độ ẩn danh
        let isAnonymous = false;
        let content = args.join(" ");
        
        // Kiểm tra flag ẩn danh
        if (args.length > 0 && (args[0] === "anonymous" || args[0] === "anon" || args[0] === "ẩn")) {
            isAnonymous = true;
            content = args.slice(1).join(" ");
        }

        if (!content) {
            const errorMsg = await message.channel.send(
                "❌ Vui lòng nhập nội dung confession!\n\n**Cách sử dụng:**\n`!confess nội dung` - Gửi confession bình thường\n`!confess anonymous nội dung` - Gửi confession ẩn danh\n`!confess anon nội dung` - Gửi confession ẩn danh"
            );
            setTimeout(() => {
                errorMsg.delete().catch(() => {}); // Bỏ qua lỗi nếu không thể xóa
            }, 8000);
            return;
        }

        // Kiểm tra xem user đã có confession đang chờ duyệt chưa
        const pendingConfessions = await db.getUserPendingConfessions(message.guild.id, message.author.id);
        if (pendingConfessions.length > 0) {
            const oldestPending = pendingConfessions[0];
            const timeAgo = Math.floor((Date.now() - new Date(oldestPending.createdAt).getTime()) / 1000 / 60); // phút
            
            const errorMsg = await message.channel.send(
                `❌ Bạn đã có confession đang chờ duyệt!\n\n\`#${oldestPending._id}\` - ${oldestPending.content.substring(0, 50)}${oldestPending.content.length > 50 ? '...' : ''}\n\n⏰ Đã gửi ${timeAgo} phút trước\n\nVui lòng chờ confession này được duyệt hoặc từ chối trước khi gửi confession mới.`
            );
            setTimeout(() => {
                errorMsg.delete().catch(() => {});
            }, 10000);
            return;
        }

        // Kiểm tra độ dài confession
        if (content.length > config.confession.maxLength) {
            const errorMsg = await message.channel.send(
                `❌ Confession quá dài! Tối đa ${config.confession.maxLength} ký tự.`
            );
            setTimeout(() => {
                errorMsg.delete().catch(() => {});
            }, 5000);
            return;
        }

        if (content.length < config.confession.minLength) {
            const errorMsg = await message.channel.send(
                `❌ Confession quá ngắn! Tối thiểu ${config.confession.minLength} ký tự.`
            );
            setTimeout(() => {
                errorMsg.delete().catch(() => {});
            }, 5000);
            return;
        }

        const guildSettings = await db.getGuildSettings(message.guild.id);
        if (!guildSettings?.reviewChannel) {
            const errorMsg = await message.channel.send(
                "❌ Kênh review confession chưa được thiết lập! Hãy nhờ Admin sử dụng lệnh `!setreview`"
            );
            setTimeout(() => {
                errorMsg.delete().catch(() => {});
            }, 5000);
            return;
        }

        const reviewChannel = message.guild.channels.cache.get(
            guildSettings.reviewChannel
        );
        if (!reviewChannel) {
            const errorMsg = await message.channel.send(
                "❌ Không tìm thấy kênh review! Có thể kênh đã bị xóa."
            );
            setTimeout(() => {
                errorMsg.delete().catch(() => {});
            }, 5000);
            return;
        }

        try {
            // Lưu confession vào database với thông tin ẩn danh
            const confessionId = await db.addConfession(
                message.guild.id,
                message.author.id,
                content,
                isAnonymous
            );

            if (!confessionId) {
                throw new Error("Failed to save confession to database");
            }

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
                    
                    const analysis = await analyzer.analyzeConfession(content, message.guild.name);
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
                .setColor(config.colors.warning)
                .setTitle("📝 Confession Cần Duyệt")
                .setDescription(content)
                .addFields(
                    { name: "🆔 ID Confession", value: `#${confessionId}`, inline: true },
                    { name: "👤 Người gửi", value: `<@${message.author.id}>`, inline: true },
                    { name: "⏰ Thời gian", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                    { name: "🕵️ Chế độ", value: isAnonymous ? "🕵️ Ẩn danh" : "👤 Hiển thị tên", inline: true }
                )
                .setAuthor({
                    name: message.author.username,
                    iconURL: message.author.displayAvatarURL()
                })
                .setFooter({
                    text: `Confession Bot • ${message.guild.name}`,
                    iconURL: message.guild.iconURL(),
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
                    content: `📝 Confession mới từ **${message.author.username}** (${message.author.tag}) cần duyệt!`,
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
            let userMessage = `✅ Confession của bạn đã được gửi để duyệt! ${isAnonymous ? '🕵️ Confession sẽ được đăng ẩn danh.' : '👤 Confession sẽ hiển thị tên của bạn.'}\n\nBạn sẽ được thông báo khi confession được duyệt hoặc từ chối.`;
            
            if (autoAction === 'reject') {
                userMessage = `❌ Confession của bạn đã bị từ chối vì nội dung không phù hợp.\n\n🤖 **Lý do từ AI:** ${aiAnalysis.reason}\n📊 **Độ nghiêm trọng:** ${aiAnalysis.score}/10\n🛡️ **Loại nội dung:** ${aiAnalysis.content_type}`;
                // Cập nhật trạng thái confession thành rejected
                await db.updateConfessionStatus(confessionId, 'rejected', 'AI System');
            } else if (autoAction === 'approve') {
                userMessage = "✅ Confession của bạn đã được AI tự động duyệt!";
                // Tự động approve và gửi đến confession channel
                const confessionChannel = message.guild.channels.cache.get(guildSettings.confessionChannel);
                
                if (confessionChannel) {
                    const approvedConfessionsCount = await db.getApprovedConfessionsCount(message.guild.id);
                    const confessionNumber = approvedConfessionsCount + 1;
                    
                    const timeString = `<t:${Math.floor(Date.now() / 1000)}:R>`;
                    const authorString = isAnonymous ? "🕵️ Ẩn danh" : `<@${message.author.id}>`;
                    
                    const plainTextContent = `📢 **Confession #${confessionNumber}**\n\n${content}\n\n👤 **Người gửi:** ${authorString}\n⏰ **Thời gian:** ${timeString}\n\n*Confession Bot • ${message.guild.name}*`;

                    const { createEmojiButtons } = require("../../utils/emojiButtons");
                    const emojiCounts = await db.getEmojiCounts(message.guild.id, confessionId);
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

            const successMsg = await message.channel.send(userMessage);
            setTimeout(() => {
                successMsg.delete().catch(() => {});
            }, 8000);
        } catch (error) {
            console.error("Lỗi khi gửi confession:", error);
            const errorMsg = await message.channel.send(
                "❌ Đã xảy ra lỗi khi gửi confession!"
            );
            setTimeout(() => {
                errorMsg.delete().catch(() => {});
            }, 5000);
        }
    },
};
