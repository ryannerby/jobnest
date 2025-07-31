
// Improved LinkedIn Job Description Parser
// Based on analysis of real LinkedIn job postings

export function parseJobDescription(description) {
  if (!description || typeof description !== 'string') {
    return {};
  }

  const parsed = {};
  const lines = description.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const fullText = description.toLowerCase();

  // ===== IMPROVED COMPANY EXTRACTION =====
  parsed.company = extractCompanyImproved(lines, fullText);

  // ===== IMPROVED TITLE EXTRACTION =====
  parsed.title = extractTitleImproved(lines, fullText);

  // ===== IMPROVED LOCATION EXTRACTION =====
  parsed.location = extractLocationImproved(lines, fullText);

  // ===== IMPROVED SALARY EXTRACTION =====
  parsed.salary = extractSalaryImproved(lines, fullText);

  // ===== IMPROVED JOB TYPE EXTRACTION =====
  parsed.job_type = extractJobTypeImproved(lines, fullText);

  // ===== IMPROVED DEADLINE EXTRACTION =====
  parsed.deadline = extractDeadlineImproved(lines, fullText);

  // ===== IMPROVED HIRING MANAGER EXTRACTION =====
  parsed.hiring_manager = extractHiringManagerImproved(lines, fullText);

  // ===== IMPROVED REQUIREMENTS EXTRACTION =====
  parsed.requirements = extractRequirementsImproved(lines, fullText);

  // ===== IMPROVED BENEFITS EXTRACTION =====
  parsed.benefits = extractBenefitsImproved(lines, fullText);

  // Store the full description with formatting
  parsed.full_description = formatJobDescription(description);

  return parsed;
}

function extractCompanyImproved(lines, fullText) {
  // Strategy 1: Look for company name in first few lines
  const firstLines = lines.slice(0, 5);
  
  for (const line of firstLines) {
    const lowerLine = line.toLowerCase();
    
    // Skip lines that are too short or too long
    if (line.length < 3 || line.length > 100) continue;
    
    // Look for company indicators
    const companyIndicators = ['inc', 'corp', 'llc', 'ltd', 'company', 'group', 'technologies', 'systems', 'solutions'];
    const hasCompanyIndicator = companyIndicators.some(indicator => lowerLine.includes(indicator));
    
    if (hasCompanyIndicator) {
      return line;
    }
  }

  // Strategy 2: Look for "We are [Company]" patterns
  const weArePatterns = [
    /we are ([a-z0-9\s&.,'-]+)/i,
    /join ([a-z0-9\s&.,'-]+)/i,
    /about ([a-z0-9\s&.,'-]+)/i
  ];

  for (const pattern of weArePatterns) {
    const match = fullText.match(pattern);
    if (match && match[1]) {
      const company = match[1].trim();
      if (company.length > 2 && company.length < 100) {
        return company.charAt(0).toUpperCase() + company.slice(1);
      }
    }
  }

  // Strategy 3: Look for explicit company patterns
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('company:') || lowerLine.includes('organization:') || lowerLine.includes('employer:')) {
      const company = line.split(':')[1]?.trim();
      if (company && company.length > 2 && company.length < 100) {
        return company;
      }
    }
  }

  return null;
}

function extractTitleImproved(lines, fullText) {
  // Strategy 1: Look for job titles in first few lines
  const titleKeywords = [
    'manager', 'engineer', 'specialist', 'coordinator', 'analyst', 
    'lead', 'senior', 'junior', 'principal', 'staff', 'director', 'architect',
    'designer', 'scientist', 'consultant', 'advisor', 'associate', 'executive',
    'representative', 'technician', 'assistant', 'supervisor'
  ];

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();
    
    // Skip lines that are too short or too long
    if (line.length < 3 || line.length > 100) continue;
    
    // Check if line contains job title keywords
    const hasTitleKeyword = titleKeywords.some(keyword => lowerLine.includes(keyword));
    
    if (hasTitleKeyword) {
      // Clean up the title
      let cleanTitle = line;
      
      // Remove common prefixes
      if (cleanTitle.toLowerCase().startsWith('position:')) {
        cleanTitle = cleanTitle.split(':')[1]?.trim() || cleanTitle;
      }
      
      // Remove "at [Company]" patterns
      cleanTitle = cleanTitle.replace(/\s+at\s+[a-z0-9\s&.,'-]+$/i, '');
      
      // Remove emojis and extra symbols
      cleanTitle = cleanTitle.replace(/[🚀🎨✨🔥]/g, '').trim();
      
      // Remove bullet points
      cleanTitle = cleanTitle.replace(/^[•\-\*]\s*/, '');
      
      return cleanTitle;
    }
  }

  // Strategy 2: Look for explicit title patterns
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('position:') || lowerLine.includes('title:') || lowerLine.includes('role:')) {
      const title = line.split(':')[1]?.trim();
      if (title && title.length > 3 && title.length < 100) {
        return title;
      }
    }
  }

  return null;
}

function extractLocationImproved(lines, fullText) {
  // Strategy 1: Look for explicit location patterns
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('location:') || lowerLine.includes('based in:') || lowerLine.includes('work from:')) {
      const location = line.split(':')[1]?.trim();
      if (location && location.length > 2 && location.length < 100) {
        return location;
      }
    }
  }

  // Strategy 2: Look for location keywords in text
  const locationKeywords = ['remote', 'hybrid', 'onsite', 'work from home', 'in-office'];
  for (const keyword of locationKeywords) {
    if (fullText.includes(keyword)) {
      return keyword;
    }
  }

  // Strategy 3: Look for city/state patterns
  const cityStatePattern = /([a-z]+,\s*[a-z]{2})/i;
  const match = fullText.match(cityStatePattern);
  if (match && match[1]) {
    return match[1];
  }

  return null;
}

function extractSalaryImproved(lines, fullText) {
  // Strategy 1: Look for explicit salary patterns
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('salary:') || lowerLine.includes('compensation:') || lowerLine.includes('pay:')) {
      const salary = line.split(':')[1]?.trim();
      if (salary && salary.length > 2 && salary.length < 50) {
        return salary;
      }
    }
  }

  // Strategy 2: Look for salary ranges in text
  const salaryPatterns = [
    /\$[\d,]+(?:\s*-\s*\$[\d,]+)?/g,
    /[\d,]+(?:\s*-\s*[\d,]+)?\s*(?:k|thousand|per year|annually)/gi,
    /\$[\d,]+k\s*-\s*[\d,]+k/gi,
    /\$[\d,]+k\s*\+\s*equity/gi
  ];

  for (const pattern of salaryPatterns) {
    const matches = fullText.match(pattern);
    if (matches && matches.length > 0) {
      // Get the longest match (most complete salary info)
      const longestMatch = matches.reduce((longest, current) => 
        current.length > longest.length ? current : longest
      );
      return longestMatch;
    }
  }

  return null;
}

