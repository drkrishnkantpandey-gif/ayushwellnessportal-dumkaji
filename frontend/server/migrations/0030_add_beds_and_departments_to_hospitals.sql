-- server/migrations/0030_add_beds_and_departments_to_hospitals.sql

ALTER TABLE ayush_hospitals 
ADD COLUMN IF NOT EXISTS total_beds INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS departments JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS bed_occupancy_rate FLOAT DEFAULT 0;

-- Optional: Initialize some default departments for existing rows
UPDATE ayush_hospitals 
SET departments = '["Emergency", "General Medicine", "Pediatrics", "Pharmacy"]'::jsonb
WHERE departments IS NULL OR departments = '[]'::jsonb;
