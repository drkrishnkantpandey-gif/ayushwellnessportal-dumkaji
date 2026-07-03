-- server/migrations/0014_create_missing_tables.sql

BEGIN;

-- Wellness Centres Table
CREATE TABLE IF NOT EXISTS wellness_centres (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    registration_status VARCHAR(50) DEFAULT 'UNDER_REVIEW',
    accreditation_level VARCHAR(50),
    star_rating INTEGER,
    tourism_listing_status VARCHAR(50) DEFAULT 'NOT_LISTED',
    tourism_listing_url TEXT,
    registration_valid_to DATE,
    centre_type VARCHAR(100),
    ownership_type VARCHAR(100),
    registration_number VARCHAR(100),
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Centre Documents Table
CREATE TABLE IF NOT EXISTS centre_documents (
    id SERIAL PRIMARY KEY,
    centre_id INTEGER NOT NULL, -- Note: This might refer to training_centres or wellness_centres. 
                                -- Usually, it's better to have separate tables or a generic relation.
                                -- Based on registerController.js, it's used for wellness_centres.
    doc_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'UPLOADED',
    remarks TEXT,
    file_path TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Yoga Professional Profile Table
CREATE TABLE IF NOT EXISTS yoga_professional_profile (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dob DATE,
    gender VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    experience_years INTEGER DEFAULT 0,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Wellness Programs Table
CREATE TABLE IF NOT EXISTS wellness_programs (
    id SERIAL PRIMARY KEY,
    centre_id INTEGER NOT NULL REFERENCES wellness_centres(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    participants_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    next_session_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Incentive Applications Table
CREATE TABLE IF NOT EXISTS incentive_applications (
    id SERIAL PRIMARY KEY,
    centre_id INTEGER NOT NULL REFERENCES wellness_centres(id) ON DELETE CASCADE,
    type VARCHAR(100),
    application_code VARCHAR(100) UNIQUE,
    amount NUMERIC(15, 2),
    status VARCHAR(50) DEFAULT 'SUBMITTED',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Therapists Table
CREATE TABLE IF NOT EXISTS therapists (
    id SERIAL PRIMARY KEY,
    centre_id INTEGER NOT NULL REFERENCES wellness_centres(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    certification_code VARCHAR(100),
    status VARCHAR(50) DEFAULT 'PENDING',
    total_sessions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
