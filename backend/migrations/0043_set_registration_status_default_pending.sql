-- Migration: Set registration_status default value to 'pending'
BEGIN;

ALTER TABLE users ALTER COLUMN registration_status SET DEFAULT 'pending';

COMMIT;
