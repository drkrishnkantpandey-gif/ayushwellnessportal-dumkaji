-- server/migrations/0008_add_missing_trainer_columns.sql
-- Add missing columns to centre_trainers to match controller expectations

BEGIN;

-- Add missing columns without renaming existing ones
ALTER TABLE centre_trainers
  ADD COLUMN IF NOT EXISTS specialization TEXT,
  ADD COLUMN IF NOT EXISTS experience TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS certifications TEXT,
  ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS certification_url TEXT;

COMMIT;
