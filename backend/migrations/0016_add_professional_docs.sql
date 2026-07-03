-- Migration 0016: Add ID Proof and Degree Certificate paths to Yoga Professional Profile
ALTER TABLE yoga_professional_profile
ADD COLUMN IF NOT EXISTS degree_certificate_path TEXT,
ADD COLUMN IF NOT EXISTS govt_id_proof_path TEXT;

-- Bio should already exist based on registerController usages, but ensuring it here just in case
ALTER TABLE yoga_professional_profile
ADD COLUMN IF NOT EXISTS bio TEXT;
