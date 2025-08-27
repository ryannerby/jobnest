const pool = require('../db');

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    // Create jobs table if it doesn't exist with all required columns
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        company VARCHAR(100) NOT NULL,
        title VARCHAR(200) NOT NULL,
        status VARCHAR(20) NOT NULL CHECK (status IN ('wishlist', 'applied', 'interview', 'offer', 'rejected')),
        application_date DATE,
        deadline DATE,
        location VARCHAR(100),
        notes TEXT,
        link VARCHAR(500),
        cover_letter TEXT,
        job_description TEXT,
        hiring_manager VARCHAR(100),
        salary VARCHAR(100),
        job_type VARCHAR(50),
        requirements TEXT,
        benefits TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Jobs table created/verified successfully!');
    
    // Add any missing columns that might not exist
    const columnsToCheck = [
      { name: 'location', type: 'VARCHAR(100)' },
      { name: 'job_description', type: 'TEXT' },
      { name: 'hiring_manager', type: 'VARCHAR(100)' },
      { name: 'salary', type: 'VARCHAR(100)' },
      { name: 'job_type', type: 'VARCHAR(50)' },
      { name: 'requirements', type: 'TEXT' },
      { name: 'benefits', type: 'TEXT' },
      { name: 'cover_letter', type: 'TEXT' },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ];

    for (const column of columnsToCheck) {
      const columnExists = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'jobs' AND column_name = $1;
      `, [column.name]);
      
      if (columnExists.rows.length === 0) {
        await pool.query(`
          ALTER TABLE jobs ADD COLUMN ${column.name} ${column.type};
        `);
        console.log(`✅ Added ${column.name} column`);
      } else {
        console.log(`ℹ️  ${column.name} column already exists`);
      }
    }
    
    console.log('✅ All migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations(); 