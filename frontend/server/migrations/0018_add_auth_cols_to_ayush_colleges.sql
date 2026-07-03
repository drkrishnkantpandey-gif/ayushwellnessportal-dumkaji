-- server/migrations/0018_add_auth_cols_to_ayush_colleges.sql
-- Add missing columns required by authController and authMiddleware

BEGIN;

ALTER TABLE ayush_colleges
ADD COLUMN IF NOT EXISTS college_email VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

COMMIT;
