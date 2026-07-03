const { Pool } = require('pg');
const xlsx = require('xlsx');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Helper to get college name (if not in JWT or needed fresh)
const getCollegeName = async (collegeId) => {
    const result = await pool.query('SELECT college_name FROM ayush_colleges WHERE id = $1', [collegeId]);
    return result.rows.length > 0 ? result.rows[0].college_name : 'AYUSH College';
};

// GET /api/dashboard/overview
const getOverview = async (req, res) => {
    // Role guard: only AYUSH colleges can access dashboard
    if (req.user.role !== 'ayush_college') {
        return res.status(403).json({ success: false, message: 'Access denied: AYUSH College role required' });
    }

    const collegeId = req.user.college_id || req.user.userId; // Extracted from JWT

    if (!collegeId) {
        return res.status(401).json({ success: false, message: 'College ID not found in token' });
    }

    try {
        // 1. Get College Name (optional, but good for welcome message)
        const collegeName = await getCollegeName(collegeId);

        // 2. Get NAAC Status
        const naacStatusResult = await pool.query(
            'SELECT * FROM college_naac_status WHERE college_id = $1',
            [collegeId]
        );
        let naacStatus = naacStatusResult.rows[0];

        // Self-Healing: If missing in generic table but present in ayush_colleges, sync it now
        if (!naacStatus) {
            const legacyData = await pool.query('SELECT naac_status, naac_grade, cgpa, naac_valid_upto, naac_cycle FROM ayush_colleges WHERE id = $1', [collegeId]);
            if (legacyData.rows.length > 0) {
                const l = legacyData.rows[0];
                // Insert and return
                const newEntry = await pool.query(`
                    INSERT INTO college_naac_status (college_id, current_status, cycle, grade, cgpa, valid_till, application_status)
                    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
                 `, [
                    collegeId,
                    l.naac_status || 'Not Accredited',
                    l.naac_cycle || 'Cycle 1',
                    l.naac_grade,
                    l.cgpa,
                    l.naac_valid_upto,
                    l.naac_status === 'Accredited' ? 'Completed' : 'Not Started'
                ]);
                naacStatus = newEntry.rows[0];
            } else {
                naacStatus = {};
            }
        }

        // 3. Get Student Count (Sum from departments)
        const studentCountResult = await pool.query(
            'SELECT SUM(student_count) as total_students FROM college_departments WHERE college_id = $1',
            [collegeId]
        );
        const totalStudents = studentCountResult.rows[0].total_students || 0;

        // 4. Get Pending Incentive Amount
        const incentiveResult = await pool.query(
            "SELECT SUM(amount) as pending_amount FROM college_incentives WHERE college_id = $1 AND status = 'Under Review'",
            [collegeId]
        );
        const pendingIncentive = incentiveResult.rows[0].pending_amount || 0;

        res.json({
            success: true,
            data: {
                collegeName,
                naacGrade: naacStatus.grade || 'Not Accredited',
                cgpa: naacStatus.cgpa || '0.0',
                naacValidFrom: naacStatus.valid_from,
                naacValidTill: naacStatus.valid_till,
                naacCycle: naacStatus.cycle || 'Cycle 1',
                naacStatus: naacStatus.current_status || 'Not Started',
                totalStudents,
                pendingIncentive
            }
        });
    } catch (error) {
        console.error('Error fetching overview:', error);
        res.status(200).json({
            success: true,
            data: { collegeName: 'AYUSH College', naacGrade: '-', totalStudents: 0, pendingIncentive: 0 }
        });
    }
};

