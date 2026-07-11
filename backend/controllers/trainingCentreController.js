// server/controllers/trainingCentreController.js
const db = require('../db');
const asyncHandler = require('express-async-handler');

// @desc    Get training center profile
// @route   GET /api/training-centre/profile
// @access  Private
// @desc    Get training center profile
// @route   GET /api/training-centre/profile
// @access  Private
const getTrainingCentre = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const trainingCentre = await db.query(
    `SELECT 
      tc.*,
      COALESCE(tc.owner_name, u.full_name) as owner_name,
      COALESCE(tc.owner_email, u.email) as owner_email,
      COALESCE(tc.owner_phone, u.phone) as owner_phone
    FROM training_centres tc
    JOIN users u ON tc.user_id = u.id
    WHERE tc.user_id = $1`,
    [userId]
  );

  if (trainingCentre.rows.length === 0) {
    res.status(404);
    throw new Error('Training center not found');
  }

  res.status(200).json({
    success: true,
    data: trainingCentre.rows[0]
  });
});

// @desc    Update training center profile (supports multipart for avatar/cover)
// @route   PUT /api/training-centre/profile
// @access  Private
const updateTrainingCentre = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    centre_name,
    institution_type,
    address,
    city,
    state,
    district,
    pincode,
    description,
    facilities,
    courses_offered,
    owner_name,
    owner_email,
    owner_phone,
    latitude,
    longitude
  } = req.body;

  const avatarFile = req.files?.avatar?.[0];
  const coverFile = req.files?.cover?.[0];

  console.log('avatarFile:', avatarFile);
  console.log('coverFile:', coverFile);
  console.log('req.files:', req.files);

  // Build dynamic update fields
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (centre_name !== undefined) { fields.push(`centre_name = $${paramIndex++}`); values.push(centre_name); }
  if (institution_type !== undefined) { fields.push(`institution_type = $${paramIndex++}`); values.push(institution_type); }
  if (address !== undefined) { fields.push(`address = $${paramIndex++}`); values.push(address); }
  if (city !== undefined) { fields.push(`city = $${paramIndex++}`); values.push(city); }
  if (state !== undefined) { fields.push(`state = $${paramIndex++}`); values.push(state); }
  if (district !== undefined) { fields.push(`district = $${paramIndex++}`); values.push(district); }
  if (pincode !== undefined) { fields.push(`pincode = $${paramIndex++}`); values.push(pincode); }
  if (description !== undefined) { fields.push(`description = $${paramIndex++}`); values.push(description); }
  if (facilities !== undefined) { fields.push(`facilities = $${paramIndex++}`); values.push(facilities); }
  if (courses_offered !== undefined) { fields.push(`courses_offered = $${paramIndex++}`); values.push(courses_offered); }
  if (owner_name !== undefined) { fields.push(`owner_name = $${paramIndex++}`); values.push(owner_name); }
  if (owner_email !== undefined) { fields.push(`owner_email = $${paramIndex++}`); values.push(owner_email); }
  if (owner_phone !== undefined) { fields.push(`owner_phone = $${paramIndex++}`); values.push(owner_phone); }
  if (latitude !== undefined) { fields.push(`latitude = $${paramIndex++}`); values.push(latitude); }
  if (longitude !== undefined) { fields.push(`longitude = $${paramIndex++}`); values.push(longitude); }
  if (avatarFile) { fields.push(`avatar_url = $${paramIndex++}`); values.push(`/uploads/${avatarFile.filename}`); }
  if (coverFile) { fields.push(`cover_url = $${paramIndex++}`); values.push(`/uploads/${coverFile.filename}`); }

  fields.push(`updated_at = NOW()`);
  values.push(userId);

  const query = `
    UPDATE training_centres 
    SET ${fields.join(', ')}
    WHERE user_id = $${paramIndex}
    RETURNING *
  `;

  const updatedCentre = await db.query(query, values);

  if (updatedCentre.rows.length === 0) {
    res.status(404);
    throw new Error('Training center not found');
  }

  res.status(200).json({
    success: true,
    data: updatedCentre.rows[0]
  });
});

