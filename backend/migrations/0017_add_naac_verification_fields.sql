-- Migration: Add verification fields to college_naac_status
-- Purpose: Support declaration and admin verification workflow

ALTER TABLE college_naac_status 
ADD COLUMN IF NOT EXISTS reported_stage VARCHAR(100),
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'Not Reported',
ADD COLUMN IF NOT EXISTS verified_stage VARCHAR(100),
ADD COLUMN IF NOT EXISTS proof_document_path TEXT,
ADD COLUMN IF NOT EXISTS admin_remarks TEXT,
ADD COLUMN IF NOT EXISTS declared_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN college_naac_status.verification_status IS 'Status: Not Reported, Declared, Verified, Rejected';
COMMENT ON COLUMN college_naac_status.reported_stage IS 'College-declared NAAC stage';
COMMENT ON COLUMN college_naac_status.verified_stage IS 'Admin-verified NAAC stage (NULL until verified)';

-- Create index for faster queries on verification status
CREATE INDEX IF NOT EXISTS idx_naac_verification_status ON college_naac_status(verification_status);
