-- Create training_centres table
CREATE TABLE IF NOT EXISTS training_centres (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  centre_name VARCHAR(255) NOT NULL,
  establishment_year INTEGER,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  institution_type VARCHAR(100),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  registration_number VARCHAR(100),
  registration_authority VARCHAR(255),
  accreditation_status VARCHAR(100) DEFAULT 'PENDING',
  description TEXT,
  facilities TEXT[],
  courses_offered TEXT[],
  centre_photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_training_centres_user_id ON training_centres(user_id);
CREATE INDEX IF NOT EXISTS idx_training_centres_email ON training_centres(email);
CREATE INDEX IF NOT EXISTS idx_training_centres_city ON training_centres(city);
CREATE INDEX IF NOT EXISTS idx_training_centres_state ON training_centres(state);
