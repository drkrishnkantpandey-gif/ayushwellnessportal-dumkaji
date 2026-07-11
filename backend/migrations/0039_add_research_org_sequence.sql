-- Migration: Create sequence for research_org registration numbers
BEGIN;

CREATE SEQUENCE IF NOT EXISTS seq_research_org_reg_serial START WITH 1;

COMMIT;
