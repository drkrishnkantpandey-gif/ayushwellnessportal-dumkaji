// server/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || process.env.POSTGRES_USER || 'ayush_user',
  password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || 'ayush_password',
  database: process.env.DB_NAME || process.env.POSTGRES_DB || 'ayush_portal',
  port: process.env.DB_PORT || 5432,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};