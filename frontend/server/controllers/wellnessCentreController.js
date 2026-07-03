// server/controllers/wellnessCentreController.js
const db = require("../db");

// Helper to get centre_id from req.user.userId
async function getCentreId(userId) {
  const result = await db.query(
    "SELECT id FROM wellness_centres WHERE user_id = $1",
    [userId]
  );
  if (result.rows.length === 0) return null;
  return result.rows[0].id;
}

// GET /api/wellness/dashboard
async function getWellnessCentreDashboard(req, res) {
  try {
    const userId = req.user.userId;
    const centreId = await getCentreId(userId);

    if (!centreId) {
      return res.status(404).json({ message: "Wellness centre not found" });
    }

    // Total programs
    const programsRes = await db.query(
      "SELECT COUNT(*) FROM wellness_programs WHERE centre_id = $1",
      [centreId]
    );

    // Total staff
    const staffRes = await db.query(
      "SELECT COUNT(*) FROM wellness_staff WHERE centre_id = $1",
      [centreId]
    );

    // Total sessions
    const sessionsRes = await db.query(
      "SELECT COUNT(*) FROM wellness_sessions WHERE centre_id = $1",
      [centreId]
    );

    // Incentives summary (PENDING amount)
    const incentivesRes = await db.query(
      "SELECT SUM(amount) as total FROM incentive_applications WHERE centre_id = $1 AND status = 'SUBMITTED'",
      [centreId]
    );

    res.json({
      success: true,
      data: {
        totalPrograms: parseInt(programsRes.rows[0].count),
        totalStaff: parseInt(staffRes.rows[0].count),
        totalSessions: parseInt(sessionsRes.rows[0].count),
        pendingIncentives: parseFloat(incentivesRes.rows[0].total || 0),
      }
    });
  } catch (err) {
    console.error("Error in getWellnessCentreDashboard:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// GET /api/wellness/programs
async function getPrograms(req, res) {
  try {
    const userId = req.user.userId;
    const centreId = await getCentreId(userId);
    const result = await db.query(
      "SELECT * FROM wellness_programs WHERE centre_id = $1 ORDER BY created_at DESC",
      [centreId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error in getPrograms:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// POST /api/wellness/programs
async function addProgram(req, res) {
  try {
    const userId = req.user.userId;
    const centreId = await getCentreId(userId);
    const { programName, description, duration, fees, status } = req.body;

    const result = await db.query(
      `INSERT INTO wellness_programs (centre_id, name, description, duration, fees, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [centreId, programName, description, duration, fees, status || 'ACTIVE']
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error in addProgram:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// PUT /api/wellness/programs/:id
async function updateProgram(req, res) {
  try {
    const userId = req.user.userId;
    const centreId = await getCentreId(userId);
    const { id } = req.params;
    const { programName, description, duration, fees, status } = req.body;

    const result = await db.query(
      `UPDATE wellness_programs 
       SET name = $1, description = $2, duration = $3, fees = $4, status = $5, updated_at = NOW()
       WHERE id = $6 AND centre_id = $7
       RETURNING *`,
      [programName, description, duration, fees, status, id, centreId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Program not found" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error in updateProgram:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// GET /api/wellness/staff
async function getStaff(req, res) {
  try {
    const userId = req.user.userId;
    const centreId = await getCentreId(userId);
    const result = await db.query(
      "SELECT * FROM wellness_staff WHERE centre_id = $1 ORDER BY full_name ASC",
      [centreId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error in getStaff:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// POST /api/wellness/staff
async function addStaff(req, res) {
  try {
    const userId = req.user.userId;
    const centreId = await getCentreId(userId);
    const { fullName, role, qualification, experience, contactInfo, status } = req.body;

    const result = await db.query(
      `INSERT INTO wellness_staff (centre_id, full_name, role, qualification, experience, contact_info, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [centreId, fullName, role, qualification, experience, contactInfo, status || 'ACTIVE']
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error in addStaff:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// GET /api/wellness/sessions
async function getSessions(req, res) {
  try {
    const userId = req.user.userId;
    const centreId = await getCentreId(userId);
    const result = await db.query(
      `SELECT s.*, p.name as program_name, st.full_name as staff_name 
       FROM wellness_sessions s
       JOIN wellness_programs p ON s.program_id = p.id
       JOIN wellness_staff st ON s.staff_id = st.id
       WHERE s.centre_id = $1 
       ORDER BY s.session_date DESC`,
      [centreId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error in getSessions:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// POST /api/wellness/sessions
async function addSession(req, res) {
  try {
    const userId = req.user.userId;
    const centreId = await getCentreId(userId);
    const { programId, staffId, date, numberOfParticipants } = req.body;

    const result = await db.query(
      `INSERT INTO wellness_sessions (centre_id, program_id, staff_id, session_date, participants_count)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [centreId, programId, staffId, date, numberOfParticipants]
    );

    // Update program participant count (optional but nice)
    await db.query(
      "UPDATE wellness_programs SET participants_count = participants_count + $1 WHERE id = $2",
      [numberOfParticipants, programId]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error in addSession:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// GET /api/wellness/incentives
async function getIncentives(req, res) {
  try {
    const userId = req.user.userId;
    const centreId = await getCentreId(userId);
    const result = await db.query(
      "SELECT * FROM incentive_applications WHERE centre_id = $1 ORDER BY last_updated DESC",
      [centreId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error in getIncentives:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// DELETE /api/wellness/programs/:id
async function deleteProgram(req, res) {
  try {
    const userId = req.user.userId;
    const centreId = await getCentreId(userId);
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM wellness_programs WHERE id = $1 AND centre_id = $2 RETURNING *",
      [id, centreId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Program not found" });
    }
    res.json({ success: true, message: "Program deleted successfully" });
  } catch (err) {
    console.error("Error in deleteProgram:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// PUT /api/wellness/staff/:id
async function updateStaff(req, res) {
  try {
    const userId = req.user.userId;
    const centreId = await getCentreId(userId);
    const { id } = req.params;
    const { fullName, role, qualification, experience, contactInfo, status } = req.body;

    const result = await db.query(
      `UPDATE wellness_staff 
       SET full_name = $1, role = $2, qualification = $3, experience = $4, contact_info = $5, status = $6, updated_at = NOW()
       WHERE id = $7 AND centre_id = $8
       RETURNING *`,
      [fullName, role, qualification, experience, contactInfo, status, id, centreId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Staff not found" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error in updateStaff:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// DELETE /api/wellness/staff/:id
async function deleteStaff(req, res) {
  try {
    const userId = req.user.userId;
    const centreId = await getCentreId(userId);
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM wellness_staff WHERE id = $1 AND centre_id = $2 RETURNING *",
      [id, centreId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Staff member not found" });
    }
    res.json({ success: true, message: "Staff member deleted successfully" });
  } catch (err) {
    console.error("Error in deleteStaff:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// DELETE /api/wellness/sessions/:id
async function deleteSession(req, res) {
  try {
    const userId = req.user.userId;
    const centreId = await getCentreId(userId);
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM wellness_sessions WHERE id = $1 AND centre_id = $2 RETURNING *",
      [id, centreId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.json({ success: true, message: "Session deleted successfully" });
  } catch (err) {
    console.error("Error in deleteSession:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// POST /api/wellness/incentives
async function addIncentive(req, res) {
  try {
    const userId = req.user.userId;
    const centreId = await getCentreId(userId);
    const { title, description, amount, status } = req.body;
    const applicationCode = 'INC' + Date.now().toString().slice(-8);

    const result = await db.query(
      `INSERT INTO incentive_applications (centre_id, type, amount, status, application_code, last_updated)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [centreId, title, amount, status || 'SUBMITTED', applicationCode]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error in addIncentive:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// GET /api/wellness/profile
async function getCentreProfile(req, res) {
  try {
    const userId = req.user.userId;
    const result = await db.query(
      "SELECT * FROM wellness_centres WHERE user_id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Wellness centre profile not found" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error in getCentreProfile:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// PUT /api/wellness/profile
async function updateCentreProfile(req, res) {
  try {
    const userId = req.user.userId;
    const { name, address, contact_person, contact_email, contact_phone, accreditation_level, registration_valid_to } = req.body;

    const result = await db.query(
      `UPDATE wellness_centres 
       SET name = $1, address = $2, contact_person = $3, contact_email = $4, contact_phone = $5, 
           accreditation_level = $6, registration_valid_to = $7, updated_at = NOW()
       WHERE user_id = $8
       RETURNING *`,
      [name, address, contact_person, contact_email, contact_phone, accreditation_level, registration_valid_to, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Wellness centre not found" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error in updateCentreProfile:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// GET /api/wellness/pending-actions
async function getPendingActions(req, res) {
  try {
    const userId = req.user.userId;
    const centreId = await getCentreId(userId);

    const pendingActions = [];

    // Check staff
    const staffRes = await db.query("SELECT COUNT(*) FROM wellness_staff WHERE centre_id = $1", [centreId]);
    if (parseInt(staffRes.rows[0].count) === 0) {
      pendingActions.push({ id: 'add_staff', title: "Add your first therapist or staff member", priority: 'high' });
    }

    // Check programs
    const progRes = await db.query("SELECT COUNT(*) FROM wellness_programs WHERE centre_id = $1", [centreId]);
    if (parseInt(progRes.rows[0].count) === 0) {
      pendingActions.push({ id: 'create_program', title: "Create a wellness program to start", priority: 'high' });
    }

    // Check documents
    const docRes = await db.query("SELECT COUNT(*) FROM wellness_documents WHERE centre_id = $1", [centreId]);
    if (parseInt(docRes.rows[0].count) === 0) {
      pendingActions.push({ id: 'upload_docs', title: "Upload required registration documents", priority: 'medium' });
    }

    // Static placeholder for now as requested
    pendingActions.push({ id: 'report_pending', title: "Wellness program report pending submission", priority: 'low' });

    res.json({ success: true, data: pendingActions });
  } catch (err) {
    console.error("Error in getPendingActions:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// POST /api/wellness/documents
async function uploadDocuments(req, res) {
  try {
    const userId = req.user.userId;
    const centreId = await getCentreId(userId);

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const fileQueries = Object.keys(req.files).map(field => {
      const fileList = req.files[field];
      return fileList.map(file => {
        return db.query(
          `INSERT INTO wellness_documents (centre_id, document_type, file_path, file_name)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [centreId, field, file.path, file.originalname]
        );
      });
    }).flat();

    const results = await Promise.all(fileQueries);
    res.status(201).json({ success: true, message: "Documents uploaded successfully", data: results.map(r => r.rows[0]) });
  } catch (err) {
    console.error("Error in uploadDocuments:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// GET /api/wellness/public-profile/:id
async function getPublicProfile(req, res) {
  try {
    const { id } = req.params;

    const centreResult = await db.query(
      "SELECT name, address, accreditation_level, contact_email, contact_phone, registration_number, centre_type FROM wellness_centres WHERE id = $1",
      [id]
    );

    if (centreResult.rows.length === 0) {
      return res.status(404).json({ message: "Wellness centre not found" });
    }

    const programsResult = await db.query(
      "SELECT name, description, duration, fees FROM wellness_programs WHERE centre_id = $1 AND status = 'ACTIVE'",
      [id]
    );

    res.json({
      success: true,
      data: {
        profile: centreResult.rows[0],
        programs: programsResult.rows
      }
    });
  } catch (err) {
    console.error("Error in getPublicProfile:", err);
    res.status(500).json({ message: "Server error" });
  }
}
module.exports = {
  getWellnessCentreDashboard,
  getPrograms,
  addProgram,
  updateProgram,
  deleteProgram,
  getStaff,
  addStaff,
  updateStaff,
  deleteStaff,
  getSessions,
  addSession,
  deleteSession,
  getIncentives,
  addIncentive,
  getCentreProfile,
  updateCentreProfile,
  getPendingActions,
  uploadDocuments,
  getPublicProfile
};
