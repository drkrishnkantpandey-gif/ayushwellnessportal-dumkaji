-- server/migrations/0021_add_infrastructure_cols.sql
ALTER TABLE ayush_colleges
ADD COLUMN IF NOT EXISTS total_area VARCHAR(50),
ADD COLUMN IF NOT EXISTS built_up_area VARCHAR(50),
ADD COLUMN IF NOT EXISTS hospital_beds INTEGER,
ADD COLUMN IF NOT EXISTS laboratories_count INTEGER,
ADD COLUMN IF NOT EXISTS library_details TEXT,
ADD COLUMN IF NOT EXISTS principal_qualification VARCHAR(255);
