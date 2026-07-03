-- server/migrations/0021_wellness_centre_v2.sql

BEGIN;

-- Update wellness_programs table
ALTER TABLE wellness_programs 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS duration VARCHAR(100),
ADD COLUMN IF NOT EXISTS fees NUMERIC(15, 2);

-- Create wellness_staff table (more generic than therapists)
CREATE TABLE IF NOT EXISTS wellness_staff (
    id SERIAL PRIMARY KEY,
    centre_id INTEGER NOT NULL REFERENCES wellness_centres(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL, -- therapist / staff
    qualification VARCHAR(255),
    experience VARCHAR(100),
    contact_info VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create wellness_sessions table
CREATE TABLE IF NOT EXISTS wellness_sessions (
    id SERIAL PRIMARY KEY,
    centre_id INTEGER NOT NULL REFERENCES wellness_centres(id) ON DELETE CASCADE,
    program_id INTEGER NOT NULL REFERENCES wellness_programs(id) ON DELETE CASCADE,
    staff_id INTEGER NOT NULL REFERENCES wellness_staff(id) ON DELETE CASCADE,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    participants_count INTEGER DEFAULT 0,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