function extractJobTypeImproved(lines, fullText) {
  // Strategy 1: Look for explicit job type patterns
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('job type:') || lowerLine.includes('employment type:') || lowerLine.includes('position type:')) {
      const jobType = line.split(':')[1]?.trim();
      if (jobType && jobType.length > 2 && jobType.length < 50) {
        return jobType;
      }
    }
  }

  // Strategy 2: Look for job type keywords
  const jobTypeKeywords = ['full-time', 'part-time', 'contract', 'temporary', 'permanent', 'freelance', 'internship'];
  for (const keyword of jobTypeKeywords) {
    if (fullText.includes(keyword)) {
      return keyword;
    }
  }

  return null;
}

function extractDeadlineImproved(lines, fullText) {
  // Strategy 1: Look for explicit deadline patterns
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('deadline:') || lowerLine.includes('application deadline:') || lowerLine.includes('closing date:')) {
      const deadline = line.split(':')[1]?.trim();
      if (deadline && deadline.length > 2 && deadline.length < 50) {
        return deadline;
      }
    }
  }

  // Strategy 2: Look for deadline keywords
  const deadlineKeywords = ['asap', 'immediately', 'urgent', 'rolling basis', 'open until filled'];
  for (const keyword of deadlineKeywords) {
    if (fullText.includes(keyword)) {
      return keyword.toUpperCase();
    }
  }

  return null;
}

function extractHiringManagerImproved(lines, fullText) {
  // Strategy 1: Look for explicit hiring manager patterns
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('hiring manager:') || lowerLine.includes('contact:') || lowerLine.includes('recruiter:')) {
      const manager = line.split(':')[1]?.trim();
      if (manager && manager.length > 2 && manager.length < 100) {
        // Remove email if present
        const cleanManager = manager.split('(')[0].trim();
        return cleanManager;
      }
    }
  }

  // Strategy 2: Look for email patterns
  const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
  const emailMatch = fullText.match(emailPattern);
  if (emailMatch) {
    const email = emailMatch[1];
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  return null;
}

