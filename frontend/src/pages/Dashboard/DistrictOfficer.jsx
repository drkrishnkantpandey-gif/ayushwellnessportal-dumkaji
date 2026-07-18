import API from '../../config/api';
import axiosInstance from '../../config/axiosInstance';
import React, { useState, useEffect } from "react";
import { Users, Building, Calendar, DollarSign, AlertCircle, MapPin, FileText, TrendingUp, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, IndianRupee, Paperclip, X, Download, Award } from "lucide-react";
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