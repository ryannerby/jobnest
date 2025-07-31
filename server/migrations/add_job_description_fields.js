const pool = require('../db');

async function addJobDescriptionFields() {
  try {
    console.log('🔄 Adding job description fields to jobs table...');
    
    // Check if columns already exist and add them if they don't
    const columnsToAdd = [
      { name: 'job_description', type: 'TEXT' },
      { name: 'hiring_manager', type: 'VARCHAR(100)' },
      { name: 'salary', type: 'VARCHAR(100)' },
      { name: 'job_type', type: 'VARCHAR(50)' },
      { name: 'requirements', type: 'TEXT' },
      { name: 'benefits', type: 'TEXT' }
    ];

    for (const column of columnsToAdd) {
      const columnExists = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'jobs' AND column_name = $1;
      `, [column.name]);
      
      if (columnExists.rows.length === 0) {
        await pool.query(`
          ALTER TABLE jobs ADD COLUMN ${column.name} ${column.type};
        `);
        console.log(`✅ Added ${column.name} column to jobs table`);
      } else {
        console.log(`ℹ️  ${column.name} column already exists`);
      }
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

addJobDescriptionFields(); 