function extractRequirementsImproved(lines, fullText) {
  // Strategy 1: Look for requirements section
  let requirementsStart = -1;
  let requirementsEnd = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('requirements:') || line.includes('qualifications:') || line.includes('skills:') || line.includes('experience:') || line.includes('what you need:')) {
      requirementsStart = i + 1;
      break;
    }
  }
  
  if (requirementsStart !== -1) {
    for (let i = requirementsStart; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (line.includes('benefits:') || line.includes('perks:') || line.includes('what we offer:') || 
          line.includes('deadline:') || line.includes('application deadline:') || line.includes('hiring manager:') ||
          line.includes('contact:') || line.includes('apply') || line.includes('please')) {
        requirementsEnd = i;
        break;
      }
    }
    
    if (requirementsEnd === -1) {
      requirementsEnd = lines.length;
    }
    
    const requirementsLines = lines.slice(requirementsStart, requirementsEnd);
    if (requirementsLines.length > 0) {
      return requirementsLines.join('\n');
    }
  }

  return null;
}

function extractBenefitsImproved(lines, fullText) {
  // Strategy 1: Look for benefits section
  let benefitsStart = -1;
  let benefitsEnd = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('benefits:') || line.includes('perks:') || line.includes('what we offer:') || line.includes('compensation includes:')) {
      benefitsStart = i + 1;
      break;
    }
  }
  
  if (benefitsStart !== -1) {
    for (let i = benefitsStart; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (line.includes('deadline:') || line.includes('application deadline:') || line.includes('hiring manager:') || 
          line.includes('contact:') || line.includes('apply') || line.includes('please')) {
        benefitsEnd = i;
        break;
      }
    }
    
    if (benefitsEnd === -1) {
      benefitsEnd = lines.length;
    }
    
    const benefitsLines = lines.slice(benefitsStart, benefitsEnd);
    if (benefitsLines.length > 0) {
      return benefitsLines.join('\n');
    }
  }

  return null;
}

// Function to format the parsed data for display
export function formatParsedData(parsed) {
  const formatted = {};
  
  if (parsed.company) {
    formatted.company = parsed.company.charAt(0).toUpperCase() + parsed.company.slice(1);
  }
  
  if (parsed.title) {
    formatted.title = parsed.title.charAt(0).toUpperCase() + parsed.title.slice(1);
  }
  
  if (parsed.location) {
    formatted.location = parsed.location.charAt(0).toUpperCase() + parsed.location.slice(1);
  }
  
  if (parsed.deadline) {
    formatted.deadline = parsed.deadline.toUpperCase();
  }
  
  if (parsed.hiring_manager) {
    formatted.hiring_manager = parsed.hiring_manager.charAt(0).toUpperCase() + parsed.hiring_manager.slice(1);
  }
  
  if (parsed.salary) {
    formatted.salary = parsed.salary;
  }
  
  if (parsed.job_type) {
    formatted.job_type = parsed.job_type.charAt(0).toUpperCase() + parsed.job_type.slice(1);
  }
  
  if (parsed.requirements) {
    formatted.requirements = parsed.requirements;
  }
  
  if (parsed.benefits) {
    formatted.benefits = parsed.benefits;
  }
  
  if (parsed.full_description) {
    formatted.full_description = parsed.full_description;
  }
  
  return formatted;
}

// Function to format job description for better readability
function formatJobDescription(description) {
  if (!description) return '';
  
  let formatted = description;
  
  // Split into lines and clean up
  const lines = formatted.split('\\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Process each line for better formatting
  const processedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();
    
    // Add extra spacing before section headers
    if (lowerLine.includes('requirements:') || lowerLine.includes('qualifications:') || 
        lowerLine.includes('skills:') || lowerLine.includes('experience:') || 
        lowerLine.includes('education:') || lowerLine.includes('benefits:') || 
        lowerLine.includes('perks:') || lowerLine.includes('what we offer:') || 
        lowerLine.includes('compensation:') || lowerLine.includes('salary:') || 
        lowerLine.includes('location:') || lowerLine.includes('job type:') || 
        lowerLine.includes('employment type:') || lowerLine.includes('position type:') || 
        lowerLine.includes('deadline:') || lowerLine.includes('application deadline:') || 
        lowerLine.includes('closing date:') || lowerLine.includes('hiring manager:') || 
        lowerLine.includes('contact:') || lowerLine.includes('recruiter:') || 
        lowerLine.includes('hr:') || lowerLine.includes('company:')) {
      
      // Add extra line break before section headers
      if (processedLines.length > 0) {
        processedLines.push('');
      }
      processedLines.push(line);
      processedLines.push('');
    }
    // Format bullet points
    else if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*') || line.match(/^\\d+\\./)) {
      processedLines.push(line);
    }
    // Regular content
    else {
      processedLines.push(line);
    }
  }
  
  // Join lines back together
  formatted = processedLines.join('\\n');
  
  // Clean up multiple line breaks
  formatted = formatted.replace(/\\n{4,}/g, '\\n\\n\\n');
  
  // Trim whitespace
  formatted = formatted.trim();
  
  return formatted;
}
