const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
async function checkSchema() {
    try {
        const tables = ['wellness_centres', 'wellness_programs', 'wellness_staff', 'wellness_sessions', 'therapists'];
        for (const table of tables) {
            const res = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [table]);
            console.log(`--- Table: ${table} ---`);
            if (res.rows.length > 0) {
                console.log(res.rows);
            } else {
                console.log('Does not exist');
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
checkSchema();
