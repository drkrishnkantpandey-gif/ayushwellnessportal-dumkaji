-- server/migrations/0022_ayush_hospital_dashboard.sql

CREATE TABLE IF NOT EXISTS ayush_hospitals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    nabh_status VARCHAR(255) DEFAULT 'Level 1',
    total_patients_this_month INTEGER DEFAULT 0,
    pending_incentive_amount DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ayush_hospital_departments (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER REFERENCES ayush_hospitals(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    head VARCHAR(255),
    patients INTEGER DEFAULT 0,
    beds INTEGER DEFAULT 0,
    occupancy VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ayush_hospital_compliance (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER REFERENCES ayush_hospitals(id) ON DELETE CASCADE,
    area VARCHAR(255) NOT NULL,
    score VARCHAR(50),
    status VARCHAR(100),
    last_audit DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ayush_hospital_incentives (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER REFERENCES ayush_hospitals(id) ON DELETE CASCADE,
    type VARCHAR(255) NOT NULL,
    application_id VARCHAR(100) UNIQUE,
    amount VARCHAR(100),
    status VARCHAR(100),
    updated_at DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ayush_hospital_nabh_progress (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER REFERENCES ayush_hospitals(id) ON DELETE CASCADE,
    step VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    date_info VARCHAR(255),
    display_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ayush_hospital_actions (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER REFERENCES ayush_hospitals(id) ON DELETE CASCADE,
    action_text TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
