import API from '../../../config/api';
import React, { useState, useEffect } from "react";
import axios from "axios";
import axiosInstance from '../../../config/axiosInstance';
import {
  PlusCircle, FileText, CheckCircle, Clock,
  XCircle, ChevronDown, ChevronUp, Upload, IndianRupee, Mountain, Leaf,
  CheckCircle2, X, Building, MapPin, Download, Calendar, Paperclip
} from "lucide-react";

const REGIONS = [
  {
    value: "PLAIN",
    label: "Plain Region",
    subsidy: 25,
    icon: Leaf,
    description:
      "Area lying under 800m from mean sea level in District Dehradun and Nainital. Entire area under Haridwar and US Nagar",
    bg: "bg-amber-50/70",
    border: "border-amber-400",
    badge: "bg-amber-100 text-amber-700",
    iconColor: "text-amber-600",
  },
  {
    value: "HILLY",
    label: "Hilly Region",
    subsidy: 50,
    icon: Mountain,
    description:
      "Entire Area under District Pithoragarh, Uttarkashi, Chamoli, Champawat, Rudraprayag, Bageshwar, Almora, Pauri Garhwal, Tehri Garhwal. Areas lying above 800m form mean sea level in district Dehradun and Nainital",
    bg: "bg-blue-50/70",
    border: "border-blue-400",
    badge: "bg-blue-100 text-blue-700",
    iconColor: "text-blue-600",
  },
];

const PROPOSED_LOCATIONS = [
  "Kolidhek Lake Area",
  "Jageshar",
  "Mukteshwar",
  "Vyass Valley",
  "Darma Valley",
  "Chaudans Valley",
  "Tehri Lake Area",
  "Other"
];

const SERVICES = [
  "Yoga Training",
  "Yoga Therapy",
  "Yoga Clinical Services",
  "Meditation Centres",
  "Meditation Huts",
  "Stay Facilty for residents",
  "In- House Kitchen"
];

const DOCS = [
  { field: "doc_fire_safety",                 label: "Fire & Safety NOC",                                  required: true  },
  { field: "doc_udyog_reg",                   label: "Udyog / MSME Registration",                          required: true  },
  { field: "doc_gst_reg",                     label: "GST Registration Certificate",                        required: false },
  { field: "doc_pollution_cert",              label: "Pollution Control Board NOC",                        required: false },
  { field: "doc_dpr",                         label: "DPR — Certified by Planner / Architect",             required: true  },
  { field: "doc_ca_project_cost",             label: "CA Certified Project Cost Statement",                 required: true  },
  { field: "doc_ca_eca",                      label: "CA Certified Eligible Capital Assets (ECA)",          required: false },
  { field: "doc_land_document",               label: "Copy of Land Document",                              required: true  },
  { field: "doc_constitution",                label: "Constitution of Firm / Society Deed/ MOA etc",       required: true  },
  { field: "doc_entity_registration",         label: "Registration certificate of Entity",                 required: true  },
  { field: "doc_map_approval",                label: "MAP Approved by Development Authority",              required: true  },
  { field: "doc_non_agri_land",               label: "Non-Agriculture Land Certificate",                   required: true  },
  { field: "doc_land_possession",             label: "Document of Land Possession / Lease of atleast 5 Years", required: true },
  { field: "doc_affidavit",                   label: "Affidavit (No construction started & no other state subsidy claimed)", required: true },
  { field: "doc_others",                      label: "Any Other Supporting Document",                       required: false },
];

const STATUS_META = {
  SUBMITTED:                { label: "Submitted to Directorate", color: "bg-blue-100 text-blue-700",      icon: Clock        },
  FORWARDED_TO_DISTRICT:    { label: "Forwarded to District Officer", color: "bg-yellow-100 text-yellow-700",  icon: Clock        },
  DISTRICT_VERIFIED:        { label: "Verified by District Officer", color: "bg-orange-100 text-orange-700",    icon: CheckCircle  },
  REVERTED_TO_APPLICANT:    { label: "Reverted (Compliance Required)", color: "bg-red-100 text-red-700",        icon: XCircle      },
  RESUBMITTED:              { label: "Resubmitted to Directorate", color: "bg-cyan-100 text-cyan-700",      icon: Clock        },
  FORWARDED_TO_SLRC:        { label: "Forwarded to SLRC", color: "bg-purple-100 text-purple-700",  icon: Clock        },
  SLRC_APPROVED:            { label: "SLRC Approved", color: "bg-indigo-100 text-indigo-700",    icon: CheckCircle  },
  IN_PRINCIPLE_APPROVED:    { label: "In-Principle Approved ✓",   color: "bg-emerald-100 text-emerald-700", icon: CheckCircle  },
};

const fmt = (n) =>
  n != null ? `₹${parseFloat(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—";

// If path is already a full URL (Cloudinary), use it directly.
// Otherwise prefix with the backend API base (local dev).
const docUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API}/${path.replace(/^\//, '')}`;
};

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

