-- Migration 0015: Expand Yoga Professional Dashboard Modules

-- 1. Enhance yoga_professional_profile
ALTER TABLE yoga_professional_profile 
ADD COLUMN IF NOT EXISTS ayush_id VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS teaching_category VARCHAR(50),
ADD COLUMN IF NOT EXISTS district VARCHAR(100),
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS admin_remarks TEXT,
ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS bank_account_no VARCHAR(50),
ADD COLUMN IF NOT EXISTS bank_ifsc VARCHAR(20),
ADD COLUMN IF NOT EXISTS profile_locked BOOLEAN DEFAULT FALSE;

-- 2. Create yoga_certificates table
CREATE TABLE IF NOT EXISTS yoga_certificates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    certificate_type VARCHAR(100) DEFAULT 'YCB',
    certificate_no VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    file_path TEXT,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, EXPIRED
    admin_remarks TEXT,
    qr_code_data TEXT,
    verification_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create reimbursement_applications table
CREATE TABLE IF NOT EXISTS reimbursement_applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    application_type VARCHAR(100), -- e.g., 'YCB_EXAM_FEE'
    amount DECIMAL(10, 2),
    receipt_path TEXT,
    bank_account_no VARCHAR(50), -- Snapshots at time of application
    bank_ifsc VARCHAR(20),
    status VARCHAR(20) DEFAULT 'SUBMITTED', -- SUBMITTED, UNDER_REVIEW, APPROVED, PAID, REJECTED
    payment_ref VARCHAR(100), -- Transaction ID
    payment_date TIMESTAMP WITH TIME ZONE,
    admin_remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create yoga_sessions table
CREATE TABLE IF NOT EXISTS yoga_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    session_time TIME NOT NULL,
    participants_count INTEGER DEFAULT 0,
    geotag_location TEXT, -- JSON or string lat/long
    address_display TEXT,
    photo_proof_path TEXT,
    timestamped_photo_url TEXT,
    status VARCHAR(20) DEFAULT 'COMPLETED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50), -- PROFILE, CERTIFICATE, REIMBURSEMENT, EXPIRY
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(255), -- e.g., 'PROFILE_UPDATE', 'CERTIFICATE_UPLOAD'
    entity_id INTEGER,
    entity_type VARCHAR(50),
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_yoga_certs_user ON yoga_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_reimbursement_user ON reimbursement_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_yoga_sessions_user ON yoga_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
