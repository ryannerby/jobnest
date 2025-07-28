const pool = require('./db');

const mockJobs = [
  {
    company: 'Netflix',
    title: 'Senior Frontend Engineer',
    status: 'applied',
    application_date: '2024-01-15',
    deadline: '2024-02-15',
    notes: 'Great company culture, remote-friendly position. Focus on React and TypeScript.',
    link: 'https://jobs.netflix.com/senior-frontend-engineer'
  },
  {
    company: 'Spotify',
    title: 'Full Stack Developer',
    status: 'interview',
    application_date: '2024-01-10',
    deadline: '2024-01-30',
    notes: 'Second round interview scheduled. Working on music recommendation algorithms.',
    link: 'https://careers.spotify.com/full-stack-developer'
  },
  {
    company: 'Airbnb',
    title: 'Software Engineer - Backend',
    status: 'wishlist',
    application_date: null,
    deadline: '2024-03-01',
    notes: 'Dream company! Need to improve my system design skills before applying.',
    link: 'https://careers.airbnb.com/backend-engineer'
  },
  {
    company: 'Stripe',
    title: 'Product Engineer',
    status: 'offer',
    application_date: '2023-12-20',
    deadline: '2024-01-20',
    notes: 'Received offer! $180k base + equity. Great team and interesting fintech problems.',
    link: 'https://stripe.com/jobs/product-engineer'
  },
  {
    company: 'Uber',
    title: 'Mobile Engineer - iOS',
    status: 'rejected',
    application_date: '2024-01-05',
    deadline: '2024-01-25',
    notes: 'Rejected after technical interview. Need to practice more iOS development.',
    link: 'https://careers.uber.com/ios-engineer'
  },
  {
    company: 'Meta',
    title: 'Machine Learning Engineer',
    status: 'applied',
    application_date: '2024-01-20',
    deadline: '2024-02-20',
    notes: 'Applied for ML role. Strong background in Python and TensorFlow.',
    link: 'https://careers.meta.com/ml-engineer'
  },
  {
    company: 'Google',
    title: 'Cloud Solutions Architect',
    status: 'interview',
    application_date: '2024-01-12',
    deadline: '2024-02-12',
    notes: 'First interview went well. Next round focuses on system design.',
    link: 'https://careers.google.com/cloud-architect'
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with mock jobs...');
    
    for (const job of mockJobs) {
      const result = await pool.query(
        `INSERT INTO jobs (company, title, status, application_date, deadline, notes, link)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [job.company, job.title, job.status, job.application_date, job.deadline, job.notes, job.link]
      );
      console.log(`✅ Added job: ${job.title} at ${job.company} (ID: ${result.rows[0].id})`);
    }
    
    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Added ${mockJobs.length} mock jobs to your database.`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the seed function
seedDatabase(); 