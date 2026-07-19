-- 0051: Create wellness_centre_registrations table for center registration workflow

BEGIN;

CREATE TABLE IF NOT EXISTS wellness_centre_registrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Section 1: General Info
    already_registered VARCHAR(10) DEFAULT 'No',
    prev_reg_reason VARCHAR(50),
    prev_reg_number VARCHAR(100),
    prev_reg_certificate TEXT,
    
    centre_name VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    latitude VARCHAR(100),
    longitude VARCHAR(100),
    map_link TEXT,
    owner_name VARCHAR(255),
    phone VARCHAR(50),
    is_residential VARCHAR(10) DEFAULT 'No',
    offers_clinical VARCHAR(10) DEFAULT 'No',
    category VARCHAR(100) NOT NULL,
    services_offered TEXT[],
    
    -- Section 2: Clinical Info
    doctor_appointed VARCHAR(10) DEFAULT 'No',
    doctor_name VARCHAR(255),
    doctor_qualification VARCHAR(255),
    doctor_qualification_doc TEXT,
    doctor_bcp_reg_number VARCHAR(100),
    doctor_bcp_reg_doc TEXT,
    declaration_a BOOLEAN DEFAULT FALSE,
    declaration_b BOOLEAN DEFAULT FALSE,
    cea_reg_number VARCHAR(100),
    cea_valid_till DATE,
    cea_reg_doc TEXT,
    cea_registered VARCHAR(10) DEFAULT 'No',
    
    -- Section 3: Details of Infrastructure
    rooms_count INTEGER,
    therapy_beds_count INTEGER,
    covered_area VARCHAR(100),
    equipment_details TEXT,
    
    -- Section 4: Details of Additional Staff
    pharmacist_name VARCHAR(255),
    pharmacist_reg_number VARCHAR(100),
    pharmacist_bcp_doc TEXT,
    male_therapists_count INTEGER,
    female_therapists_count INTEGER,
    
    registration_status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
