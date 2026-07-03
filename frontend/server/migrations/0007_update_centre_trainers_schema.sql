-- server/migrations/0007_update_centre_trainers_schema.sql
-- Add missing columns to centre_courses and centre_trainers to match controller expectations

BEGIN;

-- Update centre_trainers to match controller fields
ALTER TABLE centre_trainers
  ADD COLUMN IF NOT EXISTS specialization TEXT,
  ADD COLUMN IF NOT EXISTS experience TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS certifications TEXT,
  ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS certification_url TEXT;

-- Rename existing columns to match controller if needed
ALTER TABLE centre_trainers RENAME COLUMN certification TO old_certification;
ALTER TABLE centre_trainers RENAME COLUMN experience_years TO old_experience_years;
ALTER TABLE centre_trainers RENAME COLUMN certification_files TO old_certification_files;
ALTER TABLE centre_trainers RENAME COLUMN active TO old_active;

COMMIT;
