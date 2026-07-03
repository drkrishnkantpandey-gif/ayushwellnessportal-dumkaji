const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function runMigrations() {
    const client = await pool.connect();
    try {
        const migrationsDir = path.join(__dirname, 'migrations');
        const files = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort(); // Ensure alphanumeric order

        console.log(`Found ${files.length} migration files.`);

        // Create migrations table if not exists (optional, but good practice to track)
        await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        for (const file of files) {
            // Check if migration already executed
            const { rows } = await client.query('SELECT name FROM migrations WHERE name = $1', [file]);
            if (rows.length > 0) {
                console.log(`Skipping ${file} (already executed)`);
                continue;
            }

            console.log(`Running ${file}...`);
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            await client.query('BEGIN');
            try {
                await client.query(sql);
                await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
                await client.query('COMMIT');
                console.log(`Success: ${file}`);
            } catch (err) {
                await client.query('ROLLBACK');
                console.error(`Error running ${file}:`);
                console.error(err);
                throw err;
            }
        }
        console.log('All migrations completed successfully.');
    } catch (err) {
        console.error('Migration process failed:', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigrations();
