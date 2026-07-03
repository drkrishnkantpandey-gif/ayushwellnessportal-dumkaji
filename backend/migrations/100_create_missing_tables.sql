
-- 1. NAAC STATUS
CREATE TABLE IF NOT EXISTS college_naac_status (
  college_id INTEGER PRIMARY KEY REFERENCES ayush_colleges(id),
  current_status VARCHAR(50) DEFAULT 'Not Accredited',
  cycle VARCHAR(50),
  grade VARCHAR(20),
  cgpa DECIMAL(4, 2),
  valid_from DATE,
  valid_till DATE,
  verified_by_admin BOOLEAN DEFAULT FALSE,
  application_status VARCHAR(50) DEFAULT 'Not Started'
);

-- 2. NAAC DOCUMENTS
CREATE TABLE IF NOT EXISTS college_naac_documents (
  id SERIAL PRIMARY KEY,
  college_id INTEGER REFERENCES ayush_colleges(id),
  document_name VARCHAR(255),
  document_type VARCHAR(100),
  file_url TEXT,
  status VARCHAR(50) DEFAULT 'Pending',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  remarks TEXT,
  related_phase VARCHAR(50) DEFAULT 'Registration'
);

-- 3. NAAC CRITERIA SCORES
CREATE TABLE IF NOT EXISTS college_naac_criteria_scores (
  id SERIAL PRIMARY KEY,
  college_id INTEGER REFERENCES ayush_colleges(id),
  criterion_code INTEGER,
  criterion_name VARCHAR(255),
  score DECIMAL(10, 2) DEFAULT 0,
  max_score DECIMAL(10, 2),
  grade VARCHAR(10),
  status VARCHAR(50),
  completion_percent DECIMAL(5, 2) DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. NAAC COMPLIANCE TASKS
CREATE TABLE IF NOT EXISTS college_naac_compliance_tasks (
  id SERIAL PRIMARY KEY,
  college_id INTEGER REFERENCES ayush_colleges(id),
  task_name VARCHAR(255),
  phase VARCHAR(100),
  due_date DATE,
  status VARCHAR(50) DEFAULT 'Pending',
  linked_document_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. NAAC TIMELINE
CREATE TABLE IF NOT EXISTS college_naac_timeline (
  id SERIAL PRIMARY KEY,
  college_id INTEGER REFERENCES ayush_colleges(id),
  event VARCHAR(255),
  event_date DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
