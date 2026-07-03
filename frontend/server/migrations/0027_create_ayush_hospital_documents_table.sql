-- server/migrations/0027_create_ayush_hospital_documents_table.sql

CREATE TABLE IF NOT EXISTS ayush_hospital_documents (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER REFERENCES ayush_hospitals(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- 'NABH_CERTIFICATE' or 'SUPPORTING_DOC'
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    upload_status VARCHAR(50) DEFAULT 'UPLOADED', -- 'UPLOADED', 'VERIFIED', 'REJECTED'
    remarks TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP WITH TIME ZONE
);
