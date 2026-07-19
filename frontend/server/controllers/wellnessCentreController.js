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
    const {
      name,
      address,
      district,
      contact_phone,
      applicant_name,
      designation,
      entity_type
    } = req.body;

    const result = await db.query(
      `UPDATE wellness_centres 
       SET name = $1, address = $2, district = $3, contact_phone = $4,
           applicant_name = $5, designation = $6, entity_type = $7,
           contact_person = $5, updated_at = NOW()
       WHERE user_id = $8
       RETURNING *`,
      [name, address, district, contact_phone, applicant_name, designation, entity_type, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Wellness centre not found" });
    }

    // Update users table full name and phone too
    await db.query(
      `UPDATE users SET full_name = $1, phone = $2 WHERE id = $3`,
      [applicant_name, contact_phone, userId]
    );

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

// ── OPERATIONAL REGISTRATION (post-login, 5-section form) ─────────────────────

// Helper: generate registration number UK-WC-FY-YYYY-XXXX
async function generateWCRegNumber(db) {
  const now = new Date();
  const fyYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const seqRes = await db.query("SELECT nextval('seq_wc_operational_reg_serial') as seq");
  const serial = String(seqRes.rows[0].seq).padStart(4, '0');
  return `UK-WC-FY-${fyYear}-${serial}`;
}

// POST /api/wellness/operational-registration
async function submitOperationalRegistration(req, res) {
  const userId = req.user.userId;
  try {
    // Check if user already has a registration
    const existing = await db.query(
      'SELECT id, status FROM wellness_centre_registrations WHERE user_id = $1',
      [userId]
    );
    if (existing.rows.length > 0 && existing.rows[0].status !== 'REVERTED') {
      return res.status(400).json({ success: false, message: 'You already have a registration submitted. You can only resubmit if it was reverted by district.' });
    }

    const files = req.files || {};
    const fp = (field) => (files[field] && files[field][0]) ? `/uploads/${files[field][0].filename}` : null;

    const b = req.body;
    const servicesOffered = b.services_offered
      ? (Array.isArray(b.services_offered) ? b.services_offered : b.services_offered.split(','))
      : [];

    const regNumber = await generateWCRegNumber(db);

    // Fetch user info for actor_name
    const userRes = await db.query('SELECT full_name FROM users WHERE id = $1', [userId]);
    const actorName = userRes.rows[0]?.full_name || 'Wellness Centre User';

    const insertResult = await db.query(`
      INSERT INTO wellness_centre_registrations (
        user_id, registration_number,
        already_on_portal, portal_reg_reason, previous_reg_number, previous_reg_certificate,
        centre_name, district, address, gps_lat, gps_lng, google_map_link,
        owner_name, mobile, is_residential, offers_clinical, category, services_offered,
        doctor_appointed, doctor_name, doctor_qualification, doctor_qual_doc,
        bcp_reg_number, bcp_reg_doc, cea_reg_number, cea_valid_till, cea_reg_certificate,
        cea_registered, declaration_board, declaration_signboard, clinical_affidavit,
        reception_area_sqft, waiting_capacity, consultation_rooms,
        incharge_name, incharge_mobile, emergency_centre_name, emergency_distance_m,
        offers_prakruti, website, service_charges_doc, brochure_doc,
        num_beds, kitchen_available, dosha_dietetics, parking_cars, cctv_supervised,
        abhyanga_rooms, vasti_rooms, post_therapy_waiting_rooms,
        medicine_dispensing_rooms, marma_rooms, para_surgical_rooms, kshar_sutra_ot,
        yoga_halls, meditation_halls, shatkarma_rooms,
        massage_rooms, enema_rooms, hydrotherapy_rooms,
        receptionist_count, sanitation_worker_count, mpw_count, cook_count, watchman_count,
        pharmacist_name, pharmacist_reg_number, pharmacist_bcp_doc,
        wc_attendant_count, ayurveda_nurse_count,
        male_panchakarma_therapist, female_panchakarma_therapist, panchakarma_staff_bcp_doc,
        yoga_instructor_count, yoga_instructor_qual_doc,
        bnys_doctor_name, bnys_reg_certificate,
        male_naturopathy_attendant, female_naturopathy_attendant,
        fee_deposited, fee_receipt_doc, all_declarations_accepted, declaration_affidavit,
        status, submitted_at, updated_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,
        $19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,
        $35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,
        $51,$52,$53,$54,$55,$56,$57,$58,$59,$60,$61,$62,$63,$64,$65,$66,
        $67,$68,$69,$70,$71,$72,$73,$74,$75,$76,$77,$78,$79,$80,$81,$82,
        $83,$84,$85, 'SUBMITTED', NOW(), NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        registration_number = EXCLUDED.registration_number,
        already_on_portal = EXCLUDED.already_on_portal,
        portal_reg_reason = EXCLUDED.portal_reg_reason,
        previous_reg_number = EXCLUDED.previous_reg_number,
        previous_reg_certificate = COALESCE(EXCLUDED.previous_reg_certificate, wellness_centre_registrations.previous_reg_certificate),
        centre_name = EXCLUDED.centre_name, district = EXCLUDED.district,
        address = EXCLUDED.address, gps_lat = EXCLUDED.gps_lat, gps_lng = EXCLUDED.gps_lng,
        google_map_link = EXCLUDED.google_map_link, owner_name = EXCLUDED.owner_name,
        mobile = EXCLUDED.mobile, is_residential = EXCLUDED.is_residential,
        offers_clinical = EXCLUDED.offers_clinical, category = EXCLUDED.category,
        services_offered = EXCLUDED.services_offered,
        doctor_appointed = EXCLUDED.doctor_appointed, doctor_name = EXCLUDED.doctor_name,
        doctor_qualification = EXCLUDED.doctor_qualification,
        doctor_qual_doc = COALESCE(EXCLUDED.doctor_qual_doc, wellness_centre_registrations.doctor_qual_doc),
        bcp_reg_number = EXCLUDED.bcp_reg_number,
        bcp_reg_doc = COALESCE(EXCLUDED.bcp_reg_doc, wellness_centre_registrations.bcp_reg_doc),
        cea_reg_number = EXCLUDED.cea_reg_number, cea_valid_till = EXCLUDED.cea_valid_till,
        cea_reg_certificate = COALESCE(EXCLUDED.cea_reg_certificate, wellness_centre_registrations.cea_reg_certificate),
        cea_registered = EXCLUDED.cea_registered, declaration_board = EXCLUDED.declaration_board,
        declaration_signboard = EXCLUDED.declaration_signboard,
        clinical_affidavit = COALESCE(EXCLUDED.clinical_affidavit, wellness_centre_registrations.clinical_affidavit),
        reception_area_sqft = EXCLUDED.reception_area_sqft, waiting_capacity = EXCLUDED.waiting_capacity,
        consultation_rooms = EXCLUDED.consultation_rooms, incharge_name = EXCLUDED.incharge_name,
        incharge_mobile = EXCLUDED.incharge_mobile, emergency_centre_name = EXCLUDED.emergency_centre_name,
        emergency_distance_m = EXCLUDED.emergency_distance_m, offers_prakruti = EXCLUDED.offers_prakruti,
        website = EXCLUDED.website,
        service_charges_doc = COALESCE(EXCLUDED.service_charges_doc, wellness_centre_registrations.service_charges_doc),
        brochure_doc = COALESCE(EXCLUDED.brochure_doc, wellness_centre_registrations.brochure_doc),
        num_beds = EXCLUDED.num_beds, kitchen_available = EXCLUDED.kitchen_available,
        dosha_dietetics = EXCLUDED.dosha_dietetics, parking_cars = EXCLUDED.parking_cars,
        cctv_supervised = EXCLUDED.cctv_supervised, abhyanga_rooms = EXCLUDED.abhyanga_rooms,
        vasti_rooms = EXCLUDED.vasti_rooms, post_therapy_waiting_rooms = EXCLUDED.post_therapy_waiting_rooms,
        medicine_dispensing_rooms = EXCLUDED.medicine_dispensing_rooms, marma_rooms = EXCLUDED.marma_rooms,
        para_surgical_rooms = EXCLUDED.para_surgical_rooms, kshar_sutra_ot = EXCLUDED.kshar_sutra_ot,
        yoga_halls = EXCLUDED.yoga_halls, meditation_halls = EXCLUDED.meditation_halls,
        shatkarma_rooms = EXCLUDED.shatkarma_rooms, massage_rooms = EXCLUDED.massage_rooms,
        enema_rooms = EXCLUDED.enema_rooms, hydrotherapy_rooms = EXCLUDED.hydrotherapy_rooms,
        receptionist_count = EXCLUDED.receptionist_count, sanitation_worker_count = EXCLUDED.sanitation_worker_count,
        mpw_count = EXCLUDED.mpw_count, cook_count = EXCLUDED.cook_count, watchman_count = EXCLUDED.watchman_count,
        pharmacist_name = EXCLUDED.pharmacist_name, pharmacist_reg_number = EXCLUDED.pharmacist_reg_number,
        pharmacist_bcp_doc = COALESCE(EXCLUDED.pharmacist_bcp_doc, wellness_centre_registrations.pharmacist_bcp_doc),
        wc_attendant_count = EXCLUDED.wc_attendant_count, ayurveda_nurse_count = EXCLUDED.ayurveda_nurse_count,
        male_panchakarma_therapist = EXCLUDED.male_panchakarma_therapist,
        female_panchakarma_therapist = EXCLUDED.female_panchakarma_therapist,
        panchakarma_staff_bcp_doc = COALESCE(EXCLUDED.panchakarma_staff_bcp_doc, wellness_centre_registrations.panchakarma_staff_bcp_doc),
        yoga_instructor_count = EXCLUDED.yoga_instructor_count,
        yoga_instructor_qual_doc = COALESCE(EXCLUDED.yoga_instructor_qual_doc, wellness_centre_registrations.yoga_instructor_qual_doc),
        bnys_doctor_name = EXCLUDED.bnys_doctor_name,
        bnys_reg_certificate = COALESCE(EXCLUDED.bnys_reg_certificate, wellness_centre_registrations.bnys_reg_certificate),
        male_naturopathy_attendant = EXCLUDED.male_naturopathy_attendant,
        female_naturopathy_attendant = EXCLUDED.female_naturopathy_attendant,
        fee_deposited = EXCLUDED.fee_deposited,
        fee_receipt_doc = COALESCE(EXCLUDED.fee_receipt_doc, wellness_centre_registrations.fee_receipt_doc),
        all_declarations_accepted = EXCLUDED.all_declarations_accepted,
        declaration_affidavit = COALESCE(EXCLUDED.declaration_affidavit, wellness_centre_registrations.declaration_affidavit),
        status = 'SUBMITTED', district_comment = NULL, updated_at = NOW()
      RETURNING id
    `, [
      userId, regNumber,
      b.already_on_portal === 'true', b.portal_reg_reason || null,
      b.previous_reg_number || null, fp('previous_reg_certificate'),
      b.centre_name, b.district, b.address,
      b.gps_lat || null, b.gps_lng || null, b.google_map_link || null,
      b.owner_name || null, b.mobile || null,
      b.is_residential === 'true', b.offers_clinical === 'true',
      b.category || null, servicesOffered,
      b.doctor_appointed === 'true', b.doctor_name || null,
      b.doctor_qualification || null, fp('doctor_qual_doc'),
      b.bcp_reg_number || null, fp('bcp_reg_doc'),
      b.cea_reg_number || null,
      b.cea_valid_till || null,
      fp('cea_reg_certificate'),
      b.cea_registered === 'true', b.declaration_board === 'true',
      b.declaration_signboard === 'true', fp('clinical_affidavit'),
      b.reception_area_sqft || null, b.waiting_capacity || null, b.consultation_rooms || null,
      b.incharge_name || null, b.incharge_mobile || null,
      b.emergency_centre_name || null, b.emergency_distance_m || null,
      b.offers_prakruti === 'true', b.website || null,
      fp('service_charges_doc'), fp('brochure_doc'),
      b.num_beds || null, b.kitchen_available === 'true',
      b.dosha_dietetics === 'true', b.parking_cars || null, b.cctv_supervised === 'true',
      b.abhyanga_rooms || null, b.vasti_rooms || null, b.post_therapy_waiting_rooms || null,
      b.medicine_dispensing_rooms || null, b.marma_rooms || null,
      b.para_surgical_rooms || null, b.kshar_sutra_ot || null,
      b.yoga_halls || null, b.meditation_halls || null, b.shatkarma_rooms || null,
      b.massage_rooms || null, b.enema_rooms || null, b.hydrotherapy_rooms || null,
      b.receptionist_count || null, b.sanitation_worker_count || null,
      b.mpw_count || null, b.cook_count || null, b.watchman_count || null,
      b.pharmacist_name || null, b.pharmacist_reg_number || null, fp('pharmacist_bcp_doc'),
      b.wc_attendant_count || null, b.ayurveda_nurse_count || null,
      b.male_panchakarma_therapist || null, b.female_panchakarma_therapist || null,
      fp('panchakarma_staff_bcp_doc'),
      b.yoga_instructor_count || null, fp('yoga_instructor_qual_doc'),
      b.bnys_doctor_name || null, fp('bnys_reg_certificate'),
      b.male_naturopathy_attendant || null, b.female_naturopathy_attendant || null,
      b.fee_deposited === 'true', fp('fee_receipt_doc'),
      b.all_declarations_accepted === 'true', fp('declaration_affidavit')
    ]);

    const regId = insertResult.rows[0].id;

    // Log event
    await db.query(`
      INSERT INTO wellness_centre_reg_events (registration_id, event_type, actor_role, actor_id, actor_name)
      VALUES ($1, 'SUBMITTED', 'wellness_centre', $2, $3)
    `, [regId, userId, actorName]);

    return res.status(201).json({
      success: true,
      message: 'Wellness Centre registration submitted successfully',
      registration_number: regNumber
    });
  } catch (err) {
    console.error('Error in submitOperationalRegistration:', err);
    return res.status(500).json({ success: false, message: 'Server error submitting registration' });
  }
}

// GET /api/wellness/operational-registration
async function getMyOperationalRegistration(req, res) {
  const userId = req.user.userId;
  try {
    const regRes = await db.query(
      'SELECT * FROM wellness_centre_registrations WHERE user_id = $1',
      [userId]
    );
    if (regRes.rows.length === 0) {
      return res.json({ success: true, data: null });
    }
    const reg = regRes.rows[0];

    // Fetch events log
    const eventsRes = await db.query(
      'SELECT * FROM wellness_centre_reg_events WHERE registration_id = $1 ORDER BY created_at ASC',
      [reg.id]
    );

    return res.json({ success: true, data: { ...reg, events: eventsRes.rows } });
  } catch (err) {
    console.error('Error in getMyOperationalRegistration:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

// GET /api/wellness/operational-registration/certificate  (download certificate HTML)
async function downloadRegistrationCertificate(req, res) {
  const userId = req.user.userId;
  try {
    const regRes = await db.query(
      'SELECT * FROM wellness_centre_registrations WHERE user_id = $1 AND status = $2',
      [userId, 'APPROVED']
    );
    if (regRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No approved registration found' });
    }
    const reg = regRes.rows[0];
    const approvedDate = reg.approved_at ? new Date(reg.approved_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
    const validTill = reg.certificate_valid_till ? new Date(reg.certificate_valid_till).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>Registration Certificate — ${reg.registration_number}</title>
<style>
  body { font-family: Arial, sans-serif; padding: 60px; background: #fff; color: #1a1a1a; }
  .border { border: 4px double #166534; padding: 40px; border-radius: 8px; }
  .header { text-align: center; margin-bottom: 30px; }
  .header h1 { font-size: 22px; color: #166534; margin-bottom: 4px; }
  .header h2 { font-size: 16px; color: #15803d; }
  .title { text-align: center; font-size: 20px; font-weight: bold; margin: 20px 0; text-decoration: underline; }
  .field { margin: 10px 0; font-size: 14px; }
  .field strong { display: inline-block; width: 240px; }
  .reg-num { text-align: center; font-size: 28px; font-weight: bold; color: #166534; margin: 20px 0; letter-spacing: 2px; }
  .footer { margin-top: 40px; text-align: right; font-size: 13px; }
  .stamp { border: 2px solid #166534; display: inline-block; padding: 10px 20px; border-radius: 50%; color: #166534; font-weight: bold; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="border">
  <div class="header">
    <h1>Government of Uttarakhand</h1>
    <h2>AYUSH & Wellness Department</h2>
    <h2>Directorate of AYUSH, Uttarakhand</h2>
  </div>
  <div class="title">Certificate of Registration — AYUSH Wellness Centre</div>
  <div class="reg-num">${reg.registration_number}</div>
  <div class="field"><strong>Centre Name:</strong> ${reg.centre_name}</div>
  <div class="field"><strong>Category:</strong> ${reg.category || '—'}</div>
  <div class="field"><strong>District:</strong> ${reg.district}</div>
  <div class="field"><strong>Address:</strong> ${reg.address}</div>
  <div class="field"><strong>Owner / Applicant:</strong> ${reg.owner_name || '—'}</div>
  <div class="field"><strong>Services Offered:</strong> ${(reg.services_offered || []).join(', ') || '—'}</div>
  <div class="field"><strong>Date of Registration:</strong> ${approvedDate}</div>
  <div class="field"><strong>Valid Till:</strong> ${validTill}</div>
  <div class="footer">
    <p>This certificate is issued under the AYUSH Wellness Centre Registration Scheme, Uttarakhand.</p>
    <br/>
    <div class="stamp">Directorate of AYUSH<br/>Uttarakhand</div>
  </div>
</div>
<script>window.onload = function() { window.print(); }</script>
</body></html>`;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `inline; filename="WC_Certificate_${reg.registration_number}.html"`);
    return res.send(html);
  } catch (err) {
    console.error('Error in downloadRegistrationCertificate:', err);
    return res.status(500).json({ success: false, message: 'Server error generating certificate' });
  }
}

// ── Admin/District: get pending wellness centre operational registrations ──────

// GET /api/admin/wellness-centre-operational-registrations
async function getPendingWellnessCentreRegistrations(req, res) {
  const requesterRole = req.user.role;
  const requesterId = req.user.id || req.user.userId;
  try {
    let query;
    let params = [];

    if (requesterRole === 'district_officer') {
      const officerCheck = await db.query('SELECT district FROM district_officer_profile WHERE user_id = $1', [requesterId]);
      if (officerCheck.rows.length === 0) {
        return res.status(400).json({ success: false, message: 'District Officer profile not found' });
      }
      const officerDistrict = officerCheck.rows[0].district;
      query = `
        SELECT wcr.*, u.full_name as applicant_user_name, u.email as applicant_email, u.phone as applicant_phone
        FROM wellness_centre_registrations wcr
        JOIN users u ON u.id = wcr.user_id
        WHERE wcr.district = $1
        ORDER BY wcr.submitted_at DESC
      `;
      params = [officerDistrict];
    } else {
      // Directorate / admin — see all
      query = `
        SELECT wcr.*, u.full_name as applicant_user_name, u.email as applicant_email, u.phone as applicant_phone
        FROM wellness_centre_registrations wcr
        JOIN users u ON u.id = wcr.user_id
        ORDER BY wcr.submitted_at DESC
      `;
    }

    const { rows } = await db.query(query, params);

    // Fetch events for each registration
    const result = await Promise.all(rows.map(async (reg) => {
      const eventsRes = await db.query(
        'SELECT * FROM wellness_centre_reg_events WHERE registration_id = $1 ORDER BY created_at ASC',
        [reg.id]
      );
      return { ...reg, events: eventsRes.rows };
    }));

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error in getPendingWellnessCentreRegistrations:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

// PUT /api/admin/wellness-centre-operational-registrations/:id
async function actionWellnessCentreRegistration(req, res) {
  const { id } = req.params;
  const { action, comment } = req.body; // action: APPROVE | REVERT | REJECT
  const actorId = req.user.id || req.user.userId;
  const actorRole = req.user.role;

  if (!['APPROVE', 'REVERT', 'REJECT'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Action must be APPROVE, REVERT, or REJECT' });
  }
  if ((action === 'REVERT' || action === 'REJECT') && !comment) {
    return res.status(400).json({ success: false, message: 'Comment is required for REVERT or REJECT actions' });
  }

  try {
    // Only district_officer can REVERT/APPROVE; directorate is read-only
    if (actorRole === 'directorate' && action !== 'VIEW') {
      return res.status(403).json({ success: false, message: 'Directorate can only view operational registrations. Action is reserved for District Officer.' });
    }

    const regRes = await db.query('SELECT * FROM wellness_centre_registrations WHERE id = $1', [id]);
    if (regRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    const actorRes = await db.query('SELECT full_name FROM users WHERE id = $1', [actorId]);
    const actorName = actorRes.rows[0]?.full_name || actorRole;

    let newStatus, approvedAt = null, certValidTill = null, eventType;

    if (action === 'APPROVE') {
      newStatus = 'APPROVED';
      approvedAt = new Date();
      const validTill = new Date(approvedAt);
      validTill.setFullYear(validTill.getFullYear() + 3);
      certValidTill = validTill.toISOString().split('T')[0];
      eventType = 'APPROVED';
    } else if (action === 'REVERT') {
      newStatus = 'REVERTED';
      eventType = 'REVERTED';
    } else {
      newStatus = 'REJECTED';
      eventType = 'REJECTED';
    }

    await db.query(`
      UPDATE wellness_centre_registrations
      SET status = $1, district_comment = $2, approved_at = $3, certificate_valid_till = $4,
          approved_by_user_id = $5, updated_at = NOW()
      WHERE id = $6
    `, [newStatus, comment || null, approvedAt, certValidTill, actorId, id]);

    await db.query(`
      INSERT INTO wellness_centre_reg_events (registration_id, event_type, actor_role, actor_id, actor_name, comment)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [id, eventType, actorRole, actorId, actorName, comment || null]);

    return res.json({ success: true, message: `Registration ${action.toLowerCase()}d successfully` });
  } catch (err) {
    console.error('Error in actionWellnessCentreRegistration:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
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
  getPublicProfile,
  submitOperationalRegistration,
  getMyOperationalRegistration,
  downloadRegistrationCertificate,
  getPendingWellnessCentreRegistrations,
  actionWellnessCentreRegistration
};

