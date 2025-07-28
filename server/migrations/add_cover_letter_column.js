const pool = require('../db');

async function addCoverLetterColumn() {
  try {
    console.log('🔄 Adding cover_letter column to jobs table...');
    
    const result = await pool.query(`
      ALTER TABLE jobs 
      ADD COLUMN IF NOT EXISTS cover_letter TEXT
    `);
    
    console.log('✅ Successfully added cover_letter column to jobs table');
    
  } catch (error) {
    console.error('❌ Error adding cover_letter column:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the migration
addCoverLetterColumn(); 