-- Migration: Create research_org_profile table
BEGIN;

CREATE TABLE IF NOT EXISTS research_org_profile (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    applicant_name VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    organization_type VARCHAR(100) NOT NULL,
    organization_name VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    work_experience_years INTEGER NOT NULL,
    email VARCHAR(255) NOT NULL,
    contact_number VARCHAR(50) NOT NULL,
    registration_doc_path TEXT NOT NULL,
    registration_doc_id VARCHAR(100) NOT NULL,
    website VARCHAR(255),
    physical_address TEXT NOT NULL,
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL,
    projects_completed TEXT NOT NULL,
    funding_received NUMERIC(15, 2) NOT NULL,
    association_with_yoga TEXT NOT NULL,
    affiliations TEXT NOT NULL,
    relevant_docs_paths TEXT[] NOT NULL DEFAULT '{}',
    registration_status VARCHAR(50) DEFAULT 'UNDER_REVIEW',
    registration_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_research_org_profile_user_id ON research_org_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_research_org_profile_district ON research_org_profile(district);

COMMIT;