// ── Application History & Status Timeline ──────────────────────────────────
function ApplicationTimeline({ events, createdAt }) {
  const allEvents = [...(events || [])];
  const hasSubmitted = allEvents.some(ev => ev.event_type === 'SUBMITTED');
  if (!hasSubmitted && createdAt) {
    allEvents.unshift({
      event_type: 'SUBMITTED',
      actor_role: 'applicant',
      comment: 'Application submitted successfully',
      created_at: createdAt
    });
  }

  if (allEvents.length === 0) return null;
  return (
    <div className="md:col-span-3 border-t pt-4 mt-2">
      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Application History &amp; Status Timeline</h4>
      <div className="relative border-l border-slate-200 ml-2 space-y-4">
        {allEvents.map((ev, index) => {
          const dateStr = new Date(ev.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
          const timeStr = new Date(ev.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
          return (
            <div key={index} className="relative pl-6">
              <span className="absolute -left-1.5 top-1 bg-emerald-600 rounded-full w-3 h-3 border-2 border-white"></span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[11px] text-slate-800">{ev.event_type.replace(/_/g, ' ')}</span>
                <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold capitalize">{ev.actor_role}</span>
                <span className="text-[10px] text-slate-400 ml-auto">{dateStr} · {timeStr}</span>
              </div>
              {ev.comment && (
                <p className="text-[11px] text-slate-600 mt-1 bg-white p-2 rounded border border-slate-100 italic">
                  "{ev.comment}"
                </p>
              )}
              {ev.actor_name && (
                <p className="text-[9px] text-slate-400 mt-0.5 ml-1">
                  By: <strong>{ev.actor_name}</strong>
                </p>
              )}
              {ev.attachment_paths && ev.attachment_paths.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-1.5 ml-1">
                  {ev.attachment_paths.map((path, idx) => (
                    <a
                      key={idx}
                      href={docUrl(path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 transition shadow-xs"
                    >
                      <Paperclip size={9} /> Attached Doc #{idx + 1}
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── GPS Map using OpenStreetMap (no API key required) ─────────────────────────
function GpsMap({ coords }) {
  if (!coords) return null;
  // Accept "lat,lng" or "lat, lng" format
  const parts = coords.split(',').map(s => s.trim());
  if (parts.length < 2) return null;
  const [lat, lng] = parts;
  if (isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) return null;

  // OpenStreetMap embed via iframe — works on any network, no third-party account
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(lng)-0.01},${parseFloat(lat)-0.01},${parseFloat(lng)+0.01},${parseFloat(lat)+0.01}&layer=mapnik&marker=${lat},${lng}`;
  const linkUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;

  return (
    <div className="md:col-span-3 bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-slate-50">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <MapPin size={11} className="text-emerald-600" /> Proposed Site Location on Map
        </p>
        <a href={linkUrl} target="_blank" rel="noopener noreferrer"
           className="text-[10px] text-blue-600 underline font-semibold">Open in Maps ↗</a>
      </div>
      <iframe
        title="Proposed Site GPS Location"
        src={osmUrl}
        width="100%"
        height="220"
        style={{ border: 'none', display: 'block' }}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
      />
      <p className="text-[10px] text-slate-400 px-3 py-1.5 bg-slate-50 border-t">
        📍 GPS: {coords} &nbsp;·&nbsp; Map © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap</a> contributors
      </p>
    </div>
  );
}

// ── PDF generator using browser print ─────────────────────────────────────────
function generatePDF(app, regions, docsArr, fmtFn, docUrlFn) {
  const region = regions.find(r => r.value === app.region);
  const submittedDate = app.created_at
    ? new Date(app.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';

  const docLinks = docsArr
    .filter(d => app[d.field])
    .map(d => `<li style="margin:3px 0"><a href="${docUrlFn(app[d.field])}" style="color:#065f46">${d.label}</a></li>`)
    .join('');

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
      <div class="field"><label>Region</label><span>${region?.label || app.region || '—'}</span></div>
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
      <div class="field"><label>Total Investment</label><span>${fmtFn(app.investment_amount)}</span></div>
      <div class="field"><label>Eligible Capital Assets (ECA)</label><span>${fmtFn(app.eligible_assets_amount)}</span></div>
      <div class="field"><label>Claimed Subsidy (Tentative)</label><span>${fmtFn(app.subsidy_amount)}</span></div>
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

  ${docLinks ? `<div class="section docs">
    <div class="section-title">Submitted Documents</div>
    <ul>${docLinks}</ul>
  </div>` : ''}

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

export default function IncentiveApplication() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [expandedId, setExpandedId]     = useState(null);
  const [submitting, setSubmitting]     = useState(false);
  const [successMsg, setSuccessMsg]     = useState("");
  const [errorMsg, setErrorMsg]         = useState("");

  const [form, setForm] = useState({
    region: "",
    projectType: "Greenfield", // Greenfield or Expansion
    proposedLocation: "",
    otherLocationName: "",
    gpsCoordinates: "",
    proposedCentreName: "",
    investmentAmount: "",
    eligibleAssetsAmount: "",
    district: "",
    address: "",

    // Auto-filled from registration profile
    entityName: "",
    applicantName: "",
    designation: "",
    entityType: "",
    mobileNumber: "",
    emailId: "",

    // Questionnaire details
    siteTotalArea: "",
    proposedConstructedArea: "",
    servicesOffered: [],
    tentativeEmployees: "",
    ycbCertifiedInstructors: "",
    clinicalServicesProvided: false,
    certifiedAyushDoctors: "",
    proposedSitePhoto: "",
    declarationNoConstruction: false,
    declarationNoSubsidy: false,
  });

  // Track status of uploads: { fieldName: { name, progress, uploading, path } }
  const [uploadStatus, setUploadStatus] = useState({});

  // Resubmission flow states
  const [resubmitApp, setResubmitApp] = useState(null);
  const [complianceNote, setComplianceNote] = useState("");
  const [resubmitUploads, setResubmitUploads] = useState({}); // distinct file status for resubmissions

  const fetchProfileAndApplications = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      // 1. Fetch submitted applications
      const appsRes = await axiosInstance.get(`${API}/api/training-centre/incentives`);
      setApplications(appsRes.data.data || []);

      // 2. Fetch profile details for auto-fill
      const profileRes = await axiosInstance.get(`${API}/api/training-centre/profile`);
      const profile = profileRes.data?.data || {};

      setForm((prev) => ({
        ...prev,
        entityName: profile.centre_name || "",
        applicantName: profile.applicant_name || "",
        designation: profile.designation || "",
        entityType: profile.entity_type || profile.institution_type || "",
        mobileNumber: profile.phone || "",
        emailId: profile.email || "",
        proposedCentreName: profile.centre_name || "",
        district: profile.district || "",
        address: profile.address || "",
        gpsCoordinates: profile.gps_coordinates || "",
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndApplications();
  }, []);

  const selectedRegion = REGIONS.find((r) => r.value === form.region);
  const eligibleEca = parseFloat(form.eligibleAssetsAmount) || 0;

  // Auto calculate subsidy capped at 20L for Hill and 10L for Plains
  let calculatedSubsidy = 0;
  if (form.region === "HILLY") {
    calculatedSubsidy = Math.min(eligibleEca * 0.50, 2000000);
  } else if (form.region === "PLAIN") {
    calculatedSubsidy = Math.min(eligibleEca * 0.25, 1000000);
  }

  // Instant upload handler with progress bar
  const handleFileSelect = async (field, fileList) => {
    const file = fileList[0];
    if (!file) return;

    setUploadStatus(prev => ({
      ...prev,
      [field]: {
        name: file.name,
        uploading: true,
        progress: 0,
        path: null
      }
    }));

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await axios.post(`${API}/api/register/upload-temp-file`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadStatus(prev => ({
              ...prev,
              [field]: {
                ...prev[field],
                progress: percentCompleted
              }
            }));
          }
        }
      });

      setUploadStatus(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          uploading: false,
          progress: 100,
          path: res.data.path
        }
      }));
    } catch (err) {
      console.error("Instant upload failed:", err);
      alert(`Failed to upload ${file.name}`);
      setUploadStatus(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const removeUploadedFile = (field) => {
    setUploadStatus(prev => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const [complianceFiles, setComplianceFiles] = useState([]);

  const handleComplianceFileSelect = async (fileList) => {
    const file = fileList[0];
    if (!file) return;

    const fileId = Math.random().toString(36).substring(7);
    setComplianceFiles(prev => [...prev, { id: fileId, name: file.name, uploading: true, progress: 0, path: null }]);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await axios.post(`${API}/api/register/upload-temp-file`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setComplianceFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: percentCompleted } : f));
          }
        }
      });

      setComplianceFiles(prev => prev.map(f => f.id === fileId ? { ...f, uploading: false, progress: 100, path: res.data.path } : f));
    } catch (err) {
      console.error(err);
      alert(`Failed to upload ${file.name}`);
      setComplianceFiles(prev => prev.filter(f => f.id !== fileId));
    }
  };

  const removeComplianceFile = (id) => {
    setComplianceFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleResubmitSubmit = async (e) => {
    e.preventDefault();
    if (!complianceNote.trim()) {
      alert("Compliance note is required.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        complianceNote,
        attachments: complianceFiles.filter(f => f.path).map(f => f.path)
      };

      await axiosInstance.put(`${API}/api/training-centre/incentives/${resubmitApp.id}/resubmit`, payload);
      setSuccessMsg("Application resubmitted successfully with compliance details!");
      setResubmitApp(null);
      setComplianceNote("");
      setComplianceFiles([]);
      fetchProfileAndApplications();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Failed to resubmit application.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleServiceCheckboxChange = (service, checked) => {
    setForm(prev => {
      const services = [...(prev.servicesOffered || [])];
      if (checked) {
        if (!services.includes(service)) services.push(service);
      } else {
        const idx = services.indexOf(service);
        if (idx > -1) services.splice(idx, 1);
      }
      return { ...prev, servicesOffered: services };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (applications.length > 0) {
      return alert("You can submit only one application at most under Incentive Applications.");
    }
    if (!form.region) {
      return alert("Please select Plain or Hilly region.");
    }
    if (parseFloat(form.eligibleAssetsAmount) > parseFloat(form.investmentAmount)) {
      return alert("Eligible Capital Assets Amount for Subsidy must not be more than Total Investment Amount.");
    }

    const missingDocs = DOCS.filter(d => d.required && (!uploadStatus[d.field] || !uploadStatus[d.field].path));
    if (missingDocs.length > 0) {
      return alert(`Please upload all mandatory documents: ${missingDocs.map(d => d.label).join(", ")}`);
    }

    if (!uploadStatus.proposedSitePhoto || !uploadStatus.proposedSitePhoto.path) {
      return alert("Please upload a photograph of the proposed site.");
    }

    if (!form.declarationNoConstruction || !form.declarationNoSubsidy) {
      return alert("Please check and confirm all declaration statements to submit the application.");
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const payload = {
        region: form.region,
        projectType: form.projectType,
        proposedLocation: form.proposedLocation,
        otherLocationName: form.proposedLocation === "Other" ? form.otherLocationName : "",
        gpsCoordinates: form.gpsCoordinates,
        proposedCentreName: form.proposedCentreName,
        investmentAmount: form.investmentAmount,
        eligibleAssetsAmount: form.eligibleAssetsAmount,
        district: form.district,
        address: form.address,

        applicantName: form.applicantName,
        designation: form.designation,
        entityType: form.entityType,
        mobileNumber: form.mobileNumber,
        emailId: form.emailId,

        siteTotalArea: form.siteTotalArea,
        proposedConstructedArea: form.proposedConstructedArea,
        servicesOffered: form.servicesOffered,
        tentativeEmployees: form.tentativeEmployees,
        ycbCertifiedInstructors: form.ycbCertifiedInstructors,
        clinicalServicesProvided: form.clinicalServicesProvided,
        certifiedAyushDoctors: form.clinicalServicesProvided ? form.certifiedAyushDoctors : 0,
        proposedSitePhoto: uploadStatus.proposedSitePhoto.path
      };

      // Append upload paths to payload
      DOCS.forEach(doc => {
        if (uploadStatus[doc.field] && uploadStatus[doc.field].path) {
          payload[doc.field] = uploadStatus[doc.field].path;
        }
      });

      await axiosInstance.post(`${API}/api/training-centre/incentives`, payload);

      setSuccessMsg("Incentive Application submitted successfully! UPN will be generated dynamically.");
      setShowForm(false);
      // reset form
      setForm((prev) => ({
        ...prev,
        region: "",
        projectType: "Greenfield",
        proposedLocation: "",
        otherLocationName: "",
        investmentAmount: "",
        eligibleAssetsAmount: "",
        siteTotalArea: "",
        proposedConstructedArea: "",
        servicesOffered: [],
        tentativeEmployees: "",
        ycbCertifiedInstructors: "",
        clinicalServicesProvided: false,
        certifiedAyushDoctors: "",
        declarationNoConstruction: false,
        declarationNoSubsidy: false,
      }));
      setUploadStatus({});
      fetchProfileAndApplications();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Incentive Applications</h1>
          <p className="text-sm text-gray-500 mt-1">
            Apply for Greenfield or Expansion scheme subsidies for your Yoga Centre
          </p>
        </div>
        {applications.length === 0 && (
          <button
            onClick={() => { setShowForm(!showForm); setSuccessMsg(""); setErrorMsg(""); }}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition font-semibold text-sm shadow-sm"
          >
            <PlusCircle size={16} /> New Application
          </button>
        )}
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <XCircle size={18} /> {errorMsg}
        </div>
      )}

      {/* ── Application Form ─────────────────────────────────────────────── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 space-y-6">
          <div className="border-b pb-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-800">New Incentive Scheme Application</h2>
              <p className="text-xs text-gray-500 mt-0.5">Please provide proposed site plans and financial details.</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-semibold">Capped Subsidy Claim</span>
          </div>

          {/* 1. Project Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Project Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              {["Greenfield", "Expansion"].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setForm(p => ({ ...p, projectType: t }))}
                  className={`py-3.5 px-4 rounded-xl border text-center font-bold text-sm transition-all ${
                    form.projectType === t
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {t} Project
                </button>
              ))}
            </div>
          </div>

          {/* 2. Region Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Proposed Site Region <span className="text-red-500">*</span>
            </label>
            <div className="grid md:grid-cols-2 gap-4">
              {REGIONS.map((r) => {
                const Icon = r.icon;
                const selected = form.region === r.value;
                return (
                  <button
                    type="button"
                    key={r.value}
                    onClick={() => setForm((p) => ({ ...p, region: r.value }))}
                    className={`text-left p-5 rounded-xl border-2 transition-all flex flex-col justify-between ${
                      selected ? `${r.border} ${r.bg}` : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3 w-full">
                      <div className="flex items-center gap-2">
                        <Icon size={20} className={selected ? r.iconColor : "text-gray-400"} />
                        <span className="font-bold text-gray-800">{r.label}</span>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${r.badge}`}>
                        {r.subsidy}% Subsidy Rate
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium bg-white/60 p-2.5 rounded-lg border border-slate-100">{r.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Proposed Location */}
          {form.region && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Proposed Location <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.proposedLocation}
                  onChange={(e) => setForm(p => ({ ...p, proposedLocation: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  required
                >
                  <option value="">-- Select Site Location --</option>
                  {PROPOSED_LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {form.proposedLocation === "Other" && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Specify Location Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.otherLocationName}
                    onChange={(e) => setForm(p => ({ ...p, otherLocationName: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter location name"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  GPS Coordinates (Lat, Long) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.gpsCoordinates}
                  onChange={(e) => setForm(p => ({ ...p, gpsCoordinates: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. 30.3165, 78.0322"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  District <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.district}
                  onChange={(e) => setForm(p => ({ ...p, district: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Proposed Site District"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Complete Address of Proposed Location <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 h-20"
                  placeholder="Enter complete plot address details"
                  required
                />
              </div>
            </div>
          )}

          {/* 4. Autofilled Applicant Profile Info */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
              <Building size={16} className="text-gray-500" />
              Auto-fetched Registration Credentials
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border text-xs">
              <div>
                <span className="text-gray-400 block font-semibold">Entity Name</span>
                <span className="text-gray-700 font-bold">{form.entityName || "—"}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">Applicant Name</span>
                <span className="text-gray-700 font-bold">{form.applicantName || "—"}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">Designation</span>
                <span className="text-gray-700 font-bold">{form.designation || "—"}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">Entity Type</span>
                <span className="text-gray-700 font-bold">{form.entityType || "—"}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">Registered Email</span>
                <span className="text-gray-700 font-bold">{form.emailId || "—"}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">Registered Phone</span>
                <span className="text-gray-700 font-bold">{form.mobileNumber || "—"}</span>
              </div>
            </div>
          </div>

          {/* 5. Center and Financial Assets Details */}
          <div className="grid md:grid-cols-3 gap-4 border-t pt-5">
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Proposed Name of Centre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.proposedCentreName}
                onChange={(e) => setForm((p) => ({ ...p, proposedCentreName: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                placeholder="Proposed name of the center"
                required
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Total Investment Amount (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <IndianRupee size={14} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.investmentAmount}
                  onChange={(e) => setForm((p) => ({ ...p, investmentAmount: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Eligible Capital Assets (ECA) Amount for Subsidy (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <IndianRupee size={14} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.eligibleAssetsAmount}
                  onChange={(e) => setForm((p) => ({ ...p, eligibleAssetsAmount: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  placeholder="ECA amount for subsidy claim"
                  required
                />
              </div>
              {parseFloat(form.eligibleAssetsAmount) > parseFloat(form.investmentAmount) && (
                <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1">
                  ⚠️ Eligible Capital Assets amount cannot exceed Total Investment amount.
                </p>
              )}
            </div>
          </div>

          {/* Auto-calculated subsidy block */}
          {form.region && eligibleEca > 0 && (
            <div className={`border rounded-xl p-4 flex items-center gap-4 ${selectedRegion?.bg} border-slate-200/80`}>
              <div className={`rounded-full p-2 bg-white border border-slate-200`}>
                <IndianRupee size={20} className={selectedRegion?.iconColor} />
              </div>
              <div className="flex-1">
                <p className={`text-xs font-semibold uppercase tracking-wide text-slate-500`}>
                  Auto-Calculated Scheme Subsidy Capping Details
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-gray-800">
                    {fmt(calculatedSubsidy)}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({form.region === "HILLY" ? "50% capped at 20 Lakhs max" : "25% capped at 10 Lakhs max"})
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Claim generated on Eligible Capital Assets amount of {fmt(eligibleEca)}
                </p>
              </div>
            </div>
          )}

          {/* Proposed Site Questionnaire Details */}
          <div className="border-t pt-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              📋 Proposed Site Questionnaire & Project Details
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Proposed Site Total Area (sq feet) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.siteTotalArea}
                  onChange={(e) => setForm(p => ({ ...p, siteTotalArea: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  placeholder="e.g. 5000"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Proposed Constructed Area (sq feet) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.proposedConstructedArea}
                  onChange={(e) => setForm(p => ({ ...p, proposedConstructedArea: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  placeholder="e.g. 2500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Tentative Number of Employees <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.tentativeEmployees}
                  onChange={(e) => setForm(p => ({ ...p, tentativeEmployees: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  placeholder="e.g. 10"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  No. of YCB Certified Yoga Instructors <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.ycbCertifiedInstructors}
                  onChange={(e) => setForm(p => ({ ...p, ycbCertifiedInstructors: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  placeholder="e.g. 2"
                  required
                />
              </div>
            </div>

            {/* Checkboxes: Services Offered */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                Services Offered <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                {SERVICES.map((srv) => {
                  const checked = form.servicesOffered.includes(srv);
                  return (
                    <label key={srv} className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => handleServiceCheckboxChange(srv, e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 w-4 h-4"
                      />
                      {srv}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Clinical Services Provided Toggle */}
            <div className="grid md:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Will Clinical Services be provided? <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-1.5 text-sm font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="clinical_services"
                      checked={form.clinicalServicesProvided === true}
                      onChange={() => setForm(p => ({ ...p, clinicalServicesProvided: true }))}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    Yes
                  </label>
                  <label className="flex items-center gap-1.5 text-sm font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="clinical_services"
                      checked={form.clinicalServicesProvided === false}
                      onChange={() => setForm(p => ({ ...p, clinicalServicesProvided: false, certifiedAyushDoctors: "" }))}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    No
                  </label>
                </div>
              </div>

              {form.clinicalServicesProvided && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    No. of Certified AYUSH Doctors to be appointed <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.certifiedAyushDoctors}
                    onChange={(e) => setForm(p => ({ ...p, certifiedAyushDoctors: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    placeholder="e.g. 2"
                    required
                  />
                </div>
              )}
            </div>

            {/* Photograph of Proposed Site Upload */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Photograph of the proposed Site (JPG / PNG) <span className="text-red-500">*</span>
              </label>
              {(() => {
                const fileVal = uploadStatus.proposedSitePhoto;
                return !fileVal ? (
                  <label className="flex items-center gap-2.5 cursor-pointer border border-dashed border-gray-300 rounded-xl px-4 py-3.5 hover:border-emerald-500 hover:bg-slate-50 transition text-xs text-gray-500 bg-white shadow-sm w-full md:w-1/2">
                    <Upload size={14} className="text-gray-400" />
                    <span className="font-semibold text-gray-600">Select proposed site photo</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => handleFileSelect("proposedSitePhoto", e.target.files)}
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-xl w-full md:w-1/2">
                    <div className="flex items-center space-x-3 min-w-0">
                      {fileVal.uploading ? (
                        <div className="relative flex items-center justify-center h-8 w-8 shrink-0">
                          {(() => {
                            const radius = 10;
                            const circumference = 2 * Math.PI * radius;
                            const strokeDashoffset = circumference - ((fileVal.progress || 0) / 100) * circumference;
                            return (
                              <>
                                <svg className="w-8 h-8 transform -rotate-90">
                                  <circle
                                    cx="16"
                                    cy="16"
                                    r={radius}
                                    className="text-gray-200"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                    fill="transparent"
                                  />
                                  <circle
                                    cx="16"
                                    cy="16"
                                    r={radius}
                                    className="text-emerald-600 transition-all duration-300"
                                    strokeWidth="2"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                  />
                                </svg>
                                <span className="absolute text-[8px] font-bold text-emerald-800">{fileVal.progress || 0}%</span>
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <FileText className="h-5 w-5 text-emerald-600 shrink-0" />
                      )}
                      <div className="truncate">
                        <p className="text-xs font-bold text-gray-800 truncate">{fileVal.name}</p>
                        {fileVal.uploading ? (
                          <p className="text-[10px] text-emerald-700 font-medium">Uploading...</p>
                        ) : (
                          <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                            <CheckCircle2 size={10} /> Uploaded successfully
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeUploadedFile("proposedSitePhoto")}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                    >
                      <X size={15} />
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Declaration Statements Checkboxes */}
          <div className="border-t pt-5 space-y-3">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              ✍️ Applicant Declarations
            </h3>
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border">
              <label className="flex items-start gap-2.5 text-xs font-semibold text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.declarationNoConstruction}
                  onChange={(e) => setForm(p => ({ ...p, declarationNoConstruction: e.target.checked }))}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 w-4 h-4 mt-0.5"
                  required
                />
                <span>I hereby declare that I have not started any construction work yet for the proposed Yoga & Meditation Centre. <span className="text-red-500">*</span></span>
              </label>

              <label className="flex items-start gap-2.5 text-xs font-semibold text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.declarationNoSubsidy}
                  onChange={(e) => setForm(p => ({ ...p, declarationNoSubsidy: e.target.checked }))}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 w-4 h-4 mt-0.5"
                  required
                />
                <span>I hereby declare that I have not claimed any subsidy for this project in any other scheme of the state government. <span className="text-red-500">*</span></span>
              </label>
            </div>
          </div>

          {/* 6. Documents Section */}
          <div className="border-t pt-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Mandatory Scheme Documents</h3>
              <p className="text-xs text-gray-400 mt-0.5">Please upload certified copies. Files will upload instantly on selection.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {DOCS.map((doc) => {
                const fileVal = uploadStatus[doc.field];
                return (
                  <div key={doc.field} className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-600">
                      {doc.label} {doc.required && <span className="text-red-500">*</span>}
                    </label>

                    {!fileVal ? (
                      <label className="flex items-center gap-2.5 cursor-pointer border border-dashed border-gray-300 rounded-xl px-4 py-3 hover:border-emerald-500 hover:bg-slate-50 transition text-xs text-gray-500 bg-white shadow-sm">
                        <Upload size={14} className="text-gray-400" />
                        <span className="font-semibold text-gray-600">Click to upload document</span>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileSelect(doc.field, e.target.files)}
                        />
                      </label>
                    ) : (
                      <div className="flex items-center justify-between p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                        <div className="flex items-center space-x-3 min-w-0">
                          {fileVal.uploading ? (
                            <div className="relative flex items-center justify-center h-8 w-8 shrink-0">
                              {(() => {
                                const radius = 10;
                                const circumference = 2 * Math.PI * radius;
                                const strokeDashoffset = circumference - ((fileVal.progress || 0) / 100) * circumference;
                                return (
                                  <>
                                    <svg className="w-8 h-8 transform -rotate-90">
                                      <circle
                                        cx="16"
                                        cy="16"
                                        r={radius}
                                        className="text-gray-200"
                                        strokeWidth="2"
                                        stroke="currentColor"
                                        fill="transparent"
                                      />
                                      <circle
                                        cx="16"
                                        cy="16"
                                        r={radius}
                                        className="text-emerald-600 transition-all duration-300"
                                        strokeWidth="2"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="transparent"
                                      />
                                    </svg>
                                    <span className="absolute text-[8px] font-bold text-emerald-800">{fileVal.progress || 0}%</span>
                                  </>
                                );
                              })()}
                            </div>
                          ) : (
                            <FileText className="h-5 w-5 text-emerald-600 shrink-0" />
                          )}
                          <div className="truncate">
                            <p className="text-xs font-bold text-gray-800 truncate">{fileVal.name}</p>
                            {fileVal.uploading ? (
                              <p className="text-[10px] text-emerald-700 font-medium">Uploading...</p>
                            ) : (
                              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                                <CheckCircle2 size={10} /> Uploaded successfully
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeUploadedFile(doc.field)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60 flex items-center gap-2 font-bold shadow-sm"
            >
              {submitting ? "Submitting Application..." : <><FileText size={15} /> Submit Application</>}
            </button>
          </div>
        </form>
      )}

      {/* ── My Applications ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="p-5 border-b">
          <h2 className="font-bold text-gray-800">Submitted Applications Overview</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : applications.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <FileText size={40} className="mx-auto mb-3 opacity-40 text-emerald-600" />
            <p className="text-sm font-semibold">No applications found.</p>
            <p className="text-xs text-gray-400 mt-0.5">Click <strong>New Application</strong> to apply under the incentive scheme.</p>
          </div>
        ) : (
          <div className="divide-y">
            {applications.map((app) => {
              const meta   = STATUS_META[app.status] || STATUS_META.SUBMITTED;
              const Icon   = meta.icon;
              const open   = expandedId === app.id;
              const region = REGIONS.find((r) => r.value === app.region);
              return (
                <div key={app.id} className="p-4 hover:bg-slate-50/50 transition">
                  <button
                    className="w-full flex items-center justify-between text-left"
                    onClick={() => setExpandedId(open ? null : app.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-100 rounded-full p-2.5">
                        <FileText size={18} className="text-emerald-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-800 text-sm">{app.centre_name}</p>
                          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">{app.project_type || "Greenfield"}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          UPN: <strong className="text-slate-700">{app.upn || "—"}</strong> · {region?.label || app.region} · {app.district}
                        </p>
                        {app.created_at && (
                          <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                            <Calendar size={10} /> Submitted: {new Date(app.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${meta.color}`}>
                        <Icon size={12} /> {meta.label}
                      </span>
                      {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {open && (
                    <div className="mt-5 ml-12 grid md:grid-cols-3 gap-4 text-xs bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
                      
                      {/* Download PDF button */}
                      <div className="md:col-span-3 flex justify-end">
                        <button
                          onClick={() => generatePDF(app, REGIONS, DOCS, fmt, docUrl)}
                          className="flex items-center gap-2 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-lg shadow-sm transition"
                        >
                          <Download size={13} /> Download PDF
                        </button>
                      </div>

                      <div className={`rounded-lg p-3 bg-white border border-slate-200/80`}>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Region & Scheme</p>
                        <p className="font-bold text-gray-800 text-sm mt-0.5">{region?.label || app.region}</p>
                        <p className="text-xs text-slate-500 mt-1">{app.subsidy_percentage}% subsidy rate</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-slate-200/80">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Proposed Site Location</p>
                        <p className="font-bold text-gray-800 text-sm mt-0.5">{app.proposed_location || "—"}</p>
                        {app.gps_coordinates && <p className="text-xs text-slate-500 mt-1">GPS: {app.gps_coordinates}</p>}
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Claimed Subsidy (Tentative)</p>
                        <p className="font-bold text-emerald-700 text-sm mt-0.5">{fmt(app.subsidy_amount)}</p>
                        <p className="text-xs text-emerald-500 mt-1">Capped claim limit applied</p>
                      </div>

                      {/* Submission date */}
                      {app.created_at && (
                        <div className="bg-white rounded-lg p-3 border border-slate-200/80">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                            <Calendar size={10} /> Date of Submission
                          </p>
                          <p className="font-bold text-gray-800 text-sm mt-0.5">
                            {new Date(app.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(app.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      )}

                      {/* GPS Map */}
                      <GpsMap coords={app.gps_coordinates} />

                      {/* Financial info */}
                      <div className="md:col-span-3 grid grid-cols-2 gap-4 bg-white p-3 rounded-lg border">
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">Total Investment</span>
                          <span className="font-bold text-gray-700">{fmt(app.investment_amount)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">Eligible Capital Assets (ECA)</span>
                          <span className="font-bold text-gray-700">{fmt(app.eligible_assets_amount)}</span>
                        </div>
                      </div>

                      {/* Proposed Site & Location Details */}
                      <div className="md:col-span-3 bg-white p-3 rounded-lg border space-y-3">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b pb-1">Proposed Project Site Info</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <span className="text-[10px] text-gray-400 font-bold block uppercase">Proposed Location</span>
                            <span className="font-bold text-gray-700">{app.proposed_location || "—"}{app.other_location_name ? ` (${app.other_location_name})` : ""}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 font-bold block uppercase">District</span>
                            <span className="font-bold text-gray-700">{app.district || "—"}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-[10px] text-gray-400 font-bold block uppercase">Complete Site Address</span>
                            <span className="font-bold text-gray-700">{app.address || "—"}</span>
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
                        </div>
                      </div>

                      <div className="md:col-span-3 bg-white p-3 rounded-lg border grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">Services Offered</span>
                          <span className="font-semibold text-gray-700">{Array.isArray(app.services_offered) ? app.services_offered.join(", ") : "—"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">Clinical Services Provided?</span>
                          <span className="font-semibold text-gray-700">
                            {app.clinical_services_provided ? `Yes (${app.certified_ayush_doctors || 0} AYUSH Doctors)` : "No"}
                          </span>
                        </div>
                      </div>

                      {/* Documents List */}
                      <div className="md:col-span-3 space-y-2 border-t pt-3">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider">Submitted Scheme Documents</span>
                        <div className="grid md:grid-cols-2 gap-2 text-[11px]">
                          {app.proposed_site_photo && (
                            <a
                              href={docUrl(app.proposed_site_photo)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 transition truncate text-slate-600 font-bold"
                            >
                              <FileText size={13} className="text-emerald-500 shrink-0" />
                              <span className="truncate">📷 Proposed Site Photograph</span>
                            </a>
                          )}
                          {DOCS.map(doc => {
                            const val = app[doc.field];
                            if (!val) return null;
                            return (
                              <a
                                key={doc.field}
                                href={docUrl(val)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 transition truncate text-slate-600 font-semibold"
                              >
                                <FileText size={13} className="text-slate-400 shrink-0" />
                                <span className="truncate">{doc.label}</span>
                              </a>
                            );
                          })}
                        </div>
                      </div>

                      {app.district_remarks && (
                        <div className="md:col-span-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-[10px] font-semibold text-yellow-700 uppercase tracking-wide">District Officer Remarks</p>
                          <p className="text-xs text-yellow-800 mt-1">{app.district_remarks}</p>
                        </div>
                      )}
                      {app.directorate_remarks && (
                        <div className="md:col-span-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <p className="text-[10px] font-semibold text-purple-700 uppercase tracking-wide">Directorate Remarks</p>
                          <p className="text-xs text-purple-800 mt-1">{app.directorate_remarks}</p>
                        </div>
                      )}

                      {/* Revert Compliance Section */}
                      {app.status === 'REVERTED_TO_APPLICANT' && (
                        <div className="md:col-span-3 bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
                          <div>
                            <p className="font-bold text-red-800 text-xs uppercase tracking-wide">⚠️ Additional Documents / Compliance Required</p>
                            <p className="text-xs text-red-700 mt-1">Remarks: "{app.revert_comment || 'No remarks provided'}"</p>
                          </div>
                          <button
                            onClick={() => { setResubmitApp(app); setComplianceNote(""); }}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition shrink-0 shadow-sm"
                          >
                            Resubmit Compliance
                          </button>
                        </div>
                      )}

                      {/* Additional compliance & report attachments */}
                      <AdditionalAttachments events={app.events} />

                      {/* Application History & Timeline */}
                      <ApplicationTimeline events={app.events} createdAt={app.created_at} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* ── Resubmit Compliance Modal ─────────────────────────────────────── */}
      {resubmitApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-xl border overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-800 text-base">Resubmit Incentive Application</h3>
                <p className="text-xs text-gray-500 mt-0.5">UPN: {resubmitApp.upn}</p>
              </div>
              <button
                type="button"
                onClick={() => { setResubmitApp(null); setComplianceNote(""); setComplianceFiles([]); }}
                className="text-gray-400 hover:text-gray-600 hover:bg-slate-100 p-1.5 rounded-full transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResubmitSubmit} className="p-6 space-y-5">
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-xs text-red-800">
                <strong>Revert Comments from Directorate:</strong>
                <p className="mt-1 italic">"{resubmitApp.revert_comment}"</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Compliance / Correction Explanation Note <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows="3"
                  value={complianceNote}
                  onChange={(e) => setComplianceNote(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  placeholder="Explain the updates or corrections made in response to the comments..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Upload Compliance Documents (Attachments)
                </label>
                
                {/* Uploaded files list */}
                {complianceFiles.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {complianceFiles.map((file) => (
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
                          onClick={() => removeComplianceFile(file.id)}
                          className="text-red-500 hover:text-red-700 font-bold text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload trigger */}
                <label className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer flex flex-col items-center justify-center transition bg-slate-50/50">
                  <span className="text-xs font-bold text-emerald-700">+ Select Document to Upload</span>
                  <span className="text-[10px] text-gray-400 mt-1">Accepts PDF, JPG, PNG up to 10MB</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleComplianceFileSelect(e.target.files)}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => { setResubmitApp(null); setComplianceNote(""); setComplianceFiles([]); }}
                  className="px-4 py-2 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || complianceFiles.some(f => f.uploading)}
                  className="px-5 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm"
                >
                  {submitting ? "Resubmitting..." : "Submit Resubmission"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
