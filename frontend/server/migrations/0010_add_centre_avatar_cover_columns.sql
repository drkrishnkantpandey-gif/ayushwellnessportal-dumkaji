-- Migration: Add avatar_url and cover_url columns to training_centres table
BEGIN;

ALTER TABLE training_centres ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE training_centres ADD COLUMN IF NOT EXISTS cover_url TEXT;

COMMIT;
