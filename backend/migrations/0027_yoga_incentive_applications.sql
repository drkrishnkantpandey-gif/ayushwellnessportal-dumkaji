-- Migration: Yoga Training Centre Incentive Applications
-- Two incentive types:
--   EXPANSION  → 25% of claim amount
--   NEW_SETUP  → 50% of claim amount
-- Workflow: Applicant → District Officer → Directorate

BEGIN;

CREATE TABLE IF NOT EXISTS yoga_incentive_applications (
  id                       SERIAL PRIMARY KEY,
  user_id                  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  centre_id                INTEGER REFERENCES training_centres(id) ON DELETE SET NULL,

  -- Incentive type
  incentive_type           VARCHAR(20) NOT NULL CHECK (incentive_type IN ('EXPANSION','NEW_SETUP')),
  subsidy_percentage       INTEGER NOT NULL,      -- 25 or 50

  -- Project details
  centre_name              VARCHAR(255) NOT NULL,
  district                 VARCHAR(100) NOT NULL,
  investment_amount        NUMERIC(15,2) NOT NULL,
  claim_amount             NUMERIC(15,2) NOT NULL,
  subsidy_amount           NUMERIC(15,2) NOT NULL, -- auto-calculated

  -- Mandatory document paths
  doc_fire_safety          VARCHAR(500),
  doc_udyog_reg            VARCHAR(500),
  doc_gst_reg              VARCHAR(500),
  doc_pollution_cert       VARCHAR(500),
  doc_dpr                  VARCHAR(500),
  doc_ca_project_cost      VARCHAR(500),
  doc_land_document        VARCHAR(500),
  doc_constitution         VARCHAR(500),
  doc_others               VARCHAR(500),

  -- Overall status
  status                   VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
  -- SUBMITTED | DISTRICT_UNDER_REVIEW | DISTRICT_APPROVED | DISTRICT_DISAPPROVED
  -- | DIRECTORATE_UNDER_REVIEW | DIRECTORATE_APPROVED | DIRECTORATE_REJECTED

  -- District Officer decision
  district_decision        VARCHAR(20),   -- APPROVED | DISAPPROVED
  district_remarks         TEXT,
  district_reviewed_at     TIMESTAMP WITH TIME ZONE,

  -- Directorate decision
  directorate_decision     VARCHAR(20),   -- APPROVED | REJECTED
  directorate_remarks      TEXT,
  directorate_reviewed_at  TIMESTAMP WITH TIME ZONE,

  created_at               TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at               TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_yoga_incentive_user    ON yoga_incentive_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_yoga_incentive_status  ON yoga_incentive_applications(status);
CREATE INDEX IF NOT EXISTS idx_yoga_incentive_district ON yoga_incentive_applications(district);

COMMIT;
