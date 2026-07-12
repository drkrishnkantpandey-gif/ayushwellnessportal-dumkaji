-- server/migrations/0044_update_training_centres_revised_schema.sql
-- Revised schema for Yoga Centre (training_centres) registration

BEGIN;

ALTER TABLE training_centres 
  ADD COLUMN IF NOT EXISTS applicant_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS designation VARCHAR(255),
  ADD COLUMN IF NOT EXISTS entity_type VARCHAR(100),
  ADD COLUMN IF NOT EXISTS entity_certificate_path TEXT,
  ADD COLUMN IF NOT EXISTS already_operating VARCHAR(100),
  ADD COLUMN IF NOT EXISTS other_business VARCHAR(255),
  ADD COLUMN IF NOT EXISTS operational_business_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS operational_business_reg_number VARCHAR(100),
  ADD COLUMN IF NOT EXISTS operational_business_certificate_path TEXT,
  ADD COLUMN IF NOT EXISTS id_proof_type VARCHAR(100),
  ADD COLUMN IF NOT EXISTS id_proof_number VARCHAR(100),
  ADD COLUMN IF NOT EXISTS id_proof_path TEXT,
  ADD COLUMN IF NOT EXISTS gps_coordinates VARCHAR(100),
  ADD COLUMN IF NOT EXISTS website VARCHAR(255);

COMMIT;
