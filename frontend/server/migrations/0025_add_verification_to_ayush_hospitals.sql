-- server/migrations/0025_add_verification_to_ayush_hospitals.sql

ALTER TABLE ayush_hospitals
ADD COLUMN IF NOT EXISTS district_verification_status VARCHAR(50) DEFAULT 'Pending',
ADD COLUMN IF NOT EXISTS directorate_verification_status VARCHAR(50) DEFAULT 'Pending',
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;
