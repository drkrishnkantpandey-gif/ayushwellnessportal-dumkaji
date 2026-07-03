-- NABH Accreditation Fee Reimbursement table
-- Stores applications submitted by Ayush hospitals for reimbursement
-- of fees paid to obtain NABH accreditation.
-- Goes directly to Directorate for approval (no district step).

CREATE TABLE IF NOT EXISTS nabh_reimbursements (
  id                        SERIAL PRIMARY KEY,
  user_id                   INTEGER NOT NULL REFERENCES users(id),
  hospital_id               INTEGER REFERENCES ayush_hospitals(id),

  -- Application details
  hospital_name             VARCHAR(255) NOT NULL,
  nabh_certificate_number   VARCHAR(100),
  nabh_accreditation_type   VARCHAR(100) NOT NULL,   -- e.g. "Entry Level", "Full", "Provisional"
  nabh_valid_from           DATE,
  nabh_valid_to             DATE,
  accreditation_year        INTEGER NOT NULL,
  fee_paid_amount           NUMERIC(12,2) NOT NULL,
  requested_amount          NUMERIC(12,2),           -- amount requested for reimbursement

  -- Bank details
  bank_account_number       VARCHAR(50),
  ifsc_code                 VARCHAR(20),
  branch_name               VARCHAR(255),
  beneficiary_name          VARCHAR(255),

  -- Uploaded documents
  doc_nabh_certificate      TEXT,
  doc_fee_receipt           TEXT,
  doc_bank_details          TEXT,
  doc_others                TEXT,

  -- Workflow
  status                    VARCHAR(50)  NOT NULL DEFAULT 'SUBMITTED',
  directorate_remarks       TEXT,
  approved_amount           NUMERIC(12,2),
  directorate_reviewed_at   TIMESTAMP WITH TIME ZONE,
  reviewed_by               INTEGER REFERENCES users(id),

  created_at                TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at                TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nabh_reimbursements_user_id ON nabh_reimbursements(user_id);
CREATE INDEX IF NOT EXISTS idx_nabh_reimbursements_status  ON nabh_reimbursements(status);
