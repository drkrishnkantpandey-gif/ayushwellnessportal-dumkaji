-- server/migrations/0003_yoga_training_centre_extensions.sql

BEGIN;

-- Extend training_centres with owner/contact/profile media fields
ALTER TABLE training_centres
  ADD COLUMN IF NOT EXISTS owner_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS owner_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS owner_phone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- Trainers table
CREATE TABLE IF NOT EXISTS centre_trainers (
  id SERIAL PRIMARY KEY,
  training_centre_id INTEGER NOT NULL REFERENCES training_centres(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  certification VARCHAR(255),
  other_certification VARCHAR(255),
  experience_years INTEGER,
  photo_url TEXT,
  certification_files TEXT[],
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_centre_trainers_centre_id ON centre_trainers(training_centre_id);
CREATE INDEX IF NOT EXISTS idx_centre_trainers_active ON centre_trainers(active);

-- Courses table
CREATE TABLE IF NOT EXISTS centre_courses (
  id SERIAL PRIMARY KEY,
  training_centre_id INTEGER NOT NULL REFERENCES training_centres(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration VARCHAR(100),
  batch_timing VARCHAR(100),
  fees VARCHAR(100),
  level VARCHAR(50),
  active BOOLEAN DEFAULT TRUE,
  visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_centre_courses_centre_id ON centre_courses(training_centre_id);
CREATE INDEX IF NOT EXISTS idx_centre_courses_active ON centre_courses(training_centre_id, active);

-- Infrastructure media table
CREATE TABLE IF NOT EXISTS centre_media (
  id SERIAL PRIMARY KEY,
  training_centre_id INTEGER NOT NULL REFERENCES training_centres(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_centre_media_centre_id ON centre_media(training_centre_id);
CREATE INDEX IF NOT EXISTS idx_centre_media_category ON centre_media(category);

COMMIT;
