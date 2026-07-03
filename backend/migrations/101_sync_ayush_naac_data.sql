BEGIN;

-- 1. create table if not exists
CREATE TABLE IF NOT EXISTS college_naac_status (
    id SERIAL PRIMARY KEY,
    college_id INTEGER,
    current_status VARCHAR(100),
    cycle VARCHAR(50),
    grade VARCHAR(10),
    cgpa VARCHAR(20),
    valid_till INTEGER,
    application_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure all columns exist in case the table was created by a previous migration
ALTER TABLE college_naac_status ADD COLUMN IF NOT EXISTS current_status VARCHAR(100);
ALTER TABLE college_naac_status ADD COLUMN IF NOT EXISTS cycle VARCHAR(50);
ALTER TABLE college_naac_status ADD COLUMN IF NOT EXISTS grade VARCHAR(10);
ALTER TABLE college_naac_status ADD COLUMN IF NOT EXISTS cgpa VARCHAR(20);
ALTER TABLE college_naac_status ADD COLUMN IF NOT EXISTS valid_till INTEGER;
ALTER TABLE college_naac_status ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2. add unique constraint safely
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_college_naac_college_id'
    ) THEN
        ALTER TABLE college_naac_status
        ADD CONSTRAINT unique_college_naac_college_id UNIQUE (college_id);
    END IF;
END $$;

-- 3. check columns existence first
DO $$
DECLARE 
    has_status BOOLEAN;
    has_cycle BOOLEAN;
    has_grade BOOLEAN;
    has_cgpa BOOLEAN;
    has_valid BOOLEAN;
BEGIN

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='ayush_colleges' AND column_name='naac_status'
    ) INTO has_status;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='ayush_colleges' AND column_name='naac_cycle'
    ) INTO has_cycle;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='ayush_colleges' AND column_name='naac_grade'
    ) INTO has_grade;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='ayush_colleges' AND column_name='cgpa'
    ) INTO has_cgpa;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='ayush_colleges' AND column_name='naac_valid_upto'
    ) INTO has_valid;

    -- dynamic safe insert
    EXECUTE format('
        INSERT INTO college_naac_status
        (college_id,current_status,cycle,grade,cgpa,valid_till,application_status)
        SELECT 
            id,
            %s,
            %s,
            %s,
            %s,
            %s,
            ''Not Started''
        FROM ayush_colleges
        ON CONFLICT (college_id) DO UPDATE SET
            current_status = EXCLUDED.current_status,
            cycle = EXCLUDED.cycle,
            grade = EXCLUDED.grade,
            cgpa = EXCLUDED.cgpa,
            valid_till = EXCLUDED.valid_till,
            application_status = EXCLUDED.application_status
    ',
    CASE WHEN has_status THEN 'COALESCE(naac_status,''Not Accredited'')' ELSE '''Not Accredited''' END,
    CASE WHEN has_cycle THEN 'COALESCE(naac_cycle,''Cycle 1'')' ELSE '''Cycle 1''' END,
    CASE WHEN has_grade THEN 'naac_grade' ELSE 'NULL' END,
    CASE WHEN has_cgpa THEN 'cgpa' ELSE 'NULL' END,
    CASE WHEN has_valid THEN 'naac_valid_upto' ELSE 'NULL' END
    );

END $$;

COMMIT;
