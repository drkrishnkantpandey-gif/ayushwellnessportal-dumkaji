-- server/migrations/0013_create_ayush_colleges.sql
-- Create ayush_colleges table which is referenced by 0014_dashboard_tables.sql
-- Inferred schema from dashboardController.js

BEGIN;

CREATE TABLE IF NOT EXISTS ayush_colleges (
    id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    college_name VARCHAR(255) NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
