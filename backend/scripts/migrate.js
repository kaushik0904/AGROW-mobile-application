const { pool } = require('../src/core/database/connection');
const fs = require('fs');
const path = require('path');

async function migrate() {
  console.log('Starting migrations...');
  const migrationsDir = path.join(__dirname, '../database/migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.log('No migrations directory found.');
    process.exit(0);
  }

  const files = fs.readdirSync(migrationsDir).sort();
  for (const file of files) {
    if (file.endsWith('.sql')) {
      console.log(`Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      try {
        await pool.query(sql);
        console.log(`Successfully applied: ${file}`);
      } catch (err) {
        console.error(`Error applying migration ${file}:`, err);
        process.exit(1);
      }
    }
  }
  console.log('Migrations complete.');
  process.exit(0);
}

migrate();
