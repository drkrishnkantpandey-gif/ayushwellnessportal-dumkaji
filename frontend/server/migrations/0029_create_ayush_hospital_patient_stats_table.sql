-- Create ayush_hospital_patient_stats table
CREATE TABLE IF NOT EXISTS ayush_hospital_patient_stats (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER REFERENCES ayush_hospitals(id) ON DELETE CASCADE,
    opd_monthly INTEGER DEFAULT 0,
    ipd_monthly INTEGER DEFAULT 0,
    opd_annual INTEGER DEFAULT 0,
    ipd_annual INTEGER DEFAULT 0,
    last_updated DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed some dummy data for existing hospitals
INSERT INTO ayush_hospital_patient_stats (hospital_id, opd_monthly, ipd_monthly, opd_annual, ipd_annual, last_updated)
SELECT id, 1240, 310, 14200, 3800, CURRENT_DATE FROM ayush_hospitals
ON CONFLICT DO NOTHING;
