require('dotenv').config();
const AIContentAnalyzer = require('./src/utils/aiContentAnalyzer');

async function testAIDirect() {
    console.log('🤖 Testing AI directly...');
    console.log('OPENAI_API_KEY exists:', process.env.OPENAI_API_KEY ? 'YES' : 'NO');
    
    try {
        const analyzer = new AIContentAnalyzer();
        console.log('✅ Analyzer created');
        
        const result = await analyzer.analyzeConfession('admin ngu ơi là ngu', 'Test Server');
        console.log('✅ Analysis result:', result);
        
        if (result.success) {
            console.log('🎯 Safety Level:', result.analysis.safety_level);
            console.log('🎯 Content Type:', result.analysis.content_type);
            console.log('🎯 Score:', result.analysis.score);
            console.log('🎯 Recommendation:', result.analysis.recommendation);
        } else {
            console.log('❌ Analysis failed:', result.error);
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testAIDirect().catch(console.error); 