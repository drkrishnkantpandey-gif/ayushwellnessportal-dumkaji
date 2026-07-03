-- Create college_faculty table
CREATE TABLE IF NOT EXISTS college_faculty (
    id SERIAL PRIMARY KEY,
    college_id INTEGER REFERENCES ayush_colleges(id) ON DELETE CASCADE,
    department_id INTEGER REFERENCES college_departments(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    qualification VARCHAR(255) NOT NULL,
    experience_years INTEGER DEFAULT 0,
    specialization VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    joining_date DATE,
    status VARCHAR(50) DEFAULT 'Active', -- Active, On Leave, Retired
    publications_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create college_courses table
CREATE TABLE IF NOT EXISTS college_courses (
    id SERIAL PRIMARY KEY,
    college_id INTEGER REFERENCES ayush_colleges(id) ON DELETE CASCADE,
    department_id INTEGER REFERENCES college_departments(id) ON DELETE CASCADE,
    course_name VARCHAR(255) NOT NULL,
    course_type VARCHAR(50), -- UG, PG, Diploma, PhD
    intake_capacity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create college_student_enrollment table
CREATE TABLE IF NOT EXISTS college_student_enrollment (
    id SERIAL PRIMARY KEY,
    college_id INTEGER REFERENCES ayush_colleges(id) ON DELETE CASCADE,
    department_id INTEGER REFERENCES college_departments(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES college_courses(id) ON DELETE CASCADE,
    academic_year VARCHAR(20) NOT NULL, -- e.g., '2024-2025'
    total_enrolled INTEGER DEFAULT 0,
    male_count INTEGER DEFAULT 0,
    female_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(college_id, course_id, academic_year)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_faculty_college ON college_faculty(college_id);
CREATE INDEX IF NOT EXISTS idx_students_college ON college_student_enrollment(college_id);
