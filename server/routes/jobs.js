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
  const { company, title, status, application_date, deadline, notes, link, cover_letter } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO jobs (company, title, status, application_date, deadline, notes, link, cover_letter)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [company, title, status, application_date, deadline, notes, link, cover_letter]
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
  const { company, title, status, application_date, deadline, notes, link, cover_letter } = req.body;
  
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
         cover_letter = $8
       WHERE id = $9
       RETURNING *`,
      [company, title, status, application_date, deadline, notes, link, cover_letter, id]
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

module.exports = router;
