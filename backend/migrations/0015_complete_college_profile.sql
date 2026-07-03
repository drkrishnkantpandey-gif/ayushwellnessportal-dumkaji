-- server/migrations/0015_complete_college_profile.sql
-- Migration to complete college profile and department management features

-- Extend ayush_colleges table with registration-time data
ALTER TABLE ayush_colleges ADD COLUMN IF NOT EXISTS aishe_code VARCHAR(50);
ALTER TABLE ayush_colleges ADD COLUMN IF NOT EXISTS university_affiliation VARCHAR(255);
ALTER TABLE ayush_colleges ADD COLUMN IF NOT EXISTS recognition_authority VARCHAR(255);
ALTER TABLE ayush_colleges ADD COLUMN IF NOT EXISTS year_established INTEGER;
ALTER TABLE ayush_colleges ADD COLUMN IF NOT EXISTS ownership_type VARCHAR(50);
ALTER TABLE ayush_colleges ADD COLUMN IF NOT EXISTS institution_category VARCHAR(50);

-- Extend college_departments table with HOD contact details
ALTER TABLE college_departments ADD COLUMN IF NOT EXISTS hod_email VARCHAR(255);
ALTER TABLE college_departments ADD COLUMN IF NOT EXISTS hod_phone VARCHAR(20);

-- Create audit_logs table for traceability
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  college_id INTEGER REFERENCES ayush_colleges(id),
  action VARCHAR(100) NOT NULL,
  section VARCHAR(100),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_college_id ON audit_logs(college_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Add comments for documentation
COMMENT ON COLUMN ayush_colleges.aishe_code IS 'All India Survey on Higher Education code';
COMMENT ON COLUMN ayush_colleges.university_affiliation IS 'Name of affiliated university';
COMMENT ON COLUMN ayush_colleges.recognition_authority IS 'Recognition authority (e.g., CCIM, CCH)';
COMMENT ON COLUMN ayush_colleges.year_established IS 'Year the college was established';
COMMENT ON COLUMN ayush_colleges.ownership_type IS 'Government, Private, or Deemed';
COMMENT ON COLUMN ayush_colleges.institution_category IS 'UG, PG, or Both';
COMMENT ON TABLE audit_logs IS 'Audit trail for college profile and department updates';
