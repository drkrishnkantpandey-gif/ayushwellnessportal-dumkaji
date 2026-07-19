import React, { useState, useEffect } from "react";
import axiosInstance from "../../../config/axiosInstance";
import API from "../../../config/api";
import { 
  Building2, 
  MapPin, 
  Briefcase, 
  FileText, 
  Clock, 
  Printer, 
  CheckCircle, 
  AlertTriangle, 
  Save, 
  ShieldCheck, 
  HelpCircle,
  RefreshCcw,
  Award
} from "lucide-react";
import { toast } from "react-toastify";

const DISTRICT_OPTIONS = [
  "Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun",
  "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag",
  "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"
];

const ENTITY_TYPES = [
  "Proprietership", "Trust", "Society", "Other NGO",
  "Government", "Private Limited", "LLP", "Other"
];

export default function WellnessCentreProfile() {
  const [profile, setProfile] = useState(null);
  const [opReg, setOpReg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // "profile" or "op_reg"
  const [opRegSectionTab, setOpRegSectionTab] = useState("section1");
  const [complianceComment, setComplianceComment] = useState("");
  const [complianceFile, setComplianceFile] = useState(null);
  const [submittingCompliance, setSubmittingCompliance] = useState(false);

  const fetchProfile = async () => {
    try {
      const [profileRes, opRegRes] = await Promise.all([
        axiosInstance.get(`${API}/api/wellness/profile`),
        axiosInstance.get(`${API}/api/wellness/operational-registration`)
      ]);
      if (profileRes.data.success) {
        setProfile(profileRes.data.data);
      }
      if (opRegRes.data.success && opRegRes.data.data) {
        setOpReg(opRegRes.data.data);
        setActiveTab("op_reg"); // Default to showing application details if submitted
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile or application details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axiosInstance.put(`${API}/api/wellness/profile`, profile);
      toast.success("Profile updated successfully!");
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitCompliance = async () => {
    if (!complianceComment.trim()) {
      alert("Compliance comment is required.");
      return;
    }
    setSubmittingCompliance(true);
    try {
      const formData = new FormData();
      formData.append("comment", complianceComment);
      if (complianceFile) {
        formData.append("compliance_document", complianceFile);
      }

      const res = await axiosInstance.post(`${API}/api/wellness/submit-compliance`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        toast.success("Compliance submitted successfully!");
        setComplianceComment("");
        setComplianceFile(null);
        await fetchProfile();
      }
    } catch (err) {
      console.error("Error submitting compliance:", err);
      toast.error(err.response?.data?.message || "Failed to submit compliance.");
    } finally {
      setSubmittingCompliance(false);
    }
  };

  const handlePrint = () => {
    if (!opReg) return;
    const printWindow = window.open("", "_blank");
    
    const htmlContent = `
      <html>
      <head>
        <title>Application Details - ${opReg.registration_number || 'Draft'}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; }
          .header { border-bottom: 2px solid #0f766e; padding-bottom: 20px; margin-bottom: 30px; text-align: center; }
          .title { font-size: 24px; font-weight: 800; color: #0f766e; margin: 0; }
          .subtitle { font-size: 14px; color: #64748b; margin-top: 5px; }
          .section-title { font-size: 16px; font-weight: 700; color: #0f766e; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin: 25px 0 15px 0; text-transform: uppercase; letter-spacing: 0.05em; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 10px; }
          .field { margin-bottom: 8px; }
          .label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px; }
          .value { font-size: 14px; color: #1e293b; font-weight: 500; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 50px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
          .status-submitted { background-color: #dbeafe; color: #1e40af; }
          .status-approved { background-color: #dcfce7; color: #166534; }
          .status-reverted { background-color: #fef3c7; color: #92400e; }
          .status-rejected { background-color: #fee2e2; color: #991b1b; }
          .timeline { border-left: 2px solid #e2e8f0; padding-left: 20px; margin-left: 10px; }
          .timeline-item { position: relative; margin-bottom: 20px; }
          .timeline-item::before { content: ''; position: absolute; left: -26px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background-color: #0f766e; border: 2px solid #fff; }
          .timeline-title { font-size: 13px; font-weight: 700; color: #1e293b; }
          .timeline-meta { font-size: 11px; color: #64748b; margin-bottom: 4px; }
          .timeline-comment { font-size: 13px; color: #475569; background-color: #f8fafc; border-left: 3px solid #cbd5e1; padding: 8px; border-radius: 4px; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">AYUSH Wellness Centre Registration Portal</div>
          <div class="subtitle">Operational Registration Application - ${opReg.registration_number || 'Draft'}</div>
          <div style="margin-top: 15px;">
            Status: <span class="status-badge status-${(opReg.status || 'SUBMITTED').toLowerCase()}">${opReg.status || 'SUBMITTED'}</span>
          </div>
        </div>

        <div class="section-title">Section 1: Basic Information</div>
        <div class="grid-2">
          <div class="field"><div class="label">Centre Name</div><div class="value">${opReg.centre_name || '—'}</div></div>
          <div class="field"><div class="label">District</div><div class="value">${opReg.district || '—'}</div></div>
        </div>
        <div class="grid-2">
          <div class="field"><div class="label">Address</div><div class="value">${opReg.address || '—'}</div></div>
          <div class="field"><div class="label">Google Map Link</div><div class="value">${opReg.google_map_link || '—'}</div></div>
        </div>
        <div class="grid-2">
          <div class="field"><div class="label">GPS Latitude / Longitude</div><div class="value">${opReg.gps_lat || '—'} / ${opReg.gps_lng || '—'}</div></div>
          <div class="field"><div class="label">Owner Name / Mobile</div><div class="value">${opReg.owner_name || '—'} / ${opReg.mobile || '—'}</div></div>
        </div>
        <div class="grid-2">
          <div class="field"><div class="label">Category</div><div class="value" style="font-weight: 700; color: #0f766e;">${opReg.category || '—'}</div></div>
          <div class="field"><div class="label">Residential Facility</div><div class="value">${opReg.is_residential ? 'Yes' : 'No'}</div></div>
        </div>
        <div class="grid-2">
          <div class="field"><div class="label">Offers Clinical Services</div><div class="value">${opReg.offers_clinical ? 'Yes' : 'No'}</div></div>
          <div class="field"><div class="label">Services Offered</div><div class="value">${(opReg.services_offered || []).join(", ") || '—'}</div></div>
        </div>

        <div class="section-title">Section 2: Clinical Information</div>
        <div class="grid-2">
          <div class="field"><div class="label">Doctor Appointed</div><div class="value">${opReg.doctor_appointed ? 'Yes' : 'No'}</div></div>
          <div class="field"><div class="label">Doctor Name</div><div class="value">${opReg.doctor_name || '—'}</div></div>
        </div>
        <div class="grid-2">
          <div class="field"><div class="label">Doctor Qualification</div><div class="value">${opReg.doctor_qualification || '—'}</div></div>
          <div class="field"><div class="label">BCP Registration Number</div><div class="value">${opReg.bcp_reg_number || '—'}</div></div>
        </div>
        <div class="grid-2">
          <div class="field"><div class="label">CEA Registered</div><div class="value">${opReg.cea_registered ? 'Yes' : 'No'}</div></div>
          <div class="field"><div class="label">CEA Registration Number</div><div class="value">${opReg.cea_reg_number || '—'}</div></div>
        </div>
        <div class="grid-2">
          <div class="field"><div class="label">CEA Validity Date</div><div class="value">${opReg.cea_valid_till ? new Date(opReg.cea_valid_till).toLocaleDateString('en-IN') : '—'}</div></div>
          <div class="field"><div class="label">Clinical Signboards / Details Declaration</div><div class="value">${opReg.declaration_board ? 'Accepted' : '—'} / ${opReg.declaration_signboard ? 'Accepted' : '—'}</div></div>
        </div>

        <div class="section-title">Section 3: Rooms and Infrastructure</div>
        <div class="grid-2">
          <div class="field"><div class="label">Reception Area Size</div><div class="value">${opReg.reception_area_sqft ? opReg.reception_area_sqft + ' sqft' : '—'}</div></div>
          <div class="field"><div class="label">Waiting Capacity</div><div class="value">${opReg.waiting_capacity || '—'} persons</div></div>
        </div>
        <div class="grid-2">
          <div class="field"><div class="label">Consultation Rooms Count</div><div class="value">${opReg.consultation_rooms || '—'}</div></div>
          <div class="field"><div class="label">Total Beds</div><div class="value">${opReg.num_beds || '—'}</div></div>
        </div>
        <div class="grid-2">
          <div class="field"><div class="label">Incharge Name / Mobile</div><div class="value">${opReg.incharge_name || '—'} / ${opReg.incharge_mobile || '—'}</div></div>
          <div class="field"><div class="label">Emergency Referral Centre / Distance</div><div class="value">${opReg.emergency_centre_name || '—'} (${opReg.emergency_distance_m || '—'} km)</div></div>
        </div>
        <div class="grid-2">
          <div class="field"><div class="label">Offers Prakruti Assessment</div><div class="value">${opReg.offers_prakruti ? 'Yes' : 'No'}</div></div>
          <div class="field"><div class="label">Kitchen / Dosha Dietetics</div><div class="value">${opReg.kitchen_available ? 'Available' : '—'} / ${opReg.dosha_dietetics ? 'Available' : '—'}</div></div>
        </div>

        <div class="section-title">Section 4: Staff Details</div>
        <div class="grid-2">
          <div class="field"><div class="label">Receptionist Count</div><div class="value">${opReg.receptionist_count || '—'}</div></div>
          <div class="field"><div class="label">Sanitation Worker Count</div><div class="value">${opReg.sanitation_worker_count || '—'}</div></div>
        </div>
        <div class="grid-2">
          <div class="field"><div class="label">Multi-Purpose Workers (MPW)</div><div class="value">${opReg.mpw_count || '—'}</div></div>
          <div class="field"><div class="label">Cook / Guard Count</div><div class="value">${opReg.cook_count || '—'} / ${opReg.watchman_count || '—'}</div></div>
        </div>
        
        ${opReg.pharmacist_name ? `
        <div class="grid-2">
          <div class="field"><div class="label">Pharmacist Name</div><div class="value">${opReg.pharmacist_name}</div></div>
          <div class="field"><div class="label">Pharmacist Registration Number</div><div class="value">${opReg.pharmacist_reg_number}</div></div>
        </div>
        ` : ''}

        ${opReg.wc_attendant_count ? `
        <div class="grid-2">
          <div class="field"><div class="label">Attendants Count</div><div class="value">${opReg.wc_attendant_count}</div></div>
          <div class="field"><div class="label">Ayurveda Nurse Count</div><div class="value">${opReg.ayurveda_nurse_count}</div></div>
        </div>
        ` : ''}

        ${opReg.male_panchakarma_therapist ? `
        <div class="grid-2">
          <div class="field"><div class="label">Male Panchakarma Therapists</div><div class="value">${opReg.male_panchakarma_therapist}</div></div>
          <div class="field"><div class="label">Female Panchakarma Therapists</div><div class="value">${opReg.female_panchakarma_therapist}</div></div>
        </div>
        ` : ''}

        ${opReg.yoga_instructor_count ? `
        <div class="grid-2">
          <div class="field"><div class="label">Yoga Instructors Count</div><div class="value">${opReg.yoga_instructor_count}</div></div>
          <div class="field"></div>
        </div>
        ` : ''}

        ${opReg.bnys_doctor_name ? `
        <div class="grid-2">
          <div class="field"><div class="label">Naturopathy BNYS Doctor Name</div><div class="value">${opReg.bnys_doctor_name}</div></div>
          <div class="field"><div class="label">Male / Female Attendants</div><div class="value">${opReg.male_naturopathy_attendant} / ${opReg.female_naturopathy_attendant}</div></div>
        </div>
        ` : ''}

        <div class="section-title">Section 5: Fee & Declarations</div>
        <div class="grid-2">
          <div class="field"><div class="label">Fee Deposited</div><div class="value">${opReg.fee_deposited ? 'Yes' : 'No'}</div></div>
          <div class="field"><div class="label">All Declarations Accepted</div><div class="value">${opReg.all_declarations_accepted ? 'Yes' : 'No'}</div></div>
        </div>

        <div class="section-title">Application Compliance & Action History Log</div>
        <div class="timeline">
          ${(opReg.events || []).map(event => `
            <div class="timeline-item">
              <div class="timeline-title">${event.event_type} - By ${event.actor_name} (${event.actor_role})</div>
              <div class="timeline-meta">${new Date(event.created_at).toLocaleString('en-IN')}</div>
              ${event.comment ? `<div class="timeline-comment">${event.comment}</div>` : ''}
            </div>
          `).join("") || '<p style="color: #64748b; font-style: italic;">No logs recorded yet.</p>'}
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handlePrintCertificate = () => {
    if (!opReg || opReg.status !== 'APPROVED') return;
    const printWindow = window.open("", "_blank");
    
    const htmlContent = `
      <html>
      <head>
        <title>Registration Certificate - ${opReg.registration_number}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Montserrat:wght@400;500;600;700&display=swap');
          body {
            font-family: 'Montserrat', sans-serif;
            color: #1e293b;
            padding: 0;
            margin: 0;
            background-color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          .certificate-container {
            width: 850px;
            height: 600px;
            padding: 40px;
            border: 20px solid #0f766e;
            border-style: double;
            border-width: 15px;
            box-sizing: border-box;
            position: relative;
            background: radial-gradient(circle, #fcfdfd 0%, #f0fdfa 100%);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .corner-decoration {
            position: absolute;
            width: 30px;
            height: 30px;
            border: 4px solid #0d9488;
          }
          .top-left { top: 10px; left: 10px; border-right: none; border-bottom: none; }
          .top-right { top: 10px; right: 10px; border-left: none; border-bottom: none; }
          .bottom-left { bottom: 10px; left: 10px; border-right: none; border-top: none; }
          .bottom-right { bottom: 10px; right: 10px; border-left: none; border-top: none; }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
          }
          .govt-logo-uk {
            width: 75px;
            height: 75px;
            object-fit: contain;
            background: transparent;
            mix-blend-mode: multiply;
          }
          .govt-logo-setu {
            width: 150px;
            height: 75px;
            object-fit: contain;
            background: transparent;
            mix-blend-mode: multiply;
          }
          .dept-title {
            font-family: 'Cinzel', serif;
            font-size: 18px;
            font-weight: 800;
            color: #0f766e;
            letter-spacing: 0.1em;
            margin: 0;
          }
          .state-title {
            font-size: 11px;
            font-weight: 600;
            color: #64748b;
            letter-spacing: 0.2em;
            margin-top: 3px;
            text-transform: uppercase;
          }
          
          .body-content {
            text-align: center;
            margin: 25px 0;
          }
          .cert-title {
            font-family: 'Cinzel', serif;
            font-size: 26px;
            font-weight: 800;
            color: #115e59;
            margin: 0 0 15px 0;
            letter-spacing: 0.05em;
            border-bottom: 2px solid #99f6e4;
            display: inline-block;
            padding-bottom: 5px;
          }
          .cert-text {
            font-size: 14px;
            line-height: 1.6;
            color: #334155;
            max-width: 700px;
            margin: 0 auto;
          }
          .highlight {
            font-weight: 700;
            color: #0f766e;
          }
          
          .meta-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            font-size: 13px;
            margin: 15px auto;
            max-width: 650px;
            background-color: rgba(20, 184, 166, 0.04);
            border: 1px solid #ccfbf1;
            padding: 12px;
            border-radius: 8px;
            text-align: left;
            box-sizing: border-box;
            width: 100%;
          }
          .meta-item {
            display: flex;
            justify-content: space-between;
          }
          .meta-label {
            font-weight: 600;
            color: #475569;
          }
          .meta-val {
            font-weight: 700;
            color: #0f766e;
          }

          .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 10px;
          }
          .validity-block {
            text-align: left;
            font-size: 12px;
            color: #475569;
          }
          .validity-block p {
            margin: 3px 0;
          }
          .signature-block {
            text-align: center;
            border-top: 1px dashed #94a3b8;
            padding-top: 8px;
            width: 250px;
          }
          .signature-block p {
            margin: 2px 0;
          }
          .sig-title {
            font-weight: 700;
            color: #0f766e;
            font-size: 13px;
          }
          .sig-subtitle {
            font-size: 11px;
            color: #64748b;
          }
          .sig-verify {
            font-size: 9px;
            color: #10b981;
            font-weight: 600;
            margin-top: 5px !important;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 3px;
          }
          
          @media print {
            body { background: none; }
            .certificate-container {
              box-shadow: none;
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="certificate-container">
          <div class="corner-decoration top-left"></div>
          <div class="corner-decoration top-right"></div>
          <div class="corner-decoration bottom-left"></div>
          <div class="corner-decoration bottom-right"></div>
          
          <div class="header">
            <div style="width: 150px; display: flex; justify-content: flex-start;">
              <img class="govt-logo-uk" src="/images/uk_ayush_logo.png" alt="Uttarakhand Govt Logo" />
            </div>
            <div style="text-align: center; flex: 1;">
              <h2 class="dept-title">DEPARTMENT OF AYUSH & AYUSH EDUCATION</h2>
              <div class="state-title">GOVERNMENT OF UTTARAKHAND</div>
            </div>
            <div style="width: 150px; display: flex; justify-content: flex-end;">
              <img class="govt-logo-setu" src="/images/ayush_setu_logo.png" alt="AYUSH Setu Logo" />
            </div>
          </div>
          
          <div class="body-content">
            <h1 class="cert-title">CERTIFICATE OF REGISTRATION</h1>
            <p class="cert-text">
              This is to certify that the AYUSH Wellness Centre named <span class="highlight">${opReg.centre_name}</span>, 
              located at <span class="highlight">${opReg.address}</span>, District <span class="highlight">${opReg.district}</span>, 
              owned and managed by <span class="highlight">${opReg.owner_name}</span> (Entity Type: <span class="highlight">${opReg.entity_type || 'N/A'}</span>), 
              under Category <span class="highlight">${opReg.category || 'N/A'}</span>, has been registered and verified under the operational standards of Department of AYUSH & AYUSH Education.
            </p>
          </div>
          
          <div class="meta-info">
            <div class="meta-item"><span class="meta-label">Registration No:</span> <span class="meta-val">${opReg.registration_number}</span></div>
            <div class="meta-item"><span class="meta-label">Accreditation:</span> <span class="meta-val">${opReg.accreditation_level || 'N/A'}</span></div>
            <div class="meta-item" style="grid-column: span 2;"><span class="meta-label">Services Offered:</span> <span class="meta-val">${(opReg.services_offered || []).join(", ") || 'N/A'}</span></div>
          </div>
          
          <div class="footer">
            <div class="validity-block">
              <p><strong>Date of Approval:</strong> ${new Date(opReg.approved_at || Date.now()).toLocaleDateString('en-IN')}</p>
              <p><strong>Certificate Validity:</strong> ${opReg.certificate_valid_till ? new Date(opReg.certificate_valid_till).toLocaleDateString('en-IN') : 'N/A'}</p>
            </div>
            
            <div class="signature-block">
              <p class="sig-title">District Officer (${opReg.district})</p>
              <p class="sig-subtitle">Ayurvedic & Unani Services, Uttarakhand</p>
              <p class="sig-verify">✓ DIGITALLY SIGNED & VERIFIED</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  if (loading) {
    return <div className="p-8 text-center text-teal-600 font-semibold">Loading profile & application details...</div>;
  }

  if (!profile) {
    return <div className="p-8 text-center text-red-500 font-semibold">Profile details could not be loaded.</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Centre Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          View your submitted operational registration details or edit basic profile info.
        </p>
      </div>

      {/* Tab Selector */}
      {opReg && (
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("op_reg")}
            className={`py-2.5 px-6 font-semibold text-sm border-b-2 transition ${
              activeTab === "op_reg"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Operational Application Details
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-2.5 px-6 font-semibold text-sm border-b-2 transition ${
              activeTab === "profile"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Edit Basic Profile Info
          </button>
        </div>
      )}

      {/* Warning Banner if Op Reg is missing */}
      {!opReg && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 text-sm">
          <AlertTriangle className="text-amber-500 shrink-0" size={18} />
          <div>
            <span className="font-bold">Operational Registration Application is missing.</span> Go to your Dashboard home to fill and submit the 5-section operational registration.
          </div>
        </div>
      )}

      {activeTab === "profile" ? (
        /* Main Profile Form */
        <form onSubmit={handleProfileSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-8">
          <div className="border-b pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-teal-700">
              <Building2 size={20} />
              <h2 className="text-lg font-bold text-gray-800">Registration Details</h2>
            </div>
            <span className="text-xs bg-teal-50 text-teal-700 px-3 py-1 rounded-full font-semibold border border-teal-100 uppercase tracking-wide">
              Status: {profile.registration_status || "UNDER_REVIEW"}
            </span>
          </div>

          {/* Applicant Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-teal-600 uppercase tracking-wider">Applicant Info</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Name of Applicant <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                  value={profile.applicant_name || ""} 
                  onChange={(e) => setProfile({ ...profile, applicant_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Designation <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                  value={profile.designation || ""} 
                  onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Entity Info */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold text-teal-600 uppercase tracking-wider">Entity Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Name of Entity <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                  value={profile.name || ""} 
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Entity Type <span className="text-red-500">*</span></label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" 
                  value={profile.entity_type || ""} 
                  onChange={(e) => setProfile({ ...profile, entity_type: e.target.value })}
                  required
                >
                  <option value="">Select Entity Type</option>
                  {ENTITY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email ID (Cannot be changed)</label>
                <input 
                  type="email" 
                  disabled
                  className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-lg px-3 py-2 text-sm cursor-not-allowed" 
                  value={profile.contact_email || ""} 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Number <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  maxLength={10}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                  value={profile.contact_phone || ""} 
                  onChange={(e) => setProfile({ ...profile, contact_phone: e.target.value.replace(/\D/g, "") })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">District <span className="text-red-500">*</span></label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" 
                  value={profile.district || ""} 
                  onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                  required
                >
                  <option value="">Select District</option>
                  {DISTRICT_OPTIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Address <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                  value={profile.address || ""} 
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Uploaded Documents */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold text-teal-600 uppercase tracking-wider">Uploaded Documents</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <span className="font-semibold text-gray-700 block">Entity Registration Document</span>
                {profile.entity_certificate ? (
                  <a 
                    href={`${API}${profile.entity_certificate}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-teal-600 font-bold hover:underline inline-flex items-center gap-1 mt-1"
                  >
                    <FileText size={16} /> View Uploaded Document
                  </a>
                ) : (
                  <span className="text-gray-400 italic mt-1 block">Not uploaded</span>
                )}
              </div>

              <div>
                <span className="font-semibold text-gray-700 block">Applicant's ID Proof</span>
                {profile.id_proof_file ? (
                  <a 
                    href={`${API}${profile.id_proof_file}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-teal-600 font-bold hover:underline inline-flex items-center gap-1 mt-1"
                  >
                    <FileText size={16} /> View Uploaded Document
                  </a>
                ) : (
                  <span className="text-gray-400 italic mt-1 block">Not uploaded</span>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition disabled:opacity-50 flex items-center gap-2"
            >
              <Save size={16} />
              {saving ? "Saving Details..." : "Save Profile Details"}
            </button>
          </div>
        </form>
      ) : (
        /* Operational Application Details Panel */
        <div className="space-y-6">
          {/* Status Banner */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Application Status</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide border ${
                  opReg.status === 'APPROVED'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : opReg.status === 'REVERTED'
                      ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                      : opReg.status === 'REJECTED'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {opReg.status || 'SUBMITTED'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {opReg.centre_name}
              </h2>
              <div className="text-sm text-gray-500 font-medium">
                Serial Number: <span className="font-mono text-teal-700 font-bold">{opReg.registration_number || 'UK-WC-DRAFT'}</span>
              </div>
            </div>

            {opReg.status === 'APPROVED' && (
              <button
                onClick={handlePrintCertificate}
                className="shrink-0 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition flex items-center gap-2 shadow-sm"
              >
                <Award size={16} /> Download Certificate (PDF)
              </button>
            )}
            <button
              onClick={handlePrint}
              className="shrink-0 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 font-bold px-4 py-2 rounded-xl text-sm transition flex items-center gap-2"
            >
              <Printer size={16} /> Print Application (PDF)
            </button>
          </div>

          {/* Query & Compliance History */}
          {((opReg.events || []).some(e => e.event_type === 'REVERTED' || e.event_type === 'COMPLIANCE_SUBMITTED')) && (
            <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 space-y-4">
              <h3 className="text-base font-bold text-amber-900 border-b pb-2 flex items-center gap-2">
                <Clock size={18} className="text-amber-600" />
                Query & Compliance History
              </h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {(opReg.events || [])
                  .filter(e => e.event_type === 'REVERTED' || e.event_type === 'COMPLIANCE_SUBMITTED')
                  .map((ev, index) => {
                    const isRevert = ev.event_type === 'REVERTED';
                    const complianceEvents = (opReg.events || []).filter(e => e.event_type === 'COMPLIANCE_SUBMITTED');
                    const isLastCompliance = complianceEvents.length > 0 && complianceEvents[complianceEvents.length - 1].created_at === ev.created_at;
                    const docPath = ev.document_path || (isLastCompliance ? opReg.compliance_document : null);

                    return (
                      <div 
                        key={ev.id || index} 
                        className={`p-4 rounded-xl border ${
                          isRevert 
                            ? 'bg-amber-50 border-amber-100 border-l-4 border-l-amber-500' 
                            : 'bg-green-50 border-green-100 border-l-4 border-l-green-500'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs font-bold uppercase tracking-wider ${isRevert ? 'text-amber-800' : 'text-green-800'}`}>
                            {isRevert ? 'District Officer Query / Revert' : 'Wellness Centre Compliance Response'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {new Date(ev.created_at).toLocaleString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className={`text-sm font-medium ${isRevert ? 'text-amber-900' : 'text-green-950'}`}>
                          {isRevert ? ev.comment : ev.comment?.replace(/^Compliance Submitted:\s*/i, '')}
                        </div>
                        {!isRevert && docPath && (
                          <div className="mt-2">
                            <a 
                              href={`${API}${docPath}`} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-green-700 font-bold hover:underline inline-flex items-center gap-1 text-xs"
                            >
                              <FileText size={14} /> View Attached Supporting Document
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Compliance Response Form (when reverted) */}
          {opReg.status === 'REVERTED' && (
            <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-6 space-y-4">
              <h3 className="text-base font-bold text-amber-800 flex items-center gap-2">
                <RefreshCcw size={18} className="text-amber-600 animate-spin" />
                Submit Compliance Response
              </h3>
              <p className="text-xs text-gray-500">Provide your reply comment/justification and upload any requested document here to send back to the District Officer.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Reply Comment / Explanation <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Enter details of compliance reply..."
                    value={complianceComment}
                    onChange={(e) => setComplianceComment(e.target.value)}
                    rows={4}
                    className="w-full p-4 border rounded-xl outline-none focus:border-amber-500 bg-gray-50 focus:bg-white transition-all text-sm font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Upload Supporting Document (Optional)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setComplianceFile(e.target.files[0])}
                    className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                  />
                  <p className="text-[10px] text-gray-400 mt-2">Only PDF, JPG, PNG accepted (Max 10MB)</p>
                </div>

                <button
                  type="button"
                  onClick={handleSubmitCompliance}
                  disabled={submittingCompliance}
                  className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition flex items-center gap-2"
                >
                  {submittingCompliance ? (
                    <>Submitting Response...</>
                  ) : (
                    <>Submit Compliance Response</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Details Tabs and Sections */}
          <div className="grid md:grid-cols-4 gap-6">
            {/* Sidebar Tabs */}
            <div className="md:col-span-1 bg-white rounded-2xl border border-gray-100 p-4 space-y-1 h-fit shadow-sm">
              <button
                onClick={() => setOpRegSectionTab("section1")}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  opRegSectionTab === "section1"
                    ? "bg-teal-50 text-teal-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                1. Basic Info
              </button>
              <button
                onClick={() => setOpRegSectionTab("section2")}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  opRegSectionTab === "section2"
                    ? "bg-teal-50 text-teal-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                2. Clinical Info
              </button>
              <button
                onClick={() => setOpRegSectionTab("section3")}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  opRegSectionTab === "section3"
                    ? "bg-teal-50 text-teal-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                3. Rooms & Infra
              </button>
              <button
                onClick={() => setOpRegSectionTab("section4")}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  opRegSectionTab === "section4"
                    ? "bg-teal-50 text-teal-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                4. Staff Details
              </button>
              <button
                onClick={() => setOpRegSectionTab("documents")}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  opRegSectionTab === "documents"
                    ? "bg-teal-50 text-teal-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Uploaded Documents
              </button>
              <button
                onClick={() => setOpRegSectionTab("logs")}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  opRegSectionTab === "logs"
                    ? "bg-teal-50 text-teal-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Compliance Logs
              </button>
            </div>

            {/* Details Pane */}
            <div className="md:col-span-3 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm min-h-[300px]">
              {opRegSectionTab === "section1" && (
                <div className="space-y-6">
                  <h3 className="text-base font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                    <Building2 size={18} className="text-teal-600" />
                    Section 1: Basic Centre Information
                  </h3>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">Centre Name</span>
                      <span className="text-gray-700 font-semibold">{opReg.centre_name}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">District</span>
                      <span className="text-gray-700 font-semibold">{opReg.district}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-gray-400 block font-bold uppercase">Address</span>
                      <span className="text-gray-700 font-semibold">{opReg.address}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">GPS Latitude / Longitude</span>
                      <span className="text-gray-700 font-semibold">{opReg.gps_lat || '—'} / {opReg.gps_lng || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">Google Map Link</span>
                      <span className="text-gray-700 font-semibold text-wrap break-all">
                        {opReg.google_map_link ? (
                          <a href={opReg.google_map_link} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">
                            View Map link
                          </a>
                        ) : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">Owner Name</span>
                      <span className="text-gray-700 font-semibold">{opReg.owner_name || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">Owner Mobile</span>
                      <span className="text-gray-700 font-semibold">{opReg.mobile || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">Category</span>
                      <span className="text-teal-700 font-bold">{opReg.category}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">Residential Facility</span>
                      <span className="text-gray-700 font-semibold">{opReg.is_residential ? 'Yes' : 'No'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">Offers Clinical Services</span>
                      <span className="text-gray-700 font-semibold">{opReg.offers_clinical ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-gray-400 block font-bold uppercase mb-1">Services Offered</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(opReg.services_offered || []).map(s => (
                          <span key={s} className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-xs font-semibold border border-teal-100">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {opRegSectionTab === "section2" && (
                <div className="space-y-6">
                  <h3 className="text-base font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-teal-600" />
                    Section 2: Clinical Details
                  </h3>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">Doctor Appointed</span>
                      <span className="text-gray-700 font-semibold">{opReg.doctor_appointed ? 'Yes' : 'No'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">Doctor Name</span>
                      <span className="text-gray-700 font-semibold">{opReg.doctor_name || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">Doctor Qualification</span>
                      <span className="text-gray-700 font-semibold">{opReg.doctor_qualification || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">BCP Registration Number</span>
                      <span className="text-gray-700 font-semibold">{opReg.bcp_reg_number || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">CEA Registered</span>
                      <span className="text-gray-700 font-semibold">{opReg.cea_registered ? 'Yes' : 'No'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">CEA Registration Number</span>
                      <span className="text-gray-700 font-semibold">{opReg.cea_reg_number || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">CEA Validity Date</span>
                      <span className="text-gray-700 font-semibold">
                        {opReg.cea_valid_till ? new Date(opReg.cea_valid_till).toLocaleDateString('en-IN') : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">Mandatory Signboard Declaration</span>
                      <span className="text-gray-700 font-semibold">
                        {opReg.declaration_board && opReg.declaration_signboard ? 'Accepted' : 'Not Accepted'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {opRegSectionTab === "section3" && (
                <div className="space-y-6">
                  <h3 className="text-base font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                    <MapPin size={18} className="text-teal-600" />
                    Section 3: Rooms & Infrastructure
                  </h3>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">Reception Size (sqft)</span>
                      <span className="text-gray-700 font-semibold">{opReg.reception_area_sqft || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">Waiting Capacity</span>
                      <span className="text-gray-700 font-semibold">{opReg.waiting_capacity || '—'} persons</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">Consultation Rooms</span>
                      <span className="text-gray-700 font-semibold">{opReg.consultation_rooms || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">Total Beds</span>
                      <span className="text-gray-700 font-semibold">{opReg.num_beds || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">Incharge Name</span>
                      <span className="text-gray-700 font-semibold">{opReg.incharge_name || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">Incharge Mobile</span>
                      <span className="text-gray-700 font-semibold">{opReg.incharge_mobile || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">Emergency Referral Centre</span>
                      <span className="text-gray-700 font-semibold">{opReg.emergency_centre_name || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">Emergency Distance</span>
                      <span className="text-gray-700 font-semibold">{opReg.emergency_distance_m ? `${opReg.emergency_distance_m} km` : '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">Offers Prakruti Analysis</span>
                      <span className="text-gray-700 font-semibold">{opReg.offers_prakruti ? 'Yes' : 'No'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">Kitchen / Dosha Dietetics</span>
                      <span className="text-gray-700 font-semibold">
                        {opReg.kitchen_available ? 'Available' : '—'} {opReg.dosha_dietetics ? '/ Dosha Dietetics' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-4">
                    <h4 className="text-xs font-bold text-teal-600 uppercase tracking-wider">Service Specific Rooms</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {opReg.abhyanga_rooms !== null && opReg.abhyanga_rooms !== '' && (
                        <div>
                          <span className="text-xs text-gray-400 block">Abhyanga Rooms Count</span>
                          <span className="text-gray-700 font-semibold">{opReg.abhyanga_rooms}</span>
                        </div>
                      )}
                      {opReg.vasti_rooms !== null && opReg.vasti_rooms !== '' && (
                        <div>
                          <span className="text-xs text-gray-400 block">Vasti Rooms Count</span>
                          <span className="text-gray-700 font-semibold">{opReg.vasti_rooms}</span>
                        </div>
                      )}
                      {opReg.post_therapy_waiting_rooms !== null && opReg.post_therapy_waiting_rooms !== '' && (
                        <div>
                          <span className="text-xs text-gray-400 block">Post Therapy Waiting Rooms</span>
                          <span className="text-gray-700 font-semibold">{opReg.post_therapy_waiting_rooms}</span>
                        </div>
                      )}
                      {opReg.medicine_dispensing_rooms !== null && opReg.medicine_dispensing_rooms !== '' && (
                        <div>
                          <span className="text-xs text-gray-400 block">Medicine Dispensing Rooms</span>
                          <span className="text-gray-700 font-semibold">{opReg.medicine_dispensing_rooms}</span>
                        </div>
                      )}
                      {opReg.marma_rooms !== null && opReg.marma_rooms !== '' && (
                        <div>
                          <span className="text-xs text-gray-400 block">Marma Rooms Count</span>
                          <span className="text-gray-700 font-semibold">{opReg.marma_rooms}</span>
                        </div>
                      )}
                      {opReg.para_surgical_rooms !== null && opReg.para_surgical_rooms !== '' && (
                        <div>
                          <span className="text-xs text-gray-400 block">Para Surgical Rooms Count</span>
                          <span className="text-gray-700 font-semibold">{opReg.para_surgical_rooms}</span>
                        </div>
                      )}
                      {opReg.kshar_sutra_ot !== null && opReg.kshar_sutra_ot !== '' && (
                        <div>
                          <span className="text-xs text-gray-400 block">Kshar Sutra OTs Count</span>
                          <span className="text-gray-700 font-semibold">{opReg.kshar_sutra_ot}</span>
                        </div>
                      )}
                      {opReg.yoga_halls !== null && opReg.yoga_halls !== '' && (
                        <div>
                          <span className="text-xs text-gray-400 block">Yoga Halls Count</span>
                          <span className="text-gray-700 font-semibold">{opReg.yoga_halls}</span>
                        </div>
                      )}
                      {opReg.meditation_halls !== null && opReg.meditation_halls !== '' && (
                        <div>
                          <span className="text-xs text-gray-400 block">Meditation Halls Count</span>
                          <span className="text-gray-700 font-semibold">{opReg.meditation_halls}</span>
                        </div>
                      )}
                      {opReg.shatkarma_rooms !== null && opReg.shatkarma_rooms !== '' && (
                        <div>
                          <span className="text-xs text-gray-400 block">Shatkarma Rooms Count</span>
                          <span className="text-gray-700 font-semibold">{opReg.shatkarma_rooms}</span>
                        </div>
                      )}
                      {opReg.massage_rooms !== null && opReg.massage_rooms !== '' && (
                        <div>
                          <span className="text-xs text-gray-400 block">Massage Rooms Count</span>
                          <span className="text-gray-700 font-semibold">{opReg.massage_rooms}</span>
                        </div>
                      )}
                      {opReg.enema_rooms !== null && opReg.enema_rooms !== '' && (
                        <div>
                          <span className="text-xs text-gray-400 block">Enema Rooms Count</span>
                          <span className="text-gray-700 font-semibold">{opReg.enema_rooms}</span>
                        </div>
                      )}
                      {opReg.hydrotherapy_rooms !== null && opReg.hydrotherapy_rooms !== '' && (
                        <div>
                          <span className="text-xs text-gray-400 block">Hydrotherapy Rooms Count</span>
                          <span className="text-gray-700 font-semibold">{opReg.hydrotherapy_rooms}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {opRegSectionTab === "section4" && (
                <div className="space-y-6">
                  <h3 className="text-base font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                    <Briefcase size={18} className="text-teal-600" />
                    Section 4: Additional Staff Details
                  </h3>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">Receptionist Count</span>
                      <span className="text-gray-700 font-semibold">{opReg.receptionist_count || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">Sanitation Worker Count</span>
                      <span className="text-gray-700 font-semibold">{opReg.sanitation_worker_count || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">Multi-Purpose Workers (MPW)</span>
                      <span className="text-gray-700 font-semibold">{opReg.mpw_count || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">Cook Count</span>
                      <span className="text-gray-700 font-semibold">{opReg.cook_count || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">Watchman / Guard Count</span>
                      <span className="text-gray-700 font-semibold">{opReg.watchman_count || '—'}</span>
                    </div>
                  </div>

                  {(opReg.pharmacist_name || opReg.wc_attendant_count || opReg.male_panchakarma_therapist || opReg.yoga_instructor_count || opReg.bnys_doctor_name) && (
                    <div className="border-t pt-4 space-y-4">
                      <h4 className="text-xs font-bold text-teal-600 uppercase tracking-wider">Service Specific Staff</h4>
                      <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                        {opReg.pharmacist_name && (
                          <>
                            <div>
                              <span className="text-xs text-gray-400 block">Pharmacist Name</span>
                              <span className="text-gray-700 font-semibold">{opReg.pharmacist_name}</span>
                            </div>
                            <div>
                              <span className="text-xs text-gray-400 block">Pharmacist Reg. Number</span>
                              <span className="text-gray-700 font-semibold">{opReg.pharmacist_reg_number}</span>
                            </div>
                          </>
                        )}
                        {opReg.wc_attendant_count && (
                          <>
                            <div>
                              <span className="text-xs text-gray-400 block">Wellness Centre Attendant Count</span>
                              <span className="text-gray-700 font-semibold">{opReg.wc_attendant_count}</span>
                            </div>
                            <div>
                              <span className="text-xs text-gray-400 block">Ayurveda Nurse Count</span>
                              <span className="text-gray-700 font-semibold">{opReg.ayurveda_nurse_count}</span>
                            </div>
                          </>
                        )}
                        {opReg.male_panchakarma_therapist && (
                          <>
                            <div>
                              <span className="text-xs text-gray-400 block">Male Panchakarma Therapists</span>
                              <span className="text-gray-700 font-semibold">{opReg.male_panchakarma_therapist}</span>
                            </div>
                            <div>
                              <span className="text-xs text-gray-400 block">Female Panchakarma Therapists</span>
                              <span className="text-gray-700 font-semibold">{opReg.female_panchakarma_therapist}</span>
                            </div>
                          </>
                        )}
                        {opReg.yoga_instructor_count && (
                          <div>
                            <span className="text-xs text-gray-400 block">Yoga Instructors Count</span>
                            <span className="text-gray-700 font-semibold">{opReg.yoga_instructor_count}</span>
                          </div>
                        )}
                        {opReg.bnys_doctor_name && (
                          <>
                            <div>
                              <span className="text-xs text-gray-400 block">Naturopathy BNYS Doctor</span>
                              <span className="text-gray-700 font-semibold">{opReg.bnys_doctor_name}</span>
                            </div>
                            <div>
                              <span className="text-xs text-gray-400 block">Male / Female Naturopathy Attendants</span>
                              <span className="text-gray-700 font-semibold">{opReg.male_naturopathy_attendant} / {opReg.female_naturopathy_attendant}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {opRegSectionTab === "documents" && (
                <div className="space-y-6">
                  <h3 className="text-base font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                    <FileText size={18} className="text-teal-600" />
                    Uploaded Documents & Licences
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6 text-sm">
                    {opReg.previous_reg_certificate && (
                      <div className="p-4 bg-gray-50 border rounded-xl flex flex-col justify-between h-28">
                        <span className="font-bold text-gray-700">Previous Registration Certificate</span>
                        <a href={`${API}${opReg.previous_reg_certificate}`} target="_blank" rel="noreferrer" className="text-teal-600 font-bold hover:underline inline-flex items-center gap-1">
                          <FileText size={16} /> View Document
                        </a>
                      </div>
                    )}
                    {opReg.doctor_qual_doc && (
                      <div className="p-4 bg-gray-50 border rounded-xl flex flex-col justify-between h-28">
                        <span className="font-bold text-gray-700">Doctor Qualification Document</span>
                        <a href={`${API}${opReg.doctor_qual_doc}`} target="_blank" rel="noreferrer" className="text-teal-600 font-bold hover:underline inline-flex items-center gap-1">
                          <FileText size={16} /> View Document
                        </a>
                      </div>
                    )}
                    {opReg.bcp_reg_doc && (
                      <div className="p-4 bg-gray-50 border rounded-xl flex flex-col justify-between h-28">
                        <span className="font-bold text-gray-700">Doctor BCP Registration Document</span>
                        <a href={`${API}${opReg.bcp_reg_doc}`} target="_blank" rel="noreferrer" className="text-teal-600 font-bold hover:underline inline-flex items-center gap-1">
                          <FileText size={16} /> View Document
                        </a>
                      </div>
                    )}
                    {opReg.cea_reg_certificate && (
                      <div className="p-4 bg-gray-50 border rounded-xl flex flex-col justify-between h-28">
                        <span className="font-bold text-gray-700">CEA Registration Certificate</span>
                        <a href={`${API}${opReg.cea_reg_certificate}`} target="_blank" rel="noreferrer" className="text-teal-600 font-bold hover:underline inline-flex items-center gap-1">
                          <FileText size={16} /> View Document
                        </a>
                      </div>
                    )}
                    {opReg.clinical_affidavit && (
                      <div className="p-4 bg-gray-50 border rounded-xl flex flex-col justify-between h-28">
                        <span className="font-bold text-gray-700">Clinical declaration Affidavit</span>
                        <a href={`${API}${opReg.clinical_affidavit}`} target="_blank" rel="noreferrer" className="text-teal-600 font-bold hover:underline inline-flex items-center gap-1">
                          <FileText size={16} /> View Document
                        </a>
                      </div>
                    )}
                    {opReg.service_charges_doc && (
                      <div className="p-4 bg-gray-50 border rounded-xl flex flex-col justify-between h-28">
                        <span className="font-bold text-gray-700">Service Charges List</span>
                        <a href={`${API}${opReg.service_charges_doc}`} target="_blank" rel="noreferrer" className="text-teal-600 font-bold hover:underline inline-flex items-center gap-1">
                          <FileText size={16} /> View Document
                        </a>
                      </div>
                    )}
                    {opReg.brochure_doc && (
                      <div className="p-4 bg-gray-50 border rounded-xl flex flex-col justify-between h-28">
                        <span className="font-bold text-gray-700">Brochure/Pamphlet</span>
                        <a href={`${API}${opReg.brochure_doc}`} target="_blank" rel="noreferrer" className="text-teal-600 font-bold hover:underline inline-flex items-center gap-1">
                          <FileText size={16} /> View Document
                        </a>
                      </div>
                    )}
                    {opReg.pharmacist_bcp_doc && (
                      <div className="p-4 bg-gray-50 border rounded-xl flex flex-col justify-between h-28">
                        <span className="font-bold text-gray-700">Pharmacist BCP Registration Doc</span>
                        <a href={`${API}${opReg.pharmacist_bcp_doc}`} target="_blank" rel="noreferrer" className="text-teal-600 font-bold hover:underline inline-flex items-center gap-1">
                          <FileText size={16} /> View Document
                        </a>
                      </div>
                    )}
                    {opReg.panchakarma_staff_bcp_doc && (
                      <div className="p-4 bg-gray-50 border rounded-xl flex flex-col justify-between h-28">
                        <span className="font-bold text-gray-700">Panchakarma Staff BCP Registrations</span>
                        <a href={`${API}${opReg.panchakarma_staff_bcp_doc}`} target="_blank" rel="noreferrer" className="text-teal-600 font-bold hover:underline inline-flex items-center gap-1">
                          <FileText size={16} /> View Document
                        </a>
                      </div>
                    )}
                    {opReg.yoga_instructor_qual_doc && (
                      <div className="p-4 bg-gray-50 border rounded-xl flex flex-col justify-between h-28">
                        <span className="font-bold text-gray-700">Yoga Instructor Qualification Doc</span>
                        <a href={`${API}${opReg.yoga_instructor_qual_doc}`} target="_blank" rel="noreferrer" className="text-teal-600 font-bold hover:underline inline-flex items-center gap-1">
                          <FileText size={16} /> View Document
                        </a>
                      </div>
                    )}
                    {opReg.bnys_reg_certificate && (
                      <div className="p-4 bg-gray-50 border rounded-xl flex flex-col justify-between h-28">
                        <span className="font-bold text-gray-700">BNYS Doctor Registration Certificate</span>
                        <a href={`${API}${opReg.bnys_reg_certificate}`} target="_blank" rel="noreferrer" className="text-teal-600 font-bold hover:underline inline-flex items-center gap-1">
                          <FileText size={16} /> View Document
                        </a>
                      </div>
                    )}
                    {opReg.naturopathy_staff_bcp_doc && (
                      <div className="p-4 bg-gray-50 border rounded-xl flex flex-col justify-between h-28">
                        <span className="font-bold text-gray-700">Naturopathy Attendants BCP Doc</span>
                        <a href={`${API}${opReg.naturopathy_staff_bcp_doc}`} target="_blank" rel="noreferrer" className="text-teal-600 font-bold hover:underline inline-flex items-center gap-1">
                          <FileText size={16} /> View Document
                        </a>
                      </div>
                    )}
                    {opReg.fee_receipt_doc && (
                      <div className="p-4 bg-gray-50 border rounded-xl flex flex-col justify-between h-28">
                        <span className="font-bold text-gray-700">Fee Deposit Receipt</span>
                        <a href={`${API}${opReg.fee_receipt_doc}`} target="_blank" rel="noreferrer" className="text-teal-600 font-bold hover:underline inline-flex items-center gap-1">
                          <FileText size={16} /> View Document
                        </a>
                      </div>
                    )}
                    {opReg.declaration_affidavit && (
                      <div className="p-4 bg-gray-50 border rounded-xl flex flex-col justify-between h-28">
                        <span className="font-bold text-gray-700">Declaration Affidavit</span>
                        <a href={`${API}${opReg.declaration_affidavit}`} target="_blank" rel="noreferrer" className="text-teal-600 font-bold hover:underline inline-flex items-center gap-1">
                          <FileText size={16} /> View Document
                        </a>
                      </div>
                    )}
                    {opReg.compliance_document && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col justify-between h-28">
                        <span className="font-bold text-amber-850">Compliance Supporting Document</span>
                        <a href={`${API}${opReg.compliance_document}`} target="_blank" rel="noreferrer" className="text-amber-700 font-bold hover:underline inline-flex items-center gap-1">
                          <FileText size={16} /> View Document
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {opRegSectionTab === "logs" && (
                <div className="space-y-6">
                  <h3 className="text-base font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                    <Clock size={18} className="text-teal-600" />
                    Application Progress, Compliance & Timeline History
                  </h3>
                  <div className="relative border-l-2 border-gray-150 pl-6 ml-4 space-y-8">
                    {(opReg.events || []).map((event, idx) => (
                      <div key={event.id || idx} className="relative">
                        <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-teal-600 border-2 border-white flex items-center justify-center">
                          <CheckCircle size={10} className="text-white" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-sm font-bold text-gray-800">
                              {event.event_type}
                            </span>
                            <span className="text-xs text-gray-400 font-medium">
                              {new Date(event.created_at).toLocaleString('en-IN', {
                                day: '2-digit', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 font-semibold">
                            Action By: {event.actor_name} ({event.actor_role})
                          </div>
                          {event.comment && (
                            <div className="text-sm text-gray-600 bg-gray-50 border-l-4 border-gray-300 p-3 rounded-r-xl mt-2 font-medium">
                              {event.comment}
                            </div>
                          )}
                          {event.document_path && (
                            <div className="mt-2 text-xs">
                              <a
                                href={`${API}${event.document_path}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-teal-600 font-bold hover:underline inline-flex items-center gap-1"
                              >
                                <FileText size={14} /> View Submitted Document
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {(opReg.events || []).length === 0 && (
                      <div className="text-sm text-gray-400 italic">No movement history logged yet.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
