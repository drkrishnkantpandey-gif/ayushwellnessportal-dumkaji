-- 1. NAAC STATUS
CREATE TABLE IF NOT EXISTS college_naac_status (
  college_id INTEGER REFERENCES ayush_colleges(id),
  current_status VARCHAR(50) DEFAULT 'Not Accredited',
  cycle VARCHAR(50),
  grade VARCHAR(20),
  cgpa DECIMAL(4, 2),
  valid_from DATE,
  valid_till DATE,
  verified_by_admin BOOLEAN DEFAULT FALSE,
  application_status VARCHAR(50) DEFAULT 'Not Started',
  PRIMARY KEY (college_id)
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

-- Migrate old naac_documents if exists
DO $$
BEGIN
   IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'naac_documents') THEN
      INSERT INTO college_naac_documents (college_id, document_name, document_type, file_url, status, uploaded_at, remarks)
      SELECT college_id, document_name, document_type, file_url, status, uploaded_at, remarks FROM naac_documents;
   END IF;
END
$$;

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

-- Migrate old naac_criteria if exists
DO $$
BEGIN
   IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'naac_criteria') THEN
      INSERT INTO college_naac_criteria_scores (college_id, criterion_code, criterion_name, max_score, completion_percent, grade, status, score)
      SELECT college_id, criteria_no, criteria_name, max_score, completion_percent, grade, status, self_score FROM naac_criteria;
   END IF;
END
$$;

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

-- Migrate old naac_tasks if exists
DO $$
BEGIN
   IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'naac_tasks') THEN
      INSERT INTO college_naac_compliance_tasks (college_id, task_name, due_date, status, created_at)
      SELECT college_id, task_name, due_date, status, created_at FROM naac_tasks;
   END IF;
END
$$;

-- 5. NAAC TIMELINE
CREATE TABLE IF NOT EXISTS college_naac_timeline (
  id SERIAL PRIMARY KEY,
  college_id INTEGER REFERENCES ayush_colleges(id),
  event VARCHAR(255),
  event_date DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Migrate old naac_timeline if exists
DO $$
BEGIN
   IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'naac_timeline') THEN
      INSERT INTO college_naac_timeline (college_id, event, event_date, description, created_at)
      SELECT college_id, title, date, description, created_at FROM naac_timeline;
   END IF;
END
$$;
