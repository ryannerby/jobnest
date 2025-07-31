// Test script to verify Claude API key setup
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseJobDescriptionWithAI } from './client/src/utils/aiJobParser.js';

// Load environment variables from client/.env
function loadEnv() {
  try {
    const envPath = join(process.cwd(), 'client', '.env');
    console.log('📁 Loading .env from:', envPath);
    const envContent = readFileSync(envPath, 'utf8');
    console.log('📄 .env content:', envContent);
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (!key.startsWith('#')) {
          process.env[key.trim()] = value;
          console.log(`🔑 Set ${key.trim()} = ${value.substring(0, 20)}...`);
        }
      }
    });
  } catch (error) {
    console.error('Error loading .env file:', error.message);
  }
}

async function testClaudeSetup() {
  console.log('🧪 Testing Claude API Setup...\n');
  
  // Load environment variables
  loadEnv();
  
  const testJobDescription = `
Software Engineer - React/Node.js
Company: TechCorp Inc.
Location: San Francisco, CA (Hybrid)
Salary: $120,000 - $150,000
Type: Full-time

We're looking for a talented Software Engineer to join our team. You'll work on cutting-edge web applications using React and Node.js.

Requirements:
- 3+ years experience with React and Node.js
- Experience with TypeScript
- Knowledge of AWS or similar cloud platforms
- Strong problem-solving skills

Benefits:
- Competitive salary
- Health insurance
- 401k matching
- Flexible work hours
- Remote work options

Apply by: December 31, 2024
Contact: hiring@techcorp.com
  `;

  try {
    console.log('📝 Testing with sample job description...');
    console.log('🔍 Checking API key in process.env:', process.env.VITE_CLAUDE_API_KEY ? 'Found' : 'Not found');
    console.log('🔍 API key starts with:', process.env.VITE_CLAUDE_API_KEY?.substring(0, 10));
    const result = await parseJobDescriptionWithAI(testJobDescription);
    
    if (result.success) {
      console.log('✅ Claude API is working correctly!');
      console.log('📊 Extracted data:', JSON.stringify(result.extractedInfo, null, 2));
      console.log('📄 Cover letter generated:', result.coverLetter ? 'Yes' : 'No');
      console.log('📋 Tailored resume generated:', result.tailoredResume ? 'Yes' : 'No');
    } else {
      console.log('❌ API call failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Setup error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure you have a valid Claude API key');
    console.log('2. Check that VITE_CLAUDE_API_KEY is set in client/.env');
    console.log('3. Verify the API key starts with "sk-ant-"');
    console.log('4. Ensure you have sufficient API credits');
  }
}

testClaudeSetup(); 