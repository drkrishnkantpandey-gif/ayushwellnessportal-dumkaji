import API from '../../config/api';
import axiosInstance from '../../config/axiosInstance';
import React, { useState, useEffect } from "react";
import { Building, Users, DollarSign, AlertCircle, MapPin, FileText, TrendingUp, CheckCircle, Award, BarChart3, XCircle, ChevronDown, ChevronUp, Clock, BookOpen, IndianRupee, Paperclip, X, Calendar, Download } from "lucide-react";
import { toast } from "react-toastify";
import { printResearchApplication } from "./ResearchGrant";


const fmt = (n) =>
  n != null ? `₹${parseFloat(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—";

// If path is already a full URL (Cloudinary), use it directly.
// Otherwise prefix with the backend API base (local dev).
const docUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
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
  // Accept "lat,lng" or "lat, lng" format
  const parts = coords.split(',').map(s => s.trim());
  if (parts.length < 2) return null;
  const [lat, lng] = parts;
  if (isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) return null;

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
      <div class="field"><label>Proposed Location</label><span>${app.proposed_location || '—'}</span></div>
      <div class="field"><label>GPS Coordinates</label><span>${app.gps_coordinates || '—'}</span></div>
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
    <div class="section-title">Site &amp; Operational Details</div>
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

const REGIONS = [
  { value: "PLAIN", label: "Plain Region" },
  { value: "HILLY", label: "Hilly Region" }
];

const DOCS = [
  { field: "doc_fire_safety",                 label: "Fire & Safety NOC" },
  { field: "doc_udyog_reg",                   label: "Udyog / MSME Registration" },
  { field: "doc_gst_reg",                     label: "GST Registration Certificate" },
  { field: "doc_pollution_cert",              label: "Pollution Control Board NOC" },
  { field: "doc_dpr",                         label: "DPR — Certified by Planner / Architect" },
  { field: "doc_ca_project_cost",             label: "CA Certified Project Cost Statement" },
  { field: "doc_ca_eca",                      label: "CA Certified Eligible Capital Assets (ECA)" },
  { field: "doc_land_document",               label: "Copy of Land Document" },
  { field: "doc_constitution",                label: "Constitution of Firm / Society Deed/ MOA etc" },
  { field: "doc_entity_registration",         label: "Registration certificate of Entity" },
  { field: "doc_map_approval",                label: "MAP Approved by Development Authority" },
  { field: "doc_non_agri_land",               label: "Non-Agriculture Land Certificate" },
  { field: "doc_land_possession",             label: "Document of Land Possession / Lease of atleast 5 Years" },
  { field: "doc_affidavit",                   label: "Affidavit (No construction started & no other subsidy claimed)" },
  { field: "doc_others",                      label: "Any Other Supporting Document" },
];


// ── Additional Attachments (Resubmissions & Verification Reports) ─────────────
function AdditionalAttachments({ events }) {
  const eventsWithAttachments = (events || []).filter(
    (ev) => ev.attachment_paths && ev.attachment_paths.length > 0
  );

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mt-3">
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

const WINDOW_LABELS = { APR_MAY: "April–May", OCT_NOV: "October–November" };
const REVIEW_MONTHS = { APR_MAY: "June", OCT_NOV: "December" };
function getCurrentReviewWindow() {
  const m = new Date().getMonth() + 1;
  if (m === 6)  return "APR_MAY";
  if (m === 12) return "OCT_NOV";
  return null;
}

function WorkflowLogs({ logsList }) {
  if (!logsList || logsList.length === 0) {
    return <p className="text-xs text-gray-400 italic">No movement logs recorded yet.</p>;
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
      <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wide flex items-center gap-1.5 border-b pb-1">
        <Activity size={14} className="text-slate-500" /> Application Movement & Audit Logs
      </h4>
      <div className="relative pl-6 border-l-2 border-slate-200 space-y-4">
        {logsList.map((log) => (
          <div key={log.id} className="relative">
            {/* Dot */}
            <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border-2 border-white bg-slate-400" />
            
            <div className="text-xs space-y-1">
              <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold">
                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold uppercase">
                  {log.action_by}
                </span>
                <span>{new Date(log.created_at).toLocaleString("en-IN")}</span>
              </div>
              <p className="font-medium text-gray-700">
                Transitioned {log.from_status ? `from ${log.from_status.replace(/_/g, " ")}` : ""} to <span className="text-emerald-700 font-semibold">{log.to_status.replace(/_/g, " ")}</span>
              </p>
              {log.comments && (
                <p className="text-gray-600 italic bg-white p-2 rounded border leading-relaxed">
                  &ldquo;{log.comments}&rdquo;
                </p>
              )}
              {log.attachment_path && (
                <div className="mt-1">
                  <a
                    href={docUrl(log.attachment_path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <Paperclip size={10} /> View Log Attachment
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResearchGrantReview() {
  const [apps, setApps]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [modal, setModal]     = useState(null);
  const [remarks, setRemarks] = useState("");
  const [approvedAmt, setApprovedAmt] = useState("");
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState("");
  const [logs, setLogs] = useState({});
  const [disbursals, setDisbursals] = useState({});
  const [disbRemarks, setDisbRemarks] = useState({});
  const [disbSaving, setDisbSaving] = useState({});

  const fetchLogs = async (id) => {
    try {
      const res = await axiosInstance.get(`${API}/api/research-grants/${id}/logs`);
      setLogs(prev => ({ ...prev, [id]: res.data.data }));
    } catch (err) {
      console.error("Error fetching logs:", err);
    }
  };

  const fetchDisbursals = async (id) => {
    try {
      const res = await axiosInstance.get(`${API}/api/research-grants/${id}/disbursals`);
      setDisbursals(prev => ({ ...prev, [id]: res.data.data }));
    } catch (err) {
      console.error("Error fetching disbursals:", err);
    }
  };

  const handleReviewDisbursal = async (appId, disbId, status) => {
    const rem = disbRemarks[disbId] || "";
    if (status === 'REVERTED' && !rem.trim()) {
      alert("Please specify reversion comments.");
      return;
    }
    setDisbSaving(p => ({ ...p, [disbId]: true }));
    try {
      await axiosInstance.put(`${API}/api/research-grants/${appId}/disbursals/${disbId}`, {
        status,
        remarks: rem
      });
      alert(`Disbursal request has been ${status.toLowerCase()} successfully.`);
      fetchDisbursals(appId);
      fetchLogs(appId);
    } catch (err) {
      alert(err.response?.data?.message || "Action failed.");
    } finally {
      setDisbSaving(p => ({ ...p, [disbId]: false }));
    }
  };

  const reviewWindow = getCurrentReviewWindow();

  const [settings, setSettings] = useState("AUTO");
  const [isCurrentlyAccepting, setIsCurrentlyAccepting] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(false);

  const fetchSettings = async () => {
    try {
      const r = await axiosInstance.get(`${API}/api/research-grants/settings`);
      if (r.data.success) {
        setSettings(r.data.setting);
        setIsCurrentlyAccepting(r.data.isCurrentlyAccepting);
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
  };

  const handleToggleSettings = async (newValue) => {
    setSettingsLoading(true);
    try {
      await axiosInstance.put(`${API}/api/research-grants/settings`, { value: newValue });
      await fetchSettings();
    } catch (e) {
      alert("Failed to update application submission settings.");
    } finally {
      setSettingsLoading(false);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const r = await axiosInstance.get(`${API}/api/research-grants/admin/pending`);
      setApps(r.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); fetchSettings(); }, []);

  const openModal = (id, decision) => { setModal({ id, decision }); setRemarks(""); setApprovedAmt(""); };

  const submitDecision = async () => {
    if (!modal) return;
    if (modal.decision === "APPROVED" && !approvedAmt)
      return alert("Please enter the approved grant amount.");
    setSaving(true);
    try {
      await axiosInstance.put(`${API}/api/research-grants/admin/${modal.id}`, {
        decision: modal.decision, remarks,
        approved_amount: modal.decision === "APPROVED" ? approvedAmt : null,
      });
      setMsg(`Research grant #${modal.id} has been ${modal.decision === "APPROVED" ? "approved" : "rejected"}.`);
      setModal(null);
      setExpanded(null);
      load();
    } catch (e) { alert(e.response?.data?.message || "Action failed."); }
    finally { saving && setSaving(false); }
  };

  return (
    <div className="bg-white rounded-xl shadow mb-8">
      <div className="p-5 border-b flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <BookOpen size={18} className="text-blue-600" /> Research Grant Applications
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Research Project Approval Committee
            {reviewWindow && ` — Currently reviewing ${WINDOW_LABELS[reviewWindow]} applications`}
          </p>
        </div>
        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
          {apps.length} Pending
        </span>
      </div>

      {/* ── Settings Toggle ── */}
      <div className="mx-5 mt-4 p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">Accept New Applications</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Current Status:{" "}
            <span className={`font-bold ${isCurrentlyAccepting ? "text-emerald-600" : "text-rose-600"}`}>
              {isCurrentlyAccepting ? "ON" : "OFF"}
            </span>{" "}
            {settings === "AUTO" && "(Using calendar window schedule)"}
            {settings === "ON" && "(Forced open manually)"}
            {settings === "OFF" && "(Forced closed manually)"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isCurrentlyAccepting}
              disabled={settingsLoading}
              onChange={() => handleToggleSettings(isCurrentlyAccepting ? "OFF" : "ON")}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>

          {settings !== "AUTO" && (
            <button
              onClick={() => handleToggleSettings("AUTO")}
              disabled={settingsLoading}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-300 px-2.5 py-1 rounded-lg bg-white shadow-sm transition"
            >
              Reset to Calendar
            </button>
          )}
        </div>
      </div>

      {reviewWindow && (
        <div className="mx-5 mt-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-xs text-blue-700">
          It is <strong>{REVIEW_MONTHS[reviewWindow]}</strong> — review period for <strong>{WINDOW_LABELS[reviewWindow]}</strong> applications is active.
        </div>
      )}

      {msg && (
        <div className="mx-5 mt-3 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle size={15} /> {msg}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-400">Loading…</div>
      ) : apps.length === 0 ? (
        <div className="p-8 text-center text-gray-400">
          <CheckCircle size={36} className="mx-auto mb-2 text-green-300" />
          No pending research grant applications.
        </div>
      ) : (
        <div className="divide-y">
          {apps.map((app) => {
            const open = expanded === app.id;
            const isCurrentWindow = app.application_window === reviewWindow;
            return (
              <div key={app.id} className="p-4">
                <button className="w-full flex items-center justify-between text-left"
                  onClick={() => {
                    const nextOpen = !open;
                    setExpanded(nextOpen ? app.id : null);
                    if (nextOpen) {
                      fetchLogs(app.id);
                      fetchDisbursals(app.id);
                    }
                  }}>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full p-2 mt-0.5">
                      <BookOpen size={16} className="text-blue-700" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{app.title}</p>
                      <p className="text-xs text-gray-500">
                        <span className="font-bold text-emerald-700">{app.serial_number || "Draft"}</span> · {app.organization_name} · {WINDOW_LABELS[app.application_window]} {app.application_year}
                        {" · "}{app.applicant_name || app.applicant_email}
                      </p>
                      {isCurrentWindow && (
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          Due for review this month
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Requested</p>
                      <p className="font-bold text-gray-800 text-sm">{fmt(app.requested_amount)}</p>
                    </div>
                    {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {open && (
                  <div className="mt-4 ml-11 space-y-6 text-sm text-gray-800">
                    
                    {/* Section 1: Organisation & Cycle */}
                    <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-4 space-y-3">
                      <h4 className="font-bold text-gray-700 border-b pb-1 text-xs uppercase tracking-wide flex items-center gap-1.5">
                        <Building size={14} className="text-gray-500" /> 1. Organisation &amp; Cycle Details
                      </h4>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                          ["Organisation Name", app.organization_name],
                          ["Organisation Type", app.organization_type],
                          ["Yoga field experience", app.yoga_experience_years ? `${app.yoga_experience_years} Years` : "—"],
                          ["Application Window", `${app.application_window === 'APR_MAY' ? 'April - May' : 'October - November'} ${app.application_year || ""}`],
                          ["Received Prior Grant", app.received_prior_grant ? `Yes (App: ${app.prior_grant_app_number || "—"})` : "No"],
                          ["Completed Research Works", app.completed_research_count || "0"],
                          ["Max Project Funding Claimed", app.max_funding_amount ? fmt(app.max_funding_amount) : "—"],
                          ["Applicant Name", app.applicant_name],
                          ["Designation of Applicant", app.applicant_designation],
                          ["Authorized By", app.authorized_by]
                        ].map(([lbl, val]) => (
                          <div key={lbl} className="bg-white rounded-lg p-2.5 border">
                            <p className="text-[10px] text-gray-400 font-semibold uppercase">{lbl}</p>
                            <p className="font-medium text-gray-800 text-xs mt-0.5">{val}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section 2: Investigators */}
                    <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-4 space-y-4">
                      <h4 className="font-bold text-gray-700 border-b pb-1 text-xs uppercase tracking-wide flex items-center gap-1.5">
                        <Users size={14} className="text-gray-500" /> 2. Research Investigators
                      </h4>
                      
                      {/* PI card */}
                      <div className="bg-white border rounded-lg p-3 space-y-2">
                        <h5 className="font-semibold text-xs text-gray-700 border-b pb-1">Principal Investigator (PI)</h5>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                          {[
                            ["Name", app.pi_name],
                            ["Date of Birth", app.pi_dob ? new Date(app.pi_dob).toLocaleDateString('en-IN') : "—"],
                            ["Position in Org", app.pi_position === 'Other' ? app.pi_position_other : app.pi_position],
                            ["Educational Qualifications", (() => {
                              try {
                                const q = typeof app.pi_qualifications === 'string' ? JSON.parse(app.pi_qualifications) : app.pi_qualifications;
                                return (q || []).filter(item => item.trim()).join(", ") || "—";
                              } catch {
                                return app.pi_qualifications || "—";
                              }
                            })()]
                          ].map(([lbl, val]) => (
                            <div key={lbl}>
                              <p className="text-[10px] text-gray-400 font-semibold uppercase">{lbl}</p>
                              <p className="font-medium text-gray-800 text-xs mt-0.5">{val}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Co-PI list */}
                      {(() => {
                        try {
                          const coPisArr = typeof app.co_pis === 'string' ? JSON.parse(app.co_pis) : (app.co_pis || []);
                          if (!coPisArr || coPisArr.length === 0) return null;
                          return (
                            <div className="space-y-2">
                              <h5 className="font-semibold text-xs text-gray-700">Co-Principal Investigators (Co-PIs)</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {coPisArr.map((c, idx) => (
                                  <div key={idx} className="bg-white border rounded-lg p-3 space-y-2">
                                    <h6 className="font-semibold text-xs text-emerald-700">Co-PI #{idx + 1}: {c.name || "—"}</h6>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div>
                                        <p className="text-[9px] text-gray-400 font-semibold uppercase">DOB</p>
                                        <p className="font-medium text-gray-800 text-xs">{c.dob || "—"}</p>
                                      </div>
                                      <div>
                                        <p className="text-[9px] text-gray-400 font-semibold uppercase">Position</p>
                                        <p className="font-medium text-gray-800 text-xs">{c.position === 'Other' ? c.position_other : c.position || "—"}</p>
                                      </div>
                                      <div className="col-span-2">
                                        <p className="text-[9px] text-gray-400 font-semibold uppercase">Qualifications</p>
                                        <p className="font-medium text-gray-800 text-xs">{(c.qualifications || []).filter(q => q.trim()).join(", ") || "—"}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        } catch {
                          return null;
                        }
                      })()}
                    </div>

                    {/* Section 3: Project Overview */}
                    <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-4 space-y-3">
                      <h4 className="font-bold text-gray-700 border-b pb-1 text-xs uppercase tracking-wide flex items-center gap-1.5">
                        <FileText size={14} className="text-gray-500" /> 3. Project Overview
                      </h4>
                      <div className="space-y-3">
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="bg-white p-2.5 rounded-lg border">
                            <p className="text-[10px] text-gray-400 font-semibold uppercase">Project Title</p>
                            <p className="font-semibold text-gray-800 text-xs mt-0.5">{app.title}</p>
                          </div>
                          <div className="bg-white p-2.5 rounded-lg border">
                            <p className="text-[10px] text-gray-400 font-semibold uppercase">Duration</p>
                            <p className="font-semibold text-gray-800 text-xs mt-0.5">{app.research_duration_months || "—"} Months</p>
                          </div>
                        </div>

                        {app.abstract && (
                          <div className="bg-white p-3 rounded-lg border">
                            <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1">Abstract / Summary</p>
                            <p className="text-xs leading-relaxed text-gray-700">{app.abstract}</p>
                          </div>
                        )}

                        {app.expected_outcomes && (
                          <div className="bg-white p-3 rounded-lg border">
                            <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1">Expected Outcome</p>
                            <p className="text-xs leading-relaxed text-gray-700">{app.expected_outcomes}</p>
                          </div>
                        )}

                        {app.literature_review && (
                          <div className="bg-white p-3 rounded-lg border">
                            <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1">Literature Review</p>
                            <p className="text-xs leading-relaxed text-gray-700">{app.literature_review}</p>
                          </div>
                        )}

                        {app.methodology && (
                          <div className="bg-white p-3 rounded-lg border">
                            <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1">Methodology &amp; Data Plan</p>
                            <p className="text-xs leading-relaxed text-gray-700">{app.methodology}</p>
                          </div>
                        )}

                        {app.timeline && (
                          <div className="bg-white p-3 rounded-lg border">
                            <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1">Timeline &amp; Gantt Chart Description</p>
                            <p className="text-xs leading-relaxed text-gray-700">{app.timeline}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section 4: Budget Details */}
                    <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-4 space-y-3">
                      <h4 className="font-bold text-gray-700 border-b pb-1 text-xs uppercase tracking-wide flex items-center gap-1.5">
                        <DollarSign size={14} className="text-gray-500" /> 4. Budget &amp; Funds Breakdown
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-lg border flex flex-col justify-center">
                          <p className="text-[10px] text-gray-400 font-semibold uppercase">Total Requested Grant</p>
                          <p className="text-xl font-bold text-blue-900 mt-1">{fmt(app.requested_amount)}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border space-y-1 text-xs">
                          <div className="flex justify-between border-b pb-1 font-semibold text-gray-500 text-[10px] uppercase">
                            <span>Budget Head</span>
                            <span>Allocated Amount</span>
                          </div>
                          {[
                            ["Equipment & Research Materials (Max 40%)", app.budget_equipment],
                            ["Manpower (Max 20%)", app.budget_manpower],
                            ["Documentation (Max 15%)", app.budget_documentation],
                            ["Travel & Fieldwork (Max 20%)", app.budget_travel],
                            ["Contingency (Max 5%)", app.budget_contingency]
                          ].map(([lbl, val]) => (
                            <div key={lbl} className="flex justify-between text-xs py-0.5 border-b border-gray-50">
                              <span className="text-gray-600">{lbl}</span>
                              <span className="font-bold text-gray-800">{fmt(val)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Section 5: Documents list */}
                    <DocList docs={[
                      { label: "Documentary Proof of Org", path: app.doc_proof_path },
                      { label: "Prior Grant Approval Document", path: app.prior_grant_approval_doc_path },
                      { label: "Behalf Affidavit", path: app.behalf_affidavit_path },
                      { label: "Proof of Completed Research", path: app.research_proof_doc_path },
                      { label: "Authorization Letter", path: app.authorization_letter_path },
                      { label: "No Prior Grant Affidavit", path: app.no_prior_grant_affidavit_path },
                      { label: "PI DOB Proof", path: app.pi_dob_proof_path },
                      { label: "PI ID Proof", path: app.pi_id_proof_path },
                      { label: "PI Qualification Certificate", path: app.pi_qualifications_doc_path },
                      { label: "PI Proof of Position", path: app.pi_position_proof_path },
                      { label: "Project Synopsis", path: app.synopsis_path },
                      { label: "Other Project Document", path: app.other_doc_path },
                      { label: "Objective Milestone Chart", path: app.milestone_chart_path },
                      { label: "Budget Details Sheet", path: app.budget_details_doc_path },
                      { label: "Ethical Clearance Document", path: app.ethical_clearance_doc_path },
                      { label: "Research Team CVs", path: app.team_cvs_path },
                      { label: "Originality Affidavit", path: app.originality_affidavit_path },
                      { label: "Other Relevant Document", path: app.other_relevant_doc_path }
                    ]} />

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => printResearchApplication(app, API)}
                        className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition"
                      >
                        <FileText size={14} /> Download / Print Application PDF
                      </button>
                    </div>

                    {/* Workflow Decisions */}
                    <div className="border-t pt-4 space-y-4">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Workflow Stage: <span className="text-emerald-700 font-extrabold">{app.status.replace(/_/g, " ")}</span>
                      </p>

                      {/* 1. Submitted / Resubmitted */}
                      {(app.status === 'SUBMITTED' || app.status === 'RESUBMITTED') && (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-400">Select initial review action:</p>
                          <div className="flex gap-3">
                            <button onClick={() => openModal(app.id, "FORWARDED_TO_RPAC")}
                              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition">
                              <CheckCircle size={13} /> Forward to RPAC
                            </button>
                            <button onClick={() => openModal(app.id, "REVERTED_TO_APPLICANT")}
                              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition">
                              <AlertCircle size={13} /> Revert to Applicant (Ask Clarification)
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 2. Forwarded to RPAC */}
                      {app.status === 'FORWARDED_TO_RPAC' && (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-400">Select RPAC evaluation result:</p>
                          <div className="flex gap-3">
                            <button onClick={() => openModal(app.id, "APPROVED_BY_RPAC")}
                              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition">
                              <CheckCircle size={13} /> Approve by RPAC
                            </button>
                            <button onClick={() => openModal(app.id, "REJECTED_BY_RPAC")}
                              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition">
                              <XCircle size={13} /> Reject by RPAC
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 3. Approved by RPAC */}
                      {app.status === 'APPROVED_BY_RPAC' && (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-400">Action required:</p>
                          <div className="flex gap-3">
                            <button onClick={() => openModal(app.id, "FORWARDED_TO_SLRC")}
                              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition">
                              <CheckCircle size={13} /> Forward to SLRC
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 4. Forwarded to SLRC */}
                      {app.status === 'FORWARDED_TO_SLRC' && (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-400">Select final SLRC committee decision:</p>
                          <div className="flex gap-3">
                            <button onClick={() => openModal(app.id, "SLRC_APPROVED")}
                              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition">
                              <CheckCircle size={13} /> Approve by SLRC
                            </button>
                            <button onClick={() => openModal(app.id, "SLRC_REJECTED")}
                              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition">
                              <XCircle size={13} /> Reject by SLRC
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 5. Reverted to Applicant */}
                      {app.status === 'REVERTED_TO_APPLICANT' && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-xs font-semibold">
                          ⌛ Waiting for Applicant compliance submission details.
                        </div>
                      )}
                    </div>

                    {/* Disbursal Requests review queue */}
                    {app.status === 'SLRC_APPROVED' && disbursals[app.id] && disbursals[app.id].length > 0 && (
                      <div className="border-t pt-4 space-y-3">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                          <Landmark size={14} className="text-emerald-700" /> Disbursal Requests Review
                        </p>
                        <div className="space-y-3">
                          {disbursals[app.id].map((disb) => (
                            <div key={disb.id} className="bg-slate-50 border rounded-xl p-3 space-y-3 text-xs">
                              <div className="flex justify-between items-center border-b pb-1">
                                <span className="font-bold text-gray-800">Installment #{disb.installment_num} ({disb.percentage}%)</span>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  disb.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                  disb.status === 'REVERTED' ? 'bg-amber-100 text-amber-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                  {disb.status}
                                </span>
                              </div>

                              <div className="grid md:grid-cols-2 gap-2 text-xs">
                                <div>
                                  <p className="text-[10px] text-gray-400 font-semibold uppercase">Requested Amount</p>
                                  <p className="font-bold text-gray-800">{fmt(disb.amount)}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-gray-400 font-semibold uppercase">Progress Details</p>
                                  <p className="text-gray-700 font-medium">{disb.progress_details || "—"}</p>
                                </div>
                              </div>

                              {/* Bank Details */}
                              <div className="bg-white p-2.5 rounded border space-y-1">
                                <p className="text-[9px] text-gray-400 font-bold uppercase">Bank details submitted for disbursal</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                                  <div><span className="text-gray-400">Bank:</span> {disb.bank_name}</div>
                                  <div><span className="text-gray-400">Account:</span> {disb.account_number}</div>
                                  <div><span className="text-gray-400">Holder:</span> {disb.account_holder_name}</div>
                                  <div><span className="text-gray-400">IFSC:</span> {disb.ifsc_code}</div>
                                </div>
                              </div>

                              {/* Document Links */}
                              <div className="bg-white p-2 rounded border grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {[
                                  ["SLRC Approval Document", disb.slrc_approval_doc_path],
                                  ["Milestone Chart", disb.milestone_chart_path],
                                  ["Cancelled Cheque", disb.cancelled_cheque_path],
                                  ["Utilization Certificate", disb.utilization_certificate_path],
                                  ["Other Doc", disb.other_doc_path]
                                ].map(([lbl, path]) => (
                                  path ? (
                                    <a key={lbl} href={docUrl(path)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-medium truncate">
                                      <Paperclip size={10} /> {lbl}
                                    </a>
                                  ) : null
                                ))}
                              </div>

                              {/* Decision for Pending Disbursals */}
                              {disb.status === 'PENDING' && (
                                <div className="space-y-2 pt-2 border-t">
                                  <div>
                                    <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Reversion Remarks (Required if reverting)</label>
                                    <textarea
                                      rows={2}
                                      value={disbRemarks[disb.id] || ""}
                                      onChange={(e) => setDisbRemarks(p => ({ ...p, [disb.id]: e.target.value }))}
                                      placeholder="Provide audit feedback or request details..."
                                      className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleReviewDisbursal(app.id, disb.id, 'APPROVED')}
                                      disabled={disbSaving[disb.id]}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50 text-[11px]"
                                    >
                                      Approve Disbursal
                                    </button>
                                    <button
                                      onClick={() => handleReviewDisbursal(app.id, disb.id, 'REVERTED')}
                                      disabled={disbSaving[disb.id]}
                                      className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50 text-[11px]"
                                    >
                                      Revert to Applicant
                                    </button>
                                  </div>
                                </div>
                              )}

                              {disb.status === 'REVERTED' && disb.directorate_remarks && (
                                <p className="text-red-600 italic">Reversion comments: &ldquo;{disb.directorate_remarks}&rdquo;</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Movement Logs Timeline */}
                    <div className="border-t pt-4">
                      <WorkflowLogs logsList={logs[app.id]} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Decision Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h4 className="font-semibold text-gray-800 text-sm">
              Confirm Action: {modal.decision.replace(/_/g, " ")}
            </h4>
            <p className="text-[10px] text-gray-400 font-semibold uppercase">Research Project Approval Committee — Directorate Workflow Action</p>

            {(modal.decision === "APPROVED_BY_RPAC" || modal.decision === "SLRC_APPROVED") && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Approved Grant Amount (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <IndianRupee size={12} className="absolute left-3 top-2.5 text-gray-400" />
                  <input type="number" min="0" max="1000000"
                    value={approvedAmt} onChange={(e) => setApprovedAmt(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Max ₹10,00,000" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Remarks / Comments {modal.decision === 'REVERTED_TO_APPLICANT' && <span className="text-red-500">*</span>}</label>
              <textarea rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Enter feedback comments, actions or details here..." />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="px-4 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 font-semibold shadow-sm hover:bg-gray-50">Cancel</button>
              <button onClick={submitDecision} disabled={saving}
                className="px-5 py-1.5 text-xs text-white bg-emerald-600 hover:bg-emerald-700 font-semibold rounded-lg disabled:opacity-60 shadow-sm transition">
                {saving ? "Saving…" : "Confirm Action"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function YogaTCDirectorateReview() {
  const [apps, setApps]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [modal, setModal]       = useState(null);
  const [actionType, setActionType] = useState("");

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
  const [remarks, setRemarks]   = useState("");
  const [slrcDate, setSlrcDate] = useState("");
  const [slrcRef, setSlrcRef]   = useState("");
  const [ipOrderNum, setIpOrderNum] = useState("");
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const r = await axiosInstance.get(`${API}/api/admin/incentives/directorate`);
      setApps(r.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // ── Disbursal Claims Management states & methods ───────────────────────────
  const [disbursalClaims, setDisbursalClaims] = useState({});
  const [showClaimAction, setShowClaimAction] = useState(null); // { claim, actionType }
  const [claimActionText, setClaimActionText] = useState("");
  const [claimSLRCDecision, setClaimSLRCDecision] = useState(true);

  const fetchClaimsForApp = async (appId) => {
    try {
      const res = await axiosInstance.get(`${API}/api/admin/incentives/directorate/${appId}/disbursal-claims`);
      setDisbursalClaims(prev => ({
        ...prev,
        [appId]: res.data.data || []
      }));
    } catch (e) {
      console.error("Error fetching claims:", e);
    }
  };

  const handleClaimWorkflowSubmit = async (e) => {
    e.preventDefault();
    if (!showClaimAction) return;
    const { claim, actionType } = showClaimAction;

    try {
      let endpoint = "";
      let payload = {};

      if (actionType === 'forward') {
        endpoint = `${API}/api/admin/incentives/directorate/claims/${claim.id}/forward-committee`;
      } else if (actionType === 'revert') {
        if (!claimActionText.trim()) return alert("Revert reason is required.");
        endpoint = `${API}/api/admin/incentives/directorate/claims/${claim.id}/revert-claim`;
        payload = { revertComment: claimActionText };
      } else if (actionType === 'verify') {
        if (!claimActionText.trim()) return alert("Verification report is required.");
        endpoint = `${API}/api/admin/incentives/directorate/claims/${claim.id}/verify-committee`;
        payload = { verificationNote: claimActionText };
      } else if (actionType === 'slrc') {
        if (!claimActionText.trim()) return alert("SLRC recommendation notes are required.");
        endpoint = `${API}/api/admin/incentives/directorate/claims/${claim.id}/slrc-recommend`;
        payload = { approved: claimSLRCDecision, slrcNote: claimActionText };
      } else if (actionType === 'release') {
        endpoint = `${API}/api/admin/incentives/directorate/claims/${claim.id}/release-subsidy`;
      }

      await axiosInstance.put(endpoint, payload);
      alert("Claim workflow status updated successfully!");
      setShowClaimAction(null);
      setClaimActionText("");
      fetchClaimsForApp(claim.application_id);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit claim action.");
    }
  };

  useEffect(() => { load(); }, []);

  const openActionModal = (app, type) => {
    setModal(app);
    setActionType(type);
    setRemarks("");
    setSlrcDate("");
    setSlrcRef("");
    setIpOrderNum("");
  };

  const [slrcApprovedVal, setSlrcApprovedVal] = useState(true);

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!modal) return;
    setSaving(true);
    try {
      let endpoint = "";
      let payload = { remarks };

      if (actionType === "forward_district") {
        endpoint = `${API}/api/admin/incentives/directorate/${modal.id}/forward-district`;
      } else if (actionType === "revert") {
        if (!remarks.trim()) {
          alert("Compliance remarks are required.");
          setSaving(false);
          return;
        }
        endpoint = `${API}/api/admin/incentives/directorate/${modal.id}/revert`;
      } else if (actionType === "reject") {
        if (!remarks.trim()) {
          alert("Rejection remarks/reason are required.");
          setSaving(false);
          return;
        }
        endpoint = `${API}/api/admin/incentives/directorate/${modal.id}/reject`;
        payload = { reason: remarks };
      } else if (actionType === "forward_slrc") {
        endpoint = `${API}/api/admin/incentives/directorate/${modal.id}/forward-slrc`;
      } else if (actionType === "slrc_decision") {
        endpoint = `${API}/api/admin/incentives/directorate/${modal.id}/slrc-approval`;
        payload = {
          approved: slrcApprovedVal,
          slrcReference: slrcApprovedVal ? slrcRef : null,
          slrcDate: slrcApprovedVal ? slrcDate : null,
          comment: remarks || (slrcApprovedVal ? "SLRC Approved" : "SLRC Rejected")
        };
        if (slrcApprovedVal && (!slrcDate || !slrcRef)) {
          alert("SLRC Date and Reference Number are required for approvals.");
          setSaving(false);
          return;
        }
      } else if (actionType === "grant_approval") {
        if (!ipOrderNum) {
          alert("In-Principle Order Number is required.");
          setSaving(false);
          return;
        }
        endpoint = `${API}/api/admin/incentives/directorate/${modal.id}/grant-approval`;
        payload.inPrincipleOrderNumber = ipOrderNum;
      }

      await axiosInstance.put(endpoint, payload);
      setMsg(`Action completed successfully for Application #${modal.id}.`);
      setModal(null);
      setActionType("");
      setRemarks("");
      setSlrcDate("");
      setSlrcRef("");
      setIpOrderNum("");
      setExpanded(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit action.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow mb-8">
      <div className="p-5 border-b flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Yoga TC — Incentive Applications</h3>
          <p className="text-xs text-gray-500 mt-0.5">State Level Review Committee — Directorate Stage (District Approved)</p>
        </div>
        <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">
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
          No district-approved applications awaiting directorate review.
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
                  onClick={() => {
                    const newOpen = !open;
                    setExpanded(newOpen ? app.id : null);
                    if (newOpen && ["SLRC_APPROVED", "IN_PRINCIPLE_APPROVED"].includes(app.status)) {
                      fetchClaimsForApp(app.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 rounded-full p-2 mt-0.5">
                      <FileText size={16} className="text-purple-700" />
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
                      {app.district_remarks && (
                        <p className="text-xs text-blue-600 mt-0.5">District note: {app.district_remarks}</p>
                      )}
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
                  <div className="mt-4 ml-11 space-y-4 text-xs bg-slate-50 p-5 rounded-2xl border">
                    
                    {/* Header bar with PDF download */}
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg border">
                      <div>
                        <p className="font-bold text-gray-800 text-sm">Application Details</p>
                        <p className="text-[10px] text-gray-500">UPN: {app.upn || "—"}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => generatePDF(app, REGIONS, DOCS, fmt, docUrl)}
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
                    </div>

                    {/* Applicant & Organisation Details */}
                    <div className="bg-white p-3 rounded-lg border space-y-3">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b pb-1">Applicant &amp; Organisation Info</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">Applicant Name</span>
                          <span className="font-semibold text-gray-800">{app.applicant_name || "—"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">Designation</span>
                          <span className="font-semibold text-gray-800">{app.designation || "—"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">Entity Name</span>
                          <span className="font-semibold text-gray-800">{app.centre_name || "—"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">Institution Type</span>
                          <span className="font-semibold text-gray-800">{app.entity_type || "—"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">Mobile Number</span>
                          <span className="font-semibold text-gray-800">{app.mobile_number || "—"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">Email Address</span>
                          <span className="font-semibold text-gray-800">{app.email_id || "—"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">Date of Submission</span>
                          <span className="font-semibold text-gray-800">
                            {app.created_at ? new Date(app.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Financial details & claimed subsidy */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-white p-3 rounded-lg border">
                        <span className="text-[10px] text-gray-400 font-bold block uppercase">Total Investment</span>
                        <span className="font-bold text-gray-800 text-sm">{fmt(app.investment_amount)}</span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border">
                        <span className="text-[10px] text-gray-400 font-bold block uppercase">Eligible Capital Assets (ECA)</span>
                        <span className="font-bold text-gray-800 text-sm">{fmt(app.eligible_assets_amount || app.claim_amount)}</span>
                      </div>
                      <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                        <span className="text-[10px] text-emerald-600 font-bold block uppercase">Claimed Subsidy (Tentative)</span>
                        <span className="font-bold text-emerald-700 text-sm">{fmt(app.subsidy_amount)}</span>
                      </div>
                    </div>

                    {/* Project location & land details */}
                    <div className="bg-white p-3 rounded-lg border space-y-3">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b pb-1">Project &amp; Land Details</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">Project Type</span>
                          <span className="font-semibold text-gray-800">{app.project_type || "Greenfield"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">Region</span>
                          <span className="font-semibold text-gray-800">{app.region}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">District</span>
                          <span className="font-semibold text-gray-800">{app.district || "—"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">Proposed Location</span>
                          <span className="font-semibold text-gray-800">{app.proposed_location || "—"}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">Complete Site Address</span>
                          <span className="font-semibold text-gray-800">{app.address || "—"}</span>
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
                              <span className="font-semibold text-gray-800">{app.gps_coordinates || "—"}</span>
                              {!['FORWARDED_TO_SLRC', 'SLRC_APPROVED', 'SLRC_REJECTED', 'IN_PRINCIPLE_APPROVED', 'DIRECTORATE_REJECTED'].includes(app.status) && (
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
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">Site Total Area</span>
                          <span className="font-semibold text-gray-800">{app.site_total_area ? `${app.site_total_area} sq ft` : "—"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">Constructed Area</span>
                          <span className="font-semibold text-gray-800">{app.proposed_constructed_area ? `${app.proposed_constructed_area} sq ft` : "—"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Operational Details */}
                    <div className="bg-white p-3 rounded-lg border space-y-3">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b pb-1">Operational details</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">Tentative Employees</span>
                          <span className="font-semibold text-gray-800">{app.tentative_employees || "0"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">YCB Certified Instructors</span>
                          <span className="font-semibold text-gray-800">{app.ycb_certified_instructors || "0"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">Clinical Services?</span>
                          <span className="font-semibold text-gray-800">{app.clinical_services_provided ? `Yes` : "No"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">AYUSH Doctors</span>
                          <span className="font-semibold text-gray-800">{app.certified_ayush_doctors || "0"}</span>
                        </div>
                        <div className="col-span-4">
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">Services Offered</span>
                          <span className="font-semibold text-gray-800">{Array.isArray(app.services_offered) ? app.services_offered.join(", ") : (app.services_offered || "—")}</span>
                        </div>
                      </div>
                    </div>

                    {/* GPS Map block */}
                    <GpsMap coords={app.gps_coordinates} />

                    {/* District Officer Verification Remarks */}
                    {app.district_verified_at && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs">
                        <p className="font-bold text-orange-700 text-xs uppercase tracking-wide">✓ District Verification Note</p>
                        <p className="text-orange-800 mt-1 italic">"{app.district_verification_note}"</p>
                        <p className="text-[10px] text-orange-500 mt-1">Verified on: {new Date(app.district_verified_at).toLocaleDateString("en-IN")}</p>
                      </div>
                    )}

                    {app.status === 'REVERTED_TO_APPLICANT' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-800">
                        <p className="font-semibold uppercase tracking-wider">⚠️ Reverted to applicant</p>
                        <p className="mt-1">Revert Comment: "{app.revert_comment}"</p>
                      </div>
                    )}

                    {app.status === 'SLRC_APPROVED' && (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-xs text-indigo-800">
                        <p className="font-semibold uppercase tracking-wider">✓ SLRC Approved</p>
                        <p className="mt-1">Approval Date: {app.slrc_approval_date ? new Date(app.slrc_approval_date).toLocaleDateString("en-IN") : "—"}</p>
                        <p className="mt-0.5">Reference Number: {app.slrc_reference_number}</p>
                      </div>
                    )}

                    {app.status === 'IN_PRINCIPLE_APPROVED' && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800">
                        <p className="font-semibold uppercase tracking-wider">✓ In-principle Approval Given</p>
                        <p className="mt-1">Approval Order: {app.in_principle_order_number}</p>
                        <p className="mt-0.5">Approved Date: {app.in_principle_approved_at ? new Date(app.in_principle_approved_at).toLocaleDateString("en-IN") : "—"}</p>
                      </div>
                    )}

                    {/* Submitted Documents list */}
                    <div className="space-y-2 border-t pt-3">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider">Submitted Scheme Documents</span>
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
                    </div>

                    {/* Disbursal Claims management block */}
                    {["SLRC_APPROVED", "IN_PRINCIPLE_APPROVED"].includes(app.status) && (
                      <div className="md:col-span-3 bg-indigo-50/35 border border-indigo-100/60 rounded-2xl p-5 mt-4 space-y-4">
                        <div>
                          <h4 className="font-bold text-indigo-950 text-sm flex items-center gap-2">
                            <span className="bg-indigo-600 text-white rounded p-1"><IndianRupee size={12} /></span>
                            Subsidy Claims &amp; Disbursal Milestones
                          </h4>
                          <p className="text-[11px] text-indigo-700/80 mt-0.5">Manage claims submitted by the Yoga Training Centre for each of the three financial milestones.</p>
                        </div>

                        {/* List of claims */}
                        <div className="grid md:grid-cols-3 gap-4">
                          {[
                            { type: 'FIRST_50', label: '1st Milestone Claim (50%)' },
                            { type: 'SECOND_25', label: '2nd Milestone Claim (25%)' },
                            { type: 'THIRD_25', label: '3rd Milestone Claim (25%)' }
                          ].map((milestone, idx) => {
                            const claim = (disbursalClaims[app.id] || []).find(c => c.claim_type === milestone.type);

                            return (
                              <div key={milestone.type} className={`bg-white rounded-xl border p-4 shadow-sm flex flex-col justify-between space-y-4 ${claim ? 'border-emerald-200' : 'border-slate-200'}`}>
                                <div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded">Stage {idx + 1}</span>
                                    {claim && (
                                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                        claim.status === 'RELEASED' ? 'bg-emerald-100 text-emerald-800' :
                                        claim.status === 'REVERTED' ? 'bg-red-100 text-red-800' :
                                        claim.status === 'APPROVED_DISBURSAL' ? 'bg-indigo-100 text-indigo-800' :
                                        'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {claim.status.replace(/_/g, ' ')}
                                      </span>
                                    )}
                                  </div>
                                  <h5 className="font-bold text-slate-800 text-xs mt-2">{milestone.label}</h5>
                                </div>

                                <div className="text-[11px] space-y-3 pt-2 border-t border-slate-100">
                                  {claim ? (
                                    <>
                                      <div className="space-y-1">
                                        <p className="text-[9px] text-gray-400 font-bold uppercase">Bank details</p>
                                        <p className="font-semibold text-slate-700">{claim.bank_name} - {claim.bank_account_number}</p>
                                        <p className="text-slate-500 text-[10px]">Branch: {claim.branch_address}</p>
                                        {claim.loan_account_number && <p className="text-slate-500 text-[10px]">Loan A/c: {claim.loan_account_number}</p>}
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-[9px] text-gray-400 font-bold uppercase">CAPEX Incurred</p>
                                        <p className="font-bold text-slate-700">{fmt(claim.capex_incurred)}</p>
                                      </div>

                                      {/* Document files list */}
                                      <div className="space-y-1 bg-slate-50 p-2 rounded border text-[10px]">
                                        <p className="font-bold text-slate-500 uppercase text-[9px] mb-1">Submitted Files</p>
                                        {[
                                          { label: 'Bank details', path: claim.doc_bank_detail },
                                          { label: 'CA Certified ECA', path: claim.doc_ca_eca_report },
                                          { label: 'Fire & Safety Audit', path: claim.doc_fire_safety_audit },
                                          { label: 'Wellness Centre Reg', path: claim.doc_wellness_registration },
                                          { label: 'CAPEX Cert', path: claim.doc_capex_certificate },
                                          { label: 'Actual Bills', path: claim.doc_actual_bills },
                                          { label: 'Others', path: claim.doc_others },
                                          { label: 'Sessions/Workshops Log', path: claim.doc_sessions_workshops },
                                        ].map(f => {
                                          if (!f.path) return null;
                                          return (
                                            <a key={f.label} href={docUrl(f.path)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-700 font-semibold hover:underline mt-0.5">
                                              📄 {f.label}
                                            </a>
                                          );
                                        })}
                                      </div>

                                      {/* Claim flow remarks */}
                                      {claim.revert_comment && <p className="bg-red-50 text-red-700 p-2 rounded text-[10px] italic">Reverted: "{claim.revert_comment}"</p>}
                                      {claim.committee_verification_note && <p className="bg-emerald-50 text-emerald-800 p-2 rounded text-[10px]">Committee verification note: "{claim.committee_verification_note}"</p>}
                                      {claim.slrc_disbursal_note && <p className="bg-indigo-50 text-indigo-900 p-2 rounded text-[10px]">SLRC Recommendation note: "{claim.slrc_disbursal_note}"</p>}

                                      {/* Admin Actions */}
                                      <div className="space-y-1.5 pt-2">
                                        {claim.status === 'SUBMITTED' && (
                                          <button
                                            type="button"
                                            onClick={() => setShowClaimAction({ claim, actionType: 'forward' })}
                                            className="w-full py-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-[10px] transition"
                                          >
                                            Forward to Working Committee
                                          </button>
                                        )}
                                        {['SUBMITTED', 'FORWARDED_TO_COMMITTEE'].includes(claim.status) && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setShowClaimAction({ claim, actionType: 'revert' });
                                              setClaimActionText("");
                                            }}
                                            className="w-full py-1 text-center bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-[10px] transition"
                                          >
                                            Revert back for Clarification
                                          </button>
                                        )}
                                        {claim.status === 'FORWARDED_TO_COMMITTEE' && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setShowClaimAction({ claim, actionType: 'verify' });
                                              setClaimActionText("");
                                            }}
                                            className="w-full py-1 text-center bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px] transition"
                                          >
                                            Enter Physical Verification Notes
                                          </button>
                                        )}
                                        {claim.status === 'COMMITTEE_VERIFIED' && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setShowClaimAction({ claim, actionType: 'slrc' });
                                              setClaimActionText("");
                                              setClaimSLRCDecision(true);
                                            }}
                                            className="w-full py-1 text-center bg-purple-600 hover:bg-purple-700 text-white rounded font-bold text-[10px] transition"
                                          >
                                            Enter SLRC Disbursal Decision
                                          </button>
                                        )}
                                        {claim.status === 'APPROVED_DISBURSAL' && (
                                          <button
                                            type="button"
                                            onClick={() => setShowClaimAction({ claim, actionType: 'release' })}
                                            className="w-full py-1 text-center bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold text-[10px] transition"
                                          >
                                            Mark Subsidy Amount Released
                                          </button>
                                        )}
                                        {claim.status === 'RELEASED' && (
                                          <div className="bg-emerald-100 text-emerald-900 border border-emerald-200 text-center rounded p-1.5 text-[9px] font-bold">
                                            ✓ Subsidy claim fully released
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  ) : (
                                    <span className="text-gray-400 italic">No disbursal claim submitted yet for this milestone.</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

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
                              <span className="absolute -left-[22px] top-1 bg-purple-600 rounded-full w-2 h-2 border border-white"></span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-slate-800 text-[10px]">{ev.event_type.replace(/_/g, ' ')}</span>
                                <span className="text-[8px] bg-purple-50 text-purple-700 px-1 py-0.5 rounded font-bold capitalize">{ev.actor_role}</span>
                                <span className="text-[9px] text-slate-400 ml-auto">{new Date(ev.created_at).toLocaleDateString("en-IN")}</span>
                              </div>
                              {ev.comment && <p className="text-[10px] text-slate-600 italic bg-white p-1.5 rounded border border-slate-100 mt-0.5">"{ev.comment}"</p>}
                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                    {/* Action panel footer */}
                    <div className="border-t pt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-3">
                        Directorate Action Panel — Current Status: <strong className="text-purple-700">{app.status.replace(/_/g, ' ')}</strong>
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {["SUBMITTED", "RESUBMITTED", "DISTRICT_VERIFIED"].includes(app.status) && (
                          <button
                            onClick={() => openActionModal(app, "forward_district")}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded text-xs font-bold transition shadow-sm"
                          >
                            Forward to District for Verification
                          </button>
                        )}
                        {["SUBMITTED", "DISTRICT_VERIFIED", "RESUBMITTED"].includes(app.status) && (
                          <button
                            onClick={() => openActionModal(app, "revert")}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded text-xs font-bold transition shadow-sm"
                          >
                            Revert to Yoga Centre (Need Info/Docs)
                          </button>
                        )}
                        {["SUBMITTED", "DISTRICT_VERIFIED", "RESUBMITTED"].includes(app.status) && (
                          <button
                            onClick={() => openActionModal(app, "reject")}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-bold transition shadow-sm"
                          >
                            Reject Application
                          </button>
                        )}
                        {["SUBMITTED", "DISTRICT_VERIFIED", "RESUBMITTED"].includes(app.status) && (
                          <button
                            onClick={() => openActionModal(app, "forward_slrc")}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-xs font-bold transition shadow-sm"
                          >
                            Forward to SLRC
                          </button>
                        )}
                        {app.status === "FORWARDED_TO_SLRC" && (
                          <button
                            onClick={() => {
                              openActionModal(app, "slrc_decision");
                              setSlrcApprovedVal(true);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs font-bold transition shadow-sm"
                          >
                            SLRC Decision (Approve / Reject)
                          </button>
                        )}
                        {app.status === "SLRC_APPROVED" && (
                          <button
                            onClick={() => openActionModal(app, "grant_approval")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-xs font-bold transition shadow-sm"
                          >
                            Grant In-Principle Approval
                          </button>
                        )}
                        {app.status === "IN_PRINCIPLE_APPROVED" && (
                          <span className="text-emerald-700 font-bold bg-emerald-100 px-3 py-1.5 rounded text-xs">
                            ✓ In-Principle Approval Granted
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Directorate Multi-stage Action Modal */}
      {modal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border overflow-hidden">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-gray-800 text-base">
                {actionType === "forward_district" && "Forward to District Nodal Officer"}
                {actionType === "revert" && "Revert to Yoga Centre"}
                {actionType === "reject" && "Reject Application"}
                {actionType === "forward_slrc" && "Forward to SLRC"}
                {actionType === "slrc_decision" && "SLRC Decision Review"}
                {actionType === "grant_approval" && "Grant In-Principle Approval"}
              </h4>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <form onSubmit={handleActionSubmit} className="space-y-4 text-xs">
              <p className="text-slate-500 leading-normal">
                Applying workflow action to Application <strong>#{modal.id}</strong> (UPN: {modal.upn})
              </p>

              {/* SLRC input fields */}
              {actionType === "slrc_decision" && (
                <>
                  <div>
                    <label className="block text-gray-600 font-bold mb-1">SLRC Recommendation / Decision <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSlrcApprovedVal(true)}
                        className={`py-2 px-3 rounded-lg border font-bold text-center transition-all ${
                          slrcApprovedVal
                            ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        Approved
                      </button>
                      <button
                        type="button"
                        onClick={() => setSlrcApprovedVal(false)}
                        className={`py-2 px-3 rounded-lg border font-bold text-center transition-all ${
                          !slrcApprovedVal
                            ? "border-red-600 bg-red-50 text-red-700"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        Rejected
                      </button>
                    </div>
                  </div>

                  {slrcApprovedVal && (
                    <>
                      <div>
                        <label className="block text-gray-600 font-bold mb-1">SLRC Meeting / Approval Date <span className="text-red-500">*</span></label>
                        <input
                          type="date"
                          required
                          value={slrcDate}
                          onChange={(e) => setSlrcDate(e.target.value)}
                          className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 font-bold mb-1">SLRC Reference Number <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. SLRC/2026/YOGA-452"
                          value={slrcRef}
                          onChange={(e) => setSlrcRef(e.target.value)}
                          className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {/* In-principle order input fields */}
              {actionType === "grant_approval" && (
                <div>
                  <label className="block text-gray-600 font-bold mb-1">In-Principle Approval Order Number <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AYUSH-IP/2026/09"
                    value={ipOrderNum}
                    onChange={(e) => setIpOrderNum(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  />
                </div>
              )}

              {/* Generic remarks / comments */}
              <div>
                <label className="block text-gray-600 font-bold mb-1">
                  {actionType === "revert" && "Compliance instructions / reasons to revert *"}
                  {actionType === "reject" && "Rejection reasons / remarks *"}
                  {!["revert", "reject"].includes(actionType) && "Remarks / notes"}
                </label>
                <textarea
                  rows={3}
                  required={["revert", "reject"].includes(actionType)}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  placeholder={["revert", "reject"].includes(actionType) ? "Provide detailed comments..." : "Add workflow remarks..."}
                />
              </div>

              <div className="flex justify-end gap-3 mt-5 border-t pt-4">
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border rounded text-gray-600 font-semibold">Cancel</button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-white rounded bg-purple-600 hover:bg-purple-700 disabled:opacity-60 font-bold"
                >
                  {saving ? "Processing…" : "Confirm Action"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Disbursal Claim Nodal Officer Action Modal ────────────────────────── */}
      {showClaimAction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border overflow-hidden">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-gray-800 text-base capitalize">
                {showClaimAction.actionType === 'forward' && "Forward Claim to Working Committee"}
                {showClaimAction.actionType === 'revert' && "Revert Claim for Clarification"}
                {showClaimAction.actionType === 'verify' && "Working Committee Verification Notes"}
                {showClaimAction.actionType === 'slrc' && "SLRC Disbursal Decision"}
                {showClaimAction.actionType === 'release' && "Confirm Subsidy Release"}
              </h4>
              <button onClick={() => setShowClaimAction(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <form onSubmit={handleClaimWorkflowSubmit} className="space-y-4 text-xs">
              <p className="text-slate-500 leading-normal">
                Applying milestone claim action to <strong>{showClaimAction.claim.claim_type.replace(/_/g, ' ')}</strong> (CAPEX: {fmt(showClaimAction.claim.capex_incurred)})
              </p>

              {showClaimAction.actionType === 'slrc' && (
                <div>
                  <label className="block text-gray-600 font-bold mb-1">SLRC Claim Recommendation <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setClaimSLRCDecision(true)}
                      className={`py-2 px-3 rounded-lg border font-bold text-center transition-all ${
                        claimSLRCDecision
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      Approved for Disbursal
                    </button>
                    <button
                      type="button"
                      onClick={() => setClaimSLRCDecision(false)}
                      className={`py-2 px-3 rounded-lg border font-bold text-center transition-all ${
                        !claimSLRCDecision
                          ? "border-red-600 bg-red-50 text-red-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      Rejected
                    </button>
                  </div>
                </div>
              )}

              {/* Textarea fields for comments, verification notes etc. */}
              {['revert', 'verify', 'slrc'].includes(showClaimAction.actionType) && (
                <div>
                  <label className="block text-gray-600 font-bold mb-1">
                    {showClaimAction.actionType === 'revert' && "Revert Clarification Comments *"}
                    {showClaimAction.actionType === 'verify' && "Physical Verification Report Notes *"}
                    {showClaimAction.actionType === 'slrc' && "SLRC Meeting Decision Notes *"}
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={claimActionText}
                    onChange={(e) => setClaimActionText(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    placeholder="Enter details..."
                  />
                </div>
              )}

              {showClaimAction.actionType === 'forward' && (
                <p className="text-amber-700 font-medium bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                  ⚠️ This claim will be forwarded to the Working Committee for physical verification.
                </p>
              )}

              {showClaimAction.actionType === 'release' && (
                <p className="text-emerald-700 font-medium bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                  ⚠️ Confirm that the first 50% / next 25% subsidy amount has been successfully disbursed to the Yoga Centre.
                </p>
              )}

              <div className="flex justify-end gap-3 mt-5 border-t pt-4">
                <button type="button" onClick={() => setShowClaimAction(null)} className="px-4 py-2 border rounded text-gray-600 font-semibold">Cancel</button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white rounded bg-indigo-600 hover:bg-indigo-700 font-bold"
                >
                  Confirm Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const NAAC_GRADE_LABELS = { 'B++': { label: 'NAAC B++', badge: 'bg-amber-100 text-amber-700' }, 'A': { label: 'NAAC A', badge: 'bg-blue-100 text-blue-700' }, 'A+': { label: 'NAAC A+', badge: 'bg-purple-100 text-purple-700' }, 'A++': { label: 'NAAC A++', badge: 'bg-emerald-100 text-emerald-700' } };

function NAACReimbursementReview() {
  const [apps, setApps]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [modal, setModal]       = useState(null);
  const [remarks, setRemarks]   = useState("");
  const [approvedAmt, setApprovedAmt] = useState("");
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState("");

  const fmtAmt  = (n) => n != null ? `₹${parseFloat(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—";

  const load = async () => {
    setLoading(true);
    try {
      const r = await axiosInstance.get(`${API}/api/admin/naac-reimbursement/pending`);
      setApps(r.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openModal = (id, decision, claimed) => {
    setModal({ id, decision });
    setRemarks("");
    setApprovedAmt(decision === "APPROVED" ? String(claimed) : "");
  };

  const submitDecision = async () => {
    if (!modal) return;
    if (modal.decision === "APPROVED" && !approvedAmt) return alert("Please enter approved amount.");
    setSaving(true);
    try {
      await axiosInstance.put(`${API}/api/admin/naac-reimbursement/${modal.id}`, {
        decision: modal.decision, remarks,
        approved_amount: modal.decision === "APPROVED" ? approvedAmt : null,
      });
      setMsg(`NAAC reimbursement #${modal.id} ${modal.decision === "APPROVED" ? "approved" : "rejected"}.`);
      setModal(null); setExpanded(null); load();
    } catch (e) { alert(e.response?.data?.message || "Action failed."); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-xl shadow mb-8">
      <div className="p-5 border-b flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Award size={18} className="text-purple-600" /> NAAC Accreditation Reimbursement — AYUSH Colleges
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Grade-based reimbursement claims awaiting directorate approval (max ₹15 lakh)</p>
        </div>
        <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">{apps.length} Pending</span>
      </div>

      {msg && (
        <div className="mx-5 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle size={15} /> {msg}
        </div>
      )}

      {loading ? <div className="p-8 text-center text-gray-400">Loading…</div>
      : apps.length === 0 ? (
        <div className="p-8 text-center text-gray-400">
          <CheckCircle size={36} className="mx-auto mb-2 text-green-300" />
          No pending NAAC reimbursement claims.
        </div>
      ) : (
        <div className="divide-y">
          {apps.map((app) => {
            const open  = expanded === app.id;
            const grade = NAAC_GRADE_LABELS[app.naac_grade] || {};
            return (
              <div key={app.id} className="p-4">
                <button className="w-full flex items-center justify-between text-left"
                  onClick={() => setExpanded(open ? null : app.id)}>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 rounded-full p-2 mt-0.5">
                      <Award size={16} className="text-purple-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800">{app.college_name}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${grade.badge}`}>{grade.label}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Accreditation Year: {app.accreditation_year} · {app.applicant_user_name || app.applicant_email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Claim</p>
                      <p className="font-bold text-gray-800 text-sm">{fmtAmt(app.reimbursement_amount)}</p>
                    </div>
                    {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {open && (
                  <div className="mt-4 ml-11 space-y-4">
                    <div className="grid md:grid-cols-3 gap-3 text-sm">
                      {[
                        ["NAAC Grade",       app.naac_grade],
                        ["Accred. Year",     app.accreditation_year],
                        ["Valid Until",      app.accreditation_valid_until || "—"],
                        ["Certificate No.",  app.naac_certificate_number  || "—"],
                        ["Claim Amount",     fmtAmt(app.reimbursement_amount)],
                        ["Submitted",        new Date(app.created_at).toLocaleDateString("en-IN")],
                      ].map(([lbl, val]) => (
                        <div key={lbl} className="bg-gray-50 rounded-lg p-2.5">
                          <p className="text-xs text-gray-400">{lbl}</p>
                          <p className="font-medium text-xs mt-0.5">{val}</p>
                        </div>
                      ))}
                    </div>
                    {app.bank_account_number && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs">
                        <p className="font-semibold text-blue-700 mb-1">Bank Details</p>
                        <p>A/C: {app.bank_account_number} · IFSC: {app.ifsc_code} · Branch: {app.branch_name}</p>
                        <p>Beneficiary: {app.beneficiary_name}</p>
                      </div>
                    )}

                    {/* Documents submitted by applicant */}
                    <DocList docs={[
                      { label: "NAAC Certificate",      path: app.doc_naac_certificate },
                      { label: "Grade Sheet",           path: app.doc_grade_sheet },
                      { label: "Fee Receipt",           path: app.doc_fee_receipt },
                      { label: "Bank Details Document", path: app.doc_bank_details },
                      { label: "Others",                path: app.doc_others },
                    ]} />

                    <div className="border-t pt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-3">Directorate Decision</p>
                      <div className="flex gap-3">
                        <button onClick={() => openModal(app.id, "APPROVED", app.reimbursement_amount)}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                          <CheckCircle size={15} /> Approve
                        </button>
                        <button onClick={() => openModal(app.id, "REJECTED", 0)}
                          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600">
                          <XCircle size={15} /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h4 className="font-semibold text-gray-800">{modal.decision === "APPROVED" ? "Approve" : "Reject"} NAAC Claim #{modal.id}</h4>
            <p className="text-xs text-gray-500">Directorate — NAAC Accreditation Reimbursement Decision</p>
            {modal.decision === "APPROVED" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Approved Amount (₹) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <IndianRupee size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input type="number" min="0" max="1500000" value={approvedAmt}
                    onChange={(e) => setApprovedAmt(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm" />
                </div>
                <p className="text-xs text-gray-400 mt-1">Maximum cap: ₹15,00,000</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Add remarks..." />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600">Cancel</button>
              <button onClick={submitDecision} disabled={saving}
                className={`px-5 py-2 text-sm text-white rounded-lg disabled:opacity-60 ${modal.decision === "APPROVED" ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"}`}>
                {saving ? "Saving…" : `Confirm ${modal.decision === "APPROVED" ? "Approval" : "Rejection"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NABHReimbursementReview() {
  const [apps, setApps]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [modal, setModal]       = useState(null);
  const [remarks, setRemarks]   = useState("");
  const [approvedAmt, setApprovedAmt] = useState("");
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState("");

  const fmtAmt = (n) => n != null ? `₹${parseFloat(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—";

  const load = async () => {
    setLoading(true);
    try {
      const r = await axiosInstance.get(`${API}/api/admin/nabh-reimbursement/pending`);
      setApps(r.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openModal = (id, decision, claimed) => {
    setModal({ id, decision });
    setRemarks("");
    setApprovedAmt(decision === "APPROVED" ? String(claimed) : "");
  };

  const submitDecision = async () => {
    if (!modal) return;
    if (modal.decision === "APPROVED" && !approvedAmt) return alert("Please enter approved amount.");
    setSaving(true);
    try {
      await axiosInstance.put(`${API}/api/admin/nabh-reimbursement/${modal.id}`, {
        decision: modal.decision, remarks,
        approved_amount: modal.decision === "APPROVED" ? approvedAmt : null,
      });
      setMsg(`NABH reimbursement #${modal.id} ${modal.decision === "APPROVED" ? "approved" : "rejected"}.`);
      setModal(null); setExpanded(null); load();
    } catch (e) { alert(e.response?.data?.message || "Action failed."); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-xl shadow mb-8">
      <div className="p-5 border-b flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Award size={18} className="text-emerald-600" /> NABH Accreditation Fee Reimbursement — AYUSH Hospitals
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Reimbursement claims for NABH accreditation fees awaiting directorate approval</p>
        </div>
        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">{apps.length} Pending</span>
      </div>

      {msg && (
        <div className="mx-5 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle size={15} /> {msg}
        </div>
      )}

      {loading ? <div className="p-8 text-center text-gray-400">Loading…</div>
      : apps.length === 0 ? (
        <div className="p-8 text-center text-gray-400">
          <CheckCircle size={36} className="mx-auto mb-2 text-green-300" />
          No pending NABH reimbursement claims.
        </div>
      ) : (
        <div className="divide-y">
          {apps.map((app) => {
            const open = expanded === app.id;
            return (
              <div key={app.id} className="p-4">
                <button className="w-full flex items-center justify-between text-left"
                  onClick={() => setExpanded(open ? null : app.id)}>
                  <div className="flex items-start gap-3">
                    <div className="bg-emerald-100 rounded-full p-2 mt-0.5">
                      <Award size={16} className="text-emerald-700" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{app.hospital_name}</p>
                      <p className="text-xs text-gray-500">
                        {app.nabh_accreditation_type} · Year {app.accreditation_year} · {app.applicant_user_name || app.applicant_email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Fee Paid</p>
                      <p className="font-bold text-gray-800 text-sm">{fmtAmt(app.fee_paid_amount)}</p>
                    </div>
                    {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {open && (
                  <div className="mt-4 ml-11 space-y-4">
                    <div className="grid md:grid-cols-3 gap-3 text-sm">
                      {[
                        ["Accreditation Type",    app.nabh_accreditation_type || "—"],
                        ["Certificate No.",       app.nabh_certificate_number || "—"],
                        ["Valid From",            app.nabh_valid_from ? new Date(app.nabh_valid_from).toLocaleDateString("en-IN") : "—"],
                        ["Valid To",              app.nabh_valid_to   ? new Date(app.nabh_valid_to).toLocaleDateString("en-IN")   : "—"],
                        ["Fee Paid",              fmtAmt(app.fee_paid_amount)],
                        ["Requested Amount",      app.requested_amount ? fmtAmt(app.requested_amount) : "Full amount"],
                        ["Submitted",             new Date(app.created_at).toLocaleDateString("en-IN")],
                        ["Applicant Email",       app.applicant_email || "—"],
                      ].map(([lbl, val]) => (
                        <div key={lbl} className="bg-gray-50 rounded-lg p-2.5">
                          <p className="text-xs text-gray-400">{lbl}</p>
                          <p className="font-medium text-xs mt-0.5">{val}</p>
                        </div>
                      ))}
                    </div>

                    {app.bank_account_number && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs">
                        <p className="font-semibold text-blue-700 mb-1">Bank Details</p>
                        <p>A/C: {app.bank_account_number} · IFSC: {app.ifsc_code} · Branch: {app.branch_name}</p>
                        <p>Beneficiary: {app.beneficiary_name}</p>
                      </div>
                    )}

                    <DocList docs={[
                      { label: "NABH Accreditation Certificate", path: app.doc_nabh_certificate },
                      { label: "Fee Receipt / Payment Proof",    path: app.doc_fee_receipt },
                      { label: "Bank Details Document",          path: app.doc_bank_details },
                      { label: "Other Documents",                path: app.doc_others },
                    ]} />

                    <div className="border-t pt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-3">Directorate Decision</p>
                      <div className="flex gap-3">
                        <button onClick={() => openModal(app.id, "APPROVED", app.requested_amount || app.fee_paid_amount)}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                          <CheckCircle size={15} /> Approve
                        </button>
                        <button onClick={() => openModal(app.id, "REJECTED", 0)}
                          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600">
                          <XCircle size={15} /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h4 className="font-semibold text-gray-800">{modal.decision === "APPROVED" ? "Approve" : "Reject"} NABH Claim #{modal.id}</h4>
            <p className="text-xs text-gray-500">Directorate — NABH Accreditation Fee Reimbursement Decision</p>
            {modal.decision === "APPROVED" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Approved Amount (₹) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <IndianRupee size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input type="number" min="0" value={approvedAmt}
                    onChange={(e) => setApprovedAmt(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm" />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Add remarks..." />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600">Cancel</button>
              <button onClick={submitDecision} disabled={saving}
                className={`px-5 py-2 text-sm text-white rounded-lg disabled:opacity-60 ${modal.decision === "APPROVED" ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"}`}>
                {saving ? "Saving…" : `Confirm ${modal.decision === "APPROVED" ? "Approval" : "Rejection"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExamFeeReimbursementReview() {
  const [apps, setApps]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [modal, setModal]     = useState(null);
  const [remarks, setRemarks] = useState("");
  const [approvedAmt, setApprovedAmt] = useState("");
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState("");

  const fmt = (n) => n != null ? `₹${parseFloat(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—";

  const load = async () => {
    setLoading(true);
    try {
      const r = await axiosInstance.get(`${API}/api/admin/exam-fee/pending`);
      setApps(r.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openModal = (id, decision) => { setModal({ id, decision }); setRemarks(""); setApprovedAmt(""); };

  const submitDecision = async () => {
    if (!modal) return;
    if (modal.decision === "APPROVED" && !approvedAmt) return alert("Please enter approved amount.");
    setSaving(true);
    try {
      await axiosInstance.put(`${API}/api/admin/exam-fee/${modal.id}`, {
        decision: modal.decision, remarks,
        approved_amount: modal.decision === "APPROVED" ? approvedAmt : null,
      });
      setMsg(`Application #${modal.id} has been ${modal.decision === "APPROVED" ? "approved" : "rejected"}.`);
      setModal(null);
      setExpanded(null);
      load();
    } catch (e) { alert(e.response?.data?.message || "Action failed."); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-xl shadow mb-8">
      <div className="p-5 border-b flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FileText size={18} className="text-emerald-600" /> Exam Fee Reimbursement — Yoga Professionals
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Board-certified course fee claims awaiting directorate approval</p>
        </div>
        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
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
          No pending exam fee reimbursement claims.
        </div>
      ) : (
        <div className="divide-y">
          {apps.map((app) => {
            const open = expanded === app.id;
            return (
              <div key={app.id} className="p-4">
                <button className="w-full flex items-center justify-between text-left"
                  onClick={() => setExpanded(open ? null : app.id)}>
                  <div className="flex items-start gap-3">
                    <div className="bg-emerald-100 rounded-full p-2 mt-0.5">
                      <FileText size={16} className="text-emerald-700" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{app.course_name}</p>
                      <p className="text-xs text-gray-500">
                        {app.certifying_board} · {app.applicant_name} · {app.applicant_user_name || app.applicant_email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Claimed</p>
                      <p className="font-bold text-gray-800 text-sm">{fmt(app.claimed_amount)}</p>
                    </div>
                    {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {open && (
                  <div className="mt-4 ml-11 space-y-4">
                    <div className="grid md:grid-cols-3 gap-3 text-sm">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Exam Fee Paid</p>
                        <p className="font-bold">{fmt(app.exam_fee_paid)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Claimed Amount</p>
                        <p className="font-bold">{fmt(app.claimed_amount)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Completion Date</p>
                        <p className="font-bold">{new Date(app.completion_date).toLocaleDateString("en-IN")}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Registration No.</p>
                        <p className="font-medium text-xs">{app.registration_number || "—"}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Exam Centre</p>
                        <p className="font-medium text-xs">{app.exam_center || "—"}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Submitted On</p>
                        <p className="font-medium text-xs">{new Date(app.created_at).toLocaleDateString("en-IN")}</p>
                      </div>
                    </div>

                    {app.bank_account_number && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs">
                        <p className="font-semibold text-blue-700 mb-1">Bank Details</p>
                        <p>A/C: {app.bank_account_number} · IFSC: {app.ifsc_code} · Branch: {app.branch_name}</p>
                        <p>Beneficiary: {app.beneficiary_name}</p>
                      </div>
                    )}

                    {/* Documents submitted by applicant */}
                    <DocList docs={[
                      { label: "Course Certificate",      path: app.doc_certificate },
                      { label: "Fee Receipt",             path: app.doc_fee_receipt },
                      { label: "Mark Sheet",              path: app.doc_marksheet },
                      { label: "ID Proof",                path: app.doc_id_proof },
                      { label: "Board Approval Letter",   path: app.doc_board_approval },
                    ]} />

                    <div className="border-t pt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-3">Directorate Decision</p>
                      <div className="flex gap-3">
                        <button onClick={() => openModal(app.id, "APPROVED")}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                          <CheckCircle size={15} /> Approve
                        </button>
                        <button onClick={() => openModal(app.id, "REJECTED")}
                          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600">
                          <XCircle size={15} /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h4 className="font-semibold text-gray-800">
              {modal.decision === "APPROVED" ? "Approve" : "Reject"} Claim #{modal.id}
            </h4>
            <p className="text-xs text-gray-500">Directorate — Exam Fee Reimbursement Decision</p>
            {modal.decision === "APPROVED" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Approved Amount (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <IndianRupee size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input type="number" min="0" value={approvedAmt}
                    onChange={(e) => setApprovedAmt(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm" />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Add remarks..." />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600">Cancel</button>
              <button onClick={submitDecision} disabled={saving}
                className={`px-5 py-2 text-sm text-white rounded-lg disabled:opacity-60 ${modal.decision === "APPROVED" ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"}`}>
                {saving ? "Saving…" : `Confirm ${modal.decision === "APPROVED" ? "Approval" : "Rejection"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TrainerFeeReview() {
  const [apps, setApps]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [modal, setModal]       = useState(null);
  const [remarks, setRemarks]   = useState("");
  const [approvedAmt, setApprovedAmt] = useState("");
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState("");


  const INSTITUTE_LABELS = {
    INSTITUTION: "Institution", HOMESTAY: "Home Stay", RESORT: "Resort",
    HOTEL: "Hotel", SCHOOL: "School", COLLEGE: "College",
    YOGA_CENTRE: "Yoga Centre", YOGA_INSTITUTE: "Yoga Institute",
  };

  const load = async () => {
    setLoading(true);
    try {
      const r = await axiosInstance.get(`${API}/api/admin/trainer-fee/pending`);
      setApps(r.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openModal = (id, decision, claimed) => {
    setModal({ id, decision });
    setRemarks("");
    setApprovedAmt(decision === "APPROVED" ? String(claimed) : "");
  };

  const submitDecision = async () => {
    if (!modal) return;
    if (modal.decision === "APPROVED" && !approvedAmt) return alert("Please enter approved amount.");
    setSaving(true);
    try {
      await axiosInstance.put(`${API}/api/admin/trainer-fee/${modal.id}`, {
        decision: modal.decision, remarks,
        approved_amount: modal.decision === "APPROVED" ? approvedAmt : null,
      });
      setMsg(`Trainer fee claim #${modal.id} ${modal.decision === "APPROVED" ? "approved" : "rejected"}.`);
      setModal(null); setExpanded(null); load();
    } catch (e) { alert(e.response?.data?.message || "Action failed."); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-xl shadow mb-8">
      <div className="p-5 border-b flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Users size={18} className="text-orange-600" /> Trainer Fee Reimbursement — Institutions
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            3-month claims · ₹250/session · Max 20 sessions/month · Cap ₹5,000/month · Total ₹15,000
          </p>
        </div>
        <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
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
          No pending trainer fee reimbursement claims.
        </div>
      ) : (
        <div className="divide-y">
          {apps.map((app) => {
            const open = expanded === app.id;
            return (
              <div key={app.id} className="p-4">
                <button className="w-full flex items-center justify-between text-left"
                  onClick={() => setExpanded(open ? null : app.id)}>
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-100 rounded-full p-2 mt-0.5">
                      <Users size={16} className="text-orange-700" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{app.institute_name}</p>
                      <p className="text-xs text-gray-500">
                        {INSTITUTE_LABELS[app.institute_type] || app.institute_type}
                        {" · "}{app.month_1_label} – {app.month_3_label}
                        {" · "}{app.applicant_user_name || app.applicant_email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Claimed</p>
                      <p className="font-bold text-gray-800 text-sm">{fmt(app.total_claimed_amount)}</p>
                    </div>
                    {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {open && (
                  <div className="mt-4 ml-11 space-y-4">
                    {/* Monthly breakdown */}
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3].map((n) => (
                        <div key={n} className="bg-orange-50 border border-orange-100 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-500">{app[`month_${n}_label`]}</p>
                          <p className="text-sm font-bold text-gray-800 mt-1">{app[`month_${n}_sessions`]} sessions</p>
                          <p className="text-sm font-semibold text-orange-700">{fmt(app[`month_${n}_amount`])}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      {[
                        ["Trainer", app.trainer_name || "—"],
                        ["Qualification", app.trainer_qualification || "—"],
                        ["Cert. No.", app.trainer_cert_number || "—"],
                        ["Contact Person", app.contact_person || "—"],
                        ["Phone", app.contact_phone || "—"],
                        ["Submitted", new Date(app.created_at).toLocaleDateString("en-IN")],
                      ].map(([lbl, val]) => (
                        <div key={lbl} className="bg-gray-50 rounded-lg p-2.5">
                          <p className="text-xs text-gray-400">{lbl}</p>
                          <p className="font-medium text-xs mt-0.5">{val}</p>
                        </div>
                      ))}
                    </div>

                    {app.bank_account_number && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs">
                        <p className="font-semibold text-blue-700 mb-1">Bank Details</p>
                        <p>A/C: {app.bank_account_number} · IFSC: {app.ifsc_code} · Branch: {app.branch_name}</p>
                        <p>Beneficiary: {app.beneficiary_name}</p>
                      </div>
                    )}

                    {/* Documents submitted by applicant */}
                    <DocList docs={[
                      { label: "Month 1 Attendance Sheet",  path: app.doc_attendance_m1 },
                      { label: "Month 2 Attendance Sheet",  path: app.doc_attendance_m2 },
                      { label: "Month 3 Attendance Sheet",  path: app.doc_attendance_m3 },
                      { label: "Trainer Certificate",       path: app.doc_trainer_certificate },
                      { label: "Others",                    path: app.doc_others },
                    ]} />

                    <div className="border-t pt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-3">Directorate Decision</p>
                      <div className="flex gap-3">
                        <button onClick={() => openModal(app.id, "APPROVED", app.total_claimed_amount)}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                          <CheckCircle size={15} /> Approve
                        </button>
                        <button onClick={() => openModal(app.id, "REJECTED", 0)}
                          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600">
                          <XCircle size={15} /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h4 className="font-semibold text-gray-800">
              {modal.decision === "APPROVED" ? "Approve" : "Reject"} Trainer Fee Claim #{modal.id}
            </h4>
            <p className="text-xs text-gray-500">Directorate — Trainer Fee Reimbursement Decision</p>
            {modal.decision === "APPROVED" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Approved Amount (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <IndianRupee size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input type="number" min="0" max="15000" value={approvedAmt}
                    onChange={(e) => setApprovedAmt(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm" />
                </div>
                <p className="text-xs text-gray-400 mt-1">Maximum: ₹15,000</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Add remarks or conditions..." />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600">Cancel</button>
              <button onClick={submitDecision} disabled={saving}
                className={`px-5 py-2 text-sm text-white rounded-lg disabled:opacity-60 ${modal.decision === "APPROVED" ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"}`}>
                {saving ? "Saving…" : `Confirm ${modal.decision === "APPROVED" ? "Approval" : "Rejection"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Directorate = ({ activeTab }) => {
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
        console.error("Error fetching Directorate profile:", err);
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
    if (activeTab === "approvals" || activeTab === "entity_approvals") {
      fetchPendingUsers(filterStatus);
    }
  }, [activeTab, filterStatus]);

  const handleAction = async (targetUserId, decision) => {
    if (!window.confirm(`Are you sure you want to ${decision} this registration request?`)) return;
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
      title: "Total State Entities",
      value: stats ? stats.totalEntities : "0",
      desc: "All approved AYUSH entities in the state",
      icon: Building,
      color: "bg-blue-600"
    },
    {
      title: "Pending Approvals",
      value: stats ? stats.pendingVerifications : "0",
      desc: "Applications awaiting admin approval",
      icon: FileText,
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

  const districtStats = stats ? stats.districtStats : [];

  const incentiveSchemes = stats ? stats.schemesStats : [];

  const pendingApprovals = [];

  const complianceReports = [];

  const budgetBreakdown = (stats ? stats.schemesStats : []).map(s => {
    const rawVal = parseFloat(s.amount.replace(/[^\d.]/g, '')) || 0;
    const allocatedVal = 1000000; // 10 Lakhs allocated per scheme for demo
    return {
      category: s.scheme,
      allocated: "₹10,00,000",
      utilized: s.amount,
      percentage: Math.min(100, (rawVal / allocatedVal) * 100).toFixed(1)
    };
  });

  if (activeTab === "approvals") {
    const districtOfficers = pendingUsers.filter(u => u.role === "district_officer");
    return (
      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <CheckCircle className="text-teal-600" size={32} />
            District Officer Registration Approvals
          </h1>
          <p className="text-gray-500 mt-1">Review and approve registrations for District Administration Officers</p>
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
          ) : districtOfficers.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-medium bg-gray-50 rounded-xl">
              No {filterStatus} District Officer registrations found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Officer Details</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">District</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID Details</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Documents</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Submitted On</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {districtOfficers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">{u.full_name}</div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                        <div className="text-sm text-gray-500">{u.phone}</div>
                        <div className="text-xs mt-1 text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded-full inline-block">
                          Designation: {u.designation || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                        {u.district || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                        <div>Employee ID: {u.employee_id || "N/A"}</div>
                        <div className="mt-1">ID Type: {u.id_type || "N/A"} ({u.id_number || "N/A"})</div>
                      </td>
                      <td className="px-6 py-4 space-y-1 text-sm">
                        {u.id_upload_path ? (
                          <a
                            href={`${API}${u.id_upload_path}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline block font-semibold"
                          >
                            📄 View ID Upload
                          </a>
                        ) : (
                          <span className="text-gray-400">No ID File</span>
                        )}
                        {u.authority_order_path ? (
                          <a
                            href={`${API}${u.authority_order_path}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline block font-semibold"
                          >
                            📄 View Authority Order
                          </a>
                        ) : (
                          <span className="text-gray-400">No Authority File</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {filterStatus === "pending" ? (
                          <>
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
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                            filterStatus === "approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}>
                            {filterStatus === "approved" ? "Approved" : "Rejected"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === "entity_approvals") {
    const otherEntities = pendingUsers.filter(u => u.role !== "district_officer");
    const roleLabels = {
      wellness_centre: "Wellness Centre",
      yoga_centre: "Yoga Centre",
      yoga_professional: "Yoga Professional",
      ayush_hospital: "AYUSH Hospital",
      ayush_college: "AYUSH College",
      research_org: "Research Org"
    };

    return (
      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Award className="text-teal-600" size={32} />
            State Entity Approvals (Directorate)
          </h1>
          <p className="text-gray-500 mt-1">Review and approve registrations for AYUSH Colleges, Research Institutions, and any other entities</p>
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
          ) : otherEntities.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-medium bg-gray-50 rounded-xl">
              No {filterStatus} entity registrations found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Entity Details</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role Type</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">District</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Submitted On</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {otherEntities.map((u) => (
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
                ) : selectedEntity.role === "research_org" ? (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b pb-2">Research Institution Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-semibold text-gray-800 block">Applicant Name</span> 
                        <span className="text-gray-900">{selectedEntity.ro_applicant_name || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">Designation</span> 
                        <span className="text-gray-900">{selectedEntity.ro_designation || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">Organization Name</span> 
                        <span className="text-gray-900">{selectedEntity.ro_organization_name || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">Organization Type</span> 
                        <span className="text-gray-900">{selectedEntity.ro_organization_type || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">District</span> 
                        <span className="text-gray-900">{selectedEntity.district || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">Work Experience (Years)</span> 
                        <span className="text-gray-900">{selectedEntity.ro_work_experience_years || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">Email Address</span> 
                        <span className="text-gray-900">{selectedEntity.ro_email || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">Contact Number</span> 
                        <span className="text-gray-900">{selectedEntity.ro_contact_number || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">Registration Doc ID</span> 
                        <span className="text-gray-900">{selectedEntity.ro_registration_doc_id || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">Website</span>
                        {selectedEntity.ro_website ? (
                          <a href={selectedEntity.ro_website} target="_blank" rel="noreferrer" className="text-teal-600 font-semibold hover:underline text-sm break-all">
                            {selectedEntity.ro_website}
                          </a>
                        ) : <span className="text-gray-500">N/A</span>}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">GPS Coordinates</span> 
                        <span className="text-gray-900">
                          {selectedEntity.ro_latitude && selectedEntity.ro_longitude ? `${selectedEntity.ro_latitude}, ${selectedEntity.ro_longitude}` : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">Funding Received till Date</span> 
                        <span className="text-gray-900">₹{parseFloat(selectedEntity.ro_funding_received || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold text-gray-800 block">Physical Address</span> 
                        <span className="text-gray-900 block bg-gray-50 p-3 rounded-lg border border-gray-100">{selectedEntity.ro_physical_address || "N/A"}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold text-gray-800 block">Projects Completed</span> 
                        <span className="text-gray-900 block bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-line">{selectedEntity.ro_projects_completed || "N/A"}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold text-gray-800 block">Brief Association with Yoga</span> 
                        <span className="text-gray-900 block bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-line">{selectedEntity.ro_association_with_yoga || "N/A"}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold text-gray-800 block">Organization Affiliations</span> 
                        <span className="text-gray-900 block bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-line">{selectedEntity.ro_affiliations || "N/A"}</span>
                      </div>
                      <div className="col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                        <div className="font-bold text-slate-700 text-xs uppercase tracking-wider">Uploaded Documents</div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="font-semibold text-gray-800 block text-xs mb-1">Registration Document</span>
                            {selectedEntity.ro_registration_doc_path ? (
                              <a 
                                href={`${API}/${selectedEntity.ro_registration_doc_path}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-teal-600 font-semibold hover:underline inline-flex items-center gap-1 text-sm"
                              >
                                <FileText size={14} /> View Registration Doc
                              </a>
                            ) : <span className="text-xs text-gray-400 italic">Not Uploaded</span>}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-800 block text-xs mb-1">Relevant Documents</span>
                            {selectedEntity.ro_relevant_docs_paths && selectedEntity.ro_relevant_docs_paths.length > 0 ? (
                              <div className="space-y-1.5">
                                {selectedEntity.ro_relevant_docs_paths.map((path, idx) => (
                                  <a 
                                    key={idx}
                                    href={`${API}/${path}`} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-teal-600 font-semibold hover:underline flex items-center gap-1 text-sm"
                                  >
                                    <FileText size={14} /> Document #{idx + 1}
                                  </a>
                                ))}
                              </div>
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
          Welcome Back, {profile?.full_name || "Directorate Officer"}!
        </h1>
        <p className="text-gray-500 font-semibold mt-1">State AYUSH Directorate Dashboard</p>
      </div>

      {/* Trainer Fee Reimbursement Review */}
      <TrainerFeeReview />

      {/* NABH Accreditation Fee Reimbursement Review */}
      <NABHReimbursementReview />

      {/* NAAC Reimbursement Review */}
      <NAACReimbursementReview />

      {/* Exam Fee Reimbursement Review */}
      <ExamFeeReimbursementReview />

      {/* Research Grant Review */}
      <ResearchGrantReview />

      {/* Yoga TC Directorate Review */}
      <YogaTCDirectorateReview />

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
                Review Reports
              </button>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* District-wise Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">District-wise Statistics</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">District</th>
                <th className="text-left px-4 py-2">Total Entities</th>
                <th className="text-left px-4 py-2">Incentives Disbursed</th>
                <th className="text-left px-4 py-2">Pending</th>
                <th className="text-left px-4 py-2">District Officer</th>
              </tr>
            </thead>
            <tbody>
              {districtStats.map((district, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{district.district}</td>
                  <td className="px-4 py-2">{district.entities}</td>
                  <td className="px-4 py-2">{district.incentives}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      district.pending === 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {district.pending}
                    </span>
                  </td>
                  <td className="px-4 py-2">{district.officer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incentive Schemes Overview */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Incentive Schemes Overview</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Scheme Name</th>
                <th className="text-left px-4 py-2">Total Applications</th>
                <th className="text-left px-4 py-2">Approved</th>
                <th className="text-left px-4 py-2">Total Amount</th>
                <th className="text-left px-4 py-2">Budget Utilization</th>
              </tr>
            </thead>
            <tbody>
              {incentiveSchemes.map((scheme, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{scheme.scheme}</td>
                  <td className="px-4 py-2">{scheme.totalApplications}</td>
                  <td className="px-4 py-2">{scheme.approved}</td>
                  <td className="px-4 py-2">{scheme.amount}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${scheme.utilization}` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{scheme.utilization}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Directorate Approvals */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Pending Directorate Approvals</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Type</th>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">District</th>
                <th className="text-left px-4 py-2">Submitted Date</th>
                <th className="text-left px-4 py-2">Priority</th>
                <th className="text-left px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingApprovals.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{item.type}</td>
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">{item.district}</td>
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

      {/* Budget Utilization */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Budget Utilization</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Category</th>
                <th className="text-left px-4 py-2">Allocated</th>
                <th className="text-left px-4 py-2">Utilized</th>
                <th className="text-left px-4 py-2">Utilization %</th>
                <th className="text-left px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {budgetBreakdown.map((budget, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{budget.category}</td>
                  <td className="px-4 py-2">{budget.allocated}</td>
                  <td className="px-4 py-2">{budget.utilized}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            budget.percentage >= 80 
                              ? 'bg-green-500' 
                              : budget.percentage >= 50
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${budget.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{budget.percentage}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      budget.percentage >= 80 
                        ? 'bg-green-100 text-green-700' 
                        : budget.percentage >= 50
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {budget.percentage >= 80 ? 'Good' : budget.percentage >= 50 ? 'Moderate' : 'Low'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Reports */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Compliance Reports Status</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Report Type</th>
                <th className="text-left px-4 py-2">Due Date</th>
                <th className="text-left px-4 py-2">Submitted</th>
                <th className="text-left px-4 py-2">Pending</th>
                <th className="text-left px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {complianceReports.map((report, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{report.type}</td>
                  <td className="px-4 py-2">{report.dueDate}</td>
                  <td className="px-4 py-2">{report.submitted}</td>
                  <td className="px-4 py-2">{report.pending}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      report.status === 'On Track' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {report.status}
                    </span>
                  </td>
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
          Approve Incentives
        </button>
        <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm flex items-center">
          <BarChart3 className="mr-2" size={16} />
          Generate Reports
        </button>
        <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm flex items-center">
          <Award className="mr-2" size={16} />
          Manage Schemes
        </button>
      </div>
    </div>
  );
};

export default Directorate;