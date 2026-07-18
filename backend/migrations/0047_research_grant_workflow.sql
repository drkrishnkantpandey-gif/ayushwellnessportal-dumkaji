-- Migration: Add tables and columns for research grant workflow, logs, and disbursals
BEGIN;

-- 1. Create table for research grant movement logs
CREATE TABLE IF NOT EXISTS research_grant_logs (
    id SERIAL PRIMARY KEY,
    grant_id INTEGER NOT NULL REFERENCES research_grants(id) ON DELETE CASCADE,
    action_by VARCHAR(50) NOT NULL, -- 'APPLICANT' or 'DIRECTORATE'
    action_by_user_id INTEGER REFERENCES users(id),
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    comments TEXT,
    attachment_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create table for grant installment disbursals
CREATE TABLE IF NOT EXISTS research_grant_disbursals (
    id SERIAL PRIMARY KEY,
    grant_id INTEGER NOT NULL REFERENCES research_grants(id) ON DELETE CASCADE,
    installment_num INTEGER NOT NULL, -- 1, 2, or 3
    percentage NUMERIC(5, 2) NOT NULL, -- 40.00, 30.00, 30.00
    amount NUMERIC(15, 2) NOT NULL,
    progress_details TEXT NOT NULL,
    slrc_approval_doc_path TEXT NOT NULL,
    milestone_chart_path TEXT NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    account_holder_name VARCHAR(255) NOT NULL,
    ifsc_code VARCHAR(50) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    cancelled_cheque_path TEXT NOT NULL,
    utilization_certificate_path TEXT, -- required for 2nd and 3rd
    other_doc_path TEXT,
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REVERTED'
    directorate_remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_research_grant_logs_grant_id ON research_grant_logs(grant_id);
CREATE INDEX IF NOT EXISTS idx_research_grant_disbursals_grant_id ON research_grant_disbursals(grant_id);

COMMIT;
