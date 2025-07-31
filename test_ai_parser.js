// Test script for AI-powered job parser
// Note: This requires a valid Claude API key to work

const { parseJobDescriptionWithAI, formatAIResponseForForm } = require('./client/src/utils/aiJobParser.js');

// Test job description
const testJobDescription = `
Position: Senior Software Engineer
Organization: TechCorp Inc.
Work Location: San Francisco, CA (Hybrid)
Employment Type: Full-time
Compensation: $120,000 - $180,000 annually

We are looking for a Senior Software Engineer to join our growing team. You will be responsible for developing scalable web applications using React, Node.js, and AWS.

Requirements:
- 5+ years of experience in software development
- Strong knowledge of JavaScript, React, and Node.js
- Experience with cloud platforms (AWS, Azure, or GCP)
- Excellent problem-solving skills

Benefits:
- Competitive salary and equity
- Health, dental, and vision insurance
- 401(k) matching
- Flexible work arrangements
- Professional development opportunities

Please apply by March 15, 2024. Contact hiring manager Sarah Johnson at sarah.johnson@techcorp.com
`;

async function testAIParser() {
  console.log('Testing AI-powered job parser...\n');
  console.log('Job Description:');
  console.log(testJobDescription);
  console.log('\n' + '='.repeat(50) + '\n');

  try {
    // Test the AI parser
    const aiResponse = await parseJobDescriptionWithAI(testJobDescription);
    
    if (aiResponse.success) {
      console.log('✅ AI Parsing Successful!');
      console.log('\nExtracted Job Information:');
      console.log(JSON.stringify(aiResponse.jobInfo, null, 2));
      
      console.log('\nFormatted for Form:');
      const formattedData = formatAIResponseForForm(aiResponse);
      console.log(JSON.stringify(formattedData, null, 2));
      
      if (aiResponse.coverLetter) {
        console.log('\nGenerated Cover Letter:');
        console.log(aiResponse.coverLetter);
      }
      
      if (aiResponse.tailoredResume) {
        console.log('\nGenerated Tailored Resume:');
        console.log(JSON.stringify(aiResponse.tailoredResume, null, 2));
      }
    } else {
      console.log('❌ AI Parsing Failed:');
      console.log(aiResponse.error);
    }
  } catch (error) {
    console.log('❌ Error testing AI parser:');
    console.log(error.message);
    console.log('\n💡 Make sure you have set the REACT_APP_CLAUDE_API_KEY environment variable');
  }
}

// Run the test
testAIParser(); 