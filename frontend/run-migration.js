// run-migration.js
import { Pool } from 'pg';
import { readFile, readdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

// Load environment variables from server/.env
config({ path: './server/.env' });

// Get current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database connection configuration
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.NODE_ENV === 'production' ? 'db' : (process.env.DB_HOST || 'localhost'),
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10),
};

console.log('Database connection config:', {
  ...dbConfig,
  password: dbConfig.password ? '***' : 'not set'
});

const pool = new Pool(dbConfig);

// Test the database connection
async function testConnection() {
  let client;
  try {
    client = await pool.connect();
    console.log('✅ Successfully connected to the database');
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('Please check your database configuration in server/.env');
    console.error('Make sure:');
    console.error('1. PostgreSQL is running');
    console.error('2. The database and user exist');
    console.error('3. The password is correct');
    return false;
  } finally {
    if (client) client.release();
  }
}

// Run the migration
async function runMigration() {
  if (!await testConnection()) {
    console.error('❌ Cannot proceed with migration due to connection issues');
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const migrationPath = join(__dirname, 'server', 'migrations', '0011_add_location_coordinates.sql');
    console.log(`📄 Reading migration file from: ${migrationPath}`);

    const migrationSQL = await readFile(migrationPath, 'utf8');
    console.log(`🚀 Running migration ${migrationPath}...`);

    await client.query(migrationSQL);
    await client.query('COMMIT');

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
runMigration().catch(console.error);