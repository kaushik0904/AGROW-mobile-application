const { getClient } = require('../src/core/database/connection');

async function seed() {
  const client = await getClient();
  try {
    console.log('Starting database seed...');
    await client.query('BEGIN');
    
    // Example: TRUNCATE tables and RESTART IDENTITY
    // await client.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE;');
    
    // Seed logic goes here
    
    await client.query('COMMIT');
    console.log('Seeding complete.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during seeding, transaction rolled back:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

seed();
