const db = require('../db');

/**
 * GET /api/registry/list
 * Query parameters:
 *  - district (optional)
 *  - type (optional: 'wellness_centre' | 'yoga_professional' | 'research_org')
 */
exports.getRegistryList = async (req, res) => {
    try {
        const { district, type } = req.query;
        let wellnessQuery = `
            SELECT 
                wcr.id, 
                wcr.centre_name as "name", 
                wcr.registration_number as "registrationNumber", 
                wcr.category as "entityType", 
                wcr.services_offered as "services", 
                wcr.owner_name as "contactPerson", 
                wc.contact_phone as "contactPhone", 
                wc.contact_email as "contactEmail",
                wcr.district, 
                wcr.address,
                wcr.status,
                'wellness_centre' as "type"
            FROM wellness_centre_registrations wcr
            LEFT JOIN wellness_centres wc ON wc.user_id = wcr.user_id
            WHERE wcr.status = 'APPROVED'
        `;
        let yogaQuery = `
            SELECT 
                u.id, 
                u.full_name as "name", 
                u.email as "contactEmail", 
                u.phone as "contactPhone", 
                p.registration_number as "registrationNumber", 
                p.district, 
                p.address,
                u.registration_status as "status",
                'yoga_professional' as "type"
            FROM users u
            JOIN yoga_professional_profile p ON u.id = p.user_id
            WHERE u.role = 'yoga_professional' AND u.registration_status = 'approved'
        `;
        let researchQuery = `
            SELECT 
                u.id, 
                p.organization_name as "name", 
                p.registration_number as "registrationNumber", 
                p.organization_type as "entityType", 
                p.email as "contactEmail", 
                p.contact_number as "contactPhone", 
                p.district, 
                p.physical_address as "address",
                u.registration_status as "status",
                'research_org' as "type"
            FROM users u
            JOIN research_org_profile p ON u.id = p.user_id
            WHERE u.role = 'research_org' AND u.registration_status = 'approved'
        `;

        const wellnessParams = [];
        const yogaParams = [];
        const researchParams = [];

        if (district) {
            wellnessParams.push(district);
            wellnessQuery += ` AND district = $${wellnessParams.length}`;

            yogaParams.push(district);
            yogaQuery += ` AND p.district = $${yogaParams.length}`;

            researchParams.push(district);
            researchQuery += ` AND p.district = $${researchParams.length}`;
        }

        const results = [];

        if (!type || type === 'wellness_centre') {
            const wellnessRes = await db.query(wellnessQuery, wellnessParams);
            results.push(...wellnessRes.rows);
        }

        if (!type || type === 'yoga_professional') {
            const yogaRes = await db.query(yogaQuery, yogaParams);
            results.push(...yogaRes.rows);
        }

        if (!type || type === 'research_org') {
            const researchRes = await db.query(researchQuery, researchParams);
            results.push(...researchRes.rows);
        }

        res.json({
            success: true,
            count: results.length,
            data: results
        });
    } catch (error) {
        console.error('Error fetching registry list:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * GET /api/registry/verify
 * Query parameters:
 *  - registrationNumber
 */
exports.verifyRegistration = async (req, res) => {
    try {
        const { registrationNumber } = req.query;
        if (!registrationNumber) {
            return res.status(400).json({ success: false, message: 'Registration number is required' });
        }

        const cleanRegNum = registrationNumber.trim().toUpperCase();

        // 1. Check Wellness Centres
        const wellnessRes = await db.query(`
            SELECT id, centre_name as "name", registration_number as "registrationNumber", status, 'wellness_centre' as "type"
            FROM wellness_centre_registrations
            WHERE UPPER(TRIM(registration_number)) = $1
        `, [cleanRegNum]);

        if (wellnessRes.rows.length > 0) {
            const record = wellnessRes.rows[0];
            return res.json({
                success: true,
                valid: record.status === 'APPROVED',
                name: record.name,
                type: 'wellness_centre',
                registrationNumber: record.registrationNumber
            });
        }

        // 2. Check Yoga Professionals
        const yogaRes = await db.query(`
            SELECT u.id, u.full_name as "name", p.registration_number as "registrationNumber", u.registration_status as "status", 'yoga_professional' as "type"
            FROM users u
            JOIN yoga_professional_profile p ON u.id = p.user_id
            WHERE u.role = 'yoga_professional' AND UPPER(TRIM(p.registration_number)) = $1
        `, [cleanRegNum]);

        if (yogaRes.rows.length > 0) {
            const record = yogaRes.rows[0];
            return res.json({
                success: true,
                valid: record.status === 'approved',
                name: record.name,
                type: 'yoga_professional',
                registrationNumber: record.registrationNumber
            });
        }

        // 3. Check Research Institutions
        const researchRes = await db.query(`
            SELECT u.id, p.organization_name as "name", p.registration_number as "registrationNumber", u.registration_status as "status", 'research_org' as "type"
            FROM users u
            JOIN research_org_profile p ON u.id = p.user_id
            WHERE u.role = 'research_org' AND UPPER(TRIM(p.registration_number)) = $1
        `, [cleanRegNum]);

        if (researchRes.rows.length > 0) {
            const record = researchRes.rows[0];
            return res.json({
                success: true,
                valid: record.status === 'approved',
                name: record.name,
                type: 'research_org',
                registrationNumber: record.registrationNumber
            });
        }

        return res.status(404).json({
            success: false,
            valid: false,
            message: 'Registration number not found or invalid'
        });
    } catch (error) {
        console.error('Error verifying registration:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