// @desc    Get training center statistics
// @route   GET /api/training-centre/stats
// @access  Private
const getTrainingCentreStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Resolve the training_centre.id for this user
  const centreResult = await db.query(
    'SELECT id FROM training_centres WHERE user_id = $1',
    [userId]
  );
  if (centreResult.rows.length === 0) {
    res.status(404);
    throw new Error('Training centre not found for this user');
  }
  const trainingCentreId = centreResult.rows[0].id;

  const safeCountQuery = async (query, params, label) => {
    try {
      const result = await db.query(query, params);
      return parseInt(result.rows[0]?.count, 10) || 0;
    } catch (error) {
      if (error.code === '42P01') {
        console.warn(`Skipping ${label} stats because table is missing`);
        return 0;
      }
      throw error;
    }
  };

  const trainers = await safeCountQuery(
    'SELECT COUNT(*) AS count FROM centre_trainers WHERE training_centre_id = $1',
    [trainingCentreId],
    'trainers'
  );

  const courses = await safeCountQuery(
    'SELECT COUNT(*) AS count FROM centre_courses WHERE training_centre_id = $1',
    [trainingCentreId],
    'courses'
  );

  const students = await safeCountQuery(
    `SELECT COUNT(DISTINCT student_id) AS count
     FROM course_enrollments 
     WHERE course_id IN (
       SELECT id FROM centre_courses WHERE training_centre_id = $1
     )`,
    [trainingCentreId],
    'course_enrollments'
  );

  res.status(200).json({
    success: true,
    data: { trainers, courses, students }
  });
});

// @desc    Get all trainers for a training centre
// @route   GET /api/training-centre/trainers
// @access  Private
const getTrainers = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Resolve the training_centre.id for this user
  const centreResult = await db.query(
    'SELECT id FROM training_centres WHERE user_id = $1',
    [userId]
  );
  if (centreResult.rows.length === 0) {
    res.status(404);
    throw new Error('Training centre not found for this user');
  }
  const trainingCentreId = centreResult.rows[0].id;

  const trainers = await db.query(
    `SELECT * FROM centre_trainers 
     WHERE training_centre_id = $1 
     ORDER BY created_at DESC`,
    [trainingCentreId]
  );

  res.status(200).json({
    success: true,
    data: trainers.rows
  });
});

