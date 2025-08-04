const OpenAI = require('openai');

class AIContentAnalyzer {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async analyzeConfession(content, guildName = 'Discord Server') {
        try {
            const prompt = `Hãy phân tích nội dung confession sau đây và đánh giá nghiêm ngặt:

NỘI DUNG CONFESSION:
"${content}"

YÊU CẦU PHÂN TÍCH:
1. Mức độ phù hợp (APPROPRIATE/INAPPROPRIATE/FLAG_FOR_REVIEW)
2. Loại nội dung (NORMAL/SENSITIVE/EXPLICIT/VIOLENT/HARASSMENT/INSULT/SPAM)
3. Điểm đánh giá từ 1-10 (1=hoàn toàn phù hợp, 10=rất không phù hợp)
4. Lý do đánh giá (ngắn gọn)
5. Khuyến nghị hành động (APPROVE/REJECT/FLAG)

QUY TẮC ĐÁNH GIÁ NGHIÊM NGẶT:
- Nội dung chứa từ ngữ chửi bới, xúc phạm (ngu, ngu ngốc, khốn, đần, dốt, v.v.) → INAPPROPRIATE + REJECT
- Nội dung quấy rối, harassment → INAPPROPRIATE + REJECT  
- Nội dung spam, không có ý nghĩa → INAPPROPRIATE + REJECT
- Nội dung bạo lực, explicit → INAPPROPRIATE + REJECT
- Nội dung tiêu cực về admin/mod (ghét, không thích, chỉ trích, chửi) → INAPPROPRIATE + REJECT
- Nội dung có ý định xúc phạm, chế giễu người khác → INAPPROPRIATE + REJECT
- Nội dung nhạy cảm nhưng có ý nghĩa → FLAG_FOR_REVIEW
- Nội dung bình thường, tích cực, có ý nghĩa → APPROPRIATE + APPROVE

TỪ KHÓA CẦN CHÚ Ý:
- Chửi bới: ngu, ngu ngốc, khốn, đần, dốt, ngu si, ngu đần, v.v.
- Xúc phạm: admin ngu, mod ngu, admin khốn, v.v.
- Tiêu cực: ghét, không thích, chán, tệ, v.v.

TRẢ LỜI THEO FORMAT JSON:
{
    "safety_level": "APPROPRIATE|INAPPROPRIATE|FLAG_FOR_REVIEW",
    "content_type": "NORMAL|SENSITIVE|EXPLICIT|VIOLENT|HARASSMENT|INSULT|SPAM",
    "score": 1-10,
    "reason": "Lý do đánh giá",
    "recommendation": "APPROVE|REJECT|FLAG",
    "confidence": 0.0-1.0
}`;

            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Bạn là một AI moderator cực kỳ nghiêm ngặt chuyên phân tích nội dung confession. Hãy đánh giá công bằng nhưng cực kỳ nghiêm khắc với các nội dung không phù hợp, đặc biệt là chửi bới, xúc phạm, quấy rối, và các nội dung tiêu cực về admin/mod. Bất kỳ nội dung nào chứa từ ngữ chửi bới như 'ngu', 'khốn', 'đần', 'dốt' đều phải được đánh giá là INAPPROPRIATE và REJECT."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.1, // Giảm temperature để ổn định hơn
                max_tokens: 500
            });

            const result = response.choices[0].message.content;
            
