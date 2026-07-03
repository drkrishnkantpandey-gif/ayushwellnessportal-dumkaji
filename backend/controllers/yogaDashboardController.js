const db = require('../db');

/**
 * Get Overview data for Yoga Professional Dashboard
 */
exports.getOverview = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Get user and profile details
    const profileRes = await db.query(`
      SELECT 
        u.full_name, 
        u.email, 
        u.phone,
        p.ayush_id,
        p.profile_photo,
        p.approval_status,
        p.teaching_category,
        p.experience_years
      FROM users u
      LEFT JOIN yoga_professional_profile p ON u.id = p.user_id
      WHERE u.id = $1
    `, [userId]);

    if (profileRes.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profile = profileRes.rows[0];

    // 2. Get Certificate Status
    const certRes = await db.query(`
      SELECT status, expiry_date 
      FROM yoga_certificates 
      WHERE user_id = $1 
      ORDER BY created_at DESC LIMIT 1
    `, [userId]);

    const latestCert = certRes.rows[0] || null;
    let daysToExpiry = null;
    if (latestCert && latestCert.expiry_date) {
      const diffTime = new Date(latestCert.expiry_date) - new Date();
      daysToExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // 3. Get Reimbursement Status
    const reimbRes = await db.query(`
      SELECT status, amount 
      FROM reimbursement_applications 
      WHERE user_id = $1 
      ORDER BY created_at DESC LIMIT 1
    `, [userId]);
    const latestReimb = reimbRes.rows[0] || null;

    // 4. Total Sessions count
    const sessionsRes = await db.query(`
          SELECT COUNT(*) as total 
          FROM yoga_sessions 
          WHERE user_id = $1
        `, [userId]);

    // 5. Last Month Sessions
    const lastMonthSessionsRes = await db.query(`
          SELECT COUNT(*) as total 
          FROM yoga_sessions 
          WHERE user_id = $1 AND session_date >= NOW() - INTERVAL '1 month'
        `, [userId]);

    // 6. Next Payout Due (Approved but not PAID)
    const payoutRes = await db.query(`
          SELECT SUM(amount) as total 
          FROM reimbursement_applications 
          WHERE user_id = $1 AND status = 'APPROVED'
        `, [userId]);

    // 7. Recent Sessions (for table)
    const recentSessionsRes = await db.query(`
          SELECT session_date as date, address_display as centre, participants_count as participants, status
          FROM yoga_sessions 
          WHERE user_id = $1
          ORDER BY session_date DESC LIMIT 5
        `, [userId]);

    // 8. Recent Reimbursements (for table)
    const recentReimbRes = await db.query(`
          SELECT id, application_type, amount, status, updated_at
          FROM reimbursement_applications 
          WHERE user_id = $1
          ORDER BY created_at DESC LIMIT 5
        `, [userId]);

    // 9. Recent Notifications
    const notifRes = await db.query(`
          SELECT * FROM notifications 
          WHERE user_id = $1 
          ORDER BY created_at DESC LIMIT 5
        `, [userId]);

    // Calculate progress stage (1 to 4)
    let progressStage = 1; // Submitted
    if (profile.approval_status === 'UNDER_REVIEW') progressStage = 2;
    if (profile.approval_status === 'PENDING_FINAL') progressStage = 3;
    if (profile.approval_status === 'APPROVED') progressStage = 4;

    res.json({
      identity: {
        name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        ayushId: (profile.email === 'kritijoshi1108@gmail.com') ? (profile.ayush_id || 'AYUSH-Y-1002') : (profile.ayush_id || 'NOT_ASSIGNED'),
        profilePhoto: profile.profile_photo,
        category: profile.teaching_category
      },
      stats: {
        pendingApplications: (latestCert && latestCert.status === 'PENDING' ? 1 : 0) + (latestReimb && latestReimb.status === 'SUBMITTED' ? 1 : 0),
        lastMonthSessions: parseInt(lastMonthSessionsRes.rows[0].total) || 0,
        nextPayout: parseFloat(payoutRes.rows[0].total) || 0
      },
      progress: {
        stage: progressStage,
        status: profile.approval_status
      },
      recentSessions: recentSessionsRes.rows,
      recentReimbursements: recentReimbRes.rows,
      statusCards: {
        profileStatus: profile.approval_status,
        certificateStatus: latestCert ? latestCert.status : 'NOT_UPLOADED',
        expiryDays: daysToExpiry,
        reimbursementStatus: latestReimb ? latestReimb.status : 'NO_APPLICATIONS',
        totalSessions: parseInt(sessionsRes.rows[0].total) || 0
      },
      notifications: notifRes.rows
    });

  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
