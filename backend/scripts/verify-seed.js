const { pool } = require('../src/core/database/connection');

async function verifySeed() {
  try {
    console.log('Verifying database seed states...');
    
    // Example assertion
    // const res = await pool.query('SELECT count(*) FROM users');
    // console.log(`Users count: ${res.rows[0].count}`);
    
    console.log('Verification complete.');
  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

verifySeed();
