const { Pool } = require('pg');
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
    const collegeId = req.user.userId; // Extracted from JWT

    try {
        // 1. Get College Name (optional, but good for welcome message)
        const collegeName = await getCollegeName(collegeId);

        // 2. Get NAAC Status
        const naacStatusResult = await pool.query(
            'SELECT accreditation_grade, application_status FROM college_naac_status WHERE college_id = $1',
            [collegeId]
        );
        const naacStatus = naacStatusResult.rows[0] || { accreditation_grade: 'Not Accredited', application_status: 'Not Started' };

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
                naacGrade: naacStatus.accreditation_grade,
                totalStudents,
                pendingIncentive
            }
        });
    } catch (error) {
        console.error('Error fetching overview:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/dashboard/naac-progress
const getNaacProgress = async (req, res) => {
    const collegeId = req.user.userId;

    try {
        const result = await pool.query(
            'SELECT step_name, is_completed, completion_date, display_order FROM college_naac_progress WHERE college_id = $1 ORDER BY display_order ASC',
            [collegeId]
        );

        // If no data, return default steps structure (mock-like but empty)
        if (result.rows.length === 0) {
            return res.json({
                success: true,
                data: [
                    { step: "SSR Submitted", completed: false, date: "-" },
                    { step: "Data Validation", completed: false, date: "-" },
                    { step: "Peer Team Visit", completed: false, date: "-" },
                    { step: "Final Accreditation", completed: false, date: "-" }
                ]
            });
        }

        // Format for frontend
        const formattedData = result.rows.map(row => ({
            step: row.step_name,
            completed: row.is_completed,
            date: row.completion_date ? new Date(row.completion_date).toISOString().split('T')[0] : (row.is_completed ? 'Completed' : 'Pending')
        }));

        res.json({ success: true, data: formattedData });

    } catch (error) {
        console.error('Error fetching NAAC progress:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/dashboard/departments
const getDepartments = async (req, res) => {
    const collegeId = req.user.userId;

    try {
        const result = await pool.query(
            'SELECT name, head_of_department, student_count, faculty_count, course_count FROM college_departments WHERE college_id = $1 ORDER BY name ASC',
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
    const collegeId = req.user.userId;

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
    const collegeId = req.user.userId;

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
    const collegeId = req.user.userId;

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

module.exports = {
    getOverview,
    getNaacProgress,
    getDepartments,
    getResearch,
    getIncentives,
    getNaacCriteria
};
