-- 0049: Create disbursal compliance tracking table
-- Each row = one compliance submission against a reverted installment disbursal claim

CREATE TABLE IF NOT EXISTS research_grant_disbursal_compliance (
  id                SERIAL PRIMARY KEY,
  disbursal_id      INTEGER NOT NULL REFERENCES research_grant_disbursals(id) ON DELETE CASCADE,
  grant_id          INTEGER NOT NULL REFERENCES research_grants(id) ON DELETE CASCADE,
  submitted_by      INTEGER NOT NULL REFERENCES users(id),
  comments          TEXT NOT NULL,
  doc_path          TEXT,
  submitted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disbursal_compliance_disbursal_id
  ON research_grant_disbursal_compliance(disbursal_id);
