-- server/migrations/0020_add_specialization_to_yoga_pro.sql
-- Add missing specialization column to yoga_professional_profile

BEGIN;

ALTER TABLE yoga_professional_profile
ADD COLUMN IF NOT EXISTS specialization TEXT;

COMMIT;
