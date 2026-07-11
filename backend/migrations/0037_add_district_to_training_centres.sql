-- Migration: Add district field to training_centres
BEGIN;

ALTER TABLE training_centres
ADD COLUMN IF NOT EXISTS district VARCHAR(100);

COMMIT;
