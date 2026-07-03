const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Helper for audit logs (duplicate of dashboardController due to separation)
const createAuditLog = async (userId, collegeId, action, section, details) => {
    try {
        await pool.query(
            `INSERT INTO audit_logs (user_id, college_id, action, section, details)
             VALUES ($1, $2, $3, $4, $5)`,
            [userId, collegeId, action, section, JSON.stringify(details)]
        );
    } catch (auditError) {
        console.error('Audit log failed:', auditError);
    }
};

const getFaculty = async (req, res) => {
    const collegeId = req.user.userId;
    console.log(`[DEBUG] getFaculty called for collegeId: ${collegeId}`);
    try {
        const result = await pool.query(
            `SELECT f.*, d.name as department_name 
             FROM college_faculty f
             LEFT JOIN college_departments d ON f.department_id = d.id
             WHERE f.college_id = $1
             ORDER BY f.name ASC`,
            [collegeId]
        );
        console.log(`[DEBUG] getFaculty returning ${result.rows.length} rows`);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching faculty:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const addFaculty = async (req, res) => {
    const collegeId = req.user.userId;
    const { name, designation, qualification, experience_years, specialization, email, phone, joining_date, department_id, publications_count } = req.body;
    console.log(`[DEBUG] addFaculty called. User: ${JSON.stringify(req.user)}, Body: ${JSON.stringify(req.body)}`);

    try {
        const result = await pool.query(
            `INSERT INTO college_faculty 
             (college_id, department_id, name, designation, qualification, experience_years, specialization, email, phone, joining_date, publications_count)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING *`,
            [collegeId, department_id, name, designation, qualification, experience_years || 0, specialization, email, phone, joining_date, publications_count || 0]
        );

        console.log(`[DEBUG] addFaculty success. Created ID: ${result.rows[0].id}`);

        await createAuditLog(req.user.userId, collegeId, 'ADD_FACULTY', 'Faculty', { facultyId: result.rows[0].id, name });

        // Update department faculty count
        if (department_id) {
            await pool.query(
                `UPDATE college_departments SET faculty_count = faculty_count + 1 WHERE id = $1`,
                [department_id]
            );
        }

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('[DEBUG] addFaculty Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const updateFaculty = async (req, res) => {
    const collegeId = req.user.userId;
    const { id } = req.params;
    const { name, designation, qualification, experience_years, specialization, email, phone, joining_date, department_id, status, publications_count } = req.body;

    try {
        // Build update query dynamically
        const result = await pool.query(
            `UPDATE college_faculty 
             SET name=$1, designation=$2, qualification=$3, experience_years=$4, specialization=$5, 
                 email=$6, phone=$7, joining_date=$8, department_id=$9, status=$10, publications_count=$11, updated_at=CURRENT_TIMESTAMP
             WHERE id=$12 AND college_id=$13
             RETURNING *`,
            [name, designation, qualification, experience_years, specialization, email, phone, joining_date, department_id, status || 'Active', publications_count, id, collegeId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Faculty not found' });
        }

        await createAuditLog(req.user.userId, collegeId, 'UPDATE_FACULTY', 'Faculty', { facultyId: id, name });

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error updating faculty:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const deleteFaculty = async (req, res) => {
    const collegeId = req.user.userId;
    const { id } = req.params;

    try {
        // Get department_id before delete to update count
        const faculty = await pool.query('SELECT department_id FROM college_faculty WHERE id = $1 AND college_id = $2', [id, collegeId]);

        const result = await pool.query(
            'DELETE FROM college_faculty WHERE id = $1 AND college_id = $2 RETURNING *',
            [id, collegeId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Faculty not found' });
        }

        if (faculty.rows.length > 0 && faculty.rows[0].department_id) {
            await pool.query(
                `UPDATE college_departments SET faculty_count = GREATEST(faculty_count - 1, 0) WHERE id = $1`,
                [faculty.rows[0].department_id]
            );
        }

        await createAuditLog(req.user.userId, collegeId, 'DELETE_FACULTY', 'Faculty', { facultyId: id, name: result.rows[0].name });

        res.json({ success: true, message: 'Faculty deleted successfully' });
    } catch (error) {
        console.error('Error deleting faculty:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getFaculty,
    addFaculty,
    updateFaculty,
    deleteFaculty,
    importFaculty: async (req, res) => {
        const collegeId = req.user.userId;
        const facultyData = req.body;
        const client = await pool.connect();
        let results = { success: [], failed: [] };

        try {
            console.log(`[DEBUG] importFaculty started. CollegeId: ${collegeId}, Rows: ${facultyData.length}`);
            await client.query('BEGIN');

            // Get existing departments for mapping
            const deptResult = await client.query('SELECT id, LOWER(name) as name FROM college_departments WHERE college_id = $1', [collegeId]);
            const deptMap = {};
            deptResult.rows.forEach(d => deptMap[d.name] = d.id);

            for (const item of facultyData) {
                try {
                    // Map headers flexibly
                    const nameStr = item["Faculty Name"] || item["name"] || item["Full Name"];
                    const deptStr = item["Department"] || item["department_name"] || item["department"];
                    const emailStr = item["Email"] || item["email_id"] || item["email"];
                    const phoneStr = item["Phone"] || item["mobile"] || item["phone"];
                    const designation = item["Designation"] || item["designation"] || "Assistant Professor";
                    const qualification = item["Qualification"] || item["qualification"];
                    const experience = parseInt(item["Experience"] || item["experience_years"] || 0);
                    const specialization = item["Specialization"] || item["specialization"];
                    const publications = parseInt(item["Publications"] || item["publications_count"] || 0);
                    const joiningDate = item["Joining Date"] || item["joining_date"] || new Date().toISOString().split('T')[0];

                    const deptName = deptStr?.toLowerCase().trim();
                    const deptId = deptMap[deptName];

                    if (!deptId) {
                        results.failed.push({
                            name: nameStr || "Unknown",
                            reason: `Department '${deptStr}' not found.`
                        });
                        continue;
                    }

                    if (!emailStr) {
                        results.failed.push({
                            name: nameStr || "Unknown",
                            reason: "Email is required for faculty records."
                        });
                        continue;
                    }

                    // Check if faculty exists by email and college_id
                    const checkRes = await client.query('SELECT id FROM college_faculty WHERE email = $1 AND college_id = $2', [emailStr, collegeId]);

                    let facultyId;
                    if (checkRes.rows.length > 0) {
                        // Update
                        facultyId = checkRes.rows[0].id;
                        await client.query(
                            `UPDATE college_faculty 
                             SET department_id=$1, name=$2, designation=$3, qualification=$4, experience_years=$5, 
                                 specialization=$6, phone=$7, joining_date=$8, publications_count=$9, updated_at=CURRENT_TIMESTAMP
                             WHERE id=$10`,
                            [deptId, nameStr, designation, qualification, experience, specialization, phoneStr, joiningDate, publications, facultyId]
                        );
                    } else {
                        // Insert
                        const insertRes = await client.query(
                            `INSERT INTO college_faculty 
                             (college_id, department_id, name, designation, qualification, experience_years, specialization, email, phone, joining_date, publications_count)
                             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                             RETURNING id`,
                            [collegeId, deptId, nameStr, designation, qualification, experience, specialization, emailStr, phoneStr, joiningDate, publications]
                        );
                        facultyId = insertRes.rows[0].id;
                    }

                    // Update department faculty count (aggregate count for accuracy)
                    await client.query(
                        `UPDATE college_departments 
                         SET faculty_count = (SELECT COUNT(*) FROM college_faculty WHERE department_id = $1) 
                         WHERE id = $1`,
                        [deptId]
                    );

                    results.success.push({ id: facultyId, name: nameStr });

                } catch (rowErr) {
                    console.error(`[DEBUG] Faculty Row Error:`, rowErr);
                    results.failed.push({ name: item["Faculty Name"] || "Unknown", reason: rowErr.message });
                    throw rowErr; // Rollback transaction
                }
            }

            await client.query('COMMIT');
            console.log(`[DEBUG] importFaculty committed. Success: ${results.success.length}, Failed: ${results.failed.length}`);
            res.json({ success: true, ...results });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('[DEBUG] importFaculty FAILED & ROLLED BACK:', error);
            res.status(500).json({ success: false, message: 'Bulk Import Failed', error: error.message });
        } finally {
            client.release();
        }
    }
};
