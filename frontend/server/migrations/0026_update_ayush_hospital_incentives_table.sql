-- server/migrations/0026_update_ayush_hospital_incentives_table.sql

-- Drop the old table if it exists to ensure correct schema as per new request
DROP TABLE IF EXISTS ayush_hospital_incentives;

CREATE TABLE ayush_hospital_incentives (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    hospital_id INTEGER REFERENCES ayush_hospitals(id) ON DELETE CASCADE,
    incentive_type VARCHAR(255) NOT NULL,
    incentive_amount NUMERIC(15, 2),
    application_status VARCHAR(50) DEFAULT 'SUBMITTED',
    district_status VARCHAR(50) DEFAULT 'PENDING',
    directorate_status VARCHAR(50) DEFAULT 'PENDING',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
