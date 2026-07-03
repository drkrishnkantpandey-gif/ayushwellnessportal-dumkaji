-- server/migrations/0014_dashboard_tables.sql

-- 1. College Departments
CREATE TABLE IF NOT EXISTS college_departments (
  id SERIAL PRIMARY KEY,
  college_id INTEGER REFERENCES ayush_colleges(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  head_of_department VARCHAR(255),
  student_count INTEGER DEFAULT 0,
  faculty_count INTEGER DEFAULT 0,
  course_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. College Incentives
CREATE TABLE IF NOT EXISTS college_incentives (
  id SERIAL PRIMARY KEY,
  college_id INTEGER REFERENCES ayush_colleges(id) ON DELETE CASCADE,
  incentive_type VARCHAR(255) NOT NULL,
  application_id VARCHAR(100) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'Approved', 'Under Review', 'Rejected'
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. College Research
CREATE TABLE IF NOT EXISTS college_research (
  id SERIAL PRIMARY KEY,
  college_id INTEGER REFERENCES ayush_colleges(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  faculty_name VARCHAR(255),
  status VARCHAR(50) NOT NULL, -- 'Published', 'Under Review', 'In Progress'
  journal_name VARCHAR(255),
  publication_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. NAAC Status (One per college)
CREATE TABLE IF NOT EXISTS college_naac_status (
  id SERIAL PRIMARY KEY,
  college_id INTEGER REFERENCES ayush_colleges(id) ON DELETE CASCADE UNIQUE,
  accreditation_grade VARCHAR(10), -- 'B++', 'A', etc.
  current_cycle INTEGER DEFAULT 1,
  application_status VARCHAR(100), -- 'Peer Team Visit Scheduled'
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. NAAC Progress (Timeline)
CREATE TABLE IF NOT EXISTS college_naac_progress (
  id SERIAL PRIMARY KEY,
  college_id INTEGER REFERENCES ayush_colleges(id) ON DELETE CASCADE,
  step_name VARCHAR(255) NOT NULL, -- 'SSR Submitted', 'Data Validation'
  is_completed BOOLEAN DEFAULT FALSE,
  completion_date DATE,
  notes TEXT,
  display_order INTEGER NOT NULL -- 1, 2, 3, 4
);

-- 6. NAAC Criteria Scores
CREATE TABLE IF NOT EXISTS college_naac_criteria (
  id SERIAL PRIMARY KEY,
  college_id INTEGER REFERENCES ayush_colleges(id) ON DELETE CASCADE,
  criterion_name VARCHAR(255) NOT NULL, -- 'Curricular Aspects'
  score VARCHAR(50), -- '85%'
  grade VARCHAR(10), -- 'A', 'B++'
  status VARCHAR(50), -- 'Good', 'Very Good'
  display_order INTEGER NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_col_dept_col_id ON college_departments(college_id);
CREATE INDEX IF NOT EXISTS idx_col_inc_col_id ON college_incentives(college_id);
CREATE INDEX IF NOT EXISTS idx_col_res_col_id ON college_research(college_id);
CREATE INDEX IF NOT EXISTS idx_col_naac_prog_col_id ON college_naac_progress(college_id);
CREATE INDEX IF NOT EXISTS idx_col_naac_crit_col_id ON college_naac_criteria(college_id);
