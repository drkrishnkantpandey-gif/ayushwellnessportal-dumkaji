-- Migration: Add registration_status to users table
BEGIN;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS registration_status VARCHAR(50) DEFAULT 'approved';

COMMIT;
