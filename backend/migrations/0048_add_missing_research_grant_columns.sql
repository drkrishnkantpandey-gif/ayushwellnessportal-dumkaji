-- Migration: Add missing review columns to research_grants table
BEGIN;

ALTER TABLE research_grants
  ADD COLUMN IF NOT EXISTS directorate_reviewed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS reviewed_by INTEGER REFERENCES users(id);

COMMIT;