// @desc    Add a new trainer
// @route   POST /api/training-centre/trainers
// @access  Private
const addTrainer = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    name,
    specialization,
    experience,
    bio,
    certifications,
    phone,
    email,
    is_active
  } = req.body;

  // Resolve the training_centre.id for this user
  const centreResult = await db.query(
    'SELECT id FROM training_centres WHERE user_id = $1',
    [userId]
  );
  if (centreResult.rows.length === 0) {
    res.status(404);
    throw new Error('Training centre not found for this user');
  }
  const trainingCentreId = centreResult.rows[0].id;

  const photoFile = req.files?.photo?.[0];
  const certFile = req.files?.certification?.[0];

  const trainer = await db.query(
    `INSERT INTO centre_trainers 
     (training_centre_id, name, specialization, experience, bio, certifications, 
      phone, email, photo_url, certification_url, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      trainingCentreId,
      name,
      specialization,
      experience,
      bio,
      certifications,
      phone,
      email,
      photoFile ? `/uploads/${photoFile.filename}` : null,
      certFile ? `/uploads/${certFile.filename}` : null,
      is_active !== undefined ? is_active : true
    ]
  );

  res.status(201).json({
    success: true,
    data: trainer.rows[0]
  });
});

// @desc    Update a trainer
// @route   PUT /api/training-centre/trainers/:id
// @access  Private
const updateTrainer = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const trainerId = req.params.id;
  const {
    name,
    specialization,
    experience,
    bio,
    certifications,
    phone,
    email,
    is_active
  } = req.body;

  // Resolve the training_centre.id for this user
  const centreResult = await db.query(
    'SELECT id FROM training_centres WHERE user_id = $1',
    [userId]
  );
  if (centreResult.rows.length === 0) {
    res.status(404);
    throw new Error('Training centre not found for this user');
  }
  const trainingCentreId = centreResult.rows[0].id;

  const photoFile = req.files?.photo?.[0];
  const certFile = req.files?.certification?.[0];

  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (name !== undefined) { fields.push(`name = $${paramIndex++}`); values.push(name); }
  if (specialization !== undefined) { fields.push(`specialization = $${paramIndex++}`); values.push(specialization); }
  if (experience !== undefined) { fields.push(`experience = $${paramIndex++}`); values.push(experience); }
  if (bio !== undefined) { fields.push(`bio = $${paramIndex++}`); values.push(bio); }
  if (certifications !== undefined) { fields.push(`certifications = $${paramIndex++}`); values.push(certifications); }
  if (phone !== undefined) { fields.push(`phone = $${paramIndex++}`); values.push(phone); }
  if (email !== undefined) { fields.push(`email = $${paramIndex++}`); values.push(email); }
  if (is_active !== undefined) { fields.push(`is_active = $${paramIndex++}`); values.push(is_active); }
  if (photoFile) { fields.push(`photo_url = $${paramIndex++}`); values.push(`/uploads/${photoFile.filename}`); }
  if (certFile) { fields.push(`certification_url = $${paramIndex++}`); values.push(`/uploads/${certFile.filename}`); }

  fields.push(`updated_at = NOW()`);
  values.push(trainerId, trainingCentreId);

  const query = `
    UPDATE centre_trainers 
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex++} AND training_centre_id = $${paramIndex++}
    RETURNING *
  `;

  const trainer = await db.query(query, values);

  if (trainer.rows.length === 0) {
    res.status(404);
    throw new Error('Trainer not found');
  }

  res.status(200).json({
    success: true,
    data: trainer.rows[0]
  });
});

// @desc    Delete a trainer
// @route   DELETE /api/training-centre/trainers/:id
// @access  Private
const deleteTrainer = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const trainerId = req.params.id;

  // Resolve the training_centre.id for this user
  const centreResult = await db.query(
    'SELECT id FROM training_centres WHERE user_id = $1',
    [userId]
  );
  if (centreResult.rows.length === 0) {
    res.status(404);
    throw new Error('Training centre not found for this user');
  }
  const trainingCentreId = centreResult.rows[0].id;

  const trainer = await db.query(
    'DELETE FROM centre_trainers WHERE id = $1 AND training_centre_id = $2 RETURNING *',
    [trainerId, trainingCentreId]
  );

  if (trainer.rows.length === 0) {
    res.status(404);
    throw new Error('Trainer not found');
  }

  res.status(200).json({
    success: true,
    message: 'Trainer deleted successfully'
  });
});

// @desc    Get all courses for a training centre
// @route   GET /api/training-centre/courses
// @access  Private
const getCourses = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Resolve the training_centre.id for this user
  const centreResult = await db.query(
    'SELECT id FROM training_centres WHERE user_id = $1',
    [userId]
  );
  if (centreResult.rows.length === 0) {
    res.status(404);
    throw new Error('Training centre not found for this user');
  }
  const trainingCentreId = centreResult.rows[0].id;

  const courses = await db.query(
    `SELECT * FROM centre_courses 
     WHERE training_centre_id = $1 
     ORDER BY created_at DESC`,
    [trainingCentreId]
  );

  res.status(200).json({
    success: true,
    data: courses.rows
  });
});

// @desc    Add a new course
// @route   POST /api/training-centre/courses
// @access  Private
const addCourse = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    name,
    description,
    duration,
    duration_type,
    price,
    level,
    max_students,
    is_active,
    is_visible
  } = req.body;

  // Resolve the training_centre.id for this user
  const centreResult = await db.query(
    'SELECT id FROM training_centres WHERE user_id = $1',
    [userId]
  );
  if (centreResult.rows.length === 0) {
    res.status(404);
    throw new Error('Training centre not found for this user');
  }
  const trainingCentreId = centreResult.rows[0].id;

  const course = await db.query(
    `INSERT INTO centre_courses 
     (training_centre_id, name, description, duration, duration_type, price, 
      level, max_students, is_active, is_visible)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [trainingCentreId, name, description, duration, duration_type, price, level, max_students, is_active, is_visible]
  );

  res.status(201).json({
    success: true,
    data: course.rows[0]
  });
});

