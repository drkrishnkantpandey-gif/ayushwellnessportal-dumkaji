-- server/migrations/0005_ensure_training_centre_for_existing_users.sql
-- Ensure every yoga_centre user has a training_centres row (required for FKs)

BEGIN;

-- Insert a minimal training_centres record for any yoga_centre users that lack one
INSERT INTO training_centres (user_id, centre_name, email, phone, institution_type, address, city, state, pincode, accreditation_status)
SELECT 
  u.id,
  COALESCE(u.full_name, 'Centre ' || u.id) as centre_name,
  u.email,
  COALESCE(u.phone, '0000000000') as phone,
  'Yoga Centre' as institution_type,
  'Address not set' as address,
  'City' as city,
  'State' as state,
  '000000' as pincode,
  'APPROVED' as accreditation_status
FROM users u
LEFT JOIN training_centres tc ON u.id = tc.user_id
WHERE 
  u.role = 'yoga_centre' 
  AND tc.user_id IS NULL;

COMMIT;
