const pool = require('../db');

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    // Create jobs table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        company VARCHAR(100) NOT NULL,
        title VARCHAR(200) NOT NULL,
        status VARCHAR(20) NOT NULL CHECK (status IN ('wishlist', 'applied', 'interview', 'offer', 'rejected')),
        application_date DATE,
        deadline DATE,
        notes TEXT,
        link VARCHAR(500),
        cover_letter TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Add cover_letter column if it doesn't exist
    const columnExists = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'jobs' AND column_name = 'cover_letter';
    `);
    
    if (columnExists.rows.length === 0) {
      await pool.query(`
        ALTER TABLE jobs ADD COLUMN cover_letter TEXT;
      `);
      console.log('✅ Added cover_letter column');
    }
    
    // Add created_at and updated_at columns if they don't exist
    const createdAtExists = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'jobs' AND column_name = 'created_at';
    `);
    
    if (createdAtExists.rows.length === 0) {
      await pool.query(`
        ALTER TABLE jobs ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      `);
      console.log('✅ Added created_at column');
    }
    
    const updatedAtExists = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'jobs' AND column_name = 'updated_at';
    `);
    
    if (updatedAtExists.rows.length === 0) {
      await pool.query(`
        ALTER TABLE jobs ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      `);
      console.log('✅ Added updated_at column');
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