// @desc    Update a course
// @route   PUT /api/training-centre/courses/:id
// @access  Private
const updateCourse = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const courseId = req.params.id;
  const {
    name,
    description,
    duration,
    duration_type,
    price,
    level,
    max_students,
    is_active,
    is_visible
  } = req.body;

  // Resolve the training_centre.id for this user
  const centreResult = await db.query(
    'SELECT id FROM training_centres WHERE user_id = $1',
    [userId]
  );
  if (centreResult.rows.length === 0) {
    res.status(404);
    throw new Error('Training centre not found for this user');
  }
  const trainingCentreId = centreResult.rows[0].id;

  const course = await db.query(
    `UPDATE centre_courses 
     SET name = $1, description = $2, duration = $3, duration_type = $4, 
         price = $5, level = $6, max_students = $7, is_active = $8, 
         is_visible = $9, updated_at = NOW()
     WHERE id = $10 AND training_centre_id = $11
     RETURNING *`,
    [name, description, duration, duration_type, price, level, max_students, is_active, is_visible, courseId, trainingCentreId]
  );

  if (course.rows.length === 0) {
    res.status(404);
    throw new Error('Course not found');
  }

  res.status(200).json({
    success: true,
    data: course.rows[0]
  });
});

// @desc    Delete a course
// @route   DELETE /api/training-centre/courses/:id
// @access  Private
const deleteCourse = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const courseId = req.params.id;

  // Resolve the training_centre.id for this user
  const centreResult = await db.query(
    'SELECT id FROM training_centres WHERE user_id = $1',
    [userId]
  );
  if (centreResult.rows.length === 0) {
    res.status(404);
    throw new Error('Training centre not found for this user');
  }
  const trainingCentreId = centreResult.rows[0].id;

  const course = await db.query(
    'DELETE FROM centre_courses WHERE id = $1 AND training_centre_id = $2 RETURNING *',
    [courseId, trainingCentreId]
  );

  if (course.rows.length === 0) {
    res.status(404);
    throw new Error('Course not found');
  }

  res.status(200).json({
    success: true,
    message: 'Course deleted successfully'
  });
});

// @desc    Get all infrastructure media for a training centre
// @route   GET /api/training-centre/infrastructure
// @access  Private
const getInfrastructure = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { category } = req.query;

  // Resolve the training_centre.id for this user
  const centreResult = await db.query(
    'SELECT id FROM training_centres WHERE user_id = $1',
    [userId]
  );
  if (centreResult.rows.length === 0) {
    res.status(404);
    throw new Error('Training centre not found for this user');
  }
  const trainingCentreId = centreResult.rows[0].id;

  let query = 'SELECT * FROM centre_media WHERE training_centre_id = $1';
  const params = [trainingCentreId];

  if (category) {
    query += ' AND category = $2 ORDER BY created_at DESC';
    params.push(category);
  } else {
    query += ' ORDER BY created_at DESC';
  }

  const media = await db.query(query, params);

  res.status(200).json({
    success: true,
    data: media.rows
  });
});

