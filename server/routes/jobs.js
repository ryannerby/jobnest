// server/routes/jobs.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const Anthropic = require('@anthropic-ai/sdk');
const { validateJob, validateCoverLetter } = require('../middleware/validation');
require('dotenv').config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// GET all jobs
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM jobs ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new job
router.post('/', validateJob, async (req, res) => {
  const { 
    company, title, status, application_date, deadline, notes, link, location, cover_letter,
    job_description, hiring_manager, salary, job_type, requirements, benefits
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO jobs (company, title, status, application_date, deadline, notes, link, location, cover_letter, job_description, hiring_manager, salary, job_type, requirements, benefits)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [company, title, status, application_date, deadline, notes, link, location, cover_letter, job_description, hiring_manager, salary, job_type, requirements, benefits]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      error: 'Failed to create job',
      message: 'An error occurred while saving the job. Please try again.'
    });
  }
});

// PUT (update) a job by ID
router.put('/:id', validateJob, async (req, res) => {
  const { id } = req.params;
  const { 
    company, title, status, application_date, deadline, notes, link, location, cover_letter,
    job_description, hiring_manager, salary, job_type, requirements, benefits
  } = req.body;
  
  try {
    // Check if job exists
    const existingJob = await pool.query('SELECT * FROM jobs WHERE id = $1', [id]);
    if (existingJob.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Job not found',
        message: 'The job you are trying to update does not exist.'
      });
    }
    
    const result = await pool.query(
      `UPDATE jobs SET
         company = $1,
         title = $2,
         status = $3,
         application_date = $4,
         deadline = $5,
         notes = $6,
         link = $7,
         location = $8,
         cover_letter = $9,
         job_description = $10,
         hiring_manager = $11,
         salary = $12,
         job_type = $13,
         requirements = $14,
         benefits = $15
       WHERE id = $16
       RETURNING *`,
      [company, title, status, application_date, deadline, notes, link, location, cover_letter, job_description, hiring_manager, salary, job_type, requirements, benefits, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      error: 'Failed to update job',
      message: 'An error occurred while updating the job. Please try again.'
    });
  }
});

// DELETE a job by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Check if job exists
    const existingJob = await pool.query('SELECT * FROM jobs WHERE id = $1', [id]);
    if (existingJob.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Job not found',
        message: 'The job you are trying to delete does not exist.'
      });
    }
    
    await pool.query('DELETE FROM jobs WHERE id = $1', [id]);
    res.json({ 
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      error: 'Failed to delete job',
      message: 'An error occurred while deleting the job. Please try again.'
    });
  }
});

// Generate cover letter using AI
router.post('/generate-cover-letter', validateCoverLetter, async (req, res) => {
  const { jobTitle, company, jobDescription, resume } = req.body;

  try {
    const prompt = `
You are an expert career coach and resume writer. Write a professional, personalized cover letter for the following job application. Use the resume and job description to highlight the most relevant skills and experience. The tone should be confident, clear, and tailored to the company.

Job Title: ${jobTitle}
Company: ${company}
Job Description: ${jobDescription}
Resume: ${resume}

The cover letter should be ready to send, starting with "Dear Hiring Manager," and ending with "Sincerely, [Your Name]".
`;

    const msg = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      temperature: 0.2,
      system: "You are a helpful assistant.",
      messages: [{ role: "user", content: prompt }],
    });

    const coverLetter = msg.content[0].text;
    res.json({ coverLetter });
  } catch (err) {
    console.error("Claude API error:", err);
    if (err.response) {
      console.error("Claude API error response data:", err.response.data);
    }
    res.status(500).json({ 
      error: "Failed to generate cover letter",
      message: "Unable to generate cover letter at this time. Please try again later."
    });
  }
});

// AI-powered cover letter generation function
function generateCoverLetter(jobTitle, company, jobDescription, resume) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Extract key information from resume (simplified parsing)
  const resumeLines = resume.split('\n').filter(line => line.trim());
  const skills = extractSkills(resume);
  const experience = extractExperience(resume);
  
  // Generate personalized content based on job requirements
  let personalizedContent = '';
  
  if (jobDescription) {
    const jobKeywords = extractKeywords(jobDescription.toLowerCase());
    const matchingSkills = skills.filter(skill => 
      jobKeywords.some(keyword => skill.toLowerCase().includes(keyword))
    );
    
    if (matchingSkills.length > 0) {
      personalizedContent = `My experience with ${matchingSkills.slice(0, 3).join(', ')} directly aligns with the technical requirements for this role. `;
    }
  }

  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${company}. With my background and experience, I am confident that I would be a valuable addition to your team.

${jobDescription ? `Based on the job description, I understand that this role involves ${jobDescription}. ` : ''}${personalizedContent}My experience aligns well with the requirements for this position, and I am excited about the opportunity to contribute to ${company}'s continued success.

Key highlights from my background include:
${skills.slice(0, 4).map(skill => `• ${skill}`).join('\n')}
• Strong technical and problem-solving skills
• Proven track record of delivering results
• Excellent communication and collaboration abilities

I am particularly drawn to ${company} because of its reputation for innovation and excellence. I am excited about the opportunity to work with a team that values creativity and continuous improvement.

I would welcome the opportunity to discuss how my skills and experience can contribute to ${company}'s success. Thank you for considering my application. I look forward to hearing from you.

Sincerely,
[Your Name]

${currentDate}`;
}

// Helper functions for resume parsing
function extractSkills(resume) {
  const skillKeywords = [
    'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'aws', 'docker',
    'kubernetes', 'git', 'agile', 'scrum', 'machine learning', 'ai', 'data science',
    'frontend', 'backend', 'full stack', 'devops', 'cloud', 'api', 'rest', 'graphql'
  ];
  
  const foundSkills = [];
  const resumeLower = resume.toLowerCase();
  
  skillKeywords.forEach(skill => {
    if (resumeLower.includes(skill)) {
      foundSkills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  });
  
  return foundSkills.length > 0 ? foundSkills : ['Technical Skills', 'Problem Solving', 'Team Collaboration'];
}

function extractExperience(resume) {
  // Simple experience extraction - look for years and common job titles
  const experienceKeywords = ['years', 'experience', 'senior', 'junior', 'lead', 'manager'];
  const lines = resume.split('\n');
  
  return lines.filter(line => 
    experienceKeywords.some(keyword => line.toLowerCase().includes(keyword))
  ).slice(0, 3);
}

function extractKeywords(text) {
  const commonKeywords = [
    'development', 'engineering', 'programming', 'coding', 'software',
    'web', 'mobile', 'frontend', 'backend', 'full stack', 'database',
    'api', 'testing', 'deployment', 'cloud', 'devops', 'agile'
  ];
  
  return commonKeywords.filter(keyword => text.includes(keyword));
}

// Claude API proxy route to avoid CORS issues
router.post('/claude-proxy', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Claude API key not configured' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: `API call failed: ${response.status} ${response.statusText}`,
        details: errorText
      });
    }

    const data = await response.json();
    res.json({ content: data.content[0].text });
    
  } catch (error) {
    console.error('Claude proxy error:', error);
    res.status(500).json({ error: `Proxy error: ${error.message}` });
  }
});

module.exports = router;
