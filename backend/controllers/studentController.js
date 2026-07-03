const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const getEnrollment = async (req, res) => {
    const collegeId = req.user.userId;
    console.log(`[STAGE 5] getEnrollment START. CollegeId: ${collegeId}`);
    try {
        const result = await pool.query(
            `SELECT e.*, c.course_name, d.name as department_name 
             FROM college_student_enrollment e
             JOIN college_courses c ON e.course_id = c.id
             JOIN college_departments d ON e.department_id = d.id
             WHERE e.college_id = $1
             ORDER BY d.name, c.course_name`,
            [collegeId]
        );
        console.log(`[STAGE 5] getEnrollment END. Records Found: ${result.rows.length}`);
        console.log("FETCH COUNT:", result.rows.length); // Step 6
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('[DEBUG] getEnrollment Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const getCourses = async (req, res) => {
    const collegeId = req.user.userId;
    console.log(`[DEBUG] getCourses called for collegeId: ${collegeId}`);
    try {
        const result = await pool.query(
            `SELECT c.*, d.name as department_name 
             FROM college_courses c
             JOIN college_departments d ON c.department_id = d.id
             WHERE c.college_id = $1
             ORDER BY c.course_name`,
            [collegeId]
        );
        console.log(`[DEBUG] getCourses returning ${result.rows.length} rows`);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('[DEBUG] getCourses Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const addCourse = async (req, res) => {
    const collegeId = req.user.userId;
    const { department_id, course_name, course_type, intake_capacity } = req.body;
    console.log(`[DEBUG] addCourse called. Body: ${JSON.stringify(req.body)}`);

    try {
        const result = await pool.query(
            `INSERT INTO college_courses (college_id, department_id, course_name, course_type, intake_capacity)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [collegeId, department_id, course_name, course_type, intake_capacity]
        );

        console.log(`[DEBUG] addCourse success. ID: ${result.rows[0].id}`);

        // Update department course count
        await pool.query(
            `UPDATE college_departments SET course_count = course_count + 1 WHERE id = $1`,
            [department_id]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('[DEBUG] addCourse Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const updateEnrollment = async (req, res) => {
    const collegeId = req.user.userId;
    const { course_id, department_id, academic_year, male_count, female_count, intake_capacity } = req.body;
    console.log(`[DEBUG] ========== UPDATE ENROLLMENT START ==========`);
    console.log(`[DEBUG] Request Body:`, JSON.stringify(req.body, null, 2));
    console.log(`[DEBUG] College ID: ${collegeId}`);

    const total = parseInt(male_count) + parseInt(female_count);
    console.log(`[DEBUG] Calculated Total: ${total} (${male_count} + ${female_count})`);

    // Use transaction for consistency
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        console.log(`[DEBUG] Transaction started`);

        // Update enrollment data
        const enrollmentResult = await client.query(
            `INSERT INTO college_student_enrollment (college_id, department_id, course_id, academic_year, male_count, female_count, total_enrolled)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (college_id, course_id, academic_year) 
             DO UPDATE SET 
             male_count = EXCLUDED.male_count, 
             female_count = EXCLUDED.female_count, 
             total_enrolled = EXCLUDED.total_enrolled,
             updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [collegeId, department_id, course_id, academic_year, male_count, female_count, total]
        );

        console.log(`[DEBUG] Enrollment UPDATE successful. Row:`, JSON.stringify(enrollmentResult.rows[0], null, 2));

        // Update intake_capacity if provided
        if (intake_capacity !== undefined && intake_capacity !== null) {
            const courseUpdateResult = await client.query(
                `UPDATE college_courses 
                 SET intake_capacity = $1, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = $2 AND college_id = $3
                 RETURNING *`,
                [intake_capacity, course_id, collegeId]
            );
            console.log(`[DEBUG] Course intake_capacity UPDATE successful. Row:`, JSON.stringify(courseUpdateResult.rows[0], null, 2));
        }

        // Update department student count (aggregate)
        await client.query(
            `UPDATE college_departments SET student_count = (
                SELECT COALESCE(SUM(total_enrolled), 0) FROM college_student_enrollment 
                WHERE department_id = $1
            ) WHERE id = $1`,
            [department_id]
        );
        console.log(`[DEBUG] Department student_count updated for dept_id: ${department_id}`);

        await client.query('COMMIT');
        console.log(`[DEBUG] Transaction COMMITTED`);

        // Fetch updated course data to return complete info
        const courseResult = await pool.query(
            'SELECT intake_capacity FROM college_courses WHERE id = $1',
            [course_id]
        );

        const responseData = {
            ...enrollmentResult.rows[0],
            intake_capacity: courseResult.rows[0]?.intake_capacity
        };

        console.log(`[DEBUG] Final response data:`, JSON.stringify(responseData, null, 2));
        console.log(`[DEBUG] ========== UPDATE ENROLLMENT END (SUCCESS) ==========`);

        res.json({
            success: true,
            data: responseData
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('[DEBUG] ========== UPDATE ENROLLMENT FAILED ==========');
        console.error('[DEBUG] Error:', error);
        console.error('[DEBUG] Stack:', error.stack);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    } finally {
        client.release();
    }
};

module.exports = {
    getEnrollment,
    getCourses,
    addCourse,
    updateEnrollment,
    importEnrollment: async (req, res) => {
        const collegeId = req.user.userId;
        const enrollmentData = req.body;
        const client = await pool.connect();
        let results = { success: [], failed: [] };

        try {
            console.log("IMPORT HIT"); // Step 3
            console.log("BODY LENGTH:", enrollmentData.length); // Step 3
            console.log("COLLEGE ID:", collegeId); // Step 3
            console.log(`[STAGE 2] importEnrollment HIT. CollegeId: ${collegeId}, Rows: ${enrollmentData.length}`);
            await client.query('BEGIN');

            // Maps for lookup
            const deptResult = await client.query('SELECT id, LOWER(name) as name FROM college_departments WHERE college_id = $1', [collegeId]);
            const courseResult = await client.query('SELECT id, LOWER(course_name) as name, department_id FROM college_courses WHERE college_id = $1', [collegeId]);

            const deptMap = {};
            deptResult.rows.forEach(d => deptMap[d.name] = d.id);
            const courseMap = {};
            courseResult.rows.forEach(c => courseMap[c.name] = c);

            for (const item of enrollmentData) {
                try {
                    // Log the row we are processing for deeper debugging
                    // console.log(`[DEBUG] Processing row: ${JSON.stringify(item)}`);

                    // Map headers flexibly
                    const deptStr = item["Department"] || item["department"];
                    const courseStr = item["Course"] || item["course_name"] || item["course"];
                    const maleCount = parseInt(item["Male"] || item["male_count"] || 0);
                    const femaleCount = parseInt(item["Female"] || item["female_count"] || 0);
                    const intakeCap = item["Intake Capacity"] || item["intake_capacity"];
                    const academicYear = item["Academic Year"] || item["academic_year"] || "2024-2025";
                    const totalFromCsv = parseInt(item["Enrolled"] || item["total_enrolled"] || 0);

                    const deptName = deptStr?.toLowerCase().trim();
                    const courseName = courseStr?.toLowerCase().trim();

                    const deptId = deptMap[deptName];
                    const course = courseMap[courseName];

                    if (!deptId) {
                        results.failed.push({
                            name: deptStr || "Unknown Dept",
                            reason: `Department '${deptStr}' not found in your institution.`
                        });
                        continue;
                    }

                    if (!course || course.department_id !== deptId) {
                        results.failed.push({
                            name: courseStr || "Unknown Course",
                            reason: `Course '${courseStr}' not found in department '${deptStr}'.`
                        });
                        continue;
                    }

                    // Use the higher of CSV total or M+F sum to be safe, or just M+F
                    const total = Math.max(maleCount + femaleCount, totalFromCsv);

                    // Update enrollment
                    const enrollRes = await client.query(
                        `INSERT INTO college_student_enrollment 
                         (college_id, department_id, course_id, academic_year, male_count, female_count, total_enrolled)
                         VALUES ($1, $2, $3, $4, $5, $6, $7)
                         ON CONFLICT (college_id, course_id, academic_year) 
                         DO UPDATE SET 
                         male_count = EXCLUDED.male_count, 
                         female_count = EXCLUDED.female_count, 
                         total_enrolled = EXCLUDED.total_enrolled,
                         updated_at = CURRENT_TIMESTAMP
                         RETURNING id`,
                        [collegeId, deptId, course.id, academicYear, maleCount, femaleCount, total]
                    );

                    console.log("INSERTING ROW:", courseStr); // Step 4
                    console.log("SQL RESULT:", enrollRes.rowCount); // Step 4

                    // Update intake capacity if provided in CSV
                    if (intakeCap !== undefined && intakeCap !== "") {
                        await client.query(
                            'UPDATE college_courses SET intake_capacity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND college_id = $3',
                            [parseInt(intakeCap), course.id, collegeId]
                        );
                        console.log(`[STAGE 3] Intake Updated: ${courseStr} -> ${intakeCap}`);
                    }

                    // Update department student count (aggregate)
                    await client.query(
                        `UPDATE college_departments SET student_count = (
                            SELECT COALESCE(SUM(total_enrolled), 0) FROM college_student_enrollment 
                            WHERE department_id = $1
                        ) WHERE id = $1`,
                        [deptId]
                    );
                    console.log(`[STAGE 3] Dept Counts Refreshed: ${deptStr}`);

                    results.success.push({ name: courseStr, id: enrollRes.rows[0].id });
                    console.log(`[STAGE 3] Row SUCCESS: ${courseStr} (ID: ${enrollRes.rows[0].id})`);

                } catch (rowErr) {
                    console.error(`[STAGE 3] Row FAILED:`, rowErr);
                    results.failed.push({ name: item["Course"] || "Unknown", reason: rowErr.message });
                    throw rowErr;
                }
            }

            await client.query('COMMIT');
            console.log(`[STAGE 3] importEnrollment COMMITTED. Success: ${results.success.length}, Failed: ${results.failed.length}`);
            res.json({ success: true, ...results });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('[DEBUG] importEnrollment FAILED & ROLLED BACK:', error);
            res.status(500).json({ success: false, message: 'Bulk Import Failed', error: error.message });
        } finally {
            client.release();
        }
    }
};
