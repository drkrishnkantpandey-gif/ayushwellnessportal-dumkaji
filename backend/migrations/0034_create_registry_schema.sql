-- Migration: Add registration_number to yoga_professional_profile and create serial sequences
BEGIN;

ALTER TABLE yoga_professional_profile 
ADD COLUMN IF NOT EXISTS registration_number VARCHAR(100);

CREATE SEQUENCE IF NOT EXISTS seq_wellness_centre_reg_serial START WITH 1;
CREATE SEQUENCE IF NOT EXISTS seq_yoga_professional_reg_serial START WITH 1;

COMMIT;
