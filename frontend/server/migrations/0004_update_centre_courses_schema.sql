-- server/migrations/0004_update_centre_courses_schema.sql
-- Align centre_courses schema with the current dashboard/backend expectations

BEGIN;

-- Rename "fees" -> "price" if the legacy column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'centre_courses' AND column_name = 'fees'
  ) THEN
    EXECUTE 'ALTER TABLE centre_courses RENAME COLUMN fees TO price';
  END IF;
END $$;

-- Rename "active" -> "is_active"
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'centre_courses' AND column_name = 'active'
  ) THEN
    EXECUTE 'ALTER TABLE centre_courses RENAME COLUMN active TO is_active';
  END IF;
END $$;

-- Rename "visible" -> "is_visible"
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'centre_courses' AND column_name = 'visible'
  ) THEN
    EXECUTE 'ALTER TABLE centre_courses RENAME COLUMN visible TO is_visible';
  END IF;
END $$;

-- Ensure duration is stored as integer (number of units)
ALTER TABLE centre_courses
  ALTER COLUMN duration TYPE INTEGER USING NULLIF(duration, '')::INTEGER;

-- Ensure price is numeric (after rename)
ALTER TABLE centre_courses
  ALTER COLUMN price TYPE NUMERIC USING NULLIF(price, '')::NUMERIC;

-- Add the new columns expected by the API/UI
ALTER TABLE centre_courses
  ADD COLUMN IF NOT EXISTS duration_type VARCHAR(50) DEFAULT 'weeks',
  ADD COLUMN IF NOT EXISTS max_students INTEGER;

-- Ensure the boolean flags default to TRUE (covers renamed columns)
ALTER TABLE centre_courses
  ALTER COLUMN is_active SET DEFAULT TRUE,
  ALTER COLUMN is_visible SET DEFAULT TRUE;

COMMIT;
