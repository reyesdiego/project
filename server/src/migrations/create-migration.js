const fs = require('fs');
const path = require('path');

function createMigration() {
  const migrationName = process.argv[2];
  
  if (!migrationName) {
    console.error('❌ Please provide a migration name');
    console.log('Usage: npm run migrate:create <migration_name>');
    console.log('Example: npm run migrate:create add_user_roles');
    process.exit(1);
  }

  // Get the next migration number
  const migrationsDir = __dirname;
  const existingMigrations = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql') && file.match(/^\d{3}_/))
    .sort();

  let nextNumber = 1;
  if (existingMigrations.length > 0) {
    const lastMigration = existingMigrations[existingMigrations.length - 1];
    const lastNumber = parseInt(lastMigration.split('_')[0]);
    nextNumber = lastNumber + 1;
  }

  // Format the migration number with leading zeros
  const migrationNumber = nextNumber.toString().padStart(3, '0');
  
  // Create the filename
  const fileName = `${migrationNumber}_${migrationName}.sql`;
  const filePath = path.join(migrationsDir, fileName);

  // Create the migration template
  const migrationTemplate = `-- Migration: ${migrationName}
-- Description: Add your migration description here
-- Date: ${new Date().toISOString().split('T')[0]}

-- Your SQL commands go here
-- Example:
-- CREATE TABLE IF NOT EXISTS example_table (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );

-- Example index:
-- CREATE INDEX IF NOT EXISTS idx_example_name ON example_table(name);

-- Example trigger:
-- DROP TRIGGER IF EXISTS update_example_updated_at ON example_table;
-- CREATE TRIGGER update_example_updated_at 
--     BEFORE UPDATE ON example_table 
--     FOR EACH ROW 
--     EXECUTE FUNCTION update_updated_at_column();

`;

  try {
    fs.writeFileSync(filePath, migrationTemplate);
    console.log(`✅ Created migration: ${fileName}`);
    console.log(`📁 Location: ${filePath}`);
    console.log('\n📝 Next steps:');
    console.log('1. Edit the migration file with your SQL commands');
    console.log('2. Run migrations with: npm run migrate');
  } catch (error) {
    console.error('❌ Error creating migration:', error.message);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  createMigration();
}

module.exports = { createMigration };

