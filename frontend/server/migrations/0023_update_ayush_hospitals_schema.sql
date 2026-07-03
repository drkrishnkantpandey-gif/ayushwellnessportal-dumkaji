-- server/migrations/0023_update_ayush_hospitals_schema.sql

-- Drop the old table to ensure clean schema as per FRD
DROP TABLE IF EXISTS ayush_hospital_actions;
DROP TABLE IF EXISTS ayush_hospital_nabh_progress;
DROP TABLE IF EXISTS ayush_hospital_incentives;
DROP TABLE IF EXISTS ayush_hospital_compliance;
DROP TABLE IF EXISTS ayush_hospital_departments;
DROP TABLE IF EXISTS ayush_hospitals;

CREATE TABLE ayush_hospitals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    hospital_name VARCHAR(255) NOT NULL,
    ayush_system VARCHAR(100) NOT NULL,
    hospital_type VARCHAR(50) NOT NULL,
    registration_number VARCHAR(100) NOT NULL,
    nabh_status VARCHAR(50) DEFAULT 'No',
    nabh_certificate_number VARCHAR(100),
    nabh_valid_from DATE,
    nabh_valid_to DATE,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_mobile VARCHAR(20) NOT NULL,
    status VARCHAR(50) DEFAULT 'SUBMITTED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Re-create the dependent tables if needed for the dashboard overview
CREATE TABLE ayush_hospital_departments (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER REFERENCES ayush_hospitals(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    head VARCHAR(255),
    patients INTEGER DEFAULT 0,
    beds INTEGER DEFAULT 0,
    occupancy VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ayush_hospital_compliance (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER REFERENCES ayush_hospitals(id) ON DELETE CASCADE,
    area VARCHAR(255) NOT NULL,
    score VARCHAR(50),
    status VARCHAR(100),
    last_audit DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ayush_hospital_incentives (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER REFERENCES ayush_hospitals(id) ON DELETE CASCADE,
    type VARCHAR(255) NOT NULL,
    application_id VARCHAR(100) UNIQUE,
    amount VARCHAR(100),
    status VARCHAR(100),
    updated_at DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ayush_hospital_nabh_progress (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER REFERENCES ayush_hospitals(id) ON DELETE CASCADE,
    step VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    date_info VARCHAR(255),
    display_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ayush_hospital_actions (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER REFERENCES ayush_hospitals(id) ON DELETE CASCADE,
    action_text TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
