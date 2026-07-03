BEGIN;

DO $$
DECLARE uid INT;
DECLARE centre_exists INT;
BEGIN

    -- 1. Find user by email
    SELECT id INTO uid 
    FROM users 
    WHERE email = 'aditithakur907@gmail.com'
    LIMIT 1;

    -- 2. If user not exists → create user
    IF uid IS NULL THEN
        INSERT INTO users (full_name, email, password_hash, role)
        VALUES (
            'Debug Training Centre User',
            'aditithakur907@gmail.com',
            '$2b$10$YourHashHere',
            'training_centre'
        )
        RETURNING id INTO uid;
    END IF;

    -- 3. Check if training centre already exists
    SELECT id INTO centre_exists
    FROM training_centres
    WHERE user_id = uid
    LIMIT 1;

    -- 4. If not exists → insert
    IF centre_exists IS NULL THEN
        INSERT INTO training_centres (
            user_id, centre_name, email, phone, institution_type,
            address, city, state, pincode, accreditation_status
        )
        VALUES (
            uid,
            'Centre Debug',
            'aditithakur907@gmail.com',
            '0000000000',
            'Yoga Centre',
            'Address not set',
            'City',
            'State',
            '000000',
            'APPROVED'
        );
    END IF;

END $$;

COMMIT;
