import API from '../../config/api';
import axiosInstance from '../../config/axiosInstance';
import React, { useState, useEffect } from "react";
import { Users, Building, Calendar, DollarSign, AlertCircle, MapPin, FileText, TrendingUp, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, IndianRupee, Paperclip, X, Download, Award, Printer } from "lucide-react";
import { toast } from "react-toastify";



const fmt = (n) =>
  n != null ? `₹${parseFloat(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—";

// Handle both Cloudinary full URLs and local /uploads paths
const docUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // strip leading slash if present to avoid double-slash
  return `${API}/${path.replace(/^\//, '')}`;
};

const STATUS_META = {
  SUBMITTED:                { label: "Submitted to Directorate", color: "bg-blue-100 text-blue-700" },
  FORWARDED_TO_DISTRICT:    { label: "Forwarded to District Officer", color: "bg-yellow-100 text-yellow-700" },
  DISTRICT_VERIFIED:        { label: "Verified by District Officer", color: "bg-orange-100 text-orange-700" },
  REVERTED_TO_APPLICANT:    { label: "Reverted (Compliance Required)", color: "bg-red-100 text-red-700" },
  RESUBMITTED:              { label: "Resubmitted to Directorate", color: "bg-cyan-100 text-cyan-700" },
  FORWARDED_TO_SLRC:        { label: "Forwarded to SLRC", color: "bg-purple-100 text-purple-700" },
  SLRC_APPROVED:            { label: "SLRC Approved", color: "bg-indigo-100 text-indigo-700" },
  IN_PRINCIPLE_APPROVED:    { label: "In-principle Approval Given",   color: "bg-emerald-100 text-emerald-700" },
  DIRECTORATE_REJECTED:     { label: "Rejected by Directorate", color: "bg-red-100 text-red-700" },
  SLRC_REJECTED:            { label: "Rejected by SLRC", color: "bg-red-100 text-red-700" },
};

function generateCertificatePDF(app) {
  const approvedDate = app.in_principle_approved_at
    ? new Date(app.in_principle_approved_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>In-Principle Approval Certificate — ${app.upn || app.id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, sans-serif;
      background-color: #fcfbf7;
      color: #1e293b;
      padding: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .certificate-container {
      width: 100%;
      max-width: 900px;
      border: 12px double #b45309;
      padding: 40px;
      background-color: #ffffff;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
      position: relative;
    }
    .certificate-container::before {
      content: "";
      position: absolute;
      top: 5px; left: 5px; right: 5px; bottom: 5px;
      border: 2px solid #b45309;
      pointer-events: none;
    }
    .header {
      text-align: center;
      margin-bottom: 24px;
    }
    .gov-title {
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
      margin-bottom: 4px;
    }
    .dept-title {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    .logo-container {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-bottom: 20px;
    }
    .logo-img {
      height: 60px;
      object-fit: contain;
    }
    .cert-heading {
      font-family: 'Georgia', serif;
      font-size: 26px;
      font-weight: 700;
      color: #065f46;
      margin: 15px 0 5px 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .cert-subheading {
      font-size: 11px;
      color: #b45309;
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 30px;
    }
    .intro-text {
      font-size: 14px;
      line-height: 1.6;
      text-align: center;
      margin-bottom: 30px;
      padding: 0 20px;
      color: #334155;
    }
    .highlight {
      font-weight: 700;
      color: #0f172a;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 35px;
      font-size: 12px;
    }
    .details-table th, .details-table td {
      border: 1px solid #e2e8f0;
      padding: 10px 14px;
      text-align: left;
    }
    .details-table th {
      background-color: #f8fafc;
      font-weight: 700;
      color: #475569;
      width: 35%;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
    }
    .details-table td {
      font-weight: 600;
      color: #0f172a;
    }
    .footer-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 40px;
      border-top: 1px solid #f1f5f9;
      padding-top: 20px;
    }
    .verification-info {
      font-size: 10px;
      color: #64748b;
      max-width: 60%;
      line-height: 1.4;
    }
    .signature-box {
      text-align: center;
    }
    .signature-line {
      border-top: 1px solid #475569;
      width: 160px;
      margin: 0 auto 4px auto;
    }
    .signature-title {
      font-size: 11px;
      font-weight: 700;
      color: #0f172a;
    }
    .signature-dept {
      font-size: 9px;
      color: #64748b;
    }
    @media print {
      body {
        padding: 0;
        background-color: #ffffff;
      }
      .certificate-container {
        border-color: #b45309 !important;
        box-shadow: none;
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="certificate-container">
    <div class="header">
      <div class="logo-container">
        <img class="logo-img" src="${window.location.origin}/images/uk_ayush_logo.png" alt="Uttarakhand Logo" onerror="this.style.display='none'" />
        <img class="logo-img" src="${window.location.origin}/images/ayush_setu_logo.png" alt="AYUSH Logo" onerror="this.style.display='none'" />
      </div>
      <p class="gov-title">Government of Uttarakhand</p>
      <p class="dept-title">AYUSH & AYUSH Education, Uttarakhand</p>
      <h2 class="cert-heading">Certificate of In-Principle Approval</h2>
      <p class="cert-subheading">Yoga Centre Incentive Scheme</p>
    </div>

    <p class="intro-text">
      This is to certify that the application submitted by <span class="highlight">${app.applicant_name || '—'}</span> on behalf of entity <span class="highlight">${app.entity_name || app.centre_name || '—'}</span> (Type of Entity: <span class="highlight">${app.entity_type || '—'}</span>) for establishing a Yoga Centre under the project name <span class="highlight">${app.proposed_centre_name || app.centre_name || '—'}</span> located at <span class="highlight">${app.address || '—'}, District: ${app.district || '—'}</span> has been duly reviewed by the State Level Rule Committee (SLRC) and is hereby granted <span class="highlight" style="color: #065f46">In-Principle Approval</span> for financial incentives.
    </p>

    <table class="details-table">
      <tr>
        <th>Unique Registration Number (URN)</th>
        <td>${app.upn || '—'}</td>
      </tr>
      <tr>
        <th>In-Principle Order Number</th>
        <td>${app.in_principle_order_number || '—'}</td>
      </tr>
      <tr>
        <th>Approval Date</th>
        <td>${approvedDate}</td>
      </tr>
      <tr>
        <th>Total Area Claimed</th>
        <td>${app.site_total_area ? app.site_total_area + ' sq ft' : '—'}</td>
      </tr>
      <tr>
        <th>Constructed Area Claimed</th>
        <td>${app.proposed_constructed_area ? app.proposed_constructed_area + ' sq ft' : '—'}</td>
      </tr>
      <tr>
        <th>Total Project Cost</th>
        <td>${fmt(app.investment_amount)}</td>
      </tr>
      <tr>
        <th>Capital Assets for Subsidy (ECA)</th>
        <td>${fmt(app.eligible_assets_amount || app.claim_amount)}</td>
      </tr>
      <tr>
        <th>Approved Subsidy Percentage</th>
        <td>${app.subsidy_percentage || '—'}% (${app.region || '—'} Region)</td>
      </tr>
      <tr>
        <th>Tentative Subsidy Amount*</th>
        <td style="color: #065f46; font-size: 13px;">${fmt(app.subsidy_amount)}</td>
      </tr>
    </table>

    <p style="font-size: 10px; color: #475569; margin-top: -25px; margin-bottom: 25px; font-weight: 500; font-style: italic;">
      * This amount will be subjected to actual capital assets verification post commencement of Operation.
    </p>

    <div class="footer-section">
      <div class="verification-info">
        <p><strong>Verification Details:</strong></p>
        <p>This is a system-generated certificate issued by the AYUSH Setu Portal. The authenticity can be verified using the URN above.</p>
        <p style="margin-top: 4px; font-style: italic;">Note: This approval is subject to physical verification and compliance with terms & conditions of the scheme guidelines.</p>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <p class="signature-title">Director</p>
        <p class="signature-dept">Ayurvedic & Unani Services</p>
      </div>
    </div>
  </div>

  <script>
    window.onload = () => {
      setTimeout(() => {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
}

// ── GPS Map using OpenStreetMap (no API key required) ─────────────────────────
function GpsMap({ coords }) {
  if (!coords) return null;
  const parts = coords.split(',').map(s => s.trim());
  if (parts.length < 2) return null;
  const [lat, lng] = parts;
  const la = parseFloat(lat);
  const ln = parseFloat(lng);
  if (isNaN(la) || isNaN(ln)) return null;

  const bbox = `${ln - 0.01},${la - 0.01},${ln + 0.01},${la + 0.01}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${la},${ln}`;

  return (
    <div className="md:col-span-3 bg-white p-3 rounded-lg border">
      <span className="text-[10px] text-gray-400 font-bold block uppercase mb-2">Project Site Map (GPS Location)</span>
      <div className="w-full h-48 rounded-lg overflow-hidden border border-slate-200">
        <iframe
          title="OSM Site Map"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          src={embedUrl}
        ></iframe>
      </div>
    </div>
  );
}

// ── PDF generator using browser print ─────────────────────────────────────────
function generatePDF(app) {
  const submittedDate = app.created_at
    ? new Date(app.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Incentive Application — ${app.upn || app.id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #1a202c; padding: 32px; }
    .header { text-align: center; border-bottom: 3px solid #059669; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { font-size: 18px; color: #065f46; }
    .header p { font-size: 11px; color: #64748b; margin-top: 4px; }
    .badge { display: inline-block; background: #d1fae5; color: #065f46; font-weight: 700; font-size: 11px; padding: 3px 10px; border-radius: 20px; margin-top: 8px; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 10px; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .field label { display: block; font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-bottom: 2px; }
    .field span { font-weight: 600; color: #1a202c; }
    .docs ul { padding-left: 16px; }
    .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
    .footer .sig { margin-top: 40px; display: flex; justify-content: flex-end; }
    .footer .sig-box { text-align: center; }
    .footer .sig-box .line { border-top: 1px solid #1a202c; width: 200px; margin-bottom: 4px; }
    .footer .sig-box p { font-size: 11px; font-weight: 700; }
    .footer .sig-box small { font-size: 10px; color: #64748b; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <div class="header">
    <p style="font-size:10px;color:#94a3b8;font-weight:600">GOVERNMENT OF UTTARAKHAND — AYUSH WELLNESS PORTAL</p>
    <h1>Yoga Centre Incentive Scheme Application</h1>
    <p>UPN: <strong>${app.upn || '—'}</strong> &nbsp;|&nbsp; Submitted on: <strong>${submittedDate}</strong></p>
    <span class="badge">${app.status || 'SUBMITTED'}</span>
  </div>

  <div class="section">
    <div class="section-title">Applicant Details</div>
    <div class="grid3">
      <div class="field"><label>Applicant Name</label><span>${app.applicant_name || '—'}</span></div>
      <div class="field"><label>Designation</label><span>${app.designation || '—'}</span></div>
      <div class="field"><label>Entity Type</label><span>${app.entity_type || '—'}</span></div>
      <div class="field"><label>Mobile</label><span>${app.mobile_number || '—'}</span></div>
      <div class="field"><label>Email</label><span>${app.email_id || '—'}</span></div>
      <div class="field"><label>District</label><span>${app.district || '—'}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Project Details</div>
    <div class="grid3">
      <div class="field"><label>Project Type</label><span>${app.project_type || '—'}</span></div>
      <div class="field"><label>Region</label><span>${app.region || '—'}</span></div>
      <div class="field"><label>Subsidy Rate</label><span>${app.subsidy_percentage || '—'}%</span></div>
      <div class="field"><label>Proposed Centre Name</label><span>${app.proposed_centre_name || app.centre_name || '—'}</span></div>
      <div class="field"><label>Proposed Location</label><span>${app.proposed_location || '—'}${app.other_location_name ? ' (' + app.other_location_name + ')' : ''}</span></div>
      <div class="field"><label>GPS Coordinates</label><span>${app.gps_coordinates || '—'}</span></div>
      <div class="field" style="grid-column: span 3"><label>Complete Address</label><span>${app.address || '—'}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Financial Details</div>
    <div class="grid3">
      <div class="field"><label>Total Investment</label><span>${fmt(app.investment_amount)}</span></div>
      <div class="field"><label>Eligible Capital Assets (ECA)</label><span>${fmt(app.eligible_assets_amount)}</span></div>
      <div class="field"><label>Claimed Subsidy (Tentative)</label><span>${fmt(app.subsidy_amount)}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Site & Operational Details</div>
    <div class="grid3">
      <div class="field"><label>Site Total Area</label><span>${app.site_total_area ? app.site_total_area + ' sq ft' : '—'}</span></div>
      <div class="field"><label>Proposed Constructed Area</label><span>${app.proposed_constructed_area ? app.proposed_constructed_area + ' sq ft' : '—'}</span></div>
      <div class="field"><label>Tentative Employees</label><span>${app.tentative_employees || '—'}</span></div>
      <div class="field"><label>YCB Certified Instructors</label><span>${app.ycb_certified_instructors || '—'}</span></div>
      <div class="field"><label>Clinical Services</label><span>${app.clinical_services_provided ? 'Yes (' + (app.certified_ayush_doctors || 0) + ' AYUSH Doctors)' : 'No'}</span></div>
      <div class="field"><label>Services Offered</label><span>${Array.isArray(app.services_offered) ? app.services_offered.join(', ') : (app.services_offered || '—')}</span></div>
    </div>
  </div>

  <div class="footer">
    <p style="font-size:10px;color:#64748b">This is a system-generated copy of the submitted application. The authenticity of this document is subject to verification by the concerned authority.</p>
    <div class="sig">
      <div class="sig-box">
        <div class="line"></div>
        <p>${app.applicant_name || 'Applicant'}</p>
        <small>${app.designation || ''}</small><br/>
        <small>Date: ${submittedDate}</small>
      </div>
    </div>
  </div>
</body>
</html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.onload = () => { win.print(); };
}

// ── Additional Attachments (Resubmissions & Verification Reports) ─────────────
function AdditionalAttachments({ events }) {
  const eventsWithAttachments = (events || []).filter(
    (ev) => ev.attachment_paths && ev.attachment_paths.length > 0
  );

  return (
    <div className="md:col-span-3 bg-slate-50 border border-slate-200 rounded-lg p-3 mt-3">
      <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1 uppercase tracking-wide">
        <Paperclip size={12} className="text-emerald-600" /> Additional Attachments (Resubmissions &amp; Reports)
      </p>
      {eventsWithAttachments.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No additional compliance or verification attachments uploaded yet.</p>
      ) : (
        <div className="space-y-2">
          {eventsWithAttachments.map((ev, eventIdx) => {
            const dateStr = new Date(ev.created_at).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });
            const roleLabel =
              ev.actor_role === 'applicant'
                ? 'Yoga Centre (Compliance)'
                : ev.actor_role === 'district'
                ? 'District Officer (Verification)'
                : 'Directorate Nodal Officer';

            return (
              <div key={eventIdx} className="p-2 bg-white rounded border border-slate-100 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                  <span>Uploaded by: <span className="text-slate-700">{ev.actor_name || roleLabel}</span></span>
                  <span>Date: {dateStr}</span>
                </div>
                {ev.comment && <p className="text-[10px] text-slate-500 italic">Comment/Notes: "{ev.comment}"</p>}
                <div className="flex gap-2 flex-wrap">
                  {ev.attachment_paths.map((path, fileIdx) => (
                    <a
                      key={fileIdx}
                      href={docUrl(path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 transition"
                    >
                      <FileText size={10} /> View Attachment #{fileIdx + 1}
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DocList({ docs }) {
  const hasAny = docs.some(d => d.path);
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
      <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1 uppercase tracking-wide">
        <Paperclip size={12} /> Submitted Documents
      </p>
      {!hasAny ? (
        <p className="text-xs text-gray-400 italic">No documents uploaded by applicant.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {docs.map(({ label, path }) => (
            <div key={label} className="flex items-center gap-1.5 min-w-0">
              {path ? (
                <a
                  href={docUrl(path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1 truncate"
                  title={`View: ${label}`}
                >
                  <FileText size={11} className="shrink-0 text-blue-400" />
                  <span className="truncate">{label}</span>
                </a>
              ) : (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <FileText size={11} className="shrink-0 text-gray-300" />
                  <span>{label}</span>
                  <em className="text-gray-300 text-xs">— not uploaded</em>
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function YogaTCIncentiveReview() {
  const [apps, setApps]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [modal, setModal]       = useState(null); // { id }
  const [remarks, setRemarks]   = useState("");
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState("");

  const [editingGpsId, setEditingGpsId] = useState(null);
  const [gpsValue, setGpsValue] = useState("");

  const saveGpsCoordinates = async (appId) => {
    try {
      await axiosInstance.put(`${API}/api/admin/incentives/${appId}/gps`, { gpsCoordinates: gpsValue });
      alert("GPS Coordinates updated successfully!");
      setEditingGpsId(null);
      setApps(prev => prev.map(a => a.id === appId ? { ...a, gps_coordinates: gpsValue } : a));
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Failed to update GPS coordinates.");
    }
  };

  const [verificationFiles, setVerificationFiles] = useState([]);

  const handleVerificationFileSelect = async (fileList) => {
    const file = fileList[0];
    if (!file) return;

    const fileId = Math.random().toString(36).substring(7);
    setVerificationFiles(prev => [...prev, { id: fileId, name: file.name, uploading: true, progress: 0, path: null }]);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await axiosInstance.post(`${API}/api/register/upload-temp-file`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setVerificationFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: percentCompleted } : f));
          }
        }
      });

      setVerificationFiles(prev => prev.map(f => f.id === fileId ? { ...f, uploading: false, progress: 100, path: res.data.path } : f));
    } catch (err) {
      console.error(err);
      alert(`Failed to upload ${file.name}`);
      setVerificationFiles(prev => prev.filter(f => f.id !== fileId));
    }
  };

  const removeVerificationFile = (id) => {
    setVerificationFiles(prev => prev.filter(f => f.id !== id));
  };

  const load = async () => {
    setLoading(true);
    try {
      const userRes = await axiosInstance.get(`${API}/api/admin/pending-registrations?status=approved`);
      const me = userRes.data?.data?.[0]; // Get current DO district if possible, fallback to query
      const district = me?.district || localStorage.getItem("district") || "";
      const r = await axiosInstance.get(`${API}/api/admin/incentives/district?district=${encodeURIComponent(district)}`);
      setApps(r.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openModal = (id) => { setModal({ id }); setRemarks(""); setVerificationFiles([]); };

  const submitVerification = async () => {
    if (!modal || !remarks.trim()) return;
    setSaving(true);
    try {
      await axiosInstance.put(
        `${API}/api/admin/incentives/district/${modal.id}/verify`,
        {
          verificationNote: remarks,
          attachments: verificationFiles.filter(f => f.path).map(f => f.path)
        }
      );
      setMsg(`Verification report submitted successfully for Application #${modal.id}.`);
      setModal(null);
      setExpanded(null);
      setVerificationFiles([]);
      load();
    } catch (e) {
      alert(e.response?.data?.message || "Verification submission failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow mb-8">
      <div className="p-5 border-b flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Yoga TC — Incentive Applications</h3>
          <p className="text-xs text-gray-500 mt-0.5">State Level Review Committee — District Stage</p>
        </div>
        <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">
          {apps.length} Pending
        </span>
      </div>

      {msg && (
        <div className="mx-5 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle size={15} /> {msg}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-400">Loading…</div>
      ) : apps.length === 0 ? (
        <div className="p-8 text-center text-gray-400">
          <CheckCircle size={36} className="mx-auto mb-2 text-green-300" />
          No pending incentive applications.
        </div>
      ) : (
        <div className="divide-y">
          {apps.map((app) => {
            const open = expanded === app.id;
            const typeLabel = app.region === "HILLY" ? "Hilly Region (50%)" : "Plain Region (25%)";
            return (
              <div key={app.id} className="p-4">
                <button
                  className="w-full flex items-center justify-between text-left"
                  onClick={() => setExpanded(open ? null : app.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full p-2 mt-0.5">
                      <FileText size={16} className="text-blue-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-800">{app.centre_name}</p>
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">{app.project_type || "Greenfield"}</span>
                        {(() => {
                          const meta = STATUS_META[app.status] || { label: app.status, color: "bg-slate-100 text-slate-700" };
                          return (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.color}`}>
                              {meta.label}
                            </span>
                          );
                        })()}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        UPN: <strong className="text-slate-700">{app.upn || "—"}</strong> · {app.district} · {typeLabel} · {app.applicant_name || app.applicant_email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Subsidy Amount</p>
                      <p className="font-bold text-emerald-700 text-sm">{fmt(app.subsidy_amount)}</p>
                    </div>
                    {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {open && (
                  <div className="mt-4 ml-11 space-y-4 text-xs bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
                    
                    {/* Action buttons */}
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => generatePDF(app)}
                        className="flex items-center gap-2 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-lg shadow-sm transition"
                      >
                        <Download size={13} /> Download Form PDF
                      </button>
                      {app.status === 'IN_PRINCIPLE_APPROVED' && (
                        <button
                          onClick={() => generateCertificatePDF(app)}
                          className="flex items-center gap-2 text-xs bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-4 py-2 rounded-lg shadow-sm transition"
                        >
                          <Award size={13} /> Download Certificate
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="bg-white rounded-lg p-3 border">
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Total Investment</p>
                        <p className="font-bold text-gray-800 text-sm mt-0.5">{fmt(app.investment_amount)}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border">
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Eligible Assets Amount</p>
                        <p className="font-bold text-gray-800 text-sm mt-0.5">{fmt(app.eligible_assets_amount || app.claim_amount)}</p>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                        <p className="text-[10px] text-emerald-600 uppercase font-bold">Claimed Subsidy (Tentative)</p>
                        <p className="font-bold text-emerald-700 text-sm mt-0.5">{fmt(app.subsidy_amount)} ({app.subsidy_percentage}%)</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Proposed Location</p>
                        <p className="font-bold text-slate-800 text-sm mt-0.5">{app.proposed_location || "—"}{app.other_location_name ? ` (${app.other_location_name})` : ""}</p>
                      </div>
                    </div>

                    {/* Site Location specifications */}
                    <div className="bg-white p-3 rounded-lg border space-y-3">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b pb-1">Proposed Project Site Info</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="col-span-2">
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">Complete Site Address</span>
                          <span className="font-bold text-gray-700">{app.address || "—"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">GPS Coordinates</span>
                          {editingGpsId === app.id ? (
                            <div className="mt-1 flex gap-1">
                              <input
                                type="text"
                                value={gpsValue}
                                onChange={(e) => setGpsValue(e.target.value)}
                                className="border px-2 py-0.5 text-xs rounded w-32 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800 bg-white"
                                placeholder="e.g. 30.3165, 78.0322"
                              />
                              <button
                                type="button"
                                onClick={() => saveGpsCoordinates(app.id)}
                                className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded hover:bg-emerald-700"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingGpsId(null)}
                                className="bg-slate-200 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded hover:bg-slate-300"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-700">{app.gps_coordinates || "—"}</span>
                              {app.status === 'FORWARDED_TO_DISTRICT' && (
                                <button
                                  type="button"
                                  onClick={() => { setEditingGpsId(app.id); setGpsValue(app.gps_coordinates || ""); }}
                                  className="text-indigo-600 hover:text-indigo-800 text-[10px] font-semibold"
                                >
                                  ✎ Edit
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">District</span>
                          <span className="font-bold text-gray-700">{app.district || "—"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">Site Total Area</span>
                          <span className="font-bold text-gray-700">{app.site_total_area ? `${app.site_total_area} sq ft` : "—"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">Constructed Area</span>
                          <span className="font-bold text-gray-700">{app.proposed_constructed_area ? `${app.proposed_constructed_area} sq ft` : "—"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">Tentative Employees</span>
                          <span className="font-bold text-gray-700">{app.tentative_employees || "—"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">YCB Certified Instructors</span>
                          <span className="font-bold text-gray-700">{app.ycb_certified_instructors || "—"}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">Services Offered</span>
                          <span className="font-bold text-gray-700">{Array.isArray(app.services_offered) ? app.services_offered.join(", ") : (app.services_offered || "—")}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">Clinical Services?</span>
                          <span className="font-bold text-gray-700">{app.clinical_services_provided ? "Yes" : "No"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">AYUSH Doctors</span>
                          <span className="font-bold text-gray-700">{app.certified_ayush_doctors || "0"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Site Map Embed */}
                    <GpsMap coords={app.gps_coordinates} />

                    {/* Documents submitted by applicant */}
                    <DocList docs={[
                      { label: "Fire & Safety NOC",         path: app.doc_fire_safety },
                      { label: "Udyog Registration",        path: app.doc_udyog_reg },
                      { label: "GST Registration Certificate", path: app.doc_gst_reg },
                      { label: "Pollution Control Board NOC", path: app.doc_pollution_cert },
                      { label: "Detailed Project Report",   path: app.doc_dpr },
                      { label: "CA Project Cost Cert.",     path: app.doc_ca_project_cost },
                      { label: "CA Certified ECA",          path: app.doc_ca_eca },
                      { label: "Land Document",             path: app.doc_land_document },
                      { label: "Constitution of Firm/Society/MOA", path: app.doc_constitution },
                      { label: "Registration certificate of Entity", path: app.doc_entity_registration },
                      { label: "MAP Approved by Dev Authority", path: app.doc_map_approval },
                      { label: "Non-Agriculture Land Cert", path: app.doc_non_agri_land },
                      { label: "Land Possession / Lease Proof", path: app.doc_land_possession },
                      { label: "Affidavit (No construction started & no other state subsidy claimed)", path: app.doc_affidavit },
                      { label: "Others",                    path: app.doc_others },
                    ]} />

                    {/* District Officer Site Verification Status */}
                    <div className="border-t pt-4">
                      {app.status === 'FORWARDED_TO_DISTRICT' ? (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            Action Required: Physical Verification &amp; Report
                          </p>
                          <button
                            onClick={() => openModal(app.id)}
                            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs hover:bg-emerald-700 font-bold transition shadow-sm"
                          >
                            Submit Verification Report
                          </button>
                        </div>
                      ) : app.district_verification_note || app.district_verified_at ? (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg">
                          <p className="font-bold text-xs uppercase tracking-wide">✓ Verification Report Submitted</p>
                          {app.district_verification_note && <p className="mt-1">Note: "{app.district_verification_note}"</p>}
                        </div>
                      ) : (
                        <div className="bg-slate-50 border border-slate-200 text-slate-500 p-3 rounded-lg italic">
                          <p className="text-xs">Pending action from Directorate Nodal Officer (Application not forwarded for verification yet).</p>
                        </div>
                      )}
                    </div>

                    {/* Additional compliance & report attachments */}
                    <AdditionalAttachments events={app.events} />

                    {/* Workflow Events Timeline */}
                    <div className="border-t pt-4">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Workflow Timeline</p>
                      <div className="relative border-l border-slate-200 ml-2 space-y-3 pl-4">
                        {(() => {
                          const timelineEvents = [...(app.events || [])];
                          const hasSubmitted = timelineEvents.some(ev => ev.event_type === 'SUBMITTED');
                          if (!hasSubmitted && app.created_at) {
                            timelineEvents.unshift({
                              event_type: 'SUBMITTED',
                              actor_role: 'applicant',
                              comment: 'Application submitted successfully',
                              created_at: app.created_at
                            });
                          }
                          return timelineEvents.map((ev, i) => (
                            <div key={i} className="relative">
                              <span className="absolute -left-[22px] top-1 bg-emerald-600 rounded-full w-2 h-2 border border-white"></span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-slate-800 text-[10px]">{ev.event_type.replace(/_/g, ' ')}</span>
                                <span className="text-[8px] bg-emerald-50 text-emerald-700 px-1 py-0.5 rounded font-bold capitalize">{ev.actor_role}</span>
                                <span className="text-[9px] text-slate-400 ml-auto">{new Date(ev.created_at).toLocaleDateString("en-IN")}</span>
                              </div>
                              {ev.comment && <p className="text-[10px] text-slate-600 italic bg-white p-1.5 rounded border border-slate-100 mt-0.5">"{ev.comment}"</p>}
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Verification Report Submission Modal */}
      {modal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-gray-800 text-base">
                Submit Verification Report
              </h4>
              <button onClick={() => { setModal(null); setVerificationFiles([]); }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Please enter detailed remarks regarding physical site verification, assets check, and compliance.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Verification Note <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={4}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  placeholder="Detailed physical verification comments..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Attach Verification Documents / Photos
                </label>
                
                {/* Uploaded files list */}
                {verificationFiles.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {verificationFiles.map((file) => (
                      <div key={file.id} className="p-3 border rounded-lg bg-slate-50 flex items-center justify-between text-xs">
                        <div className="truncate pr-2 max-w-[70%]">
                          <span className="font-semibold text-gray-700 block truncate">{file.name}</span>
                          {file.uploading ? (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-gray-400">Uploading ({file.progress}%)</span>
                              <div className="w-20 bg-gray-200 h-1 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${file.progress}%` }}></div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">✓ Uploaded successfully</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeVerificationFile(file.id)}
                          className="text-red-500 hover:text-red-700 font-bold text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload trigger */}
                <label className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer flex flex-col items-center justify-center transition bg-slate-50/50">
                  <span className="text-xs font-bold text-emerald-700">+ Add Verification Attachment</span>
                  <span className="text-[9px] text-gray-400 mt-0.5">Upload photos, geo-tagged site images, or PDFs</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleVerificationFileSelect(e.target.files)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-5 border-t pt-4">
              <button onClick={() => { setModal(null); setVerificationFiles([]); }} className="px-4 py-2 text-xs border border-gray-300 rounded-lg text-gray-600 font-semibold">Cancel</button>
              <button
                onClick={submitVerification}
                disabled={saving || !remarks.trim() || verificationFiles.some(f => f.uploading)}
                className="px-5 py-2 text-xs text-white rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 font-bold shadow-sm"
              >
                {saving ? "Submitting…" : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const DistrictOfficer = ({ activeTab }) => {
  const [stats, setStats] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [profile, setProfile] = useState(null);
  // WC operational registrations
  const [wcRegs, setWcRegs] = useState([]);
  const [wcRegsLoading, setWcRegsLoading] = useState(false);
  const [wcSelectedReg, setWcSelectedReg] = useState(null);
  const [wcModalTab, setWcModalTab] = useState("section1");
  const [wcActionModal, setWcActionModal] = useState(null); // { reg, action }
  const [wcComment, setWcComment] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const r = await axiosInstance.get(`${API}/api/auth/profile`);
        if (r.data?.data) {
          setProfile(r.data.data);
        }
      } catch (err) {
        console.error("Error fetching DO profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const handlePrint = (reg) => {
    if (!reg) return;
    const printWindow = window.open("", "_blank");
    
    const htmlContent = `
      <html>
      <head>
        <title>Application Details - ${reg.registration_number || 'Draft'}</title>
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
          <div class="subtitle">Operational Registration Application - ${reg.registration_number || 'Draft'}</div>
          <div style="margin-top: 15px;">
            Status: <span class="status-badge status-${(reg.status || 'SUBMITTED').toLowerCase()}">${reg.status || 'SUBMITTED'}</span>
          </div>
        </div>

        <div class="section-title">Section 1: Basic Information</div>
        <div class="grid-2">
          <div class="field"><div class="label">Centre Name</div><div class="value">${reg.centre_name || '—'}</div></div>
          <div class="field"><div class="label">District</div><div class="value">${reg.district || '—'}</div></div>
        </div>
        <div class="grid-2">
          <div class="field"><div class="label">Address</div><div class="value">${reg.address || '—'}</div></div>
          <div class="field"><div class="label">Google Map Link</div><div class="value">${reg.google_map_link || '—'}</div></div>
        </div>
        <div class="grid-2">
          <div class="field"><div class="label">GPS Latitude / Longitude</div><div class="value">${reg.gps_lat || '—'} / ${reg.gps_lng || '—'}</div></div>
          <div class="field"><div class="label">Owner Name / Mobile</div><div class="value">${reg.owner_name || '—'} / ${reg.mobile || '—'}</div></div>
        </div>
        <div class="grid-2">
          <div class="field"><div class="label">Category</div><div class="value" style="font-weight: 700; color: #0f766e;">${reg.category || '—'}</div></div>
          <div class="field"><div class="label">Residential Facility</div><div class="value">${reg.is_residential ? 'Yes' : 'No'}</div></div>
        </div>
        <div class="grid-2">
          <div class="field"><div class="label">Offers Clinical Services</div><div class="value">${reg.offers_clinical ? 'Yes' : 'No'}</div></div>
          <div class="field"><div class="label">Services Offered</div><div class="value">${(reg.services_offered || []).join(", ") || '—'}</div></div>
        </div>

        <div class="section-title">Section 2: Clinical Information</div>
        <div class="grid-2">
          <div class="field"><div class="label">Doctor Appointed</div><div class="value">${reg.doctor_appointed ? 'Yes' : 'No'}</div></div>
          <div class="field"><div class="label">Doctor Name</div><div class="value">${reg.doctor_name || '—'}</div></div>
        </div>
        <div class="grid-2">
          <div class="field"><div class="label">Doctor Qualification</div><div class="value">${reg.doctor_qualification || '—'}</div></div>
          <div class="field"><div class="label">BCP Registration Number</div><div class="value">${reg.bcp_reg_number || '—'}</div></div>
        </div>
        <div class="grid-2">
          <div class="field"><div class="label">CEA Registered</div><div class="value">${reg.cea_registered ? 'Yes' : 'No'}</div></div>
          <div class="field"><div class="label">CEA Registration Number</div><div class="value">${reg.cea_reg_number || '—'}</div></div>
        </div>
        <div class="grid-2">
          <div class="field"><div class="label">CEA Validity Date</div><div class="value">${reg.cea_valid_till ? new Date(reg.cea_valid_till).toLocaleDateString('en-IN') : '—'}</div></div>
          <div class="field"><div class="label">Clinical Signboards / Details Declaration</div><div class="value">${reg.declaration_board ? 'Accepted' : '—'} / ${reg.declaration_signboard ? 'Accepted' : '—'}</div></div>
        </div>

        <div class="section-title">Section 3: Rooms and Infrastructure</div>
        <div class="grid-2">
          <div class="field"><div class="label">Reception Area Size</div><div class="value">${reg.reception_area_sqft ? reg.reception_area_sqft + ' sqft' : '—'}</div></div>
          <div class="field"><div class="label">Waiting Capacity</div><div class="value">${reg.waiting_capacity || '—'} persons</div></div>
        </div>
        <div class="grid-2">
          <div class="field"><div class="label">Consultation Rooms Count</div><div class="value">${reg.consultation_rooms || '—'}</div></div>
          <div class="field"><div class="label">Total Beds</div><div class="value">${reg.num_beds || '—'}</div></div>
        </div>
        <div class="grid-2">
          <div class="field"><div class="label">Incharge Name / Mobile</div><div class="value">${reg.incharge_name || '—'} / ${reg.incharge_mobile || '—'}</div></div>
          <div class="field"><div class="label">Emergency Referral Centre / Distance</div><div class="value">${reg.emergency_centre_name || '—'} (${reg.emergency_distance_m || '—'} km)</div></div>
        </div>
        <div class="grid-2">
          <div class="field"><div class="label">Offers Prakruti Assessment</div><div class="value">${reg.offers_prakruti ? 'Yes' : 'No'}</div></div>
          <div class="field"><div class="label">Kitchen / Dosha Dietetics</div><div class="value">${reg.kitchen_available ? 'Available' : '—'} / ${reg.dosha_dietetics ? 'Available' : '—'}</div></div>
        </div>

        <div class="section-title">Section 4: Staff Details</div>
        <div class="grid-2">
          <div class="field"><div class="label">Receptionist Count</div><div class="value">${reg.receptionist_count || '—'}</div></div>
          <div class="field"><div class="label">Sanitation Worker Count</div><div class="value">${reg.sanitation_worker_count || '—'}</div></div>
        </div>
        <div class="grid-2">
          <div class="field"><div class="label">Multi-Purpose Workers (MPW)</div><div class="value">${reg.mpw_count || '—'}</div></div>
          <div class="field"><div class="label">Cook / Guard Count</div><div class="value">${reg.cook_count || '—'} / ${reg.watchman_count || '—'}</div></div>
        </div>
        
        ${reg.pharmacist_name ? `
        <div class="grid-2">
          <div class="field"><div class="label">Pharmacist Name</div><div class="value">${reg.pharmacist_name}</div></div>
          <div class="field"><div class="label">Pharmacist Registration Number</div><div class="value">${reg.pharmacist_reg_number}</div></div>
        </div>
        ` : ''}

        ${reg.wc_attendant_count ? `
        <div class="grid-2">
          <div class="field"><div class="label">Attendants Count</div><div class="value">${reg.wc_attendant_count}</div></div>
          <div class="field"><div class="label">Ayurveda Nurse Count</div><div class="value">${reg.ayurveda_nurse_count}</div></div>
        </div>
        ` : ''}

        ${reg.male_panchakarma_therapist ? `
        <div class="grid-2">
          <div class="field"><div class="label">Male Panchakarma Therapists</div><div class="value">${reg.male_panchakarma_therapist}</div></div>
          <div class="field"><div class="label">Female Panchakarma Therapists</div><div class="value">${reg.female_panchakarma_therapist}</div></div>
        </div>
        ` : ''}

        ${reg.yoga_instructor_count ? `
        <div class="grid-2">
          <div class="field"><div class="label">Yoga Instructors Count</div><div class="value">${reg.yoga_instructor_count}</div></div>
          <div class="field"></div>
        </div>
        ` : ''}

        ${reg.bnys_doctor_name ? `
        <div class="grid-2">
          <div class="field"><div class="label">Naturopathy BNYS Doctor Name</div><div class="value">${reg.bnys_doctor_name}</div></div>
          <div class="field"><div class="label">Male / Female Attendants</div><div class="value">${reg.male_naturopathy_attendant} / ${reg.female_naturopathy_attendant}</div></div>
        </div>
        ` : ''}

        <div class="section-title">Section 5: Fee & Declarations</div>
        <div class="grid-2">
          <div class="field"><div class="label">Fee Deposited</div><div class="value">${reg.fee_deposited ? 'Yes' : 'No'}</div></div>
          <div class="field"><div class="label">All Declarations Accepted</div><div class="value">${reg.all_declarations_accepted ? 'Yes' : 'No'}</div></div>
        </div>

        <div class="section-title">Application Compliance & Action History Log</div>
        <div class="timeline">
          ${(reg.events || []).map(event => `
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

  const handlePrintCertificate = (reg) => {
    if (!reg || reg.status !== 'APPROVED') return;
    const printWindow = window.open("", "_blank");
    
    const htmlContent = `
      <html>
      <head>
        <title>Registration Certificate - ${reg.registration_number}</title>
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
              This is to certify that the AYUSH Wellness Centre named <span class="highlight">${reg.centre_name}</span>, 
              located at <span class="highlight">${reg.address}</span>, District <span class="highlight">${reg.district}</span>, 
              owned and managed by <span class="highlight">${reg.owner_name}</span> (Entity Type: <span class="highlight">${reg.entity_type || 'N/A'}</span>), 
              under Category <span class="highlight">${reg.category || 'N/A'}</span>, has been registered and verified under the operational standards of Department of AYUSH & AYUSH Education.
            </p>
          </div>
          
          <div class="meta-info">
            <div class="meta-item"><span class="meta-label">Registration No:</span> <span class="meta-val">${reg.registration_number}</span></div>
            <div class="meta-item"><span class="meta-label">Accreditation:</span> <span class="meta-val">${reg.accreditation_level || 'N/A'}</span></div>
            <div class="meta-item" style="grid-column: span 2;"><span class="meta-label">Services Offered:</span> <span class="meta-val">${(reg.services_offered || []).join(", ") || 'N/A'}</span></div>
          </div>
          
          <div class="footer">
            <div class="validity-block">
              <p><strong>Date of Approval:</strong> ${new Date(reg.approved_at || Date.now()).toLocaleDateString('en-IN')}</p>
              <p><strong>Certificate Validity:</strong> ${reg.certificate_valid_till ? new Date(reg.certificate_valid_till).toLocaleDateString('en-IN') : 'N/A'}</p>
            </div>
            
            <div class="signature-block">
              <p class="sig-title">District Officer (${reg.district})</p>
              <p class="sig-subtitle">Ayurvedic & Unani Services, Uttarakhand</p>
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

  const fetchPendingUsers = async (statusVal = filterStatus) => {
    setLoadingUsers(true);
    try {
      const res = await axiosInstance.get(`${API}/api/admin/pending-registrations?status=${statusVal}`);
      if (res.data.success) {
        setPendingUsers(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching pending users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === "entity_approvals") {
      fetchPendingUsers(filterStatus);
    }
    if (activeTab === "wc_registrations") {
      fetchWcRegistrations();
    }
  }, [activeTab, filterStatus]);

  const handleAction = async (targetUserId, decision) => {
    if (!window.confirm(`Are you sure you want to ${decision} this registration?`)) return;
    try {
      const res = await axiosInstance.put(`${API}/api/admin/approve-user-registration/${targetUserId}`, {
        decision
      });
      if (res.data.success) {
        toast.success(res.data.message || `Registration request ${decision} successfully!`);
        fetchPendingUsers();
      }
    } catch (err) {
      console.error("Error during approval decision:", err);
      toast.error(err.response?.data?.message || "Action failed.");
    }
  };

  const fetchWcRegistrations = async () => {
    setWcRegsLoading(true);
    try {
      const res = await axiosInstance.get(`${API}/api/admin/wellness-centre-operational-registrations`);
      if (res.data.success) setWcRegs(res.data.data);
    } catch (err) {
      console.error('Error fetching WC registrations:', err);
    } finally {
      setWcRegsLoading(false);
    }
  };

  const handleWcAction = async () => {
    if (!wcActionModal) return;
    const { reg, action } = wcActionModal;
    if ((action === 'REVERT' || action === 'REJECT') && !wcComment.trim()) {
      toast.error('Please provide a comment for this action.');
      return;
    }
    try {
      const res = await axiosInstance.put(`${API}/api/admin/wellness-centre-operational-registrations/${reg.id}`, {
        action,
        comment: wcComment
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setWcActionModal(null);
        setWcComment('');
        setWcSelectedReg(null);
        fetchWcRegistrations();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const r = await axiosInstance.get(`${API}/api/admin/dashboard-stats`);
        if (r.data.success) {
          setStats(r.data.data);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, []);

  const topCards = [
    {
      title: "Total Registered Entities",
      value: stats ? stats.totalEntities : "0",
      desc: "Yoga professionals, centres, and institutions",
      icon: Building,
      color: "bg-blue-600"
    },
    {
      title: "Pending Verifications",
      value: stats ? stats.pendingVerifications : "0",
      desc: "Applications awaiting verification",
      icon: Clock,
      color: "bg-yellow-500"
    },
    {
      title: "Total Registered Users",
      value: stats ? stats.totalUsers : "0",
      desc: "All registered users in the platform",
      icon: Users,
      color: "bg-green-500"
    }
  ];

  const actionRequiredItems = [
    "Verify pending user registrations in Admin panel",
    "Review incoming NAAC and NABH incentive requests"
  ];

  const pendingVerifications = [];

  const entities = stats ? stats.roleStats : [];

  const incentives = (stats ? stats.schemesStats : []).map(s => ({
    scheme: s.scheme,
    applications: s.totalApplications,
    approved: s.approved,
    amount: s.amount,
    status: s.approved > 0 ? "Active" : "No Applications"
  }));

  const monthlyStats = [];

  if (activeTab === "entity_approvals") {
    const roleLabels = {
      wellness_centre: "Wellness Centre",
      yoga_centre: "Yoga Centre",
      yoga_professional: "Yoga Professional",
      ayush_hospital: "AYUSH Hospital"
    };

    return (
      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <CheckCircle className="text-teal-600" size={32} />
            District Entity Approvals
          </h1>
          <p className="text-gray-500 mt-1">Review and approve registrations for wellness centres, professionals, training centres, and hospitals in your district</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 border-b border-gray-200 pb-px">
          {["pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`pb-3 px-4 text-sm font-semibold capitalize border-b-2 transition-all ${
                filterStatus === status
                  ? "border-teal-600 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {status === "pending" ? "Pending Approvals" : status === "approved" ? "Approved History" : "Rejected History"}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          {loadingUsers ? (
            <div className="p-8 text-center text-teal-600 font-medium">Loading applications...</div>
          ) : pendingUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-medium bg-gray-50 rounded-xl">
              No {filterStatus} registrations found for your district.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Entity Details</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Entity Type</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">District</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Submitted On</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {pendingUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">{u.full_name}</div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                        <div className="text-sm text-gray-500">{u.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider">
                          {roleLabels[u.role] || u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                        {u.district || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                       <td className="px-6 py-4 text-right space-x-2">
                        {filterStatus === "pending" ? (
                          <>
                            <button
                              onClick={() => setSelectedEntity(u)}
                              className="px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white font-bold rounded-lg text-xs transition"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => handleAction(u.id, "approved")}
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(u.id, "rejected")}
                              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg text-xs transition"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => setSelectedEntity(u)}
                              className="px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white font-bold rounded-lg text-xs transition"
                            >
                              View Details
                            </button>
                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                              filterStatus === "approved"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}>
                              {filterStatus === "approved" ? "Approved" : "Rejected"}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* --- Entity Profile Details Modal --- */}
        {selectedEntity && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden transform transition-all border border-slate-100 text-left">
              <div className="bg-gradient-to-r from-teal-700 to-teal-800 px-6 py-4 flex items-center justify-between text-white">
                <h3 className="text-lg font-bold">Review Registration Profile</h3>
                <button
                  onClick={() => setSelectedEntity(null)}
                  className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                {selectedEntity.role === "yoga_centre" ? (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b pb-2">Yoga Centre Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-semibold text-gray-800 block">Applicant Name</span> 
                        <span className="text-gray-600">{selectedEntity.tc_applicant_name || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">Designation</span> 
                        <span className="text-gray-600">{selectedEntity.tc_designation || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">Entity Name</span> 
                        <span className="text-gray-600">{selectedEntity.full_name || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">Entity Type</span> 
                        <span className="text-gray-600">{selectedEntity.tc_entity_type || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">Existing Operational Business</span> 
                        <span className="text-gray-600">{selectedEntity.tc_already_operating || "N/A"}</span>
                      </div>
                      {selectedEntity.tc_already_operating === "Other" && (
                        <div>
                          <span className="font-semibold text-gray-800 block">Other Business</span> 
                          <span className="text-gray-600">{selectedEntity.tc_other_business || "N/A"}</span>
                        </div>
                      )}
                      
                      {selectedEntity.tc_already_operating && selectedEntity.tc_already_operating !== "None" && (
                        <div className="col-span-2 mt-2 bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                          <div className="font-bold text-slate-700 text-xs uppercase tracking-wider">Operational Business Details</div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="font-semibold text-gray-800 block text-xs">Name of Business</span>
                              <span className="text-sm text-gray-600">{selectedEntity.tc_operational_business_name || "N/A"}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-800 block text-xs">Registration Number</span>
                              <span className="text-sm text-gray-600">{selectedEntity.tc_operational_business_reg_number || "N/A"}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="font-semibold text-gray-800 block text-xs mb-1">Registration Certificate</span>
                              {selectedEntity.tc_operational_business_certificate ? (
                                <a 
                                  href={`${API}/${selectedEntity.tc_operational_business_certificate}`} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-teal-600 font-semibold hover:underline inline-flex items-center gap-1 text-sm"
                                >
                                  <FileText size={14} /> View Document
                                </a>
                              ) : <span className="text-xs text-gray-400 italic">Not Uploaded</span>}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="col-span-2">
                        <span className="font-semibold text-gray-800 block mb-1">Entity Registration Certificate</span>
                        {selectedEntity.tc_entity_certificate ? (
                          <a 
                            href={`${API}/${selectedEntity.tc_entity_certificate}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-teal-600 font-semibold hover:underline inline-flex items-center gap-1 text-sm"
                          >
                            <FileText size={14} /> View Certificate
                          </a>
                        ) : <span className="text-xs text-gray-400 italic">Not Uploaded</span>}
                      </div>

                      <div>
                        <span className="font-semibold text-gray-800 block">Website</span>
                        {selectedEntity.tc_website ? (
                          <a href={selectedEntity.tc_website} target="_blank" rel="noreferrer" className="text-teal-600 font-semibold hover:underline text-sm break-all">
                            {selectedEntity.tc_website}
                          </a>
                        ) : <span className="text-gray-500">N/A</span>}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">GPS Coordinates</span> 
                        <span className="text-gray-600">{selectedEntity.tc_gps_coordinates || "N/A"}</span>
                      </div>

                      <div>
                        <span className="font-semibold text-gray-800 block">ID Proof Type</span> 
                        <span className="text-gray-600 capitalize">{selectedEntity.tc_id_proof_type || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">ID Number</span> 
                        <span className="text-gray-600">{selectedEntity.tc_id_proof_number || "N/A"}</span>
                      </div>

                      <div className="col-span-2">
                        <span className="font-semibold text-gray-800 block mb-1">Uploaded ID Proof</span>
                        {selectedEntity.tc_id_proof_path ? (
                          <a 
                            href={`${API}/${selectedEntity.tc_id_proof_path}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-teal-600 font-semibold hover:underline inline-flex items-center gap-1 text-sm"
                          >
                            <FileText size={14} /> View ID Proof File
                          </a>
                        ) : <span className="text-xs text-gray-400 italic">Not Uploaded</span>}
                      </div>

                      <div className="col-span-2">
                        <span className="font-semibold text-gray-800 block">Address of Business</span> 
                        <span className="text-gray-600 block bg-gray-50 p-3 rounded-lg border border-gray-100">{selectedEntity.tc_address || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                ) : selectedEntity.role === "wellness_centre" ? (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b pb-2">Wellness Centre Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-semibold text-gray-800 block">Name of Applicant</span> 
                        <span>{selectedEntity.wc_applicant_name || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">Designation</span> 
                        <span>{selectedEntity.wc_designation || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">Name of Entity</span> 
                        <span>{selectedEntity.full_name || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">Entity Type</span> 
                        <span>{selectedEntity.wc_entity_type || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">Email ID</span> 
                        <span>{selectedEntity.email || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">Mobile Number</span> 
                        <span>{selectedEntity.phone || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">District</span> 
                        <span>{selectedEntity.district || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">Address</span> 
                        <span>{selectedEntity.wc_address || "N/A"}</span>
                      </div>
                      <div className="col-span-2 border-t pt-2 mt-2 space-y-2">
                        <span className="font-semibold text-gray-800 block text-xs uppercase tracking-wider">Uploaded Documents</span>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs text-gray-500 block">Entity Registration Document</span>
                            {selectedEntity.wc_entity_certificate ? (
                              <a href={`${API}${selectedEntity.wc_entity_certificate}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-semibold text-xs inline-flex items-center gap-1 mt-0.5">
                                📄 View Document
                              </a>
                            ) : <span className="text-xs text-gray-400 italic">Not Uploaded</span>}
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">Applicant's ID Proof</span>
                            {selectedEntity.wc_id_proof_file ? (
                              <a href={`${API}${selectedEntity.wc_id_proof_file}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-semibold text-xs inline-flex items-center gap-1 mt-0.5">
                                📄 View Document
                              </a>
                            ) : <span className="text-xs text-gray-400 italic">Not Uploaded</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b pb-2">Profile Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-semibold text-gray-800 block">Name</span> 
                        <span>{selectedEntity.full_name || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">Role</span> 
                        <span className="uppercase text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">{selectedEntity.role}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">Email</span> 
                        <span>{selectedEntity.email || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">Mobile</span> 
                        <span>{selectedEntity.phone || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">District</span> 
                        <span>{selectedEntity.district || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">Submitted On</span> 
                        <span>{new Date(selectedEntity.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  onClick={() => setSelectedEntity(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition text-sm"
                >
                  Close
                </button>
                {selectedEntity.registration_status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        handleAction(selectedEntity.id, "approved");
                        setSelectedEntity(null);
                      }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleAction(selectedEntity.id, "rejected");
                        setSelectedEntity(null);
                      }}
                      className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg transition text-sm"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Wellness Centre Operational Registrations Tab ─────────────────────────────
  if (activeTab === "wc_registrations") {
    const wcStatusColors = {
      SUBMITTED: { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', label: 'Submitted' },
      REVERTED: { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c', label: 'Reverted' },
      APPROVED: { bg: '#f0fdf4', border: '#86efac', text: '#166534', label: 'Approved' },
      REJECTED: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', label: 'Rejected' },
      RESUBMITTED: { bg: '#f0f9ff', border: '#bae6fd', text: '#0369a1', label: 'Resubmitted' }
    };

    const DocLink = ({ path, label }) => {
      if (!path) return <span style={{ color: '#9ca3af', fontSize: 12 }}>Not uploaded</span>;
      const url = path.startsWith('http') ? path : `${API}/${path.replace(/^\//, '')}`;
      return <a href={url} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontSize: 12, textDecoration: 'underline' }}>{label || 'View Document'}</a>;
    };

    return (
      <div style={{ padding: 24, minHeight: '100vh', background: '#f8fafc' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', margin: 0 }}>Wellness Centre Registrations</h1>
          <p style={{ color: '#64748b', marginTop: 4 }}>Review and approve operational registration applications from Wellness Centre users in your district.</p>
        </div>

        {wcRegsLoading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#166534', fontWeight: 600 }}>Loading registrations...</div>
        ) : wcRegs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', color: '#64748b' }}>
            No wellness centre registration applications found for your district.
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead style={{ background: '#f1f5f9' }}>
                <tr>
                  {['Reg. No.', 'Centre Name', 'Category', 'District', 'Owner', 'Services', 'Submitted', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: '#475569', fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {wcRegs.map((reg) => {
                  const s = wcStatusColors[reg.status] || wcStatusColors.SUBMITTED;
                  return (
                    <tr key={reg.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#166534', fontFamily: 'monospace' }}>{reg.registration_number || '—'}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>{reg.centre_name}</td>
                      <td style={{ padding: '12px 14px', fontSize: 11, color: '#475569' }}>{reg.category || '—'}</td>
                      <td style={{ padding: '12px 14px' }}>{reg.district}</td>
                      <td style={{ padding: '12px 14px' }}>{reg.owner_name || reg.applicant_user_name || '—'}</td>
                      <td style={{ padding: '12px 14px', fontSize: 11 }}>{(reg.services_offered || []).join(', ') || '—'}</td>
                      <td style={{ padding: '12px 14px', fontSize: 11, color: '#64748b' }}>{reg.submitted_at ? new Date(reg.submitted_at).toLocaleDateString('en-IN') : '—'}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text, borderRadius: 20, padding: '3px 10px', fontWeight: 700, fontSize: 11 }}>{s.label}</span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => { setWcSelectedReg(reg); setWcModalTab("section1"); }}
                            style={{ background: '#475569', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                          >View</button>
                          {(reg.status === 'SUBMITTED' || reg.status === 'RESUBMITTED') && (
                            <>
                              <button
                                onClick={() => { setWcActionModal({ reg, action: 'APPROVE' }); setWcComment(''); }}
                                style={{ background: '#166534', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                              >Approve</button>
                              <button
                                onClick={() => { setWcActionModal({ reg, action: 'REVERT' }); setWcComment(''); }}
                                style={{ background: '#c2410c', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                              >Revert</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* View Details Modal */}
        {wcSelectedReg && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setWcSelectedReg(null)}>
            <div style={{ background: '#fff', borderRadius: 16, maxWidth: 950, width: '100%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
              <div style={{ background: 'linear-gradient(135deg,#166534,#15803d)', color: '#fff', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{wcSelectedReg.centre_name}</div>
                  <div style={{ fontSize: 13, opacity: 0.85 }}>Reg No: {wcSelectedReg.registration_number} | {wcSelectedReg.district}</div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {wcSelectedReg.status === 'APPROVED' && (
                    <button
                      onClick={() => handlePrintCertificate(wcSelectedReg)}
                      style={{ background: '#fff', color: '#166534', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <Award size={14} /> Download Certificate (PDF)
                    </button>
                  )}
                  <button
                    onClick={() => handlePrint(wcSelectedReg)}
                    style={{ background: '#fff', color: '#166534', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Printer size={14} /> Print Application (PDF)
                  </button>
                  <button onClick={() => setWcSelectedReg(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20 }}>✕</button>
                </div>
              </div>
              <div style={{ overflowY: 'auto', padding: 24, flex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
                  {/* Left Sidebar Tabs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderRight: '1px solid #e2e8f0', paddingRight: 16 }}>
                    <button
                      onClick={() => setWcModalTab("section1")}
                      style={{ textAlign: 'left', padding: '10px 14px', border: 'none', background: wcModalTab === 'section1' ? '#f0fdf4' : 'none', color: wcModalTab === 'section1' ? '#166534' : '#475569', fontWeight: 700, fontSize: 13, borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      1. Basic Info
                    </button>
                    <button
                      onClick={() => setWcModalTab("section2")}
                      style={{ textAlign: 'left', padding: '10px 14px', border: 'none', background: wcModalTab === 'section2' ? '#f0fdf4' : 'none', color: wcModalTab === 'section2' ? '#166534' : '#475569', fontWeight: 700, fontSize: 13, borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      2. Clinical Info
                    </button>
                    <button
                      onClick={() => setWcModalTab("section3")}
                      style={{ textAlign: 'left', padding: '10px 14px', border: 'none', background: wcModalTab === 'section3' ? '#f0fdf4' : 'none', color: wcModalTab === 'section3' ? '#166534' : '#475569', fontWeight: 700, fontSize: 13, borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      3. Rooms & Infrastructure
                    </button>
                    <button
                      onClick={() => setWcModalTab("section4")}
                      style={{ textAlign: 'left', padding: '10px 14px', border: 'none', background: wcModalTab === 'section4' ? '#f0fdf4' : 'none', color: wcModalTab === 'section4' ? '#166534' : '#475569', fontWeight: 700, fontSize: 13, borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      4. Staff Details
                    </button>
                    <button
                      onClick={() => setWcModalTab("documents")}
                      style={{ textAlign: 'left', padding: '10px 14px', border: 'none', background: wcModalTab === 'documents' ? '#f0fdf4' : 'none', color: wcModalTab === 'documents' ? '#166534' : '#475569', fontWeight: 700, fontSize: 13, borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      Uploaded Documents
                    </button>
                    <button
                      onClick={() => setWcModalTab("logs")}
                      style={{ textAlign: 'left', padding: '10px 14px', border: 'none', background: wcModalTab === 'logs' ? '#f0fdf4' : 'none', color: wcModalTab === 'logs' ? '#166534' : '#475569', fontWeight: 700, fontSize: 13, borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      Compliance Logs
                    </button>
                  </div>

                  {/* Right Details Pane */}
                  <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: 8 }}>
                    {wcModalTab === "section1" && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h4 style={{ fontWeight: 800, fontSize: 14, color: '#166534', margin: '0 0 8px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>Section 1: Basic Information</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
                          {[
                            ['Centre Name', wcSelectedReg.centre_name],
                            ['District', wcSelectedReg.district],
                            ['Address', wcSelectedReg.address],
                            ['Google Map Link', wcSelectedReg.google_map_link ? <a href={wcSelectedReg.google_map_link} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>View Google Map Link</a> : '—'],
                            ['GPS Latitude / Longitude', `${wcSelectedReg.gps_lat || '—'} / ${wcSelectedReg.gps_lng || '—'}`],
                            ['Owner Name', wcSelectedReg.owner_name],
                            ['Owner Mobile', wcSelectedReg.mobile],
                            ['Category', wcSelectedReg.category],
                            ['Residential Facility', wcSelectedReg.is_residential ? 'Yes' : 'No'],
                            ['Offers Clinical Services', wcSelectedReg.offers_clinical ? 'Yes' : 'No'],
                            ['Services Offered', (wcSelectedReg.services_offered || []).join(', ') || '—'],
                            ['Registered on Portal Before', wcSelectedReg.already_on_portal ? `Yes (${wcSelectedReg.portal_reg_reason || ''})` : 'No'],
                            ['Previous Registration No.', wcSelectedReg.previous_reg_number || '—'],
                          ].map(([k, v]) => (
                            <div key={k} style={{ fontSize: 13 }}>
                              <span style={{ fontWeight: 600, color: '#475569', display: 'block', fontSize: 11, textTransform: 'uppercase', marginBottom: 2 }}>{k}</span>
                              <span style={{ color: '#1e293b', fontWeight: 500 }}>{v || '—'}</span>
                            </div>
                          ))}
                        </div>
                        {wcSelectedReg.previous_reg_certificate && (
                          <div style={{ marginTop: 8 }}>
                            <span style={{ fontWeight: 600, color: '#475569', display: 'block', fontSize: 11, textTransform: 'uppercase', marginBottom: 4 }}>Previous Registration Certificate</span>
                            <DocLink path={wcSelectedReg.previous_reg_certificate} label="View Certificate Document" />
                          </div>
                        )}
                      </div>
                    )}

                    {wcModalTab === "section2" && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h4 style={{ fontWeight: 800, fontSize: 14, color: '#166534', margin: '0 0 8px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>Section 2: Clinical Details</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
                          {[
                            ['Doctor Appointed', wcSelectedReg.doctor_appointed ? 'Yes' : 'No'],
                            ['Doctor Name', wcSelectedReg.doctor_name],
                            ['Doctor Qualification', wcSelectedReg.doctor_qualification],
                            ['BCP Registration Number', wcSelectedReg.bcp_reg_number],
                            ['CEA Registered', wcSelectedReg.cea_registered ? 'Yes' : 'No'],
                            ['CEA Registration Number', wcSelectedReg.cea_reg_number],
                            ['CEA Valid Till', wcSelectedReg.cea_valid_till ? new Date(wcSelectedReg.cea_valid_till).toLocaleDateString('en-IN') : '—'],
                            ['Mandatory Signboards Displayed', wcSelectedReg.declaration_board && wcSelectedReg.declaration_signboard ? 'Yes (Accepted)' : 'No'],
                          ].map(([k, v]) => (
                            <div key={k} style={{ fontSize: 13 }}>
                              <span style={{ fontWeight: 600, color: '#475569', display: 'block', fontSize: 11, textTransform: 'uppercase', marginBottom: 2 }}>{k}</span>
                              <span style={{ color: '#1e293b', fontWeight: 500 }}>{v || '—'}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop: 8, display: 'flex', gap: 16, flexDirection: 'column' }}>
                          {wcSelectedReg.doctor_qual_doc && (
                            <div>
                              <span style={{ fontWeight: 600, color: '#475569', display: 'block', fontSize: 11, textTransform: 'uppercase', marginBottom: 4 }}>Doctor Qualification Doc</span>
                              <DocLink path={wcSelectedReg.doctor_qual_doc} label="View Doc" />
                            </div>
                          )}
                          {wcSelectedReg.bcp_reg_doc && (
                            <div>
                              <span style={{ fontWeight: 600, color: '#475569', display: 'block', fontSize: 11, textTransform: 'uppercase', marginBottom: 4 }}>Doctor BCP Registration Doc</span>
                              <DocLink path={wcSelectedReg.bcp_reg_doc} label="View Doc" />
                            </div>
                          )}
                          {wcSelectedReg.cea_reg_certificate && (
                            <div>
                              <span style={{ fontWeight: 600, color: '#475569', display: 'block', fontSize: 11, textTransform: 'uppercase', marginBottom: 4 }}>CEA Certificate</span>
                              <DocLink path={wcSelectedReg.cea_reg_certificate} label="View Doc" />
                            </div>
                          )}
                          {wcSelectedReg.clinical_affidavit && (
                            <div>
                              <span style={{ fontWeight: 600, color: '#475569', display: 'block', fontSize: 11, textTransform: 'uppercase', marginBottom: 4 }}>Clinical Affidavit</span>
                              <DocLink path={wcSelectedReg.clinical_affidavit} label="View Doc" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {wcModalTab === "section3" && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h4 style={{ fontWeight: 800, fontSize: 14, color: '#166534', margin: '0 0 8px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>Section 3: Rooms & Infrastructure</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
                          {[
                            ['Reception Size (sqft)', wcSelectedReg.reception_area_sqft],
                            ['Waiting Capacity', wcSelectedReg.waiting_capacity],
                            ['Consultation Rooms', wcSelectedReg.consultation_rooms],
                            ['Total Beds', wcSelectedReg.num_beds],
                            ['Incharge Name', wcSelectedReg.incharge_name],
                            ['Incharge Mobile', wcSelectedReg.incharge_mobile],
                            ['Emergency Referral Centre', wcSelectedReg.emergency_centre_name],
                            ['Emergency Distance', wcSelectedReg.emergency_distance_m ? `${wcSelectedReg.emergency_distance_m} km` : '—'],
                            ['Offers Prakruti Analysis', wcSelectedReg.offers_prakruti ? 'Yes' : 'No'],
                            ['Kitchen / Dosha Dietetics', wcSelectedReg.kitchen_available ? `Available ${wcSelectedReg.dosha_dietetics ? '(with Dietetics)' : ''}` : 'No'],
                            ['Parking (Cars)', wcSelectedReg.parking_cars],
                            ['CCTV Supervised', wcSelectedReg.cctv_supervised ? 'Yes' : 'No'],
                          ].map(([k, v]) => (
                            <div key={k} style={{ fontSize: 13 }}>
                              <span style={{ fontWeight: 600, color: '#475569', display: 'block', fontSize: 11, textTransform: 'uppercase', marginBottom: 2 }}>{k}</span>
                              <span style={{ color: '#1e293b', fontWeight: 500 }}>{v ?? '—'}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                          <span style={{ fontWeight: 700, color: '#166534', fontSize: 12, display: 'block', marginBottom: 12 }}>Service Specific Rooms Count</span>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                            {[
                              ['Marma Rooms', wcSelectedReg.marma_rooms],
                              ['Para Surgical Rooms', wcSelectedReg.para_surgical_rooms],
                              ['Kshar Sutra OT', wcSelectedReg.kshar_sutra_ot],
                              ['Yoga Halls', wcSelectedReg.yoga_halls],
                              ['Meditation Halls', wcSelectedReg.meditation_halls],
                              ['Shatkarma Rooms', wcSelectedReg.shatkarma_rooms],
                              ['Massage Rooms', wcSelectedReg.massage_rooms],
                              ['Enema Rooms', wcSelectedReg.enema_rooms],
                              ['Hydrotherapy Rooms', wcSelectedReg.hydrotherapy_rooms],
                              ['Abhyanga Rooms', wcSelectedReg.abhyanga_rooms],
                              ['Vasti Rooms', wcSelectedReg.vasti_rooms],
                              ['Post Therapy Waiting', wcSelectedReg.post_therapy_waiting_rooms],
                              ['Medicine Dispensing', wcSelectedReg.medicine_dispensing_rooms],
                            ].map(([k, v]) => (
                              v !== null && v !== '' && (
                                <div key={k} style={{ fontSize: 12 }}>
                                  <span style={{ fontWeight: 600, color: '#64748b', display: 'block' }}>{k}</span>
                                  <span style={{ color: '#1e293b', fontWeight: 700 }}>{v}</span>
                                </div>
                              )
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {wcModalTab === "section4" && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h4 style={{ fontWeight: 800, fontSize: 14, color: '#166534', margin: '0 0 8px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>Section 4: Staff Details</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
                          {[
                            ['Receptionist Count', wcSelectedReg.receptionist_count],
                            ['Sanitation Worker Count', wcSelectedReg.sanitation_worker_count],
                            ['Multi-Purpose Workers (MPW)', wcSelectedReg.mpw_count],
                            ['Cook Count', wcSelectedReg.cook_count],
                            ['Watchman / Guard Count', wcSelectedReg.watchman_count],
                          ].map(([k, v]) => (
                            <div key={k} style={{ fontSize: 13 }}>
                              <span style={{ fontWeight: 600, color: '#475569', display: 'block', fontSize: 11, textTransform: 'uppercase', marginBottom: 2 }}>{k}</span>
                              <span style={{ color: '#1e293b', fontWeight: 500 }}>{v ?? '—'}</span>
                            </div>
                          ))}
                        </div>

                        {(wcSelectedReg.pharmacist_name || wcSelectedReg.wc_attendant_count || wcSelectedReg.male_panchakarma_therapist || wcSelectedReg.yoga_instructor_count || wcSelectedReg.bnys_doctor_name) && (
                          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                            <span style={{ fontWeight: 700, color: '#166534', fontSize: 12, display: 'block', marginBottom: 12 }}>Service Specific Staff Details</span>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                              {wcSelectedReg.pharmacist_name && (
                                <>
                                  <div style={{ fontSize: 13 }}>
                                    <span style={{ fontWeight: 600, color: '#64748b', display: 'block', fontSize: 11 }}>Pharmacist Name</span>
                                    <span style={{ color: '#1e293b', fontWeight: 600 }}>{wcSelectedReg.pharmacist_name}</span>
                                  </div>
                                  <div style={{ fontSize: 13 }}>
                                    <span style={{ fontWeight: 600, color: '#64748b', display: 'block', fontSize: 11 }}>Pharmacist Reg. Number</span>
                                    <span style={{ color: '#1e293b', fontWeight: 600 }}>{wcSelectedReg.pharmacist_reg_number}</span>
                                  </div>
                                  {wcSelectedReg.pharmacist_bcp_doc && (
                                    <div style={{ gridColumn: 'span 2' }}>
                                      <span style={{ fontWeight: 600, color: '#64748b', display: 'block', fontSize: 11, marginBottom: 4 }}>Pharmacist BCP Document</span>
                                      <DocLink path={wcSelectedReg.pharmacist_bcp_doc} label="View Pharmacist Doc" />
                                    </div>
                                  )}
                                </>
                              )}
                              {wcSelectedReg.wc_attendant_count && (
                                <>
                                  <div style={{ fontSize: 13 }}>
                                    <span style={{ fontWeight: 600, color: '#64748b', display: 'block', fontSize: 11 }}>Wellness Centre Attendants (Min 2/10 Beds)</span>
                                    <span style={{ color: '#1e293b', fontWeight: 600 }}>{wcSelectedReg.wc_attendant_count}</span>
                                  </div>
                                  <div style={{ fontSize: 13 }}>
                                    <span style={{ fontWeight: 600, color: '#64748b', display: 'block', fontSize: 11 }}>Ayurveda Nurses (Min 2/10 Beds)</span>
                                    <span style={{ color: '#1e293b', fontWeight: 600 }}>{wcSelectedReg.ayurveda_nurse_count}</span>
                                  </div>
                                </>
                              )}
                              {wcSelectedReg.male_panchakarma_therapist && (
                                <>
                                  <div style={{ fontSize: 13 }}>
                                    <span style={{ fontWeight: 600, color: '#64748b', display: 'block', fontSize: 11 }}>Male Panchakarma Therapists</span>
                                    <span style={{ color: '#1e293b', fontWeight: 600 }}>{wcSelectedReg.male_panchakarma_therapist}</span>
                                  </div>
                                  <div style={{ fontSize: 13 }}>
                                    <span style={{ fontWeight: 600, color: '#64748b', display: 'block', fontSize: 11 }}>Female Panchakarma Therapists</span>
                                    <span style={{ color: '#1e293b', fontWeight: 600 }}>{wcSelectedReg.female_panchakarma_therapist}</span>
                                  </div>
                                  {wcSelectedReg.panchakarma_staff_bcp_doc && (
                                    <div style={{ gridColumn: 'span 2' }}>
                                      <span style={{ fontWeight: 600, color: '#64748b', display: 'block', fontSize: 11, marginBottom: 4 }}>Panchakarma Staff BCP License Doc</span>
                                      <DocLink path={wcSelectedReg.panchakarma_staff_bcp_doc} label="View Panchakarma Staff Doc" />
                                    </div>
                                  )}
                                </>
                              )}
                              {wcSelectedReg.yoga_instructor_count && (
                                <>
                                  <div style={{ fontSize: 13 }}>
                                    <span style={{ fontWeight: 600, color: '#64748b', display: 'block', fontSize: 11 }}>Yoga Instructors</span>
                                    <span style={{ color: '#1e293b', fontWeight: 600 }}>{wcSelectedReg.yoga_instructor_count}</span>
                                  </div>
                                  {wcSelectedReg.yoga_instructor_qual_doc && (
                                    <div>
                                      <span style={{ fontWeight: 600, color: '#64748b', display: 'block', fontSize: 11, marginBottom: 4 }}>Yoga Instructors Qualification Doc</span>
                                      <DocLink path={wcSelectedReg.yoga_instructor_qual_doc} label="View Yoga Qual Doc" />
                                    </div>
                                  )}
                                </>
                              )}
                              {wcSelectedReg.bnys_doctor_name && (
                                <>
                                  <div style={{ fontSize: 13 }}>
                                    <span style={{ fontWeight: 600, color: '#64748b', display: 'block', fontSize: 11 }}>BNYS Doctor Name</span>
                                    <span style={{ color: '#1e293b', fontWeight: 600 }}>{wcSelectedReg.bnys_doctor_name}</span>
                                  </div>
                                  <div style={{ fontSize: 13 }}>
                                    <span style={{ fontWeight: 600, color: '#64748b', display: 'block', fontSize: 11 }}>Male / Female Naturopathy Attendants</span>
                                    <span style={{ color: '#1e293b', fontWeight: 600 }}>{wcSelectedReg.male_naturopathy_attendant} / {wcSelectedReg.female_naturopathy_attendant}</span>
                                  </div>
                                  {wcSelectedReg.bnys_reg_certificate && (
                                    <div>
                                      <span style={{ fontWeight: 600, color: '#64748b', display: 'block', fontSize: 11, marginBottom: 4 }}>BNYS Registration Certificate</span>
                                      <DocLink path={wcSelectedReg.bnys_reg_certificate} label="View BNYS Certificate" />
                                    </div>
                                  )}
                                  {wcSelectedReg.naturopathy_staff_bcp_doc && (
                                    <div>
                                      <span style={{ fontWeight: 600, color: '#64748b', display: 'block', fontSize: 11, marginBottom: 4 }}>Naturopathy Attendants BCP Doc</span>
                                      <DocLink path={wcSelectedReg.naturopathy_staff_bcp_doc} label="View Naturopathy Attendants Doc" />
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {wcModalTab === "documents" && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h4 style={{ fontWeight: 800, fontSize: 14, color: '#166534', margin: '0 0 8px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>Uploaded Documents & Licences</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                          {[
                            ['Previous Registration Certificate', wcSelectedReg.previous_reg_certificate],
                            ['Doctor Qualification Document', wcSelectedReg.doctor_qual_doc],
                            ['Doctor BCP Registration Document', wcSelectedReg.bcp_reg_doc],
                            ['CEA Registration Certificate', wcSelectedReg.cea_reg_certificate],
                            ['Clinical declaration Affidavit', wcSelectedReg.clinical_affidavit],
                            ['Service Charges List', wcSelectedReg.service_charges_doc],
                            ['Brochure / Pamphlet', wcSelectedReg.brochure_doc],
                            ['Pharmacist BCP Registration Doc', wcSelectedReg.pharmacist_bcp_doc],
                            ['Panchakarma Staff BCP Registrations', wcSelectedReg.panchakarma_staff_bcp_doc],
                            ['Yoga Instructor Qualification Doc', wcSelectedReg.yoga_instructor_qual_doc],
                            ['BNYS Doctor Registration Certificate', wcSelectedReg.bnys_reg_certificate],
                            ['Naturopathy Attendants BCP Doc', wcSelectedReg.naturopathy_staff_bcp_doc],
                            ['Fee Deposit Receipt', wcSelectedReg.fee_receipt_doc],
                            ['Declaration Affidavit', wcSelectedReg.declaration_affidavit],
                            ['Compliance Supporting Document', wcSelectedReg.compliance_document],
                          ].map(([label, path]) => (
                            path && (
                              <div key={label} style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, display: 'flex', flexDirection: 'column', justifycontent: 'space-between', minHeight: 90 }}>
                                <span style={{ fontWeight: 700, color: '#334155', fontSize: 12 }}>{label}</span>
                                <DocLink path={path} label="View Uploaded Document" />
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {wcModalTab === "logs" && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h4 style={{ fontWeight: 800, fontSize: 14, color: '#166534', margin: '0 0 8px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>Application Activity & Compliance Logs</h4>
                        <div style={{ position: 'relative', borderLeft: '2px solid #e2e8f0', paddingLeft: 20, marginLeft: 10, display: 'flex', flexDirection: 'column', gap: 24 }}>
                          {(wcSelectedReg.events || []).map((event, idx) => (
                            <div key={event.id || idx} style={{ position: 'relative' }}>
                              <div style={{ position: 'absolute', left: -25, top: 4, width: 8, height: 8, borderRadius: '50%', background: '#166534', border: '2px solid #fff' }}></div>
                              <div>
                                <div style={{ display: 'flex', justifycontent: 'space-between', gap: 10 }}>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{event.event_type}</span>
                                  <span style={{ fontSize: 11, color: '#94a3b8' }}>
                                    {new Date(event.created_at).toLocaleString('en-IN', {
                                      day: '2-digit', month: 'short', year: 'numeric',
                                      hour: '2-digit', minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                                  Action By: {event.actor_name} ({event.actor_role})
                                </div>
                                {event.comment && (
                                  <div style={{ fontSize: 12, color: '#475569', background: '#f1f5f9', borderLeft: '3px solid #cbd5e1', padding: 8, borderRadius: '0 6px 6px 0', marginTop: 6, fontWeight: 500 }}>
                                    "{event.comment}"
                                  </div>
                                )}
                                {event.document_path && (
                                  <div style={{ marginTop: 6 }}>
                                    <a
                                      href={`${API}${event.document_path}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{ color: '#0f766e', fontWeight: 700, fontSize: 11, textDecoration: 'underline' }}
                                    >
                                      View Submitted Document
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          {(wcSelectedReg.events || []).length === 0 && (
                            <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>No movement timeline logged yet.</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Query & Compliance History */}
                {((wcSelectedReg.events || []).some(e => e.event_type === 'REVERTED' || e.event_type === 'COMPLIANCE_SUBMITTED')) && (
                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, marginTop: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#0f766e', borderBottom: '1px solid #e2e8f0', paddingBottom: 6, marginBottom: 12 }}>
                      Query & Compliance History
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 250, overflowY: 'auto' }}>
                      {(wcSelectedReg.events || [])
                        .filter(e => e.event_type === 'REVERTED' || e.event_type === 'COMPLIANCE_SUBMITTED')
                        .map((ev, index) => {
                          const isRevert = ev.event_type === 'REVERTED';
                          const complianceEvents = (wcSelectedReg.events || []).filter(e => e.event_type === 'COMPLIANCE_SUBMITTED');
                          const isLastCompliance = complianceEvents.length > 0 && complianceEvents[complianceEvents.length - 1].created_at === ev.created_at;
                          const docPath = ev.document_path || (isLastCompliance ? wcSelectedReg.compliance_document : null);

                          return (
                            <div 
                              key={ev.id || index} 
                              style={{
                                padding: 12,
                                borderRadius: 8,
                                border: '1px solid ' + (isRevert ? '#fed7aa' : '#a7f3d0'),
                                borderLeft: '4px solid ' + (isRevert ? '#ea580c' : '#10b981'),
                                background: isRevert ? '#fff7ed' : '#ecfdf5'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: isRevert ? '#9a3412' : '#065f46' }}>
                                  {isRevert ? 'District Officer Query / Revert' : 'Wellness Centre Compliance Response'}
                                </span>
                                <span style={{ fontSize: 10, color: '#94a3b8' }}>
                                  {new Date(ev.created_at).toLocaleString('en-IN', {
                                    day: '2-digit', month: 'short', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 500, color: isRevert ? '#7c2d12' : '#064e3b' }}>
                                {isRevert ? ev.comment : ev.comment?.replace(/^Compliance Submitted:\s*/i, '')}
                              </div>
                              {!isRevert && docPath && (
                                <div style={{ marginTop: 6 }}>
                                  <a 
                                    href={`${API}${docPath}`} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    style={{ color: '#047857', fontWeight: 700, fontSize: 11, textDecoration: 'underline' }}
                                  >
                                    View Attached Supporting Document
                                  </a>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}



                {/* Action Buttons */}
                {(wcSelectedReg.status === 'SUBMITTED' || wcSelectedReg.status === 'RESUBMITTED') && (
                  <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                    <button
                      onClick={() => { setWcActionModal({ reg: wcSelectedReg, action: 'APPROVE' }); setWcComment(''); }}
                      style={{ background: '#166534', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}
                    >✓ Approve Registration</button>
                    <button
                      onClick={() => { setWcActionModal({ reg: wcSelectedReg, action: 'REVERT' }); setWcComment(''); }}
                      style={{ background: '#c2410c', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}
                    >↩ Revert with Comment</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Confirm Modal */}
        {wcActionModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div style={{ background: '#fff', borderRadius: 14, maxWidth: 480, width: '100%', padding: 28 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
                {wcActionModal.action === 'APPROVE' ? '✓ Approve Registration?' : '↩ Revert Registration'}
              </h3>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>
                Centre: <strong>{wcActionModal.reg.centre_name}</strong> | Reg: {wcActionModal.reg.registration_number}
              </p>
              {(wcActionModal.action === 'REVERT' || wcActionModal.action === 'REJECT') && (
                <textarea
                  value={wcComment}
                  onChange={e => setWcComment(e.target.value)}
                  placeholder="Enter the reason / query for the applicant... (required)"
                  style={{ width: '100%', minHeight: 90, border: '1px solid #e2e8f0', borderRadius: 8, padding: 10, fontSize: 13, resize: 'vertical', marginBottom: 16 }}
                />
              )}
              {wcActionModal.action === 'APPROVE' && (
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#166534' }}>
                  Registration will be approved and a 3-year certificate will be issued to the applicant.
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setWcActionModal(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button
                  onClick={handleWcAction}
                  style={{ background: wcActionModal.action === 'APPROVE' ? '#166534' : '#c2410c', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Confirm {wcActionModal.action === 'APPROVE' ? 'Approval' : 'Revert'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome Back, {profile?.full_name || "District Officer"}!
        </h1>
        <p className="text-gray-500 font-semibold mt-1">
          District Officer Dashboard — District: <span className="text-emerald-700 font-bold">{profile?.district || "Uttarakhand"}</span>
        </p>
      </div>

      {/* Yoga TC Incentive Review */}
      <YogaTCIncentiveReview />

      {/* Top 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="text-white" size={24} />
              </div>
              <h3 className="text-sm text-gray-600 font-medium">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Action Required */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="text-yellow-600 mr-3 mt-1" size={20} />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 mb-2">Action Required</h4>
            <ul className="space-y-1">
              {actionRequiredItems.map((item, index) => (
                <li key={index} className="text-sm text-gray-700">• {item}</li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
                Review Applications
              </button>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Verifications */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Pending Verifications</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Type</th>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Application ID</th>
                <th className="text-left px-4 py-2">Submitted Date</th>
                <th className="text-left px-4 py-2">Priority</th>
                <th className="text-left px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingVerifications.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{item.type}</td>
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">{item.id}</td>
                  <td className="px-4 py-2">{item.submittedDate}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.priority === 'High' 
                        ? 'bg-red-100 text-red-700' 
                        : item.priority === 'Medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entity Overview */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Entity Overview</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Entity Type</th>
                <th className="text-left px-4 py-2">Registered</th>
                <th className="text-left px-4 py-2">Active</th>
                <th className="text-left px-4 py-2">Pending</th>
                <th className="text-left px-4 py-2">Activation Rate</th>
              </tr>
            </thead>
            <tbody>
              {entities.map((entity, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{entity.type}</td>
                  <td className="px-4 py-2">{entity.registered}</td>
                  <td className="px-4 py-2">{entity.active}</td>
                  <td className="px-4 py-2">{entity.pending}</td>
                  <td className="px-4 py-2">
                    <span className="font-medium">
                      {Math.round((entity.active / entity.registered) * 100)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incentive Schemes Status */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Incentive Schemes Status</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Scheme Name</th>
                <th className="text-left px-4 py-2">Applications</th>
                <th className="text-left px-4 py-2">Approved</th>
                <th className="text-left px-4 py-2">Amount</th>
                <th className="text-left px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {incentives.map((incentive, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{incentive.scheme}</td>
                  <td className="px-4 py-2">{incentive.applications}</td>
                  <td className="px-4 py-2">{incentive.approved}</td>
                  <td className="px-4 py-2">{incentive.amount}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      incentive.status === 'Approved' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {incentive.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Statistics</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Month</th>
                <th className="text-left px-4 py-2">New Registrations</th>
                <th className="text-left px-4 py-2">Verifications Completed</th>
                <th className="text-left px-4 py-2">Incentives Disbursed</th>
              </tr>
            </thead>
            <tbody>
              {monthlyStats.map((stat, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{stat.month}</td>
                  <td className="px-4 py-2">{stat.registrations}</td>
                  <td className="px-4 py-2">{stat.verifications}</td>
                  <td className="px-4 py-2">{stat.incentives}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center">
          <FileText className="mr-2" size={16} />
          Review Applications
        </button>
        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm flex items-center">
          <CheckCircle className="mr-2" size={16} />
          Approve Verifications
        </button>
        <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm flex items-center">
          <DollarSign className="mr-2" size={16} />
          Process Incentives
        </button>
        <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm flex items-center">
          <TrendingUp className="mr-2" size={16} />
          Generate Reports
        </button>
      </div>
    </div>
  );
};

export default DistrictOfficer;