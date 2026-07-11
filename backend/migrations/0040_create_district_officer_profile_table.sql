-- Migration: Create district_officer_profile table
BEGIN;

CREATE TABLE IF NOT EXISTS district_officer_profile (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    district VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    contact_number VARCHAR(50) NOT NULL,
    employee_id VARCHAR(100) NOT NULL,
    id_type VARCHAR(50) NOT NULL,
    id_number VARCHAR(100) NOT NULL,
    id_upload_path TEXT NOT NULL,
    authority_order_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_district_officer_profile_user_id ON district_officer_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_district_officer_profile_district ON district_officer_profile(district);

COMMIT;
