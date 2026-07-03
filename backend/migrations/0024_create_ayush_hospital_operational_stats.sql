-- server/migrations/0024_create_ayush_hospital_operational_stats.sql

CREATE TABLE IF NOT EXISTS ayush_hospital_operational_stats (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER REFERENCES ayush_hospitals(id) ON DELETE CASCADE,
    opd_count INTEGER DEFAULT 0,
    ipd_count INTEGER DEFAULT 0,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_hospital_stats UNIQUE (hospital_id)
);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_operational_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER tr_ayush_hospital_operational_stats_updated_at
    BEFORE UPDATE ON ayush_hospital_operational_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_operational_stats_updated_at();