// @desc    Add infrastructure media
// @route   POST /api/training-centre/infrastructure
// @access  Private
const addInfrastructure = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { category, description } = req.body;
  const mediaFiles = req.files?.media || [];

  // Resolve the training_centre.id for this user
  const centreResult = await db.query(
    'SELECT id FROM training_centres WHERE user_id = $1',
    [userId]
  );
  if (centreResult.rows.length === 0) {
    res.status(404);
    throw new Error('Training centre not found for this user');
  }
  const trainingCentreId = centreResult.rows[0].id;

  if (mediaFiles.length === 0) {
    res.status(400);
    throw new Error('No media files provided');
  }

  const insertedMedia = [];

  for (const file of mediaFiles) {
    const media = await db.query(
      `INSERT INTO centre_media 
       (training_centre_id, category, media_url, description, file_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [trainingCentreId, category, `/uploads/${file.filename}`, description, file.mimetype.split('/')[0]]
    );
    insertedMedia.push(media.rows[0]);
  }

  res.status(201).json({
    success: true,
    data: insertedMedia
  });
});

// @desc    Delete infrastructure media
// @route   DELETE /api/training-centre/infrastructure/:id
// @access  Private
const deleteInfrastructure = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const mediaId = req.params.id;

  // Resolve the training_centre.id for this user
  const centreResult = await db.query(
    'SELECT id FROM training_centres WHERE user_id = $1',
    [userId]
  );
  if (centreResult.rows.length === 0) {
    res.status(404);
    throw new Error('Training centre not found for this user');
  }
  const trainingCentreId = centreResult.rows[0].id;

  const media = await db.query(
    'DELETE FROM centre_media WHERE id = $1 AND training_centre_id = $2 RETURNING *',
    [mediaId, trainingCentreId]
  );

  if (media.rows.length === 0) {
    res.status(404);
    throw new Error('Media not found');
  }

  res.status(200).json({
    success: true,
    message: 'Media deleted successfully'
  });
});

// @desc    Get training centre analytics (views, enquiries)
// @route   GET /api/training-centre/analytics
// @access  Private
const getAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Resolve the training_centre.id for this user
  const centreResult = await db.query(
    'SELECT id FROM training_centres WHERE user_id = $1',
    [userId]
  );
  if (centreResult.rows.length === 0) {
    res.status(404);
    throw new Error('Training centre not found for this user');
  }
  const trainingCentreId = centreResult.rows[0].id;

  // Check if we have any data
  const checkQuery = `SELECT * FROM centre_analytics WHERE training_centre_id = $1 ORDER BY month_date ASC`;
  let result = await db.query(checkQuery, [trainingCentreId]);

  // Seed data if empty (DEMO/INITIALIZATION PURPOSE)
  if (result.rows.length === 0) {
    const months = ['2025-01-01', '2025-02-01', '2025-03-01', '2025-04-01', '2025-05-01']; // Using user's dummy months roughly
    const dummyData = [
      { profile: 120, map: 80, enquiries: 20 },
      { profile: 150, map: 100, enquiries: 30 },
      { profile: 200, map: 130, enquiries: 40 },
      { profile: 170, map: 110, enquiries: 35 },
      { profile: 220, map: 150, enquiries: 50 },
    ];

    for (let i = 0; i < months.length; i++) {
      await db.query(
        `INSERT INTO centre_analytics (training_centre_id, month_date, profile_views, map_views, enquiries)
             VALUES ($1, $2, $3, $4, $5)`,
        [trainingCentreId, months[i], dummyData[i].profile, dummyData[i].map, dummyData[i].enquiries]
      );
    }
    // Re-fetch
    result = await db.query(checkQuery, [trainingCentreId]);
  }

  // Format data for frontend
  const data = result.rows.map(row => ({
    month: new Date(row.month_date).toLocaleString('default', { month: 'short' }),
    profileViews: row.profile_views,
    mapViews: row.map_views,
    enquiries: row.enquiries
  }));

  res.status(200).json({
    success: true,
    data
  });
});

module.exports = {
  getTrainingCentre,
  updateTrainingCentre,
  getTrainingCentreStats,
  getTrainers,
  addTrainer,
  updateTrainer,
  deleteTrainer,
  getCourses,
  addCourse,
  updateCourse,
  deleteCourse,
  getInfrastructure,
  addInfrastructure,
  deleteInfrastructure,
  getAnalytics
};