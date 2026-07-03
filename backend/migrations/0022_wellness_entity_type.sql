-- Migration: Add entity_type and services columns to wellness_centres
-- Three entity types: WELLNESS_CENTRE, WELLNESS_CENTRE_HOSPITAL, WELLNESS_RESORT
-- Services: PANCHKARMA, YOGA, NATUROPATHY (stored as text array)

BEGIN;

ALTER TABLE wellness_centres
  ADD COLUMN IF NOT EXISTS entity_type VARCHAR(50) DEFAULT 'WELLNESS_CENTRE',
  ADD COLUMN IF NOT EXISTS services    TEXT[]      DEFAULT '{}';

-- Back-fill existing rows: map old centre_type to entity_type
UPDATE wellness_centres
SET entity_type = 'WELLNESS_CENTRE'
WHERE entity_type IS NULL OR entity_type = '';

-- Add check constraint for valid entity types
ALTER TABLE wellness_centres
  DROP CONSTRAINT IF EXISTS chk_entity_type;

ALTER TABLE wellness_centres
  ADD CONSTRAINT chk_entity_type
  CHECK (entity_type IN ('WELLNESS_CENTRE', 'WELLNESS_CENTRE_HOSPITAL', 'WELLNESS_RESORT'));

COMMIT;
