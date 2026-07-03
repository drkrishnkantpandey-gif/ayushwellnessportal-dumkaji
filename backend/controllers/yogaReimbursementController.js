const db = require('../db');

/**
 * Submit Reimbursement Application
 */
exports.submitApplication = async (req, res) => {
    const userId = req.user.id;
    const { applicationType, amount } = req.body;
    const receiptPath = req.file ? req.file.path : null;

    if (!receiptPath) {
        return res.status(400).json({ message: 'Fee receipt is required' });
    }

    try {
        // 1. Get current bank details from profile
        const profile = await db.query('SELECT bank_account_no, bank_ifsc FROM yoga_professional_profile WHERE user_id = $1', [userId]);

        if (!profile.rows[0]?.bank_account_no) {
            return res.status(400).json({ message: 'Please update your bank details in Profile Management first.' });
        }

        const { bank_account_no, bank_ifsc } = profile.rows[0];

        // 2. Insert application
        const result = await db.query(`
      INSERT INTO reimbursement_applications (
        user_id, application_type, amount, receipt_path, bank_account_no, bank_ifsc, status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'SUBMITTED')
      RETURNING *
    `, [userId, applicationType, amount, receiptPath, bank_account_no, bank_ifsc]);

        res.status(201).json({
            message: 'Reimbursement application submitted successfully.',
            application: result.rows[0]
        });
    } catch (error) {
        console.error('Error submitting reimbursement:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Get Reimbursement Applications
 */
exports.getApplications = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await db.query('SELECT * FROM reimbursement_applications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching reimbursements:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
