-- server/migrations/restore_ayush_colleges.sql

CREATE TABLE IF NOT EXISTS ayush_colleges (
    id SERIAL PRIMARY KEY,
    college_name VARCHAR(255) NOT NULL,
    college_email VARCHAR(255) UNIQUE NOT NULL,
    college_phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    
    -- Basic Info
    college_type VARCHAR(100),
    affiliation VARCHAR(255),
    college_code VARCHAR(100),
    establishment_year INTEGER,
    website VARCHAR(255),
    
    -- Address
    state VARCHAR(100) DEFAULT 'Uttarakhand',
    district VARCHAR(100),
    block VARCHAR(100),
    address TEXT,
    pincode VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Principal
    principal_name VARCHAR(255),
    principal_designation VARCHAR(100),
    principal_email VARCHAR(255),
    principal_phone VARCHAR(50),
    
    -- University Codes
    university_registration_number VARCHAR(100),
    aishe_code VARCHAR(100),
    mis_id VARCHAR(100),
    
    -- Meta
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for login
CREATE INDEX IF NOT EXISTS idx_ayush_colleges_email ON ayush_colleges(college_email);
