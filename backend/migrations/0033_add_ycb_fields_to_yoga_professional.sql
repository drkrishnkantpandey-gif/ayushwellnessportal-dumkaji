-- Migration: Add YCB Certificate Number and Other Qualification Name to yoga_professional_profile
ALTER TABLE yoga_professional_profile 
ADD COLUMN IF NOT EXISTS ycb_certificate_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS other_qualification_name VARCHAR(255);
