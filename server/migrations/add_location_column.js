const pool = require('../db');

async function addLocationColumn() {
  try {
    console.log('🔄 Adding location column to jobs table...');
    
    // Check if location column already exists
    const columnExists = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'jobs' AND column_name = 'location';
    `);
    
    if (columnExists.rows.length === 0) {
      await pool.query(`
        ALTER TABLE jobs ADD COLUMN location VARCHAR(100);
      `);
      console.log('✅ Added location column to jobs table');
    } else {
      console.log('ℹ️  Location column already exists');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

addLocationColumn(); 