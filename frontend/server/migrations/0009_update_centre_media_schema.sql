-- Migration: Update centre_media table schema to match controller expectations
-- Add missing columns and rename file_url to media_url

BEGIN;

-- Add missing columns
ALTER TABLE centre_media ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE centre_media ADD COLUMN IF NOT EXISTS file_type VARCHAR(50);

-- Rename file_url to media_url to match controller
ALTER TABLE centre_media RENAME COLUMN file_url TO media_url;

COMMIT;
