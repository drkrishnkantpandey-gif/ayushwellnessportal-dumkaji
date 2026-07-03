-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS centre_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_centre_id INTEGER REFERENCES training_centres(id) ON DELETE CASCADE,
  month_date DATE NOT NULL, -- We'll store the first day of the month, e.g., 2025-01-01
  profile_views INTEGER DEFAULT 0,
  map_views INTEGER DEFAULT 0,
  enquiries INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(training_centre_id, month_date)
);

-- Index for faster querying
CREATE INDEX IF NOT EXISTS idx_centre_analytics_tc_date ON centre_analytics(training_centre_id, month_date);
