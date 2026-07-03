CREATE TABLE IF NOT EXISTS ayush_colleges (
    id SERIAL PRIMARY KEY,
    college_name VARCHAR(255) NOT NULL,
    college_email VARCHAR(255) UNIQUE NOT NULL,
    college_phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),  -- Alias often used
    contact_phone VARCHAR(50),
    
    state VARCHAR(100),
    district VARCHAR(100),
    address TEXT,
    pincode VARCHAR(20),
    block_tehsil VARCHAR(100),
    
    college_type VARCHAR(100),
    university_affiliation VARCHAR(255),
    college_code VARCHAR(50),
    establishment_year INTEGER,
    website_url VARCHAR(255),
    
    principal_name VARCHAR(255),
    principal_email VARCHAR(255),
    principal_phone VARCHAR(50),
    
    naac_status VARCHAR(50),
    naac_grade VARCHAR(20),
    cgpa DECIMAL(4, 2),
    naac_valid_upto DATE,
    naac_cycle VARCHAR(50),
    
    university_reg_number VARCHAR(100),
    aishe_code VARCHAR(50),
    mis_id VARCHAR(50),
    
    -- Extra fields from canonical migration
    recognition_authority VARCHAR(255),
    ownership_type VARCHAR(50),
    institution_category VARCHAR(50),
    city VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure index on email
CREATE INDEX IF NOT EXISTS idx_ayush_colleges_email ON ayush_colleges(college_email);
