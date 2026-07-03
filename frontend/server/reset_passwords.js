const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function updatePasswords() {
    const hash = await bcrypt.hash('password123', 10);
    const emails = ['saumyajoshi675@gmail.com', 'saumya.sj675@gmail.com', 'akanshatiwari0217@gmail.com'];

    for (const email of emails) {
        try {
            await pool.query(
                'UPDATE ayush_colleges SET password_hash = $1 WHERE LOWER(college_email) = LOWER($2)',
                [hash, email]
            );
            console.log(`Updated password for ${email}`);
        } catch (err) {
            console.error(`Error updating ${email}:`, err);
        }
    }
    await pool.end();
}

updatePasswords();
