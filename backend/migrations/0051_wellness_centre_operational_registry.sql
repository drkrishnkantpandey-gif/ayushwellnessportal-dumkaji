-- 0051: Wellness Centre Operational Registration (post-login registration form)
-- This is separate from the login-approval registration (wellness_centres table)
-- This table stores the full 5-section operational registration form

BEGIN;

-- Sequence for registration numbers (per financial year, shared)
CREATE SEQUENCE IF NOT EXISTS seq_wc_operational_reg_serial START 1;

-- Main operational registrations table
CREATE TABLE IF NOT EXISTS wellness_centre_registrations (
  id                          SERIAL PRIMARY KEY,
  user_id                     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Registration number (UK-WC-FY-YYYY-XXXX), assigned at submission
  registration_number         VARCHAR(30) UNIQUE,

  already_on_portal           BOOLEAN DEFAULT FALSE,
  portal_reg_reason           VARCHAR(50),
  previous_reg_number         VARCHAR(100),
  previous_reg_certificate    TEXT,

  centre_name                 VARCHAR(255) NOT NULL,
  district                    VARCHAR(100) NOT NULL,
  address                     TEXT NOT NULL,
  gps_lat                     VARCHAR(50),
  gps_lng                     VARCHAR(50),
  google_map_link             TEXT,
  owner_name                  VARCHAR(255),
  mobile                      VARCHAR(20),
  is_residential              BOOLEAN DEFAULT FALSE,
  offers_clinical             BOOLEAN DEFAULT FALSE,
  category                    VARCHAR(100),
  services_offered            TEXT[],

  doctor_appointed            BOOLEAN DEFAULT FALSE,
  doctor_name                 VARCHAR(255),
  doctor_qualification        VARCHAR(255),
  doctor_qual_doc             TEXT,
  bcp_reg_number              VARCHAR(100),
  bcp_reg_doc                 TEXT,
  cea_reg_number              VARCHAR(100),
  cea_valid_till              DATE,
  cea_reg_certificate         TEXT,
  cea_registered              BOOLEAN DEFAULT FALSE,
  declaration_board           BOOLEAN DEFAULT FALSE,
  declaration_signboard       BOOLEAN DEFAULT FALSE,
  clinical_affidavit          TEXT,

  reception_area_sqft         NUMERIC(10,2),
  waiting_capacity            INTEGER,
  consultation_rooms          INTEGER,
  incharge_name               VARCHAR(255),
  incharge_mobile             VARCHAR(20),
  emergency_centre_name       VARCHAR(255),
  emergency_distance_m        NUMERIC(10,2),
  offers_prakruti             BOOLEAN DEFAULT FALSE,
  website                     TEXT,
  service_charges_doc         TEXT,
  brochure_doc                TEXT,
  num_beds                    INTEGER,
  kitchen_available           BOOLEAN DEFAULT FALSE,
  dosha_dietetics             BOOLEAN DEFAULT FALSE,
  parking_cars                INTEGER,
  cctv_supervised             BOOLEAN DEFAULT FALSE,

  abhyanga_rooms              INTEGER,
  vasti_rooms                 INTEGER,
  post_therapy_waiting_rooms  INTEGER,
  medicine_dispensing_rooms   INTEGER,
  marma_rooms                 INTEGER,
  para_surgical_rooms         INTEGER,
  kshar_sutra_ot              INTEGER,
  yoga_halls                  INTEGER,
  meditation_halls            INTEGER,
  shatkarma_rooms             INTEGER,
  massage_rooms               INTEGER,
  enema_rooms                 INTEGER,
  hydrotherapy_rooms          INTEGER,

  receptionist_count          INTEGER,
  sanitation_worker_count     INTEGER,
  mpw_count                   INTEGER,
  cook_count                  INTEGER,
  watchman_count              INTEGER,
  pharmacist_name             VARCHAR(255),
  pharmacist_reg_number       VARCHAR(100),
  pharmacist_bcp_doc          TEXT,
  wc_attendant_count          INTEGER,
  ayurveda_nurse_count        INTEGER,
  male_panchakarma_therapist  INTEGER,
  female_panchakarma_therapist INTEGER,
  panchakarma_staff_bcp_doc   TEXT,
  yoga_instructor_count       INTEGER,
  yoga_instructor_qual_doc    TEXT,
  bnys_doctor_name            VARCHAR(255),
  bnys_reg_certificate        TEXT,
  male_naturopathy_attendant  INTEGER,
  female_naturopathy_attendant INTEGER,

  fee_deposited               BOOLEAN DEFAULT FALSE,
  fee_receipt_doc             TEXT,
  all_declarations_accepted   BOOLEAN DEFAULT FALSE,
  declaration_affidavit       TEXT,

  status                      VARCHAR(30) DEFAULT 'SUBMITTED',
  district_comment            TEXT,
  approved_at                 TIMESTAMP,
  certificate_valid_till      DATE,
  approved_by_user_id         INTEGER REFERENCES users(id),

  submitted_at                TIMESTAMP DEFAULT NOW(),
  updated_at                  TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_wc_op_reg_user ON wellness_centre_registrations(user_id);

CREATE TABLE IF NOT EXISTS wellness_centre_reg_events (
  id               SERIAL PRIMARY KEY,
  registration_id  INTEGER NOT NULL REFERENCES wellness_centre_registrations(id) ON DELETE CASCADE,
  event_type       VARCHAR(60) NOT NULL,
  actor_role       VARCHAR(40),
  actor_id         INTEGER REFERENCES users(id),
  actor_name       VARCHAR(255),
  comment          TEXT,
  created_at       TIMESTAMP DEFAULT NOW()
);

COMMIT;
