// server/controllers/ayushHospitalController.js
const db = require("../db");

async function getAyushHospitalDashboard(req, res) {
    try {
        const userId = req.user.userId;

        const userRes = await db.query(
            `SELECT id, full_name, role FROM users WHERE id = $1`,
            [userId]
        );

        if (userRes.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = userRes.rows[0];

        let hospitalRes = await db.query(
            "SELECT *, (nabh_valid_to - CURRENT_DATE) as validity_days FROM ayush_hospitals WHERE user_id = $1",
            [userId]
        );

        let hospital;
        if (hospitalRes.rows.length === 0) {
            // Default row for a new dashboard (legacy or newly registered without details)
            const newHospitalRes = await db.query(
                `INSERT INTO ayush_hospitals (
                    user_id, hospital_name, ayush_system, hospital_type, 
                    registration_number, nabh_status, state, district, address, 
                    contact_name, contact_email, contact_mobile, status
                ) VALUES ($1, $2, 'Ayurveda', 'Government', 'REG-PENDING', 'No', 'Uttarakhand', 'Dehradun', 'Address Pending', $2, $3, '0000000000', 'SUBMITTED') 
                RETURNING *, (nabh_valid_to - CURRENT_DATE) as validity_days`,
                [userId, user.full_name, req.user.email || 'hospital@example.com']
            );
            hospital = newHospitalRes.rows[0];
        } else {
            hospital = hospitalRes.rows[0];
        }

        const hospitalId = hospital.id;

        // Fetch Recent Updates (Actions)
        let recentUpdates = [
            { text: "Registration successfully submitted", time: "Just now", type: "success" }
        ];

        try {
            const recentUpdatesRes = await db.query(
                "SELECT action_text as text, TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') as time, 'success' as type FROM ayush_hospital_actions WHERE hospital_id = $1 ORDER BY created_at DESC LIMIT 5",
                [hospitalId]
            );
            if (recentUpdatesRes.rows.length > 0) {
                recentUpdates = recentUpdatesRes.rows;
            }
        } catch (err) {
            console.error("Non-critical error fetching recent updates:", err.message);
        }

        // Fetch Incentives safely
        let latestIncentive = { amount: 0, status: 'Not Applied' };
        try {
            // Updated to use correct column names from 0026 migration
            const incentivesRes = await db.query(
                `SELECT 
                    COALESCE(incentive_amount, 0) as amount, 
                    COALESCE(application_status, 'PENDING') as status 
                 FROM ayush_hospital_incentives 
                 WHERE hospital_id = $1 
                 ORDER BY updated_at DESC LIMIT 1`,
                [hospitalId]
            );

            if (incentivesRes.rows.length > 0) {
                latestIncentive = incentivesRes.rows[0];
            }
        } catch (incentiveErr) {
            console.error("Non-critical error fetching incentives:", incentiveErr.message);
        }

        // Auto-Init Patient Stats if they don't exist
        try {
            await db.query(
                `INSERT INTO ayush_hospital_patient_stats (hospital_id)
                 VALUES ($1)
                 ON CONFLICT DO NOTHING`,
                [hospitalId]
            );
        } catch (statsErr) {
            console.error("Non-critical error auto-initializing patient stats:", statsErr.message);
        }

        res.json({
            success: true,
            data: {
                nabhStatus: hospital.nabh_status === 'Yes' ? 'Full Accreditation' : 'Pending/No Accreditation',
                nabhValidTill: hospital.nabh_valid_to ? hospital.nabh_valid_to.toISOString().split('T')[0] : 'N/A',
                validityRemainingDays: hospital.validity_days || 0,
                nextRenewalDate: hospital.nabh_valid_to ? new Date(new Date(hospital.nabh_valid_to).setMonth(new Date(hospital.nabh_valid_to).getMonth() + 1)).toISOString().split('T')[0] : 'N/A',
                incentiveAmount: latestIncentive.amount,
                incentiveStatus: latestIncentive.status,
                recentUpdates: recentUpdates,
                hospitalName: hospital.hospital_name
            }
        });

    } catch (err) {
        console.error("Error in getAyushHospitalDashboard:", err);
        res.status(500).json({ success: false, message: "Server error while fetching dashboard data" });
    }
}

async function registerAfterOtp(req, res) {
    try {
        const {
            hospitalName,
            ayushSystem,
            hospitalType,
            registrationNumber,
            nabhStatus,
            nabhCertificateNumber,
            nabhValidityStart,
            nabhValidityEnd,
            state,
            district,
            address,
            contactPersonName,
            contactEmail,
            contactMobile
        } = req.body;

        // Issue 1: Backend Validation
        if (!ayushSystem) {
            return res.status(400).json({ success: false, message: "AYUSH System is required." });
        }
        if (!contactEmail) {
            return res.status(400).json({ success: false, message: "Contact email is required." });
        }

        // Issue 3: Check user existence and role
        const userRes = await db.query(
            "SELECT id, role FROM users WHERE LOWER(email) = LOWER($1)",
            [contactEmail]
        );

        if (userRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found. Ensure primary registration is completed." });
        }

        const user = userRes.rows[0];
        if (user.role !== 'ayush_hospital') {
            return res.status(400).json({
                success: false,
                message: `This email belongs to a ${user.role.replace('_', ' ')} account. One email can only have one role.`
            });
        }

        const userId = user.id;

        // Issue 1: DB Insert
        const query = `
            INSERT INTO ayush_hospitals (
                user_id, hospital_name, ayush_system, hospital_type, 
                registration_number, nabh_status, nabh_certificate_number, 
                nabh_valid_from, nabh_valid_to, state, district, address, 
                contact_name, contact_email, contact_mobile, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'SUBMITTED')
            RETURNING id
        `;

        const values = [
            userId, hospitalName, ayushSystem, hospitalType,
            registrationNumber, nabhStatus || 'No', nabhCertificateNumber || null,
            nabhValidityStart || null, nabhValidityEnd || null,
            state, district, address,
            contactPersonName, contactEmail, contactMobile
        ];

        const hospitalRes = await db.query(query, values);
        const hospitalId = hospitalRes.rows[0].id;

        // Auto-Init Patient Stats
        try {
            await db.query(
                `INSERT INTO ayush_hospital_patient_stats (hospital_id) VALUES ($1)`,
                [hospitalId]
            );
        } catch (statsErr) {
            console.error("Non-critical error auto-initializing patient stats during registration:", statsErr.message);
        }

        res.status(201).json({
            success: true,
            message: "AYUSH Hospital registration completed successfully.",
            hospitalId: hospitalId
        });

    } catch (err) {
        console.error("Error in registerAfterOtp:", err);
        if (err.code === '23502') {
            return res.status(400).json({ success: false, message: `Missing required field: ${err.column}` });
        }
        res.status(500).json({ success: false, message: "Server error while saving hospital details" });
    }
}

async function uploadDocuments(req, res) {
    try {
        const userId = req.user.userId;
        const files = req.files;

        if (!files || Object.keys(files).length === 0) {
            return res.status(400).json({ success: false, message: "No files uploaded" });
        }

        // Fetch hospital_id
        const hospitalRes = await db.query("SELECT id FROM ayush_hospitals WHERE user_id = $1", [userId]);
        if (hospitalRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Hospital record not found" });
        }
        const hospitalId = hospitalRes.rows[0].id;

        const results = [];

        if (files.nabhCertificate) {
            const file = files.nabhCertificate[0];
            const resCert = await db.query(
                `INSERT INTO ayush_hospital_documents (hospital_id, document_type, file_name, file_path) 
                 VALUES ($1, 'NABH_CERTIFICATE', $2, $3) RETURNING *`,
                [hospitalId, file.originalname, file.path]
            );
            results.push(resCert.rows[0]);

            // Also update main table for quick ref
            await db.query("UPDATE ayush_hospitals SET nabh_certificate_path = $1 WHERE id = $2", [file.path, hospitalId]);
        }

        if (files.supportingDocument) {
            const file = files.supportingDocument[0];
            const resDoc = await db.query(
                `INSERT INTO ayush_hospital_documents (hospital_id, document_type, file_name, file_path) 
                 VALUES ($1, 'SUPPORTING_DOC', $2, $3) RETURNING *`,
                [hospitalId, file.originalname, file.path]
            );
            results.push(resDoc.rows[0]);

            // Also update main table for quick ref
            await db.query("UPDATE ayush_hospitals SET supporting_documents_path = $1 WHERE id = $2", [file.path, hospitalId]);
        }

        res.json({
            success: true,
            message: "Documents uploaded successfully",
            data: results
        });

    } catch (err) {
        console.error("Error in uploadDocuments:", err);
        res.status(500).json({ success: false, message: "Server error during document upload" });
    }
}

async function getAyushHospitalDocuments(req, res) {
    try {
        const userId = req.user.userId;

        const query = `
            SELECT 
                document_type as "type", 
                file_name as "fileName", 
                upload_status as "status", 
                TO_CHAR(uploaded_at, 'YYYY-MM-DD') as "uploadedAt", 
                remarks 
            FROM ayush_hospital_documents d
            JOIN ayush_hospitals h ON d.hospital_id = h.id
            WHERE h.user_id = $1
            ORDER BY uploaded_at DESC
        `;

        const result = await db.query(query, [userId]);

        res.json({
            success: true,
            documents: result.rows
        });

    } catch (err) {
        console.error("Error in getAyushHospitalDocuments:", err);
        res.status(500).json({ success: false, message: "Server error while fetching documents" });
    }
}

async function getAyushHospitalProfile(req, res) {
    try {
        const userId = req.user.userId;

        const result = await db.query(
            "SELECT * FROM ayush_hospitals WHERE user_id = $1",
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Hospital profile not found" });
        }

        const h = result.rows[0];

        res.json({
            success: true,
            data: {
                hospitalName: h.hospital_name,
                ayushSystem: h.ayush_system,
                hospitalType: h.hospital_type,
                registrationNumber: h.registration_number,
                address: h.address,
                state: h.state,
                district: h.district,
                email: h.contact_email,
                mobile: h.contact_mobile,
                contactPerson: h.contact_name,
                totalBeds: h.total_beds || 0,
                departments: h.departments || [],
                nabh: {
                    status: h.nabh_status === 'Yes' ? 'Fully Accredited' : 'No Accreditation',
                    certificateNumber: h.nabh_certificate_number || "N/A",
                    validTill: h.nabh_valid_to ? h.nabh_valid_to.toISOString().split('T')[0] : "N/A"
                },
                verification: {
                    district: h.district_verification_status || "Pending",
                    directorate: h.directorate_verification_status || "Pending",
                    verifiedAt: h.verified_at ? h.verified_at.toISOString().split('T')[0] : "Not yet verified"
                },
                id: h.id
            }
        });

    } catch (err) {
        console.error("Error in getAyushHospitalProfile:", err);
        res.status(500).json({ success: false, message: "Server error while fetching profile" });
    }
}

async function getAyushHospitalIncentive(req, res) {
    try {
        const userId = req.user.userId;

        let incentiveData = null;
        try {
            const result = await db.query(
                "SELECT * FROM ayush_hospital_incentives WHERE user_id = $1 ORDER BY applied_at DESC LIMIT 1",
                [userId]
            );

            if (result.rows.length > 0) {
                const i = result.rows[0];
                incentiveData = {
                    incentiveType: i.incentive_type,
                    amount: parseFloat(i.incentive_amount || 0),
                    applicationStatus: i.application_status,
                    districtStatus: i.district_status,
                    directorateStatus: i.directorate_status,
                    appliedAt: i.applied_at ? i.applied_at.toISOString().split('T')[0] : 'N/A'
                };
            }
        } catch (dbErr) {
            console.error("Non-critical DB error in getAyushHospitalIncentive:", dbErr.message);
            // Default to null data if table or query fails
        }

        res.json({
            success: true,
            data: incentiveData
        });

    } catch (err) {
        console.error("Error in getAyushHospitalIncentive:", err);
        res.status(500).json({ success: false, message: "Server error while fetching incentive data" });
    }
}

async function applyForIncentive(req, res) {
    try {
        const userId = req.user.userId;

        // 1. Check if hospital exists and is accredited
        const hospitalRes = await db.query(
            "SELECT id, nabh_status FROM ayush_hospitals WHERE user_id = $1",
            [userId]
        );

        if (hospitalRes.rows.length === 0) {
            return res.status(400).json({ success: false, message: "Hospital profile incomplete. Please complete registration details first." });
        }

        const hospital = hospitalRes.rows[0];
        if (hospital.nabh_status !== 'Yes') {
            return res.status(400).json({ success: false, message: "Only NABH Accredited hospitals are eligible for this incentive." });
        }

        // 2. Check for duplicate application
        const existingApp = await db.query(
            "SELECT id FROM ayush_hospital_incentives WHERE hospital_id = $1 AND application_status != 'REJECTED'",
            [hospital.id]
        );

        if (existingApp.rows.length > 0) {
            return res.status(400).json({ success: false, message: "An active incentive application already exists for this hospital." });
        }

        // 3. Create application in incentives table
        const queryIncentive = `
            INSERT INTO ayush_hospital_incentives (
                user_id, hospital_id, incentive_type, incentive_amount, 
                application_status, district_status, directorate_status
            ) VALUES ($1, $2, 'NABH Accreditation Incentive', 500000.00, 'SUBMITTED', 'PENDING', 'PENDING')
            RETURNING id
        `;
        const incentiveRes = await db.query(queryIncentive, [userId, hospital.id]);

        // 4. Create record in application_status table for workflow tracking
        const queryStatus = `
            INSERT INTO ayush_hospital_application_status (
                hospital_id, application_type, current_status, 
                district_status, directorate_status
            ) VALUES ($1, 'NABH_ACCREDITATION_INCENTIVE', 'SUBMITTED', 'PENDING', 'PENDING')
        `;
        await db.query(queryStatus, [hospital.id]);

        res.status(201).json({ success: true, message: "Incentive application submitted successfully!" });

    } catch (err) {
        console.error("Error in applyForIncentive:", err);
        res.status(500).json({ success: false, message: "Server error during incentive application" });
    }
}

async function getAyushHospitalApplicationStatus(req, res) {
    try {
        const userId = req.user.userId;

        let responseData = {
            hasApplication: false,
            eligibleSchemes: [
                {
                    type: "NABH Accreditation Incentive",
                    description: "Financial incentive for NABH accredited AYUSH hospitals to promote quality certification."
                }
            ]
        };

        try {
            const query = `
                SELECT 
                    s.application_type,
                    s.current_status,
                    s.district_status,
                    s.district_remarks,
                    TO_CHAR(s.district_action_at, 'YYYY-MM-DD') as district_date,
                    s.directorate_status,
                    s.directorate_remarks,
                    TO_CHAR(s.directorate_action_at, 'YYYY-MM-DD') as directorate_date,
                    TO_CHAR(s.created_at, 'YYYY-MM-DD') as submitted_date
                FROM ayush_hospital_application_status s
                JOIN ayush_hospitals h ON s.hospital_id = h.id
                WHERE h.user_id = $1
                ORDER BY s.created_at DESC
                LIMIT 1
            `;

            const result = await db.query(query, [userId]);

            if (result.rows.length > 0) {
                const s = result.rows[0];

                responseData = {
                    hasApplication: true,
                    applicationType: s.application_type.replace(/_/g, ' '),
                    currentStatus: s.current_status,
                    workflow: {
                        submitted: {
                            status: "Completed",
                            date: s.submitted_date,
                            remarks: "Application successfully submitted via portal."
                        },
                        district: {
                            status: s.district_status === 'VERIFIED' ? 'Verified' : (s.district_status === 'REJECTED' ? 'Rejected' : 'Pending'),
                            date: s.district_date,
                            remarks: s.district_remarks
                        },
                        directorate: {
                            status: s.directorate_status === 'APPROVED' ? 'Approved' : (s.directorate_status === 'REJECTED' ? 'Rejected' : 'Pending'),
                            date: s.directorate_date,
                            remarks: s.directorate_remarks
                        }
                    }
                };
            }
        } catch (dbErr) {
            console.error("Non-critical DB error in getAyushHospitalApplicationStatus:", dbErr.message);
        }

        res.json({
            success: true,
            data: responseData
        });

    } catch (err) {
        console.error("Error in getAyushHospitalApplicationStatus:", err);
        res.status(500).json({ success: false, message: "Server error while fetching application status" });
    }
}
async function getAyushHospitalValidity(req, res) {
    try {
        const userId = req.user.userId;

        const result = await db.query(
            `SELECT 
                nabh_valid_from, 
                nabh_valid_to, 
                nabh_status,
                (nabh_valid_to - CURRENT_DATE) as days_remaining
             FROM ayush_hospitals 
             WHERE user_id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.json({ success: true, data: null });
        }

        const h = result.rows[0];

        // Return null if no validity data entered yet
        if (!h.nabh_valid_to) {
            return res.json({ success: true, data: null });
        }

        const daysRemaining = parseInt(h.days_remaining) || 0;
        let validityState = 'ACTIVE';

        if (daysRemaining <= 0) {
            validityState = 'EXPIRED';
        } else if (daysRemaining <= 90) {
            validityState = 'EXPIRING_SOON';
        }

        res.json({
            success: true,
            data: {
                validFrom: h.nabh_valid_from ? h.nabh_valid_from.toISOString().split('T')[0] : null,
                validTo: h.nabh_valid_to ? h.nabh_valid_to.toISOString().split('T')[0] : null,
                daysRemaining: daysRemaining,
                validityState: validityState,
                nabhStatus: h.nabh_status
            }
        });

    } catch (err) {
        console.error("Error in getAyushHospitalValidity:", err);
        res.status(500).json({ success: false, message: "Server error while fetching validity data" });
    }
}
async function getAyushHospitalPatientSummary(req, res) {
    try {
        const userId = req.user.userId;

        try {
            const result = await db.query(
                `SELECT 
                    COALESCE(s.opd_count, 0) as opd_monthly, 
                    COALESCE(s.ipd_count, 0) as ipd_monthly
                 FROM ayush_hospitals h
                 LEFT JOIN ayush_hospital_operational_stats s ON h.id = s.hospital_id
                 WHERE h.user_id = $1`,
                [userId]
            );

            const s = result.rows[0] || { opd_monthly: 0, ipd_monthly: 0 };

            return res.json({
                success: true,
                data: {
                    opdMonthly: parseInt(s.opd_monthly),
                    ipdMonthly: parseInt(s.ipd_monthly),
                    totalMonthly: parseInt(s.opd_monthly) + parseInt(s.ipd_monthly)
                }
            });
        } catch (dbErr) {
            console.error("Database error in getAyushHospitalPatientSummary:", dbErr.message);
            // Return 0s if table doesn't exist yet
            return res.json({
                success: true,
                data: { opdMonthly: 0, ipdMonthly: 0, totalMonthly: 0 }
            });
        }
    } catch (err) {
        console.error("Serious error in getAyushHospitalPatientSummary:", err);
        res.status(500).json({ success: false, message: "System error" });
    }
}

async function getAyushHospitalPatientStats(req, res) {
    try {
        const userId = req.user.userId;

        try {
            const result = await db.query(
                `SELECT 
                    COALESCE(s.opd_count, 0) as opd_monthly, 
                    COALESCE(s.ipd_count, 0) as ipd_monthly, 
                    COALESCE(s.opd_count * 12, 0) as opd_annual, 
                    COALESCE(s.ipd_count * 12, 0) as ipd_annual, 
                    TO_CHAR(COALESCE(s.updated_at, CURRENT_TIMESTAMP), 'YYYY-MM-DD') as last_updated
                 FROM ayush_hospitals h
                 LEFT JOIN ayush_hospital_operational_stats s ON h.id = s.hospital_id
                 WHERE h.user_id = $1`,
                [userId]
            );

            if (result.rows.length === 0) {
                return res.json({ success: true, data: null });
            }

            const s = result.rows[0];
            res.json({
                success: true,
                data: {
                    opdMonthly: s.opd_monthly,
                    ipdMonthly: s.ipd_monthly,
                    opdAnnual: s.opd_annual,
                    ipdAnnual: s.ipd_annual,
                    lastUpdated: s.last_updated
                }
            });
        } catch (dbErr) {
            console.error("Database error in getAyushHospitalPatientStats:", dbErr.message);
            return res.json({ success: true, data: null });
        }
    } catch (err) {
        console.error("Serious error in getAyushHospitalPatientStats:", err);
        res.status(500).json({ success: false, message: "System error" });
    }
}

async function getOperationalStats(req, res) {
    try {
        const userId = req.user.userId;
        const result = await db.query(
            "SELECT s.* FROM ayush_hospital_operational_stats s JOIN ayush_hospitals h ON s.hospital_id = h.id WHERE h.user_id = $1",
            [userId]
        );

        res.json({
            success: true,
            data: result.rows[0] || { opd_count: 0, ipd_count: 0 }
        });
    } catch (err) {
        console.error("Error in getOperationalStats:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

async function updateOperationalStats(req, res) {
    try {
        const userId = req.user.userId;
        const { opdCount, ipdCount } = req.body;

        // Fetch hospital_id
        const hospitalRes = await db.query("SELECT id FROM ayush_hospitals WHERE user_id = $1", [userId]);
        if (hospitalRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Hospital record not found" });
        }
        const hospitalId = hospitalRes.rows[0].id;

        const result = await db.query(
            `INSERT INTO ayush_hospital_operational_stats (hospital_id, opd_count, ipd_count)
             VALUES ($1, $2, $3)
             ON CONFLICT (hospital_id) 
             DO UPDATE SET opd_count = $2, ipd_count = $3, updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [hospitalId, parseInt(opdCount) || 0, parseInt(ipdCount) || 0]
        );

        res.json({
            success: true,
            message: "Operational stats updated successfully",
            data: result.rows[0]
        });
    } catch (err) {
        console.error("Error in updateOperationalStats:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

async function updateAyushHospitalProfile(req, res) {
    const client = await db.getPool().connect();
    try {
        const userId = req.user.userId;
        const { totalBeds, departments, opdCount, ipdCount } = req.body;

        // Validation
        if (totalBeds !== undefined && (parseInt(totalBeds) < 0 || isNaN(parseInt(totalBeds)))) {
            return res.status(400).json({ success: false, message: "Total beds must be a positive integer" });
        }

        await client.query('BEGIN');

        // 1. Update ayush_hospitals
        const profileUpdateRes = await client.query(
            `UPDATE ayush_hospitals 
             SET total_beds = COALESCE($1, total_beds), 
                 departments = COALESCE($2, departments),
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $3
             RETURNING id`,
            [totalBeds, departments ? JSON.stringify(departments) : null, userId]
        );

        if (profileUpdateRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: "Hospital record not found" });
        }

        const hospitalId = profileUpdateRes.rows[0].id;

        // 2. Update operational stats if provided
        if (opdCount !== undefined || ipdCount !== undefined) {
            await client.query(
                `INSERT INTO ayush_hospital_operational_stats (hospital_id, opd_count, ipd_count)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (hospital_id) 
                 DO UPDATE SET 
                    opd_count = COALESCE($2, ayush_hospital_operational_stats.opd_count), 
                    ipd_count = COALESCE($3, ayush_hospital_operational_stats.ipd_count), 
                    updated_at = CURRENT_TIMESTAMP`,
                [hospitalId, opdCount !== undefined ? parseInt(opdCount) : null, ipdCount !== undefined ? parseInt(ipdCount) : null]
            );
        }

        await client.query('COMMIT');

        res.json({
            success: true,
            message: "Hospital profile updated successfully"
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error in updateAyushHospitalProfile:", err);
        res.status(500).json({ success: false, message: "Server error while updating profile" });
    } finally {
        client.release();
    }
}

async function getClinicalInfra(req, res) {
    try {
        const userId = req.user.userId;
        const result = await db.query(
            "SELECT i.* FROM ayush_hospital_clinical_infra i JOIN ayush_hospitals h ON i.hospital_id = h.id WHERE h.user_id = $1",
            [userId]
        );

        res.json({
            success: true,
            data: result.rows[0] || null
        });
    } catch (err) {
        console.error("Error in getClinicalInfra:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

async function updateClinicalInfra(req, res) {
    try {
        const userId = req.user.userId;
        const {
            totalBeds,
            totalDepartments,
            hasOpd,
            hasIpd,
            hasOt,
            hasIcu,
            hasDiagnostics,
            hasPharmacy
        } = req.body;

        // Validation
        if (totalBeds !== undefined && totalBeds < 0) return res.status(400).json({ success: false, message: "Total beds must be >= 0" });
        if (totalDepartments !== undefined && totalDepartments < 0) return res.status(400).json({ success: false, message: "Total departments must be >= 0" });

        // Get hospital_id
        const hospitalRes = await db.query("SELECT id FROM ayush_hospitals WHERE user_id = $1", [userId]);
        if (hospitalRes.rows.length === 0) return res.status(404).json({ success: false, message: "Hospital not found" });
        const hospitalId = hospitalRes.rows[0].id;

        const result = await db.query(
            `INSERT INTO ayush_hospital_clinical_infra 
             (hospital_id, total_beds, total_departments, has_opd, has_ipd, has_ot, has_icu, has_diagnostics, has_pharmacy)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (hospital_id) 
             DO UPDATE SET 
                total_beds = $2, 
                total_departments = $3, 
                has_opd = $4, 
                has_ipd = $5, 
                has_ot = $6, 
                has_icu = $7, 
                has_diagnostics = $8, 
                has_pharmacy = $9,
                updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [hospitalId, totalBeds || 0, totalDepartments || 0, hasOpd || false, hasIpd || false, hasOt || false, hasIcu || false, hasDiagnostics || false, hasPharmacy || false]
        );

        res.json({
            success: true,
            message: "Clinical infrastructure updated successfully",
            data: result.rows[0]
        });
    } catch (err) {
        console.error("Error in updateClinicalInfra:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

module.exports = {
    getAyushHospitalDashboard,
    registerAfterOtp,
    uploadDocuments,
    getAyushHospitalProfile,
    getAyushHospitalIncentive,
    applyForIncentive,
    getAyushHospitalDocuments,
    getAyushHospitalApplicationStatus,
    getAyushHospitalValidity,
    getAyushHospitalPatientSummary,
    getAyushHospitalPatientStats,
    getOperationalStats,
    updateOperationalStats,
    updateAyushHospitalProfile,
    getClinicalInfra,
    updateClinicalInfra
};
