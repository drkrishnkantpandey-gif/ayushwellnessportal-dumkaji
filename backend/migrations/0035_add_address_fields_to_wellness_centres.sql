-- Migration: Add address and district fields to wellness_centres
BEGIN;

ALTER TABLE wellness_centres
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS district VARCHAR(100),
ADD COLUMN IF NOT EXISTS pincode VARCHAR(20);

COMMIT;
