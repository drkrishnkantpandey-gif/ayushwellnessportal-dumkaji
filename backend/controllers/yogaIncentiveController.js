// controllers/yogaIncentiveController.js
const db = require('../db');

// Region-based subsidy: plain area 25%, hilly area 50%
const SUBSIDY_RATES = { PLAIN: 25, HILLY: 50 };

// Helper: get training_centre id for logged-in user
async function getCentreId(userId) {
  const r = await db.query('SELECT id FROM training_centres WHERE user_id = $1', [userId]);
  return r.rows[0]?.id || null;
}

// Helper: log application workflow events
async function logEvent(applicationId, eventType, actorRole, actorId, actorName, comment = null, attachmentPaths = null) {
  try {
    await db.query(
      `INSERT INTO yoga_incentive_events (application_id, event_type, actor_role, actor_id, actor_name, comment, attachment_paths)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [applicationId, eventType, actorRole, actorId, actorName, comment, attachmentPaths]
    );
  } catch (err) {
    console.error('Error logging event:', err);
  }
}

// Helper: get full name of actor
async function getActorName(userId) {
  const r = await db.query('SELECT full_name FROM users WHERE id = $1', [userId]);
  return r.rows[0]?.full_name || 'System Official';
}

// ── POST /api/training-centre/incentives ────────────────────────────────────
// Applicant submits a new incentive application
async function submitApplication(req, res) {
  try {
    const userId = req.user.userId;
    const centreId = await getCentreId(userId);

    // Limit check: A logged-in user can submit only one application at most.
    const existing = await db.query(
      `SELECT id FROM yoga_incentive_applications 
       WHERE user_id = $1 AND status NOT IN ('DIRECTORATE_REJECTED', 'SLRC_REJECTED')`,
      [userId]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'You have already submitted an incentive application. Only one active application is allowed.' });
    }

    const {
      region,
      projectType, // Greenfield or Expansion
      proposedLocation,
      otherLocationName,
      gpsCoordinates,
      proposedCentreName,
      investmentAmount,
      eligibleAssetsAmount,
      applicantName,
      designation,
      entityType,
      mobileNumber,
      emailId,
      siteTotalArea,
      proposedConstructedArea,
      servicesOffered,
      tentativeEmployees,
      ycbCertifiedInstructors,
      clinicalServicesProvided,
      certifiedAyushDoctors,
      proposedSitePhoto,
      district,
      address
    } = req.body;

    if (!SUBSIDY_RATES[region]) {
      return res.status(400).json({ message: 'Invalid region. Use PLAIN or HILLY.' });
    }
    if (!projectType || !proposedCentreName || !investmentAmount || !eligibleAssetsAmount) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const totalInv = parseFloat(investmentAmount) || 0;
    const eligibleEca = parseFloat(eligibleAssetsAmount) || 0;

    if (eligibleEca > totalInv) {
      return res.status(400).json({ message: 'Eligible Capital Assets Amount cannot be greater than Total Investment Amount.' });
    }

    // Auto calculate subsidy with capping
    let subsidyPct = SUBSIDY_RATES[region];
    let subsidyAmount = 0;
    if (region === 'HILLY') {
      subsidyAmount = Math.min(eligibleEca * 0.50, 2000000); // 50% max 20 Lakh
    } else {
      subsidyAmount = Math.min(eligibleEca * 0.25, 1000000); // 25% max 10 Lakh
    }

    const incentiveType = projectType === 'Expansion' ? 'EXPANSION' : 'NEW_SETUP';

    // Generate UPN in format: UK-YMC-26-27-Serial Number
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const fyStart = currentMonth >= 3 ? currentYear : currentYear - 1;
    const fyEnd = fyStart + 1;
    const fyStr = `${fyStart.toString().slice(-2)}-${fyEnd.toString().slice(-2)}`;

    const seqResult = await db.query('SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM yoga_incentive_applications');
    const nextId = seqResult.rows[0].next_id;
    const upn = `UK-YMC-${fyStr}-${nextId.toString().padStart(4, '0')}`;

    const files = req.files || {};
    const filePath = (field) => files[field]?.[0]?.path || req.body[field] || null;

    const result = await db.query(
      `INSERT INTO yoga_incentive_applications
        (user_id, centre_id, region, subsidy_percentage,
         centre_name, district, investment_amount, claim_amount, subsidy_amount,
         project_type, upn, proposed_location, other_location_name, gps_coordinates,
         proposed_centre_name, eligible_assets_amount,
         applicant_name, designation, entity_type, mobile_number, email_id,
         site_total_area, proposed_constructed_area, services_offered, tentative_employees,
         ycb_certified_instructors, clinical_services_provided, certified_ayush_doctors, proposed_site_photo,
         doc_fire_safety, doc_udyog_reg, doc_gst_reg, doc_pollution_cert,
         doc_dpr, doc_ca_project_cost, doc_ca_eca, doc_land_document, doc_constitution,
         doc_entity_registration, doc_map_approval, doc_non_agri_land, doc_land_possession,
         doc_others, doc_affidavit, status, incentive_type, address)
       VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21,
         $22, $23, $24, $25, $26, $27, $28, $29,
         $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, 'SUBMITTED', $45, $46
       )
       RETURNING *`,
      [
        userId, centreId, region, subsidyPct,
        proposedCentreName, district || null, totalInv, eligibleEca, subsidyAmount,
        projectType, upn, proposedLocation || null, otherLocationName || null, gpsCoordinates || null,
        proposedCentreName, eligibleEca,
        applicantName || null, designation || null, entityType || null, mobileNumber || null, emailId || null,
        parseFloat(siteTotalArea) || null, parseFloat(proposedConstructedArea) || null,
        servicesOffered || null, parseInt(tentativeEmployees, 10) || null,
        parseInt(ycbCertifiedInstructors, 10) || null, clinicalServicesProvided === 'true' || clinicalServicesProvided === true,
        parseInt(certifiedAyushDoctors, 10) || null, proposedSitePhoto || null,
        filePath('doc_fire_safety'), filePath('doc_udyog_reg'),
        filePath('doc_gst_reg'),     filePath('doc_pollution_cert'),
        filePath('doc_dpr'),         filePath('doc_ca_project_cost'), filePath('doc_ca_eca'),
        filePath('doc_land_document'),filePath('doc_constitution'),
        filePath('doc_entity_registration'), filePath('doc_map_approval'),
        filePath('doc_non_agri_land'), filePath('doc_land_possession'),
        filePath('doc_others'),
        filePath('doc_affidavit'),
        incentiveType,
        address || null
      ]
    );

    const app = result.rows[0];
    const actorName = await getActorName(userId);
    await logEvent(app.id, 'SUBMITTED', 'applicant', userId, actorName, 'Application submitted successfully');

    res.status(201).json({ success: true, data: app });
  } catch (err) {
    console.error('submitApplication error:', err);
    res.status(500).json({ message: `Server error during submission: ${err.message}` });
  }
}

// ── GET /api/training-centre/incentives ─────────────────────────────────────
// Applicant views their own applications
async function getMyApplications(req, res) {
  try {
    const userId = req.user.userId;
    const result = await db.query(
      `SELECT a.*, tc.centre_name AS entity_name
       FROM yoga_incentive_applications a
       LEFT JOIN training_centres tc ON tc.id = a.centre_id
       WHERE a.user_id = $1 ORDER BY a.created_at DESC`,
      [userId]
    );
    const apps = result.rows;
    for (const app of apps) {
      const eventsRes = await db.query(
        `SELECT * FROM yoga_incentive_events WHERE application_id = $1 ORDER BY created_at ASC`,
        [app.id]
      );
      app.events = eventsRes.rows;
    }
    res.json({ success: true, data: apps });
  } catch (err) {
    console.error('getMyApplications error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── PUT /api/training-centre/incentives/:id/resubmit ──────────────────────────
// Applicant resubmits an application after it was reverted with compliance attachments
async function resubmitApplication(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const existing = await db.query('SELECT * FROM yoga_incentive_applications WHERE id = $1 AND user_id = $2', [id, userId]);
    if (!existing.rows.length) {
      return res.status(404).json({ message: 'Application not found or unauthorized.' });
    }

    const app = existing.rows[0];
    if (app.status !== 'REVERTED_TO_APPLICANT') {
      return res.status(400).json({ message: 'Only reverted applications can be resubmitted.' });
    }

    const {
      investmentAmount,
      eligibleAssetsAmount,
      complianceNote,
      attachments // Array of temp uploaded files
    } = req.body;

    const totalInv = investmentAmount ? parseFloat(investmentAmount) : parseFloat(app.investment_amount);
    const eligibleEca = eligibleAssetsAmount ? parseFloat(eligibleAssetsAmount) : parseFloat(app.eligible_assets_amount);

    if (eligibleEca > totalInv) {
      return res.status(400).json({ message: 'Eligible Capital Assets Amount cannot be greater than Total Investment Amount.' });
    }

    let subsidyAmount = app.subsidy_amount;
    if (eligibleAssetsAmount) {
      if (app.region === 'HILLY') {
        subsidyAmount = Math.min(eligibleEca * 0.50, 2000000);
      } else {
        subsidyAmount = Math.min(eligibleEca * 0.25, 1000000);
      }
    }

    const files = req.files || {};
    const filePath = (field) => files[field]?.[0]?.path || req.body[field] || app[field];

    const result = await db.query(
      `UPDATE yoga_incentive_applications
       SET status = 'RESUBMITTED', resubmitted_at = NOW(),
           investment_amount = $1, eligible_assets_amount = $2, subsidy_amount = $3,
           doc_fire_safety = $4, doc_udyog_reg = $5, doc_gst_reg = $6, doc_pollution_cert = $7,
           doc_dpr = $8, doc_ca_project_cost = $9, doc_ca_eca = $10, doc_land_document = $11,
           doc_constitution = $12, doc_entity_registration = $13, doc_map_approval = $14,
           doc_non_agri_land = $15, doc_land_possession = $16, doc_others = $17, doc_affidavit = $18,
           updated_at = NOW()
       WHERE id = $19
       RETURNING *`,
      [
        totalInv, eligibleEca, subsidyAmount,
        filePath('doc_fire_safety'), filePath('doc_udyog_reg'),
        filePath('doc_gst_reg'),     filePath('doc_pollution_cert'),
        filePath('doc_dpr'),         filePath('doc_ca_project_cost'), filePath('doc_ca_eca'),
        filePath('doc_land_document'),filePath('doc_constitution'),
        filePath('doc_entity_registration'), filePath('doc_map_approval'),
        filePath('doc_non_agri_land'), filePath('doc_land_possession'),
        filePath('doc_others'),
        filePath('doc_affidavit'),
        id
      ]
    );

    const actorName = await getActorName(userId);
    // Parse compliance attachments if sent
    const parsedAttachments = Array.isArray(attachments) ? attachments : (attachments ? [attachments] : null);

    await logEvent(id, 'RESUBMITTED', 'applicant', userId, actorName, complianceNote || 'Compliance resubmitted by applicant', parsedAttachments);

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('resubmitApplication error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── GET /api/admin/incentives/district ──────────────────────────────────────
// District Officer: see all applications forwarded to their district for verification
async function getDistrictApplications(req, res) {
  try {
    const { district } = req.query;
    if (!district) {
      return res.status(400).json({ message: 'District query parameter is required.' });
    }

    const result = await db.query(
      `SELECT a.*, u.email as applicant_email, u.full_name as applicant_name, tc.centre_name AS entity_name
       FROM yoga_incentive_applications a
       JOIN users u ON u.id = a.user_id
       LEFT JOIN training_centres tc ON tc.id = a.centre_id
       WHERE a.district = $1
       ORDER BY COALESCE(a.forwarded_to_district_at, a.created_at) DESC`,
      [district]
    );

    const apps = result.rows;
    for (const app of apps) {
      const eventsRes = await db.query(
        `SELECT * FROM yoga_incentive_events WHERE application_id = $1 ORDER BY created_at ASC`,
        [app.id]
      );
      app.events = eventsRes.rows;
    }

    res.json({ success: true, data: apps });
  } catch (err) {
    console.error('getDistrictApplications error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── PUT /api/admin/incentives/district/:id/verify ───────────────────────────
// District Officer: submit verification report with attachments
async function districtSubmitVerification(req, res) {
  try {
    const { id } = req.params;
    const { verificationNote, attachments } = req.body;
    const actorId = req.user.userId;

    if (!verificationNote || !verificationNote.trim()) {
      return res.status(400).json({ message: 'Verification note is required.' });
    }

    const result = await db.query(
      `UPDATE yoga_incentive_applications
       SET status = 'DISTRICT_VERIFIED', district_verified_at = NOW(),
           district_verification_note = $1, updated_at = NOW()
       WHERE id = $2 AND status = 'FORWARDED_TO_DISTRICT'
       RETURNING *`,
      [verificationNote, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Forwarded application not found or already verified.' });
    }

    const actorName = await getActorName(actorId);
    const parsedAttachments = Array.isArray(attachments) ? attachments : (attachments ? [attachments] : null);

    await logEvent(id, 'DISTRICT_VERIFIED', 'district', actorId, actorName, verificationNote, parsedAttachments);

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('districtSubmitVerification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── GET /api/admin/incentives/directorate ───────────────────────────────────
// Directorate: see ALL incentive applications
async function getDirectorateApplications(req, res) {
  try {
    const result = await db.query(
      `SELECT a.*, u.email as applicant_email, u.full_name as applicant_name, tc.centre_name AS entity_name
       FROM yoga_incentive_applications a
       JOIN users u ON u.id = a.user_id
       LEFT JOIN training_centres tc ON tc.id = a.centre_id
       ORDER BY a.created_at DESC`
    );
    
    const apps = result.rows;
    for (const app of apps) {
      const eventsRes = await db.query(
        `SELECT * FROM yoga_incentive_events WHERE application_id = $1 ORDER BY created_at ASC`,
        [app.id]
      );
      app.events = eventsRes.rows;
    }
    
    res.json({ success: true, data: apps });
  } catch (err) {
    console.error('getDirectorateApplications error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── PUT /api/admin/incentives/directorate/:id/forward-district ────────────────
// Directorate: forward to district officer for verification
async function directorateForwardToDistrict(req, res) {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const actorId = req.user.userId;

    const result = await db.query(
      `UPDATE yoga_incentive_applications
       SET status = 'FORWARDED_TO_DISTRICT', forwarded_to_district_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND status IN ('SUBMITTED', 'RESUBMITTED', 'DISTRICT_VERIFIED')
       RETURNING *`,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Application not in correct state for district forwarding.' });
    }

    const actorName = await getActorName(actorId);
    await logEvent(id, 'FORWARDED_TO_DISTRICT', 'directorate', actorId, actorName, remarks || 'Forwarded to District Officer for site verification');

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('directorateForwardToDistrict error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── PUT /api/admin/incentives/directorate/:id/revert ─────────────────────────
// Directorate: revert back to applicant for additional documents / compliance
async function directorateRevertToApplicant(req, res) {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const actorId = req.user.userId;

    if (!remarks || !remarks.trim()) {
      return res.status(400).json({ message: 'Compliance comment / remarks is required.' });
    }

    const result = await db.query(
      `UPDATE yoga_incentive_applications
       SET status = 'REVERTED_TO_APPLICANT', reverted_at = NOW(), revert_comment = $1, updated_at = NOW()
       WHERE id = $2 AND status IN ('SUBMITTED', 'DISTRICT_VERIFIED', 'RESUBMITTED')
       RETURNING *`,
      [remarks, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Application not found or not in correct state for revert.' });
    }

    const actorName = await getActorName(actorId);
    await logEvent(id, 'REVERTED_TO_APPLICANT', 'directorate', actorId, actorName, remarks);

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('directorateRevertToApplicant error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── PUT /api/admin/incentives/directorate/:id/forward-slrc ───────────────────
// Directorate: forward to State Level Rule Committee (SLRC)
async function directorateForwardToSlrc(req, res) {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const actorId = req.user.userId;

    const result = await db.query(
      `UPDATE yoga_incentive_applications
       SET status = 'FORWARDED_TO_SLRC', forwarded_to_slrc_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND status IN ('SUBMITTED', 'DISTRICT_VERIFIED', 'RESUBMITTED')
       RETURNING *`,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Application not found or not verified for SLRC.' });
    }

    const actorName = await getActorName(actorId);
    await logEvent(id, 'FORWARDED_TO_SLRC', 'directorate', actorId, actorName, remarks || 'Application forwarded to SLRC');

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('directorateForwardToSlrc error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── PUT /api/admin/incentives/directorate/:id/slrc-approved ──────────────────
// Directorate: mark SLRC approved with details
async function directorateMarkSlrcApproved(req, res) {
  try {
    const { id } = req.params;
    const { slrcApprovalDate, slrcReferenceNumber, remarks } = req.body;
    const actorId = req.user.userId;

    if (!slrcApprovalDate || !slrcReferenceNumber) {
      return res.status(400).json({ message: 'SLRC Approval Date and Reference Number are required.' });
    }

    const result = await db.query(
      `UPDATE yoga_incentive_applications
       SET status = 'SLRC_APPROVED', slrc_approval_date = $1, slrc_reference_number = $2, updated_at = NOW()
       WHERE id = $3 AND status = 'FORWARDED_TO_SLRC'
       RETURNING *`,
      [slrcApprovalDate, slrcReferenceNumber, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Application not in FORWARDED_TO_SLRC state.' });
    }

    const actorName = await getActorName(actorId);
    const note = `SLRC Approved on ${slrcApprovalDate}. Ref: ${slrcReferenceNumber}. Note: ${remarks || 'None'}`;
    await logEvent(id, 'SLRC_APPROVED', 'directorate', actorId, actorName, note);

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('directorateMarkSlrcApproved error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── PUT /api/admin/incentives/directorate/:id/grant-approval ──────────────────
// Directorate: final In-Principle Approval
async function directorateGrantInPrinciple(req, res) {
  try {
    const { id } = req.params;
    const { inPrincipleOrderNumber, remarks } = req.body;
    const actorId = req.user.userId;

    if (!inPrincipleOrderNumber) {
      return res.status(400).json({ message: 'In-Principle Order Number is required.' });
    }

    const result = await db.query(
      `UPDATE yoga_incentive_applications
       SET status = 'IN_PRINCIPLE_APPROVED', in_principle_approved_at = NOW(), in_principle_order_number = $1, updated_at = NOW()
       WHERE id = $2 AND status = 'SLRC_APPROVED'
       RETURNING *`,
      [inPrincipleOrderNumber, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Application not SLRC approved.' });
    }

    const actorName = await getActorName(actorId);
    const note = `In-Principle Approval granted. Order: ${inPrincipleOrderNumber}. Note: ${remarks || 'None'}`;
    await logEvent(id, 'IN_PRINCIPLE_APPROVED', 'directorate', actorId, actorName, note);

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('directorateGrantInPrinciple error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── GET /api/admin/incentives/all ─────────────────────────────────────────
// Admin: all applications with timeline details
async function getAllApplications(req, res) {
  try {
    const result = await db.query(
      `SELECT a.*, u.email as applicant_email, u.full_name as applicant_name, tc.centre_name AS entity_name
       FROM yoga_incentive_applications a
       JOIN users u ON u.id = a.user_id
       LEFT JOIN training_centres tc ON tc.id = a.centre_id
       ORDER BY a.created_at DESC`
    );
    const apps = result.rows;
    for (const app of apps) {
      const eventsRes = await db.query(
        `SELECT * FROM yoga_incentive_events WHERE application_id = $1 ORDER BY created_at ASC`,
        [app.id]
      );
      app.events = eventsRes.rows;
    }
    res.json({ success: true, data: apps });
  } catch (err) {
    console.error('getAllApplications error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Reject application by Directorate
async function rejectApplicationByDirectorate(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const actorId = req.user.userId;

    const result = await db.query(
      `UPDATE yoga_incentive_applications
       SET status = 'DIRECTORATE_REJECTED', revert_comment = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [reason || 'Rejected by Directorate Nodal Officer', id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    const actorName = await getActorName(actorId);
    await logEvent(id, 'DIRECTORATE_REJECTED', 'directorate', actorId, actorName, reason || 'Application rejected by Directorate');

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('rejectApplicationByDirectorate error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Mark SLRC Approval or Rejection
async function markSLRCApproval(req, res) {
  try {
    const { id } = req.params;
    const { approved, slrcReference, slrcDate, comment } = req.body;
    const actorId = req.user.userId;

    const targetStatus = approved ? 'SLRC_APPROVED' : 'SLRC_REJECTED';

    const result = await db.query(
      `UPDATE yoga_incentive_applications
       SET status = $1, 
           slrc_reference_number = $2, 
           slrc_approval_date = $3, 
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [targetStatus, slrcReference || null, slrcDate || null, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    const actorName = await getActorName(actorId);
    await logEvent(id, targetStatus, 'directorate', actorId, actorName, comment || `SLRC review completed: ${targetStatus.replace(/_/g, ' ')}`);

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('markSLRCApproval error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Submit a Disbursal Claim (50%, 25%, 25%)
async function submitDisbursalClaim(req, res) {
  try {
    const { applicationId } = req.body;
    const userId = req.user.userId;

    // Verify application ownership and approval status
    const appRes = await db.query(
      `SELECT * FROM yoga_incentive_applications WHERE id = $1 AND user_id = $2`,
      [applicationId, userId]
    );
    if (!appRes.rows.length) {
      return res.status(404).json({ message: 'Approved application not found.' });
    }

    const app = appRes.rows[0];
    if (app.status !== 'SLRC_APPROVED' && app.status !== 'IN_PRINCIPLE_APPROVED') {
      return res.status(400).json({ message: 'Application must be SLRC Approved or In-Principle Approved before submitting disbursal claims.' });
    }

    const {
      claimType, // 'FIRST_50', 'SECOND_25', 'THIRD_25'
      bankAccountNumber,
      bankName,
      branchAddress,
      loanAccountNumber,
      capexIncurred,
      doc_bank_detail,
      doc_ca_eca_report,
      doc_fire_safety_audit,
      doc_wellness_registration,
      doc_capex_certificate,
      doc_actual_bills,
      doc_others,
      doc_sessions_workshops
    } = req.body;

    if (!claimType || !bankAccountNumber || !bankName || !branchAddress || !capexIncurred) {
      return res.status(400).json({ message: 'All bank and financial details are required.' });
    }

    if (!doc_bank_detail || !doc_ca_eca_report || !doc_fire_safety_audit || !doc_wellness_registration || !doc_capex_certificate || !doc_actual_bills) {
      return res.status(400).json({ message: 'All mandatory disbursal documents must be uploaded.' });
    }

    if ((claimType === 'SECOND_25' || claimType === 'THIRD_25') && !doc_sessions_workshops) {
      return res.status(400).json({ message: 'Workshop and Session details document is mandatory for 2nd and 3rd subsidy claims.' });
    }

    // Check if a claim of this type already exists for this application
    const claimCheck = await db.query(
      `SELECT id, status FROM yoga_incentive_disbursal_claims 
       WHERE application_id = $1 AND claim_type = $2`,
      [applicationId, claimType]
    );

    let result;
    const actorName = await getActorName(userId);

    if (claimCheck.rows.length > 0) {
      const existingClaim = claimCheck.rows[0];
      // If it is in REVERTED status, they can update/resubmit it
      if (existingClaim.status !== 'REVERTED') {
        return res.status(400).json({ message: `A claim for ${claimType.replace(/_/g, ' ')} has already been submitted (Status: ${existingClaim.status}).` });
      }

      result = await db.query(
        `UPDATE yoga_incentive_disbursal_claims
         SET status = 'SUBMITTED',
             bank_account_number = $1,
             bank_name = $2,
             branch_address = $3,
             loan_account_number = $4,
             capex_incurred = $5,
             doc_bank_detail = $6,
             doc_ca_eca_report = $7,
             doc_fire_safety_audit = $8,
             doc_wellness_registration = $9,
             doc_capex_certificate = $10,
             doc_actual_bills = $11,
             doc_others = $12,
             doc_sessions_workshops = $13,
             updated_at = NOW()
         WHERE id = $14
         RETURNING *`,
        [
          bankAccountNumber, bankName, branchAddress, loanAccountNumber || null, capexIncurred,
          doc_bank_detail, doc_ca_eca_report, doc_fire_safety_audit, doc_wellness_registration,
          doc_capex_certificate, doc_actual_bills, doc_others || null, doc_sessions_workshops || null,
          existingClaim.id
        ]
      );
    } else {
      // Create new claim entry
      result = await db.query(
        `INSERT INTO yoga_incentive_disbursal_claims (
          application_id, claim_type, status, bank_account_number, bank_name, branch_address, 
          loan_account_number, capex_incurred, doc_bank_detail, doc_ca_eca_report, 
          doc_fire_safety_audit, doc_wellness_registration, doc_capex_certificate, 
          doc_actual_bills, doc_others, doc_sessions_workshops
         ) VALUES ($1, $2, 'SUBMITTED', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         RETURNING *`,
        [
          applicationId, claimType, bankAccountNumber, bankName, branchAddress, loanAccountNumber || null,
          capexIncurred, doc_bank_detail, doc_ca_eca_report, doc_fire_safety_audit,
          doc_wellness_registration, doc_capex_certificate, doc_actual_bills, doc_others || null,
          doc_sessions_workshops || null
        ]
      );
    }

    await logEvent(applicationId, `DISBURSAL_CLAIM_${claimType}_SUBMITTED`, 'applicant', userId, actorName, `Disbursal claim submitted for ${claimType.replace(/_/g, ' ')}`);

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('submitDisbursalClaim error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Fetch all Disbursal Claims for an application
async function getDisbursalClaims(req, res) {
  try {
    const { applicationId } = req.params;
    const result = await db.query(
      `SELECT * FROM yoga_incentive_disbursal_claims 
       WHERE application_id = $1 
       ORDER BY created_at ASC`,
      [applicationId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getDisbursalClaims error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Forward Disbursal Claim to Working Committee
async function forwardClaimToCommittee(req, res) {
  try {
    const { claimId } = req.params;
    const actorId = req.user.userId;

    const result = await db.query(
      `UPDATE yoga_incentive_disbursal_claims
       SET status = 'FORWARDED_TO_COMMITTEE', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [claimId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Claim not found.' });
    }

    const claim = result.rows[0];
    const actorName = await getActorName(actorId);
    await logEvent(claim.application_id, `DISBURSAL_${claim.claim_type}_FORWARDED_TO_COMMITTEE`, 'directorate', actorId, actorName, `Claim forwarded to Working Committee for physical verification`);

    res.json({ success: true, data: claim });
  } catch (err) {
    console.error('forwardClaimToCommittee error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Verify Disbursal Claim by Working Committee (Directorate enters verification)
async function verifyClaimByCommittee(req, res) {
  try {
    const { claimId } = req.params;
    const { verificationNote } = req.body;
    const actorId = req.user.userId;

    if (!verificationNote || !verificationNote.trim()) {
      return res.status(400).json({ message: 'Verification report notes are required.' });
    }

    const result = await db.query(
      `UPDATE yoga_incentive_disbursal_claims
       SET status = 'COMMITTEE_VERIFIED', 
           committee_verification_note = $1, 
           committee_verified_at = NOW(), 
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [verificationNote, claimId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Claim not found.' });
    }

    const claim = result.rows[0];
    const actorName = await getActorName(actorId);
    await logEvent(claim.application_id, `DISBURSAL_${claim.claim_type}_COMMITTEE_VERIFIED`, 'directorate', actorId, actorName, `Working Committee physical verification completed: ${verificationNote}`);

    res.json({ success: true, data: claim });
  } catch (err) {
    console.error('verifyClaimByCommittee error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Revert Disbursal Claim back to Yoga Centre
async function revertClaimToApplicant(req, res) {
  try {
    const { claimId } = req.params;
    const { revertComment } = req.body;
    const actorId = req.user.userId;

    if (!revertComment || !revertComment.trim()) {
      return res.status(400).json({ message: 'Revert comment is required.' });
    }

    const result = await db.query(
      `UPDATE yoga_incentive_disbursal_claims
       SET status = 'REVERTED', revert_comment = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [revertComment, claimId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Claim not found.' });
    }

    const claim = result.rows[0];
    const actorName = await getActorName(actorId);
    await logEvent(claim.application_id, `DISBURSAL_${claim.claim_type}_REVERTED`, 'directorate', actorId, actorName, `Disbursal claim reverted to applicant: ${revertComment}`);

    res.json({ success: true, data: claim });
  } catch (err) {
    console.error('revertClaimToApplicant error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Recommend Disbursal Claim by SLRC (Approve or Reject)
async function recommendClaimBySLRC(req, res) {
  try {
    const { claimId } = req.params;
    const { approved, slrcNote } = req.body;
    const actorId = req.user.userId;

    const targetStatus = approved ? 'APPROVED_DISBURSAL' : 'REJECTED_DISBURSAL';

    const result = await db.query(
      `UPDATE yoga_incentive_disbursal_claims
       SET status = $1, slrc_disbursal_note = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [targetStatus, slrcNote || null, claimId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Claim not found.' });
    }

    const claim = result.rows[0];
    const actorName = await getActorName(actorId);
    await logEvent(claim.application_id, `DISBURSAL_${claim.claim_type}_SLRC_${approved ? 'APPROVED' : 'REJECTED'}`, 'directorate', actorId, actorName, slrcNote || `SLRC Disbursal Decision: ${targetStatus.replace(/_/g, ' ')}`);

    res.json({ success: true, data: claim });
  } catch (err) {
    console.error('recommendClaimBySLRC error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Mark Subsidy Released
async function releaseClaimSubsidy(req, res) {
  try {
    const { claimId } = req.params;
    const actorId = req.user.userId;

    const result = await db.query(
      `UPDATE yoga_incentive_disbursal_claims
       SET status = 'RELEASED', released_at = NOW(), updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [claimId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Claim not found.' });
    }

    const claim = result.rows[0];
    const actorName = await getActorName(actorId);
    await logEvent(claim.application_id, `DISBURSAL_${claim.claim_type}_RELEASED`, 'directorate', actorId, actorName, `Subsidy disbursal released for claim ${claim.claim_type.replace(/_/g, ' ')}`);

    res.json({ success: true, data: claim });
  } catch (err) {
    console.error('releaseClaimSubsidy error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  submitApplication,
  getMyApplications,
  resubmitApplication,
  getDistrictApplications,
  districtSubmitVerification,
  getDirectorateApplications,
  directorateForwardToDistrict,
  directorateRevertToApplicant,
  directorateForwardToSlrc,
  directorateMarkSlrcApproved,
  directorateGrantInPrinciple,
  getAllApplications,
  rejectApplicationByDirectorate,
  markSLRCApproval,
  submitDisbursalClaim,
  getDisbursalClaims,
  forwardClaimToCommittee,
  verifyClaimByCommittee,
  revertClaimToApplicant,
  recommendClaimBySLRC,
  releaseClaimSubsidy,
};
