-- server/migrations/0019_add_yoga_pro_cols.sql
-- Add missing columns to yoga_professional_profile table to match registerController.js

BEGIN;

ALTER TABLE yoga_professional_profile
ADD COLUMN IF NOT EXISTS profile_photo TEXT,
ADD COLUMN IF NOT EXISTS certificate_paths TEXT[];

COMMIT;