            // Parse JSON response
            try {
                const analysis = JSON.parse(result);
                return {
                    success: true,
                    analysis: analysis
                };
            } catch (parseError) {
                console.error('Error parsing AI response:', parseError);
                return {
                    success: false,
                    error: 'Failed to parse AI response',
                    rawResponse: result
                };
            }

        } catch (error) {
            console.error('AI Analysis Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getAnalysisSummary(analysis) {
        if (!analysis.success) {
            return {
                emoji: "❌",
                color: 0xFF0000,
                title: "AI Analysis Failed",
                description: "Không thể phân tích nội dung. Vui lòng kiểm tra thủ công."
            };
        }

        const { safety_level, content_type, score, reason, recommendation, confidence } = analysis.analysis;

        // Determine emoji and color based on safety level
        let emoji, color;
        switch (safety_level) {
            case 'APPROPRIATE':
                emoji = "✅";
                color = 0x00FF00;
                break;
            case 'FLAG_FOR_REVIEW':
                emoji = "⚠️";
                color = 0xFFA500;
                break;
            case 'INAPPROPRIATE':
                emoji = "🚫";
                color = 0xFF0000;
                break;
            default:
                emoji = "❓";
                color = 0x808080;
        }

        return {
            emoji,
            color,
            title: `AI Analysis: ${safety_level}`,
            description: `**Score:** ${score}/10\n**Type:** ${content_type}\n**Reason:** ${reason}\n**Recommendation:** ${recommendation}\n**Confidence:** ${(confidence * 100).toFixed(1)}%`
        };
    }

    // Static method để tương thích với code hiện tại
    static async analyzeContent(content) {
        const analyzer = new AIContentAnalyzer();
        const result = await analyzer.analyzeConfession(content);
        
        if (result.success) {
            return result.analysis;
        } else {
            throw new Error(result.error || 'AI analysis failed');
        }
    }

    // Method để tạo đánh giá chuyên nghiệp công khai
    async createPublicReview(content, guildName = 'Discord Server') {
        try {
            const prompt = `Bạn là một chuyên gia tâm lý và nhà phân tích nội dung chuyên nghiệp. Hãy đánh giá confession sau đây một cách công khai và chuyên nghiệp:

NỘI DUNG CONFESSION:
"${content}"

YÊU CẦU:
1. Đánh giá nội dung một cách chuyên nghiệp và khách quan
2. Đưa ra nhận xét về tâm lý, cảm xúc, và ý nghĩa của confession
3. Gợi ý cách ứng xử hoặc lời khuyên nếu cần thiết
4. Viết bằng giọng điệu thân thiện, hiểu biết và chuyên nghiệp
5. Không tiết lộ thông tin cá nhân hoặc nhận dạng người gửi

HƯỚNG DẪN ĐÁNH GIÁ:
- Nếu nội dung tích cực: Khuyến khích và động viên
- Nếu nội dung tiêu cực: Đưa ra lời khuyên và gợi ý cách cải thiện
- Nếu nội dung nhạy cảm: Thể hiện sự hiểu biết và đồng cảm
- Nếu nội dung có vấn đề: Đưa ra lời khuyên mang tính xây dựng

TRẢ LỜI THEO FORMAT JSON:
{
    "review_title": "Tiêu đề đánh giá",
    "review_content": "Nội dung đánh giá chi tiết và chuyên nghiệp",
    "emotional_tone": "TONE_POSITIVE|TONE_NEUTRAL|TONE_CONCERNED|TONE_SUPPORTIVE",
    "suggestions": "Lời khuyên hoặc gợi ý nếu có",
    "rating": "EXCELLENT|GOOD|AVERAGE|NEEDS_IMPROVEMENT"
}`;

            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Bạn là một chuyên gia tâm lý và nhà phân tích nội dung chuyên nghiệp. Hãy đánh giá confession một cách công khai, chuyên nghiệp và mang tính xây dựng. Luôn thể hiện sự hiểu biết, đồng cảm và đưa ra lời khuyên hữu ích."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7, // Tăng temperature để có giọng điệu tự nhiên hơn
                max_tokens: 800
            });

            const result = response.choices[0].message.content;
            
            // Parse JSON response
            try {
                const review = JSON.parse(result);
                return {
                    success: true,
                    review: review
                };
            } catch (parseError) {
                console.error('Error parsing AI review response:', parseError);
                return {
                    success: false,
                    error: 'Failed to parse AI review response',
                    rawResponse: result
                };
            }

        } catch (error) {
            console.error('AI Review Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Static method để tạo public review
    static async createPublicReview(content) {
        const analyzer = new AIContentAnalyzer();
        const result = await analyzer.createPublicReview(content);
        
        if (result.success) {
            return result.review;
        } else {
            throw new Error(result.error || 'AI review failed');
        }
    }
}

module.exports = AIContentAnalyzer; 