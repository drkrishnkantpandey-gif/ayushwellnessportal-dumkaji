-- server/migrations/0031_create_ayush_hospital_clinical_infra.sql

CREATE TABLE IF NOT EXISTS ayush_hospital_clinical_infra (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER UNIQUE REFERENCES ayush_hospitals(id) ON DELETE CASCADE,
    total_beds INTEGER DEFAULT 0,
    total_departments INTEGER DEFAULT 0,
    has_opd BOOLEAN DEFAULT FALSE,
    has_ipd BOOLEAN DEFAULT FALSE,
    has_ot BOOLEAN DEFAULT FALSE,
    has_icu BOOLEAN DEFAULT FALSE,
    has_diagnostics BOOLEAN DEFAULT FALSE,
    has_pharmacy BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to update updated_at on change
CREATE OR REPLACE FUNCTION update_clinical_infra_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER tr_update_clinical_infra_timestamp
    BEFORE UPDATE ON ayush_hospital_clinical_infra
    FOR EACH ROW
    EXECUTE FUNCTION update_clinical_infra_timestamp();

-- Initialize clinical infra for existing hospitals
INSERT INTO ayush_hospital_clinical_infra (hospital_id, total_beds, total_departments)
SELECT id, total_beds, jsonb_array_length(departments)
FROM ayush_hospitals
ON CONFLICT (hospital_id) DO NOTHING;
