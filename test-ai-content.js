require('dotenv').config();
const AIContentAnalyzer = require('./src/utils/aiContentAnalyzer');

async function testAIContent() {
    const analyzer = new AIContentAnalyzer();
    
    const testCases = [
        "Admin ngu quá admin ơi",
        "admin ngu ơi là ngu",
        "Tôi thấy admin làm việc rất tốt",
        "Fuck you admin",
        "Tôi muốn chia sẻ về một ngày buồn của mình",
        "Admin là đồ khốn",
        "Cảm ơn admin đã giúp đỡ mọi người",
        "Tôi ghét admin",
        "Hôm nay tôi cảm thấy rất vui",
        "admin ngu ngốc quá",
        "mod ngu si đần độn"
    ];

    console.log('🤖 Testing AI Content Analysis...\n');

    for (let i = 0; i < testCases.length; i++) {
        const content = testCases[i];
        console.log(`Test ${i + 1}: "${content}"`);
        
        try {
            const result = await analyzer.analyzeConfession(content);
            
            if (result.success) {
                const { safety_level, content_type, score, reason, recommendation } = result.analysis;
                console.log(`   Safety: ${safety_level}`);
                console.log(`   Type: ${content_type}`);
                console.log(`   Score: ${score}/10`);
                console.log(`   Reason: ${reason}`);
                console.log(`   Recommendation: ${recommendation}`);
                
                // Kiểm tra logic auto-action
                let autoAction = null;
                if (recommendation === 'REJECT') {
                    autoAction = 'reject';
                } else if (recommendation === 'APPROVE' && safety_level === 'APPROPRIATE' && score <= 3) {
                    autoAction = 'approve';
                } else if (safety_level === 'INAPPROPRIATE' || score >= 7) {
                    autoAction = 'reject';
                }
                
                console.log(`   Auto Action: ${autoAction || 'manual review'}`);
            } else {
                console.log(`   ❌ AI Analysis failed: ${result.error}`);
            }
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        
        console.log('');
    }
}

testAIContent().catch(console.error); 