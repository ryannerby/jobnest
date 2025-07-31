// AI-powered job description parser using Claude API
// This replaces the regex-based parser with intelligent AI extraction

// Function to get API key from environment (works in both browser and Node.js)
function getClaudeAPIKey() {
  console.log('🔍 Checking API key availability...');
  
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const browserKey = import.meta.env.VITE_CLAUDE_API_KEY;
    console.log('🌐 Browser environment detected');
    console.log('🔑 Browser API key:', browserKey ? 'Found' : 'Not found');
    return browserKey;
  }
  
  const nodeKey = process.env.VITE_CLAUDE_API_KEY;
  console.log('🖥️ Node.js environment detected');
  console.log('🔑 Node.js API key:', nodeKey ? 'Found' : 'Not found');
  return nodeKey;
}
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

// Global resume data structure
let globalResume = {
  name: '',
  email: '',
  phone: '',
  location: '',
  summary: '',
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  projects: []
};

// Function to set global resume data
export function setGlobalResume(resumeData) {
  globalResume = { ...globalResume, ...resumeData };
}

// Function to get global resume data
export function getGlobalResume() {
  return globalResume;
}

// Main function to parse job description and generate tailored content
export async function parseJobDescriptionWithAI(jobDescription) {
  try {
    console.log('Starting AI-powered job parsing...');
    
    // Step 1: Extract job information
    const jobInfo = await extractJobInformation(jobDescription);
    
    // Step 2: Generate tailored resume
    const tailoredResume = await generateTailoredResume(jobDescription, jobInfo);
    
    // Step 3: Generate cover letter
    const coverLetter = await generateCoverLetter(jobDescription, jobInfo);
    
    return {
      extractedInfo: jobInfo,
      tailoredResume,
      coverLetter,
      success: true
    };
    
  } catch (error) {
    console.error('Error in AI job parsing:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Extract job information from description
async function extractJobInformation(jobDescription) {
  const prompt = `
You are an expert job parser. Extract the following information from this job description and return it as a JSON object:

{
  "company": "Company name",
  "title": "Job title",
  "location": "Job location",
  "salary": "Salary information if mentioned",
  "job_type": "Full-time, Part-time, Contract, etc.",
  "deadline": "Application deadline if mentioned",
  "hiring_manager": "Hiring manager or contact person if mentioned",
  "requirements": "Key requirements and qualifications",
  "benefits": "Benefits and perks mentioned",
  "responsibilities": "Key responsibilities and duties"
}

Job Description:
${jobDescription}

Return only the JSON object, no additional text.
`;

  const response = await callClaudeAPI(prompt);
  
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No valid JSON found in response');
  } catch (parseError) {
    console.error('Error parsing AI response:', parseError);
    // Fallback to basic extraction
    return extractBasicInfo(jobDescription);
  }
}

// Generate tailored resume based on job description
async function generateTailoredResume(jobDescription, jobInfo) {
  const prompt = `
You are an expert resume writer. Create a tailored resume for this specific job based on the job description and the candidate's background.

Job Description:
${jobDescription}

Extracted Job Information:
${JSON.stringify(jobInfo, null, 2)}

Candidate's Background:
${JSON.stringify(globalResume, null, 2)}

Create a tailored resume that:
1. Highlights relevant experience and skills for this specific role
2. Uses keywords from the job description
3. Quantifies achievements where possible
4. Focuses on transferable skills if direct experience is limited
5. Maintains professional formatting

Return the resume in this JSON format:
{
  "summary": "Tailored professional summary",
  "experience": [
    {
      "title": "Job title",
      "company": "Company name", 
      "dates": "Date range",
      "description": "Tailored description focusing on relevant achievements"
    }
  ],
  "skills": ["Relevant skills for this role"],
  "education": "Education information",
  "certifications": "Relevant certifications"
}

Return only the JSON object, no additional text.
`;

  const response = await callClaudeAPI(prompt);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No valid JSON found in response');
  } catch (parseError) {
    console.error('Error parsing tailored resume:', parseError);
    return null;
  }
}

// Generate cover letter based on job description
async function generateCoverLetter(jobDescription, jobInfo) {
  const prompt = `
You are an expert cover letter writer. Create a compelling cover letter for this specific job based on the job description and the candidate's background.

Job Description:
${jobDescription}

Extracted Job Information:
${JSON.stringify(jobInfo, null, 2)}

Candidate's Background:
${JSON.stringify(globalResume, null, 2)}

Create a cover letter that:
1. Shows enthusiasm for the specific role and company
2. Connects the candidate's experience to the job requirements
3. Addresses key qualifications mentioned in the job description
4. Demonstrates understanding of the company and role
5. Includes a clear call to action
6. Is professional but engaging

Return the cover letter as a well-formatted text with proper paragraphs and structure.
`;

  const response = await callClaudeAPI(prompt);
  return response.trim();
}

// Call Claude API through backend proxy to avoid CORS issues
async function callClaudeAPI(prompt) {
  console.log('🔑 Using backend proxy for Claude API call...');

  try {
    const response = await fetch('http://localhost:3001/api/jobs/claude-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Response:', response.status, response.statusText);
      console.error('Error details:', errorData);
      throw new Error(`API call failed: ${response.status} ${response.statusText} - ${errorData.error || errorData.details || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.content;
    
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error(`API call failed: ${error.message}`);
  }
}

// Fallback function for basic extraction (if API fails)
function extractBasicInfo(jobDescription) {
  const lines = jobDescription.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const basicInfo = {
    company: null,
    title: null,
    location: null,
    salary: null,
    job_type: null,
    deadline: null,
    hiring_manager: null,
    requirements: null,
    benefits: null,
    responsibilities: null
  };

  // Basic extraction logic as fallback
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    if (lowerLine.includes('company:') || lowerLine.includes('organization:')) {
      basicInfo.company = line.split(':')[1]?.trim();
    }
    if (lowerLine.includes('position:') || lowerLine.includes('title:')) {
      basicInfo.title = line.split(':')[1]?.trim();
    }
    if (lowerLine.includes('location:') || lowerLine.includes('based in:')) {
      basicInfo.location = line.split(':')[1]?.trim();
    }
    if (lowerLine.includes('salary:') || lowerLine.includes('compensation:')) {
      basicInfo.salary = line.split(':')[1]?.trim();
    }
    if (lowerLine.includes('job type:') || lowerLine.includes('employment type:')) {
      basicInfo.job_type = line.split(':')[1]?.trim();
    }
  }

  return basicInfo;
}

// Function to format the AI response for the form
export function formatAIResponseForForm(aiResponse) {
  if (!aiResponse.success) {
    return {
      company: '',
      title: '',
      location: '',
      salary: '',
      job_type: '',
      deadline: '',
      hiring_manager: '',
      requirements: '',
      benefits: '',
      job_description: '',
      cover_letter: ''
    };
  }

  const { extractedInfo, coverLetter } = aiResponse;
  
  return {
    company: extractedInfo.company || '',
    title: extractedInfo.title || '',
    location: extractedInfo.location || '',
    salary: extractedInfo.salary || '',
    job_type: extractedInfo.job_type || '',
    deadline: extractedInfo.deadline || '',
    hiring_manager: extractedInfo.hiring_manager || '',
    requirements: extractedInfo.requirements || '',
    benefits: extractedInfo.benefits || '',
    job_description: extractedInfo.responsibilities || '',
    cover_letter: coverLetter || ''
  };
}

// Function to get tailored resume as formatted text
export function getTailoredResumeText(tailoredResume) {
  if (!tailoredResume) return '';

  let resumeText = '';

  if (tailoredResume.summary) {
    resumeText += `PROFESSIONAL SUMMARY\n${tailoredResume.summary}\n\n`;
  }

  if (tailoredResume.experience && tailoredResume.experience.length > 0) {
    resumeText += 'EXPERIENCE\n';
    tailoredResume.experience.forEach(exp => {
      resumeText += `${exp.title} | ${exp.company} | ${exp.dates}\n`;
      resumeText += `${exp.description}\n\n`;
    });
  }

  if (tailoredResume.skills && tailoredResume.skills.length > 0) {
    resumeText += `SKILLS\n${tailoredResume.skills.join(', ')}\n\n`;
  }

  if (tailoredResume.education) {
    resumeText += `EDUCATION\n${tailoredResume.education}\n\n`;
  }

  if (tailoredResume.certifications) {
    resumeText += `CERTIFICATIONS\n${tailoredResume.certifications}\n`;
  }

  return resumeText;
} 