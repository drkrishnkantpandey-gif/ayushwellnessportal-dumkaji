
-- Add latitude and longitude to training_centres
ALTER TABLE training_centres
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
