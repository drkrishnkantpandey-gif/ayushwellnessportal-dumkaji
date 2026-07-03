-- server/migrations/0020_canonical_rebuild.sql
-- Canonical migration to ensure all dashboard tables exist and are correct.
-- This migration is idempotent and safe to run on existing data.

BEGIN;

-- 1. Ensure ayush_colleges has all profile fields
ALTER TABLE ayush_colleges 
ADD COLUMN IF NOT EXISTS aishe_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS university_affiliation VARCHAR(255),
ADD COLUMN IF NOT EXISTS recognition_authority VARCHAR(255),
ADD COLUMN IF NOT EXISTS year_established INTEGER,
ADD COLUMN IF NOT EXISTS ownership_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS institution_category VARCHAR(50),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS pincode VARCHAR(20),
ADD COLUMN IF NOT EXISTS website VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS principal_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS principal_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS principal_phone VARCHAR(20);

-- 2. NAAC Compliance Documents (NEW)
CREATE TABLE IF NOT EXISTS naac_compliance_documents (
    id SERIAL PRIMARY KEY,
    college_id INTEGER REFERENCES ayush_colleges(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Uploaded', -- 'Uploaded', 'Verified', 'Rejected'
    remarks TEXT,
    cycle INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. NAAC Tasks (NEW)
CREATE TABLE IF NOT EXISTS naac_tasks (
    id SERIAL PRIMARY KEY,
    college_id INTEGER REFERENCES ayush_colleges(id) ON DELETE CASCADE,
    task_name VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'In Progress', 'Completed'
    priority VARCHAR(20) DEFAULT 'Medium', -- 'High', 'Medium', 'Low'
    assigned_to VARCHAR(100), -- Could be a role or email
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Incentive Payments (NEW - detailed payment tracking)
-- Linking to college_incentives which acts as the application
CREATE TABLE IF NOT EXISTS incentive_payments (
    id SERIAL PRIMARY KEY,
    incentive_id INTEGER REFERENCES college_incentives(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    payment_date DATE,
    transaction_reference VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Processed', -- 'Processed', 'Failed', 'Pending'
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_naac_docs_college ON naac_compliance_documents(college_id);
CREATE INDEX IF NOT EXISTS idx_naac_tasks_college ON naac_tasks(college_id);
CREATE INDEX IF NOT EXISTS idx_inc_pay_incentive ON incentive_payments(incentive_id);

-- Comments
COMMENT ON TABLE naac_compliance_documents IS 'Uploaded documents for NAAC compliance verification';
COMMENT ON TABLE naac_tasks IS 'Tasks assigned to the college for NAAC preparation';
COMMENT ON TABLE incentive_payments IS 'Payment records for approved incentives';

COMMIT;
