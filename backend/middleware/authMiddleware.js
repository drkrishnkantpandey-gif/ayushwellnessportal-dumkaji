// middleware/authMiddleware.js
const jwt  = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user:     process.env.DB_USER,
  host:     process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port:     process.env.DB_PORT,
});

const verifyToken = async (req, res, next) => {
  // Fix #6: prefer httpOnly cookie; fall back to Authorization header for
  // backward-compatibility during migration
  let token = req.cookies?.token;
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const userId  = decoded.userId || decoded.id;
    const role    = decoded.role;

    if (!userId) {
      return res.status(401).json({ message: 'Not authorized, invalid token payload' });
    }

    let userResult;
    if (role === 'ayush_college') {
      userResult = await pool.query(
        'SELECT id, college_name AS full_name, college_email AS email FROM ayush_colleges WHERE id = $1',
        [userId]
      );
    } else {
      userResult = await pool.query(
        'SELECT id, full_name, email, role FROM users WHERE id = $1',
        [userId]
      );
    }

    if (!userResult.rows.length) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = {
      id:     userResult.rows[0].id,
      userId: userResult.rows[0].id,
      email:  userResult.rows[0].email,
      role:   role || userResult.rows[0].role,
      name:   userResult.rows[0].full_name,
    };
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = { verifyToken, protect: verifyToken };
