-- server/migrations/0016_create_naac_application_table.sql
-- Creates the naac_application table as the single source of truth for NAAC accreditation workflow

CREATE TABLE IF NOT EXISTS naac_application (
    id SERIAL PRIMARY KEY,
    college_id INTEGER REFERENCES ayush_colleges(id) ON DELETE CASCADE UNIQUE,
    cycle INTEGER DEFAULT 1,
    applied_on TIMESTAMP WITH TIME ZONE,
    approved_on TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'Not Applied', 
    -- Status values: 'Not Applied', 'Applied', 'Approved', 'Expired'
    current_phase VARCHAR(50) DEFAULT 'IIQA',
    -- Phase values: 'IIQA', 'SSR', 'DVV', 'Peer Visit', 'Completed'
    academic_year VARCHAR(20),
    consent_declaration BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_naac_app_college_id ON naac_application(college_id);
CREATE INDEX IF NOT EXISTS idx_naac_app_status ON naac_application(status);
CREATE INDEX IF NOT EXISTS idx_naac_app_phase ON naac_application(current_phase);

-- Comment for documentation
COMMENT ON TABLE naac_application IS 'Single source of truth for NAAC accreditation application status and current phase';
COMMENT ON COLUMN naac_application.status IS 'Application status: Not Applied, Applied, Approved, Expired';
COMMENT ON COLUMN naac_application.current_phase IS 'Current accreditation phase: IIQA, SSR, DVV, Peer Visit, Completed';
