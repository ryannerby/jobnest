const express = require('express');
const router = express.Router();

// Simple test route
router.get('/test', (req, res) => {
  res.json({ message: 'LinkedIn scraper test route working' });
});

// POST /api/scrape-linkedin
router.post('/', async (req, res) => {
  try {
    const { searchTerm, location } = req.body;
    
    // Validate input
    if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Search term is required and must be a non-empty string'
      });
    }
    
    console.log(`LinkedIn scraping request: "${searchTerm}" in "${location || 'any location'}"`);
    
    // Generate 25 mock jobs
    const companies = [
      'Tech Corp', 'Innovation Labs', 'Digital Solutions Inc', 'StartupXYZ', 'Enterprise Solutions',
      'Global Tech', 'Future Systems', 'Cloud Dynamics', 'DataFlow Inc', 'Smart Solutions',
      'NextGen Tech', 'Digital Ventures', 'Tech Pioneers', 'Innovation Hub', 'Future Forward',
      'Tech Masters', 'Digital Experts', 'Innovation Partners', 'Tech Leaders', 'Digital Innovators',
      'Future Tech', 'Smart Systems', 'Cloud Solutions', 'Data Tech', 'Innovation Systems'
    ];
    
    const jobTitles = [
      `${searchTerm} Developer`,
      `Senior ${searchTerm} Engineer`,
      `${searchTerm} Specialist`,
      `Full Stack ${searchTerm} Developer`,
      `${searchTerm} Team Lead`,
      `Lead ${searchTerm} Engineer`,
      `${searchTerm} Architect`,
      `Principal ${searchTerm} Developer`,
      `${searchTerm} Consultant`,
      `Senior ${searchTerm} Specialist`,
      `${searchTerm} Manager`,
      `Staff ${searchTerm} Engineer`,
      `${searchTerm} Tech Lead`,
      `Senior ${searchTerm} Architect`,
      `${searchTerm} Platform Engineer`,
      `Lead ${searchTerm} Specialist`,
      `${searchTerm} Solutions Engineer`,
      `Senior ${searchTerm} Consultant`,
      `${searchTerm} Engineering Manager`,
      `Principal ${searchTerm} Engineer`,
      `${searchTerm} Infrastructure Engineer`,
      `Senior ${searchTerm} Platform Engineer`,
      `${searchTerm} DevOps Engineer`,
      `Lead ${searchTerm} Architect`,
      `${searchTerm} Systems Engineer`
    ];
    
    const locations = [
      location || 'San Francisco, CA',
      location || 'New York, NY',
      location || 'Remote',
      location || 'Austin, TX',
      location || 'Seattle, WA',
      location || 'Boston, MA',
      location || 'Chicago, IL',
      location || 'Denver, CO',
      location || 'Los Angeles, CA',
      location || 'Miami, FL',
      location || 'Portland, OR',
      location || 'Nashville, TN',
      location || 'Atlanta, GA',
      location || 'Dallas, TX',
      location || 'Phoenix, AZ',
      location || 'Las Vegas, NV',
      location || 'Salt Lake City, UT',
      location || 'Minneapolis, MN',
      location || 'Detroit, MI',
      location || 'Philadelphia, PA',
      location || 'Washington, DC',
      location || 'Baltimore, MD',
      location || 'Pittsburgh, PA',
      location || 'Cleveland, OH',
      location || 'Cincinnati, OH'
    ];
    
    const descriptions = [
      `We are looking for a talented ${searchTerm} developer to join our team. You will be responsible for developing and maintaining web applications using modern technologies.`,
      `Join our engineering team as a Senior ${searchTerm} Engineer. You'll work on cutting-edge projects and mentor junior developers.`,
      `Remote opportunity for a ${searchTerm} specialist. Flexible hours, competitive salary, and great benefits.`,
      `Fast-growing startup seeking a Full Stack ${searchTerm} developer. Equity options available.`,
      `Lead a team of ${searchTerm} developers in building scalable applications. Management experience required.`,
      `Exciting opportunity for a ${searchTerm} professional to work on innovative projects in a collaborative environment.`,
      `Join our dynamic team as a ${searchTerm} expert and help shape the future of technology.`,
      `We're seeking a passionate ${searchTerm} developer to build amazing user experiences.`,
      `Help us revolutionize the industry as a ${searchTerm} specialist in our growing team.`,
      `Join our mission to build the next generation of ${searchTerm} solutions.`,
      `We're looking for a ${searchTerm} professional who loves solving complex problems.`,
      `Be part of our journey to create innovative ${searchTerm} applications that make a difference.`,
      `Join our collaborative team of ${searchTerm} experts working on cutting-edge technology.`,
      `We're seeking a ${searchTerm} developer who is passionate about clean code and best practices.`,
      `Help us build scalable ${searchTerm} solutions that serve millions of users worldwide.`,
      `Join our fast-paced team as a ${searchTerm} specialist and grow your career with us.`,
      `We're looking for a ${searchTerm} professional to help us build amazing products.`,
      `Be part of our innovative team working on next-generation ${searchTerm} technologies.`,
      `Join our mission to create exceptional ${searchTerm} experiences for our users.`,
      `We're seeking a ${searchTerm} developer who thrives in a collaborative environment.`,
      `Help us build the future of ${searchTerm} development with cutting-edge tools and technologies.`,
      `Join our team of ${searchTerm} experts and work on projects that matter.`,
      `We're looking for a ${searchTerm} specialist to help us scale our platform.`,
      `Be part of our journey to revolutionize ${searchTerm} development practices.`,
      `Join our innovative team working on exciting ${searchTerm} projects.`,
      `We're seeking a ${searchTerm} professional to help us build amazing solutions.`,
      `Help us create the next generation of ${searchTerm} applications.`
    ];
    
    const mockJobs = [];
    
    for (let i = 1; i <= 25; i++) {
      const companyIndex = (i - 1) % companies.length;
      const titleIndex = (i - 1) % jobTitles.length;
      const locationIndex = (i - 1) % locations.length;
      const descriptionIndex = (i - 1) % descriptions.length;
      
      mockJobs.push({
        id: `linkedin_${Date.now()}_${i}`,
        title: jobTitles[titleIndex],
        company: companies[companyIndex],
        location: locations[locationIndex],
        link: `https://linkedin.com/jobs/view/${123456 + i}`,
        description: descriptions[descriptionIndex],
        postedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() // Random date within last 7 days
      });
    }
    
    res.json({
      success: true,
      message: `Found ${mockJobs.length} jobs for "${searchTerm}"`,
      jobs: mockJobs,
      searchTerm: searchTerm.trim(),
      location: location?.trim() || null,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('LinkedIn scraping error:', error);
    
    res.status(500).json({
      error: 'Scraping Error',
      message: 'Failed to scrape jobs from LinkedIn. Please try again later.'
    });
  }
});

module.exports = router; 