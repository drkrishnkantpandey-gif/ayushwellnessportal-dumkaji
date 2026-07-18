-- 0050: Update wellness_centres table structure for new Registration of Existing Centre form

BEGIN;

-- Drop old check constraint if it exists to allow new entity types
ALTER TABLE wellness_centres DROP CONSTRAINT IF EXISTS chk_entity_type;

-- Add new columns
ALTER TABLE wellness_centres
  ADD COLUMN IF NOT EXISTS applicant_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS designation VARCHAR(255),
  ADD COLUMN IF NOT EXISTS entity_certificate VARCHAR(255),
  ADD COLUMN IF NOT EXISTS id_proof_file VARCHAR(255);

-- Modify entity_type length if needed
ALTER TABLE wellness_centres ALTER COLUMN entity_type TYPE VARCHAR(255);

COMMIT;
