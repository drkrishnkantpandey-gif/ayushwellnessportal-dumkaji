-- server/migrations/0024_add_document_paths_to_ayush_hospitals.sql

ALTER TABLE ayush_hospitals 
ADD COLUMN IF NOT EXISTS nabh_certificate_path TEXT,
ADD COLUMN IF NOT EXISTS supporting_documents_path TEXT;
