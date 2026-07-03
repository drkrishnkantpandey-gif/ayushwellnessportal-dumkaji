// server.js or app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const registerRoutes = require('./routes/registerRoutes');
const trainingCentreRoutes = require('./routes/trainingCentreRoutes');
const yogaProfessionalRoutes = require('./routes/yogaProfessionalRoutes');
const wellnessCentreRoutes = require('./routes/wellnessCentreRoutes');
const ayushHospitalRoutes = require('./routes/ayushHospitalRoutes');


const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/register', registerRoutes);
app.use('/api/training-centre', trainingCentreRoutes);
app.use('/api/yoga-professional', yogaProfessionalRoutes);
app.use('/api/wellness', wellnessCentreRoutes);
app.use('/api/ayush-hospital', ayushHospitalRoutes);

app.use('/api/dashboard', require('./routes/dashboardRoutes'));


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Test database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Successfully connected to the database');
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;