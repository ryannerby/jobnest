# AI Integration for Cover Letter Generation

This document explains how to integrate with real AI services for enhanced cover letter generation.

## Current Implementation

The current implementation uses a template-based approach with intelligent parsing of resumes and job descriptions. It extracts skills, experience, and keywords to create personalized cover letters.

## Integrating with OpenAI

To integrate with OpenAI's GPT models, follow these steps:

### 1. Install OpenAI SDK

```bash
cd server
npm install openai
```

### 2. Set up Environment Variables

Add to your `.env` file:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Update the Cover Letter Generation Function

Replace the `generateCoverLetter` function in `server/routes/jobs.js`:

```javascript
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateCoverLetterWithAI(jobTitle, company, jobDescription, resume) {
  try {
    const prompt = `Generate a professional cover letter for the following job application:

Job Title: ${jobTitle}
Company: ${company}
Job Description: ${jobDescription || 'Not provided'}

Resume:
${resume}

Please create a compelling, personalized cover letter that:
1. Addresses the specific job requirements
2. Highlights relevant skills from the resume
3. Shows enthusiasm for the company and role
4. Is professional and well-structured
5. Includes a proper greeting and closing

Keep the cover letter concise (around 300-400 words) and avoid generic statements.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional career coach and resume writer. Create compelling, personalized cover letters that help candidates stand out."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    // Fallback to template-based generation
    return generateCoverLetter(jobTitle, company, jobDescription, resume);
  }
}
```

### 4. Update the Route Handler

Replace the route handler:

```javascript
router.post('/generate-cover-letter', async (req, res) => {
  const { jobTitle, company, jobDescription, resume } = req.body;
  
  try {
    const coverLetter = await generateCoverLetterWithAI(jobTitle, company, jobDescription, resume);
    res.json({ coverLetter });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

## Alternative AI Services

### Google Cloud AI (Vertex AI)

```javascript
const { VertexAI } = require('@google-cloud/vertexai');

const vertexAI = new VertexAI({
  project: 'your-project-id',
  location: 'us-central1',
});

async function generateWithVertexAI(jobTitle, company, jobDescription, resume) {
  const model = vertexAI.preview.getGenerativeModel({
    model: 'gemini-pro',
  });

  const prompt = `Generate a cover letter for ${jobTitle} at ${company}...`;
  
  const result = await model.generateContent(prompt);
  return result.response.text();
}
```

### Anthropic Claude

```javascript
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function generateWithClaude(jobTitle, company, jobDescription, resume) {
  const message = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Generate a cover letter for ${jobTitle} at ${company}...`
    }]
  });

  return message.content[0].text;
}
```

## Best Practices

1. **Rate Limiting**: Implement rate limiting to avoid API quota issues
2. **Error Handling**: Always have a fallback to template-based generation
3. **Cost Management**: Monitor API usage and implement caching for similar requests
4. **Content Filtering**: Review generated content for appropriateness
5. **User Feedback**: Allow users to regenerate or edit AI-generated content

## Security Considerations

1. **API Key Security**: Never expose API keys in client-side code
2. **Input Validation**: Sanitize all inputs before sending to AI services
3. **Data Privacy**: Be mindful of what data is sent to third-party services
4. **Content Review**: Implement human review for sensitive applications

## Testing

Test your AI integration with various resume formats and job descriptions to ensure consistent quality and appropriate content generation. 