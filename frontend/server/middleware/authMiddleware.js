const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const verifyToken = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

      // Attach user info from token payload directly to req.user
      // This saves a DB call if we trust the simplified JWT logic, 
      // but to be safe and consistent with previous logic, we can verify existence.
      // However, for performance and since authController handles the login, 
      // strict existence check is good.

      const role = decoded.role;
      const userId = decoded.userId || decoded.id; // Handle both cases just in case

      if (!userId) {
        return res.status(401).json({ message: 'Not authorized, invalid token payload' });
      }

      let userResult;
      if (role === 'ayush_college') {
        // ayush_colleges usually doesn't have a role column, it's implied by the table
        userResult = await pool.query('SELECT id, college_name, college_email as email FROM ayush_colleges WHERE id = $1', [userId]);
      } else {
        userResult = await pool.query('SELECT id, full_name, email, role FROM users WHERE id = $1', [userId]);
      }

      if (userResult.rows.length > 0) {
        req.user = {
          id: userResult.rows[0].id,
          userId: userResult.rows[0].id,
          email: userResult.rows[0].email,
          role: role || userResult.rows[0].role, // Use role from token for colleges
          name: userResult.rows[0].full_name || userResult.rows[0].college_name
        };
        next();
      } else {
        console.log('User not found in DB:', userId, role);
        res.status(401).json({ message: 'Not authorized, user not found' });
      }
    } catch (error) {
      console.error('Error in authentication middleware:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { verifyToken, protect: verifyToken };