// GET /api/dashboard/naac-progress
const getNaacProgress = async (req, res) => {
    if (req.user.role !== 'ayush_college') {
        return res.status(403).json({ success: false, message: 'Access denied: AYUSH College role required' });
    }
    const collegeId = req.user.college_id || req.user.userId;

    try {
        // User wants the Timeline table to drive the Timeline UI
        const result = await pool.query(
            'SELECT event as step_name, event_date as completion_date, description FROM college_naac_timeline WHERE college_id = $1 ORDER BY event_date DESC',
            [collegeId]
        );

        const formattedData = result.rows.map(row => ({
            step_name: row.step_name,
            is_completed: true, // Timeline entries are completed events
            completion_date: row.completion_date,
            description: row.description
        }));

        res.json({ success: true, data: formattedData });

    } catch (error) {
        console.error('Error fetching NAAC progress:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/dashboard/departments
const getDepartments = async (req, res) => {
    if (req.user.role !== 'ayush_college') {
        return res.status(403).json({ success: false, message: 'Access denied: AYUSH College role required' });
    }
    const collegeId = req.user.college_id || req.user.userId;

    try {
        const result = await pool.query(
            `SELECT d.*, 
            (SELECT string_agg(course_name, ', ') FROM college_courses WHERE department_id = d.id) as course_list 
            FROM college_departments d 
            WHERE d.college_id = $1 ORDER BY d.name ASC`,
            [collegeId]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/dashboard/research
const getResearch = async (req, res) => {
    if (req.user.role !== 'ayush_college') {
        return res.status(403).json({ success: false, message: 'Access denied: AYUSH College role required' });
    }
    const collegeId = req.user.college_id || req.user.userId;

    try {
        const result = await pool.query(
            'SELECT title, faculty_name, status, journal_name, publication_date FROM college_research WHERE college_id = $1 ORDER BY created_at DESC LIMIT 5',
            [collegeId]
        );

        const formattedData = result.rows.map(row => ({
            title: row.title,
            faculty: row.faculty_name,
            status: row.status,
            journal: row.journal_name || '-',
            date: row.publication_date ? new Date(row.publication_date).toISOString().split('T')[0] : '-'
        }));

        res.json({ success: true, data: formattedData });
    } catch (error) {
        console.error('Error fetching research:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/dashboard/incentives
const getIncentives = async (req, res) => {
    if (req.user.role !== 'ayush_college') {
        return res.status(403).json({ success: false, message: 'Access denied: AYUSH College role required' });
    }
    const collegeId = req.user.college_id || req.user.userId;

    try {
        const result = await pool.query(
            'SELECT incentive_type, application_id, amount, status, last_updated FROM college_incentives WHERE college_id = $1 ORDER BY last_updated DESC',
            [collegeId]
        );

        const formattedData = result.rows.map(row => ({
            type: row.incentive_type,
            id: row.application_id,
            amount: row.amount,
            status: row.status,
            updated: row.last_updated ? new Date(row.last_updated).toISOString().split('T')[0] : '-'
        }));

        res.json({ success: true, data: formattedData });
    } catch (error) {
        console.error('Error fetching incentives:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/dashboard/naac-criteria
const getNaacCriteria = async (req, res) => {
    if (req.user.role !== 'ayush_college') {
        return res.status(403).json({ success: false, message: 'Access denied: AYUSH College role required' });
    }
    const collegeId = req.user.college_id || req.user.userId;

    try {
        const result = await pool.query(
            'SELECT criterion_name, score, grade, status FROM college_naac_criteria WHERE college_id = $1 ORDER BY display_order ASC',
            [collegeId]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching naac criteria:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/dashboard/profile
const getProfile = async (req, res) => {
    if (req.user.role !== 'ayush_college') {
        return res.status(403).json({ success: false, message: 'Access denied: AYUSH College role required' });
    }
    const collegeId = req.user.college_id || req.user.userId;
    try {
        const result = await pool.query('SELECT * FROM ayush_colleges WHERE id = $1', [collegeId]);
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'College not found' });
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// PATCH /api/dashboard/profile
const updateProfile = async (req, res) => {
if (req.user.role !== 'ayush_college') {
return res.status(403).json({ success: false, message: 'Access denied: AYUSH College role required' });
}

const collegeId = req.user.college_id || req.user.userId;

const {
    contact_phone, contact_email, website,
    principal_name, principal_phone, principal_email, principal_qualification,
    address, city, state, pincode,
    total_area, built_up_area, hospital_beds, laboratories_count, library_details
} = req.body;

// 🔥 FIX: convert empty string to NULL for integer fields
const toIntOrNull = (val) => {
    if (val === "" || val === undefined || val === null) return null;
    return parseInt(val);
};

const total_area_safe = toIntOrNull(total_area);
const built_up_area_safe = toIntOrNull(built_up_area);
const hospital_beds_safe = toIntOrNull(hospital_beds);
const laboratories_count_safe = toIntOrNull(laboratories_count);

try {
    const result = await pool.query(
        `UPDATE ayush_colleges SET 
        contact_phone = COALESCE($1, contact_phone),
        contact_email = COALESCE($2, contact_email),
        website = COALESCE($3, website),
        principal_name = COALESCE($4, principal_name),
        principal_phone = COALESCE($5, principal_phone),
        principal_email = COALESCE($6, principal_email),
        principal_qualification = COALESCE($7, principal_qualification),
        address = COALESCE($8, address),
        city = COALESCE($9, city),
        state = COALESCE($10, state),
        pincode = COALESCE($11, pincode),
        total_area = COALESCE($12, total_area),
        built_up_area = COALESCE($13, built_up_area),
        hospital_beds = COALESCE($14, hospital_beds),
        laboratories_count = COALESCE($15, laboratories_count),
        library_details = COALESCE($16, library_details)
        WHERE id = $17 RETURNING *`,
        [
            contact_phone, contact_email, website,
            principal_name, principal_phone, principal_email, principal_qualification,
            address, city, state, pincode,
            total_area_safe, built_up_area_safe, hospital_beds_safe, laboratories_count_safe, library_details,
            collegeId
        ]
    );

    res.json({ success: true, data: result.rows[0], message: 'Profile updated successfully' });

} catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
}};


// GET /api/dashboard/faculty
const getFaculty = async (req, res) => {
    if (req.user.role !== 'ayush_college') {
        return res.status(403).json({ success: false, message: 'Access denied: AYUSH College role required' });
    }
    const collegeId = req.user.college_id || req.user.userId;
    try {
        const result = await pool.query(`
            SELECT f.*, d.name as department_name 
            FROM college_faculty f 
            LEFT JOIN college_departments d ON f.department_id = d.id 
            WHERE f.college_id = $1 ORDER BY f.name ASC`,
            [collegeId]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching faculty:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// POST /api/dashboard/faculty
const addFaculty = async (req, res) => {
    if (req.user.role !== 'ayush_college') {
        return res.status(403).json({ success: false, message: 'Access denied: AYUSH College role required' });
    }
    const collegeId = req.user.college_id || req.user.userId;
    const { name, designation, qualification, department_id, experience_years, email, phone } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO college_faculty (college_id, name, designation, qualification, department_id, experience_years, email, phone)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [collegeId, name, designation, qualification, department_id, experience_years, email, phone]
        );
        res.json({ success: true, data: result.rows[0], message: 'Faculty added successfully' });
    } catch (error) {
        console.error('Error adding faculty:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// PATCH /api/dashboard/faculty/:id
const updateFaculty = async (req, res) => {
    if (req.user.role !== 'ayush_college') {
        return res.status(403).json({ success: false, message: 'Access denied: AYUSH College role required' });
    }
    const collegeId = req.user.college_id || req.user.userId;
    const { id } = req.params;
    const { name, designation, qualification, department_id, experience_years, status } = req.body;
    try {
        const result = await pool.query(
            `UPDATE college_faculty SET 
            name = COALESCE($1, name),
            designation = COALESCE($2, designation),
            qualification = COALESCE($3, qualification),
            department_id = COALESCE($4, department_id),
            experience_years = COALESCE($5, experience_years),
            status = COALESCE($6, status)
            WHERE id = $7 AND college_id = $8 RETURNING *`,
            [name, designation, qualification, department_id, experience_years, status, id, collegeId]
        );
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Faculty not found or unauthorized' });
        res.json({ success: true, data: result.rows[0], message: 'Faculty updated successfully' });
    } catch (error) {
        console.error('Error updating faculty:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// DELETE /api/dashboard/faculty/:id
const deleteFaculty = async (req, res) => {
    if (req.user.role !== 'ayush_college') {
        return res.status(403).json({ success: false, message: 'Access denied: AYUSH College role required' });
    }
    const collegeId = req.user.college_id || req.user.userId;
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM college_faculty WHERE id = $1 AND college_id = $2 RETURNING id', [id, collegeId]);
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Faculty not found or unauthorized' });
        res.json({ success: true, message: 'Faculty deleted successfully' });
    } catch (error) {
        console.error('Error deleting faculty:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/dashboard/student-enrollment
const getStudentEnrollment = async (req, res) => {
    if (req.user.role !== 'ayush_college') {
        return res.status(403).json({ success: false, message: 'Access denied: AYUSH College role required' });
    }
    const collegeId = req.user.college_id || req.user.userId;
    try {
        const result = await pool.query(`
            SELECT se.*, 
            c.id as course_id, 
            c.department_id,
            c.course_name, 
            c.intake_capacity, 
            d.name as department_name,
            COALESCE(se.total_enrolled, 0) as total_enrolled,
            COALESCE(se.male_count, 0) as male_count,
            COALESCE(se.female_count, 0) as female_count,
            COALESCE(se.academic_year, '2024-2025') as academic_year,
            CASE 
                WHEN c.intake_capacity > 0 THEN ROUND((COALESCE(se.total_enrolled, 0)::decimal / c.intake_capacity) * 100, 2) 
                ELSE 0 
            END as occupancy
            FROM college_courses c
            JOIN college_departments d ON c.department_id = d.id
            LEFT JOIN college_student_enrollment se ON c.id = se.course_id AND se.college_id = $1
            WHERE c.college_id = $1
            ORDER BY d.name, c.course_name`,
            [collegeId]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching student enrollment:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// PATCH /api/dashboard/student-enrollment
const updateStudentEnrollment = async (req, res) => {
    if (req.user.role !== 'ayush_college') {
        return res.status(403).json({ success: false, message: 'Access denied: AYUSH College role required' });
    }
    const collegeId = req.user.college_id || req.user.userId;
    const { id, department_id, course_id, academic_year, male_count, female_count } = req.body;

    // Recalculate total to ensure consistency
    const total_enrolled = (parseInt(male_count) || 0) + (parseInt(female_count) || 0);

    try {
        let result;
        let targetId = id;

        // If no ID provided, try to find existing record
        if (!targetId && course_id && academic_year) {
            const existing = await pool.query(
                `SELECT id FROM college_student_enrollment 
                 WHERE college_id = $1 AND course_id = $2 AND academic_year = $3`,
                [collegeId, course_id, academic_year]
            );
            if (existing.rows.length > 0) {
                targetId = existing.rows[0].id;
            }
        }

        if (targetId) {
            // Update existing
            result = await pool.query(
                `UPDATE college_student_enrollment 
                 SET total_enrolled = $1, male_count = $2, female_count = $3
                 WHERE id = $4 AND college_id = $5 RETURNING *`,
                [total_enrolled, male_count, female_count, targetId, collegeId]
            );
            if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Record not found' });
        } else {
            // Insert new (only if we have required fields)
            if (!department_id || !course_id || !academic_year) {
                return res.status(400).json({ success: false, message: 'Missing required fields for new enrollment' });
            }
            result = await pool.query(
                `INSERT INTO college_student_enrollment(college_id, department_id, course_id, academic_year, total_enrolled, male_count, female_count)
                 VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [collegeId, department_id, course_id, academic_year, total_enrolled, male_count, female_count]
            );
        }

        // Update department total student count
        // Update department total student count
        const affectedDeptId = department_id || (result.rows[0] ? result.rows[0].department_id : null);
        if (affectedDeptId) {
            await pool.query(`
                UPDATE college_departments 
                SET student_count = (
                    SELECT COALESCE(SUM(total_enrolled), 0) 
                    FROM college_student_enrollment 
                    WHERE department_id = $1
                ) 
                WHERE id = $1`,
                [affectedDeptId]
            );
        }

        res.json({ success: true, data: result.rows[0], message: 'Enrollment updated successfully' });
    } catch (error) {
        console.error('Error updating enrollment:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/dashboard/naac/tasks
// GET /api/dashboard/naac/tasks
const getNaacTasks = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'ayush_college') {
            return res.status(403).json({ success: false, message: 'Access denied: AYUSH College role required' });
        }
        const collegeId = req.user.college_id || req.user.userId;
        if (!collegeId) return res.status(400).json({ success: false, message: 'College ID missing' });

        const result = await pool.query('SELECT * FROM college_naac_compliance_tasks WHERE college_id = $1 ORDER BY due_date ASC', [collegeId]);
        res.json({ success: true, data: result.rows || [] });
    } catch (error) {
        console.error('Error fetching NAAC tasks:', error);
        if (error.code === '42P01') {
            return res.json({ success: true, data: [], message: 'NAAC tasks table not yet created' });
        }
        res.status(500).json({ success: false, message: 'Server Error', data: [] });
    }
};

// POST /api/dashboard/naac/visit-portal - Track portal visit
const trackPortalVisit = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'ayush_college') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        const collegeId = req.user.college_id || req.user.userId;

        await pool.query(
            'INSERT INTO naac_portal_visits(college_id, action) VALUES($1, $2)',
            [collegeId, 'NAAC_PORTAL_VISIT']
        );
        res.json({ success: true, message: 'Visit tracked' });
    } catch (error) {
        // Log but don't crash client
        console.error('Error tracking visit:', error);
        res.status(200).json({ success: false, message: 'Tracking optional failure' });
    }
};

// GET /api/dashboard/naac/documents
const getNaacDocuments = async (req, res) => {
    try {
        console.log('[NAAC Documents] Request received');
        console.log('[NAAC Documents] req.user:', JSON.stringify(req.user, null, 2));

        if (!req.user || req.user.role !== 'ayush_college') {
            console.warn('[NAAC Documents] Access denied - user role:', req.user?.role);
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const collegeId = req.user.college_id || req.user.userId;
        console.log('[NAAC Documents] Using collegeId:', collegeId);

        if (!collegeId) {
            console.error('[NAAC Documents] No college ID found');
            return res.status(400).json({ success: false, message: 'College ID not found', data: [] });
        }

        const result = await pool.query('SELECT * FROM college_naac_documents WHERE college_id = $1 ORDER BY uploaded_at DESC', [collegeId]);
        console.log('[NAAC Documents] Query successful, rows:', result.rows.length);
        res.json({ success: true, data: result.rows || [] });
    } catch (error) {
        console.error('[NAAC Documents] Error details:', {
            message: error.message,
            code: error.code,
            detail: error.detail,
            stack: error.stack
        });

        // If table doesn't exist, return empty array instead of crashing
        if (error.code === '42P01') {
            console.warn('[NAAC Documents] Table does not exist. Returning empty array.');
            return res.json({ success: true, data: [], message: 'NAAC documents table not yet created' });
        }

        res.status(500).json({ success: false, message: 'Server Error', data: [] });
    }
};

// POST /api/dashboard/naac/documents/upload - Placeholder for now, assumes middleware handles file
// POST /api/dashboard/naac/documents/upload
const uploadNaacDocument = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'ayush_college') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        const collegeId = req.user.college_id || req.user.userId;
        const { document_name, document_type, remarks } = req.body;

        let file_url = '';
        if (req.file) {
            file_url = `/uploads/${req.file.filename}`;
        }

        const result = await pool.query(
            `INSERT INTO college_naac_documents(college_id, document_name, document_type, file_url, status, remarks)
             VALUES($1, $2, $3, $4, 'Pending', $5) RETURNING *`,
            [collegeId, document_name || 'Untitled', document_type || 'General', file_url, remarks]
        );
        res.json({ success: true, data: result.rows[0], message: 'Document uploaded' });
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/dashboard/naac/timeline
// GET /api/dashboard/naac/timeline
const getNaacTimeline = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'ayush_college') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        const collegeId = req.user.college_id || req.user.userId;

        const result = await pool.query('SELECT * FROM college_naac_timeline WHERE college_id = $1 ORDER BY event_date ASC', [collegeId]);
        res.json({ success: true, data: result.rows || [] });
    } catch (error) {
        console.error('Error fetching NAAC timeline:', error);
        if (error.code === '42P01') {
            return res.json({ success: true, data: [], message: 'NAAC timeline table not yet created' });
        }
        res.status(500).json({ success: false, message: 'Server Error', data: [] });
    }
};

// GET /api/dashboard/naac/criteria
const getNaacCriteriaData = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'ayush_college') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        const collegeId = req.user.college_id || req.user.userId;
        // Ensure criteria exist
        const check = await pool.query('SELECT COUNT(*) FROM college_naac_criteria_scores WHERE college_id = $1', [collegeId]);
        if (parseInt(check.rows[0].count) === 0) {
            // Seed default limits
            const defaults = [
                { code: 1, name: 'Curricular Aspects', max: 150 },
                { code: 2, name: 'Teaching-Learning and Evaluation', max: 200 },
                { code: 3, name: 'Research, Innovations and Extension', max: 150 },
                { code: 4, name: 'Infrastructure and Learning Resources', max: 100 },
                { code: 5, name: 'Student Support and Progression', max: 100 },
                { code: 6, name: 'Governance, Leadership and Management', max: 100 },
                { code: 7, name: 'Institutional Values and Best Practices', max: 100 }
            ];

            for (const d of defaults) {
                await pool.query(
                    'INSERT INTO college_naac_criteria_scores(college_id, criterion_code, criterion_name, max_score, score, completion_percent) VALUES($1, $2, $3, $4, 0, 0)',
                    [collegeId, d.code, d.name, d.max]
                );
            }
        }

        // Alias columns to match frontend expectations (criteria_no, self_score, etc)
        const result = await pool.query(
            `SELECT 
                criterion_code as criteria_no, 
                criterion_name as criteria_name, 
                score as self_score, 
                max_score, 
                completion_percent,
                id
             FROM college_naac_criteria_scores 
             WHERE college_id = $1 
             ORDER BY criterion_code`,
            [collegeId]
        );
        res.json({ success: true, data: result.rows || [] });
    } catch (error) {
        console.error('Error fetching NAAC criteria:', error);
        if (error.code === '42P01') {
            return res.json({ success: true, data: [], message: 'NAAC criteria table not yet created' });
        }
        res.status(500).json({ success: false, message: 'Server Error', data: [] });
    }
};

// POST /api/dashboard/naac/criteria/update
// POST /api/dashboard/naac/criteria/update
const updateNaacCriteria = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'ayush_college') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        const { id, self_score, completion_percent } = req.body;

        if (!id) return res.status(400).json({ success: false, message: 'Criteria ID required' });

        const result = await pool.query(
            `UPDATE college_naac_criteria_scores SET score = $1, completion_percent = $2 WHERE id = $3 RETURNING *`,
            [self_score || 0, completion_percent || 0, id]
        );
        res.json({ success: true, data: result.rows[0], message: 'Criteria updated' });
    } catch (error) {
        console.error('Error updating criteria:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const submitNaacCompliance = async (req, res) => {
    if (req.user.role !== 'ayush_college') {
        return res.status(403).json({ success: false, message: 'Access denied: AYUSH College role required' });
    }
    const collegeId = req.user.college_id || req.user.userId;
    const { document_name, file_path, cycle } = req.body;

    try {
        // Use standard documents table
        const result = await pool.query(
            `INSERT INTO college_naac_documents(college_id, document_name, document_type, file_url, status, uploaded_at, remarks)
             VALUES($1, $2, 'COMPLIANCE_REPORT', $3, 'Submitted', NOW(), $4) RETURNING *`,
            [collegeId, document_name, file_path, 'Cycle ' + (cycle || 1)]
        );

        // AUTO-UPDATE: If there is a matching pending task, update it (Optional enhancement based on user req)
        // "When document uploaded: Task status auto-updates"
        // We might need to know WHICH task. But for now, just saving the document is step 1.

        res.json({ success: true, data: result.rows[0], message: 'Compliance document submitted' });
    } catch (error) {
        console.error('Error submitting compliance:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/dashboard/naac/overview
const getNaacOverview = async (req, res) => {
    if (req.user.role !== 'ayush_college') {
        return res.status(403).json({ success: false, message: 'Access denied: AYUSH College role required' });
    }
    const collegeId = req.user.college_id || req.user.userId;
    try {
        const statusResult = await pool.query('SELECT * FROM college_naac_status WHERE college_id = $1', [collegeId]);
        const status = statusResult.rows[0] || {};

        const tasksResult = await pool.query(
            `SELECT
COUNT(*) as total_tasks,
    COUNT(*) FILTER(WHERE status = 'Completed') as completed_tasks 
             FROM college_naac_compliance_tasks WHERE college_id = $1`,
            [collegeId]
        );
        const { total_tasks, completed_tasks } = tasksResult.rows[0];

        res.json({
            success: true,
            data: {
                status: status,
                progress: { total: parseInt(total_tasks || 0), completed: parseInt(completed_tasks || 0) }
            }
        });
    } catch (error) {
        console.error('Error fetching NAAC overview:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// POST /api/dashboard/incentives/apply
const applyIncentive = async (req, res) => {
    if (req.user.role !== 'ayush_college') {
        return res.status(403).json({ success: false, message: 'Access denied: AYUSH College role required' });
    }
    const collegeId = req.user.college_id || req.user.userId;
    const { incentive_type, amount } = req.body;
    const applicationId = 'INC-' + Date.now();

    try {
        const result = await pool.query(
            `INSERT INTO college_incentives(college_id, incentive_type, application_id, amount, status)
VALUES($1, $2, $3, $4, 'Under Review') RETURNING * `,
            [collegeId, incentive_type, applicationId, amount]
        );
        res.json({ success: true, data: result.rows[0], message: 'Incentive applied successfully' });
    } catch (error) {
        console.error('Error applying incentive:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/dashboard/incentives/payments
const getIncentivePayments = async (req, res) => {
    if (req.user.role !== 'ayush_college') {
        return res.status(403).json({ success: false, message: 'Access denied: AYUSH College role required' });
    }
    const collegeId = req.user.college_id || req.user.userId;
    try {
        const result = await pool.query(`
            SELECT ip.*, ci.incentive_type
            FROM incentive_payments ip
            JOIN college_incentives ci ON ip.incentive_id = ci.id
            WHERE ci.college_id = $1
            ORDER BY ip.created_at DESC`, // Use created_at if payment_date is null initially
            [collegeId]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching incentive payments:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// POST /api/dashboard/departments - Add new department
const addDepartment = async (req, res) => {
    if (req.user.role !== 'ayush_college') {
        return res.status(403).json({ success: false, message: 'Access denied: AYUSH College role required' });
    }
    const collegeId = req.user.college_id || req.user.userId;
    const { name, head_of_department, hod_phone, hod_email } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, message: 'Department name is required' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO college_departments(college_id, name, head_of_department, hod_phone, hod_email)
VALUES($1, $2, $3, $4, $5) RETURNING * `,
            [collegeId, name, head_of_department, hod_phone, hod_email]
        );
        res.json({ success: true, data: result.rows[0], message: 'Department added successfully' });
    } catch (error) {
        console.error('Error adding department:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// POST /api/dashboard/courses - Add new course
const addCourse = async (req, res) => {
    if (req.user.role !== 'ayush_college') {
        return res.status(403).json({ success: false, message: 'Access denied: AYUSH College role required' });
    }
    const collegeId = req.user.college_id || req.user.userId;
    const { department_id, course_name, course_type, intake_capacity } = req.body;

    if (!department_id || !course_name) {
        return res.status(400).json({ success: false, message: 'Department ID and course name are required' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO college_courses(college_id, department_id, course_name, course_type, intake_capacity)
VALUES($1, $2, $3, $4, $5) RETURNING * `,
            [collegeId, department_id, course_name, course_type || 'UG', intake_capacity || 0]
        );
        res.json({ success: true, data: result.rows[0], message: 'Course added successfully' });
    } catch (error) {
        console.error('Error adding course:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// POST /api/dashboard/students/bulk-upload - Bulk upload students
const bulkUploadStudents = async (req, res) => {
    if (req.user.role !== 'ayush_college') {
        return res.status(403).json({ success: false, message: 'Access denied: AYUSH College role required' });
    }
    const collegeId = req.user.college_id || req.user.userId;
    let enrollmentData = [];

    // 1. Parsing Logic
    if (req.file) {
        try {
            const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rawData = xlsx.utils.sheet_to_json(sheet);
            // Rough normalization of keys to simplified generic keys
            enrollmentData = rawData.map(row => {
                const newRow = {};
                Object.keys(row).forEach(k => {
                    const cleanKey = k.trim().toLowerCase();
                    if (cleanKey.includes('department id')) newRow.department_id = row[k];
                    else if (cleanKey.includes('department')) newRow.department_name = row[k];
                    else if (cleanKey.includes('course id')) newRow.course_id = row[k];
                    else if (cleanKey.includes('course')) newRow.course_name = row[k];
                    else if (cleanKey.includes('academic year')) newRow.academic_year = row[k];
                    else if (cleanKey.includes('total')) newRow.total_enrolled = row[k];
                    else if (cleanKey.includes('male')) newRow.male_count = row[k];
                    else if (cleanKey.includes('female')) newRow.female_count = row[k];
                    else newRow[cleanKey] = row[k];
                });
                return {
                    department_id: newRow.department_id || row['department_id'],
                    department_name: newRow.department_name || row['department_name'],
                    course_id: newRow.course_id || row['course_id'],
                    course_name: newRow.course_name || row['course_name'],
                    academic_year: newRow.academic_year || row['academic_year'],
                    total_enrolled: newRow.total_enrolled || row['total_enrolled'],
                    male_count: newRow.male_count || row['male_count'],
                    female_count: newRow.female_count || row['female_count']
                };
            });
        } catch (error) {
            console.error('Error parsing file:', error);
            return res.status(400).json({ success: false, message: 'Failed to parse Excel/CSV file' });
        }
    } else {
        enrollmentData = req.body.enrollmentData;
    }

    if (!Array.isArray(enrollmentData) || enrollmentData.length === 0) {
        return res.status(400).json({ success: false, message: 'Enrollment data array is required' });
    }

    // 2. Pre-fetch Lookups
    try {
        const deptsResult = await pool.query('SELECT id, name FROM college_departments WHERE college_id = $1', [collegeId]);
        const coursesResult = await pool.query('SELECT id, course_name, department_id FROM college_courses WHERE college_id = $1', [collegeId]);

        const deptMap = {};
        deptsResult.rows.forEach(d => deptMap[d.name.toLowerCase().trim()] = d.id);
        const courseMap = {};
        coursesResult.rows.forEach(c => courseMap[c.course_name.toLowerCase().trim()] = { id: c.id, deptId: c.department_id });

        const results = {
            total_rows: enrollmentData.length,
            inserted: 0,
            updated: 0,
            rejected: 0,
            errors: []
        };

        const affectedDepts = new Set();
        const AY_REGEX = /^\d{4}-\d{4}$/;

        // 3. Process Rows
        for (let i = 0; i < enrollmentData.length; i++) {
            const row = enrollmentData[i];
            let { department_id, department_name, course_id, course_name, academic_year, total_enrolled, male_count, female_count } = row;

            // Trim Strings
            if (typeof department_name === 'string') department_name = department_name.trim();
            if (typeof course_name === 'string') course_name = course_name.trim();
            if (typeof academic_year === 'string') academic_year = academic_year.trim();

            // Default Academic Year
            if (!academic_year) academic_year = '2024-2025';

            // Validate Academic Year
            if (!AY_REGEX.test(academic_year)) {
                results.rejected++;
                results.errors.push({ row: i + 1, error: `Invalid academic_year format: ${academic_year}. Expected YYYY-YYYY` });
                continue;
            }

            // ID Lookup
            if (!department_id && department_name) department_id = deptMap[department_name.toLowerCase()];
            if (!course_id && course_name) {
                const found = courseMap[course_name.toLowerCase()];
                if (found) {
                    course_id = found.id;
                    if (!department_id) department_id = found.deptId;
                }
            }
            if (!department_id && course_id) {
                const c = coursesResult.rows.find(x => x.id === course_id);
                if (c) department_id = c.department_id;
            }

            if (!course_id) {
                results.rejected++;
                results.errors.push({ row: i + 1, error: `Course not found: '${course_name || 'N/A'}'` });
                continue;
            }
            if (!department_id) {
                results.rejected++;
                results.errors.push({ row: i + 1, error: `Department not identifiable.` });
                continue;
            }

            // Calculations
            male_count = parseInt(male_count) || 0;
            female_count = parseInt(female_count) || 0;
            const computedTotal = male_count + female_count;
            // Use provided total if valid, else computed. Trust computed more if components exist.
            const finalTotal = computedTotal > 0 ? computedTotal : (parseInt(total_enrolled) || 0);

            // DB Upsert
            const existing = await pool.query(
                `SELECT id FROM college_student_enrollment 
                 WHERE college_id = $1 AND course_id = $2 AND academic_year = $3`,
                [collegeId, course_id, academic_year]
            );

            if (existing.rows.length > 0) {
                await pool.query(
                    `UPDATE college_student_enrollment 
                     SET total_enrolled = $1, male_count = $2, female_count = $3, department_id = $4
                     WHERE id = $5`,
                    [finalTotal, male_count, female_count, department_id, existing.rows[0].id]
                );
                results.updated++;
            } else {
                await pool.query(
                    `INSERT INTO college_student_enrollment(college_id, department_id, course_id, academic_year, total_enrolled, male_count, female_count)
                     VALUES($1, $2, $3, $4, $5, $6, $7)`,
                    [collegeId, department_id, course_id, academic_year, finalTotal, male_count, female_count]
                );
                results.inserted++;
            }
            affectedDepts.add(department_id);
        }

        // 4. Update Department Counts
        for (const deptId of affectedDepts) {
            await pool.query(`
                UPDATE college_departments 
                SET student_count = (
                    SELECT COALESCE(SUM(total_enrolled), 0) 
                    FROM college_student_enrollment 
                    WHERE department_id = $1
                ) 
                WHERE id = $1`,
                [deptId]
            );
        }

        res.json({ success: true, ...results, message: `Bulk upload processed. Inserted: ${results.inserted}, Updated: ${results.updated}, Rejected: ${results.rejected}` });

    } catch (error) {
        console.error('Error bulk uploading students:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const bulkUploadFaculty = async (req, res) => {
    if (req.user.role !== 'ayush_college') {
        return res.status(403).json({ success: false, message: 'Access denied: AYUSH College role required' });
    }
    const collegeId = req.user.college_id || req.user.userId;
    let facultyData = [];

    // Check if file payload (Excel/CSV via multer)
    if (req.file) {
        try {
            const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rawData = xlsx.utils.sheet_to_json(sheet);

            facultyData = rawData.map(row => ({
                name: row['Name'] || row['name'],
                department_id: row['Department ID'] || row['department_id'],
                designation: row['Designation'] || row['designation'],
                qualification: row['Qualification'] || row['qualification'],
                experience_years: row['Experience'] || row['experience_years'],
                email: row['Email'] || row['email'],
                phone: row['Phone'] || row['phone'],
                specialization: row['Specialization'] || row['specialization'],
                status: row['Status'] || row['status']
            }));
        } catch (error) {
            console.error('Error parsing file:', error);
            return res.status(400).json({ success: false, message: 'Failed to parse Excel/CSV file' });
        }
    } else {
        facultyData = req.body.facultyData;
    }

    if (!Array.isArray(facultyData) || facultyData.length === 0) {
        return res.status(400).json({ success: false, message: 'Faculty data array is required' });
    }

    try {
        const results = [];
        for (const record of facultyData) {
            const { name, designation, qualification, department_id, experience_years, email, phone, specialization, status } = record;

            const result = await pool.query(
                `INSERT INTO college_faculty(college_id, name, designation, qualification, department_id, experience_years, email, phone, specialization, status)
VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING * `,
                [collegeId, name, designation, qualification, department_id, experience_years || 0, email, phone, specialization, status || 'Active']
            );
            results.push(result.rows[0]);
        }
        res.json({ success: true, data: results, message: `Added ${results.length} faculty members` });
    } catch (error) {
        console.error('Error bulk uploading faculty:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// POST /api/dashboard/departments/bulk-upload - Bulk upload departments
const bulkUploadDepartments = async (req, res) => {
    if (req.user.role !== 'ayush_college') {
        return res.status(403).json({ success: false, message: 'Access denied: AYUSH College role required' });
    }
    const collegeId = req.user.college_id || req.user.userId;
    let departmentData = [];

    if (req.file) {
        try {
            const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rawData = xlsx.utils.sheet_to_json(sheet);

            departmentData = rawData.map(row => ({
                name: row['Department Name'] || row['name'],
                head_of_department: row['HOD Name'] || row['head_of_department'],
                hod_phone: row['HOD Phone'] || row['hod_phone'],
                hod_email: row['HOD Email'] || row['hod_email']
            }));
        } catch (error) {
            console.error('Error parsing file:', error);
            return res.status(400).json({ success: false, message: 'Failed to parse Excel/CSV file' });
        }
    } else {
        departmentData = req.body.departmentData;
    }

    if (!Array.isArray(departmentData) || departmentData.length === 0) {
        return res.status(400).json({ success: false, message: 'Department data array is required' });
    }

    try {
        const results = [];
        for (const record of departmentData) {
            const { name, head_of_department, hod_phone, hod_email } = record;

            // Check if exists
            const existing = await pool.query(
                `SELECT id FROM college_departments WHERE college_id = $1 AND name = $2`,
                [collegeId, name]
            );

            if (existing.rows.length > 0) {
                const updated = await pool.query(
                    `UPDATE college_departments 
                     SET head_of_department = $1, hod_phone = $2, hod_email = $3
                     WHERE id = $4 RETURNING * `,
                    [head_of_department, hod_phone, hod_email, existing.rows[0].id]
                );
                results.push({ action: 'updated', data: updated.rows[0] });
            } else {
                const inserted = await pool.query(
                    `INSERT INTO college_departments(college_id, name, head_of_department, hod_phone, hod_email)
VALUES($1, $2, $3, $4, $5) RETURNING * `,
                    [collegeId, name, head_of_department, hod_phone, hod_email]
                );
                results.push({ action: 'inserted', data: inserted.rows[0] });
            }
        }
        res.json({ success: true, data: results, message: `Processed ${results.length} departments` });
    } catch (error) {
        console.error('Error bulk uploading departments:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getOverview,
    getNaacProgress,
    getDepartments,
    getResearch,
    getIncentives,
    getNaacCriteria,
    getProfile,
    updateProfile,
    getFaculty,
    addFaculty,
    updateFaculty,
    deleteFaculty,
    getStudentEnrollment,
    updateStudentEnrollment,
    getNaacTasks,
    submitNaacCompliance,
    getNaacOverview,
    applyIncentive,
    getIncentivePayments,
    addDepartment,
    addCourse,
    bulkUploadStudents,
    bulkUploadFaculty,
    bulkUploadDepartments,
    // NAAC Phase 6
    trackPortalVisit,
    getNaacDocuments,
    uploadNaacDocument,
    getNaacTimeline,
    getNaacCriteriaData,
    updateNaacCriteria
};
