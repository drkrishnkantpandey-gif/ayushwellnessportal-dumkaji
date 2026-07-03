-- server/migrations/0028_create_ayush_hospital_application_status_table.sql

CREATE TABLE IF NOT EXISTS ayush_hospital_application_status (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER REFERENCES ayush_hospitals(id) ON DELETE CASCADE,
    application_type VARCHAR(255) DEFAULT 'NABH_ACCREDITATION_INCENTIVE',
    current_status VARCHAR(50) DEFAULT 'SUBMITTED', -- SUBMITTED, DISTRICT_VERIFIED, DIRECTORATE_APPROVED, REJECTED
    
    district_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, VERIFIED, REJECTED
    district_remarks TEXT,
    district_action_at TIMESTAMP WITH TIME ZONE,
    
    directorate_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    directorate_remarks TEXT,
    directorate_action_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
