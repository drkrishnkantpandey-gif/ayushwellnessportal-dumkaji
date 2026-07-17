-- Migration: Create system_settings table
BEGIN;

CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(255) PRIMARY KEY,
    value VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default value for research grant applications toggle
INSERT INTO system_settings (key, value) 
VALUES ('accept_research_applications', 'AUTO')
ON CONFLICT (key) DO NOTHING;

COMMIT;
