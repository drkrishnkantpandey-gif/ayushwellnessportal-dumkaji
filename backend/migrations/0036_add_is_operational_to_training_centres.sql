-- Migration: Add is_operational field to training_centres
BEGIN;

ALTER TABLE training_centres
ADD COLUMN IF NOT EXISTS is_operational BOOLEAN DEFAULT false;

COMMIT;
