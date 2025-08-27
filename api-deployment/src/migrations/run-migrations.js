const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'your_password',
  database: process.env.DB_NAME || 'scoreteam'
};

const pool = new Pool({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...');

    // Get all migration files
    const migrationsDir = path.join(__dirname);
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql') && file.match(/^\d{3}_/))
      .sort();

    console.log(`📁 Found ${migrationFiles.length} migration files`);

    // Check if migrations table exists, if not create it
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (error) {
      console.log('Migrations table already exists or error creating it:', error.message);
    }

    // Run each migration
    for (const migrationFile of migrationFiles) {
      const migrationName = migrationFile.replace('.sql', '');
      
      try {
        // Check if migration already executed
        const result = await pool.query(`
          SELECT COUNT(*) as count FROM migrations WHERE name = $1
        `, [migrationName]);
        const executed = parseInt(result.rows[0].count) > 0;

        if (executed) {
          console.log(`✅ Migration ${migrationName} already executed, skipping...`);
          continue;
        }

        // Read and execute migration
        const migrationPath = path.join(migrationsDir, migrationFile);
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        console.log(`🔄 Running migration: ${migrationName}`);

        await pool.query(migrationSQL);
        
        // Record migration as executed
        await pool.query(`
          INSERT INTO migrations (name) VALUES ($1)
        `, [migrationName]);

        console.log(`✅ Migration ${migrationName} completed successfully`);

      } catch (error) {
        console.error(`❌ Error running migration ${migrationName}:`, error.message);
        throw error;
      }
    }

    console.log('🎉 All migrations completed successfully!');

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
