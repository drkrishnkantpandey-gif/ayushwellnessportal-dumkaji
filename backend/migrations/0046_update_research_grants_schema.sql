-- Migration: Update research_grants table with new columns
BEGIN;

ALTER TABLE research_grants 
  ADD COLUMN IF NOT EXISTS yoga_experience_years INTEGER,
  ADD COLUMN IF NOT EXISTS doc_proof_path TEXT,
  ADD COLUMN IF NOT EXISTS received_prior_grant BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS prior_grant_app_number VARCHAR(100),
  ADD COLUMN IF NOT EXISTS prior_grant_approval_doc_path TEXT,
  ADD COLUMN IF NOT EXISTS behalf_affidavit_path TEXT,
  ADD COLUMN IF NOT EXISTS completed_research_count INTEGER,
  ADD COLUMN IF NOT EXISTS max_funding_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS research_proof_doc_path TEXT,
  ADD COLUMN IF NOT EXISTS applicant_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS applicant_designation VARCHAR(255),
  ADD COLUMN IF NOT EXISTS authorized_by VARCHAR(100),
  ADD COLUMN IF NOT EXISTS authorization_letter_path TEXT,
  ADD COLUMN IF NOT EXISTS no_prior_grant_affidavit_path TEXT,
  ADD COLUMN IF NOT EXISTS pi_dob DATE,
  ADD COLUMN IF NOT EXISTS pi_dob_proof_path TEXT,
  ADD COLUMN IF NOT EXISTS pi_id_proof_path TEXT,
  ADD COLUMN IF NOT EXISTS pi_qualifications TEXT,
  ADD COLUMN IF NOT EXISTS pi_qualifications_doc_path TEXT,
  ADD COLUMN IF NOT EXISTS pi_position VARCHAR(255),
  ADD COLUMN IF NOT EXISTS pi_position_other VARCHAR(255),
  ADD COLUMN IF NOT EXISTS pi_position_proof_path TEXT,
  ADD COLUMN IF NOT EXISTS synopsis_path TEXT,
  ADD COLUMN IF NOT EXISTS research_duration_months INTEGER,
  ADD COLUMN IF NOT EXISTS other_doc_path TEXT,
  ADD COLUMN IF NOT EXISTS milestone_chart_path TEXT,
  ADD COLUMN IF NOT EXISTS budget_equipment NUMERIC,
  ADD COLUMN IF NOT EXISTS budget_manpower NUMERIC,
  ADD COLUMN IF NOT EXISTS budget_documentation NUMERIC,
  ADD COLUMN IF NOT EXISTS budget_travel NUMERIC,
  ADD COLUMN IF NOT EXISTS budget_contingency NUMERIC,
  ADD COLUMN IF NOT EXISTS budget_details_doc_path TEXT,
  ADD COLUMN IF NOT EXISTS ethical_clearance_doc_path TEXT,
  ADD COLUMN IF NOT EXISTS team_cvs_path TEXT,
  ADD COLUMN IF NOT EXISTS other_relevant_doc_path TEXT,
  ADD COLUMN IF NOT EXISTS other_relevant_doc_desc TEXT,
  ADD COLUMN IF NOT EXISTS originality_affidavit_path TEXT,
  ADD COLUMN IF NOT EXISTS serial_number VARCHAR(100) UNIQUE;

CREATE SEQUENCE IF NOT EXISTS seq_research_grant_serial START WITH 1;

COMMIT;
