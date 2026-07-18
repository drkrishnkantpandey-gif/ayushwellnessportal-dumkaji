import API from '../../config/api';
import React, { useState, useEffect } from "react";
import axiosInstance from '../../config/axiosInstance';
const headers = {};
import {
  PlusCircle, FileText, CheckCircle, Clock, XCircle,
  ChevronDown, ChevronUp, Upload, IndianRupee, AlertCircle,
  User, Users, Building2, Trash2, Landmark, BookOpen, Save, Lock
} from "lucide-react";


const MAX_AMOUNT = 1000000;

const ORG_TYPES = [
  "University",
  "College",
  "AYUSH Organization",
  "AYUSH Related NGO",
  "Yoga Research Institution",
  "Health Organization"
];

const DISTRICT_OPTIONS = [
  "Almora",
  "Bageshwar",
  "Chamoli",
  "Champawat",
  "Dehradun",
  "Haridwar",
  "Nainital",
  "Pauri Garhwal",
  "Pithoragarh",
  "Rudraprayag",
  "Tehri Garhwal",
  "Udham Singh Nagar",
  "Uttarkashi"
];

const STATUS_META = {
  SUBMITTED:    { label: "Submitted",     color: "bg-blue-100 text-blue-700",    icon: Clock        },
  UNDER_REVIEW: { label: "Under Review",  color: "bg-yellow-100 text-yellow-700",icon: Clock        },
  APPROVED:     { label: "Approved ✓",   color: "bg-emerald-100 text-emerald-700",icon: CheckCircle },
  REJECTED:     { label: "Rejected",      color: "bg-red-100 text-red-700",      icon: XCircle      },
};

const WINDOW_INFO = {
  APR_MAY: { label: "April – May",     review: "June",     color: "bg-emerald-50 border-emerald-300 text-emerald-800" },
  OCT_NOV: { label: "October – November", review: "December", color: "bg-blue-50 border-blue-300 text-blue-800" },
};

const fmt = (n) =>
  n != null ? `₹${parseFloat(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—";

function getActiveWindow() {
  const m = new Date().getMonth() + 1;
  if (m === 4 || m === 5)  return "APR_MAY";
  if (m === 10 || m === 11) return "OCT_NOV";
  return null;
}
function getNextWindowText() {
  const m = new Date().getMonth() + 1;
  if (m < 4)  return "April";
  if (m < 10) return "October";
  return "April (next year)";
}

const STEPS = [
  { id: 1, label: "Organisation & Team" },
  { id: 2, label: "Investigators"       },
  { id: 3, label: "Project Overview"    },
  { id: 4, label: "Budget"              },
  { id: 5, label: "Summary & Submit"    }
];

const BLANK_COPI = {
  name: "",
  dob: "",
  dob_proof_path: "",
  id_proof_path: "",
  qualifications: [""],
  qualifications_doc_path: "",
  position: "",
  position_other: "",
  position_proof_path: ""
};

const BLANK_FORM = {
  organization_name: "",
  organization_type: "",
  yoga_experience_years: "",
  doc_proof_path: "",
  application_window: getActiveWindow() || "APR_MAY",
  received_prior_grant: false,
  prior_grant_app_number: "",
  prior_grant_approval_doc_path: "",
  behalf_affidavit_path: "",
  completed_research_count: "",
  max_funding_amount: "",
  research_proof_doc_path: "",
  applicant_name: "",
  applicant_designation: "",
  authorized_by: "",
  authorization_letter_path: "",
  no_prior_grant_affidavit_path: "",
  pi_name: "",
  pi_dob: "",
  pi_dob_proof_path: "",
  pi_id_proof_path: "",
  pi_qualifications: [""],
  pi_qualifications_doc_path: "",
  pi_position: "",
  pi_position_other: "",
  pi_position_proof_path: "",
  co_pis: [],
  title: "",
  abstract: "",
  synopsis_path: "",
  research_duration_months: "",
  other_doc_path: "",
  expected_outcomes: "",
  literature_review: "",
  methodology: "",
  timeline: "",
  milestone_chart_path: "",
  requested_amount: "",
  budget_equipment: "",
  budget_manpower: "",
  budget_documentation: "",
  budget_travel: "",
  budget_contingency: "",
  budget_details_doc_path: "",
  ethical_clearance_doc_path: "",
  team_cvs_path: "",
  other_relevant_doc_path: "",
  other_relevant_doc_desc: "",
  originality_affidavit_path: ""
};

export function printResearchApplication(app, apiBaseUrl) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return alert("Please allow popups to download/print the PDF.");
  
  const coPisArr = typeof app.co_pis === 'string' ? JSON.parse(app.co_pis) : (app.co_pis || []);
  const coPisHtml = coPisArr.map((c, i) => `
    <div style="margin-top: 10px; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h4 style="margin: 0 0 5px 0; color: #374151;">Co-Principal Investigator #${i + 1}</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr><td style="width: 30%; font-weight: 600; padding: 4px 0;">Name:</td><td>${c.name || "—"}</td></tr>
        <tr><td style="font-weight: 600; padding: 4px 0;">DOB:</td><td>${c.dob || "—"}</td></tr>
        <tr><td style="font-weight: 600; padding: 4px 0;">Position:</td><td>${c.position === 'Other' ? c.position_other : c.position || "—"}</td></tr>
        <tr><td style="font-weight: 600; padding: 4px 0;">Qualifications:</td><td>${(c.qualifications || []).filter(q => q.trim()).join(', ') || "—"}</td></tr>
        <tr>
          <td style="font-weight: 600; padding: 4px 0;">Documents:</td>
          <td>
            ${c.dob_proof_path ? `<a href="${apiBaseUrl}${c.dob_proof_path}" target="_blank" style="color: #2563eb; text-decoration: none; margin-right: 10px;">DOB Proof</a>` : ""}
            ${c.id_proof_path ? `<a href="${apiBaseUrl}${c.id_proof_path}" target="_blank" style="color: #2563eb; text-decoration: none; margin-right: 10px;">ID Proof</a>` : ""}
            ${c.qualifications_doc_path ? `<a href="${apiBaseUrl}${c.qualifications_doc_path}" target="_blank" style="color: #2563eb; text-decoration: none; margin-right: 10px;">Qualification Proof</a>` : ""}
            ${c.position_proof_path ? `<a href="${apiBaseUrl}${c.position_proof_path}" target="_blank" style="color: #2563eb; text-decoration: none;">Position Proof</a>` : ""}
          </td>
        </tr>
      </table>
    </div>
  `).join("");

  const budgetTotal = (parseFloat(app.budget_equipment) || 0) +
                      (parseFloat(app.budget_manpower) || 0) +
                      (parseFloat(app.budget_documentation) || 0) +
                      (parseFloat(app.budget_travel) || 0) +
                      (parseFloat(app.budget_contingency) || 0);

  const html = `
    <html>
      <head>
        <title>Research Grant Application - ${app.serial_number || "Draft"}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1f2937; line-height: 1.5; }
          .header { text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 20px; color: #111827; }
          .header h2 { margin: 5px 0 0 0; font-size: 13px; font-weight: 500; color: #4b5563; text-transform: uppercase; }
          .serial-box { margin-top: 15px; font-size: 14px; font-weight: 700; color: #065f46; background-color: #ecfdf5; display: inline-block; padding: 6px 16px; border-radius: 9999px; border: 1px solid #a7f3d0; }
          .section { margin-bottom: 25px; page-break-inside: avoid; }
          .section-title { font-size: 15px; font-weight: 700; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          td { padding: 6px 8px; font-size: 13px; vertical-align: top; border-bottom: 1px solid #f3f4f6; }
          .label-col { width: 35%; font-weight: 600; color: #4b5563; }
          .value-col { color: #111827; }
          .doc-link { color: #2563eb; text-decoration: none; font-weight: 500; }
          .doc-link:hover { text-decoration: underline; }
          @media print {
            body { padding: 10px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>DEPARTMENT OF AYUSH & AYUSH EDUCATION</h1>
          <h2>Government of Uttarakhand</h2>
          <h2 style="margin-top: 8px; font-weight: 700; font-size: 15px; color: #059669;">Application for Research Project Grant</h2>
          <div class="serial-box">Serial No: ${app.serial_number || "Not Submitted"}</div>
        </div>

        <div class="section">
          <div class="section-title">1. Organisation & Team Details</div>
          <table>
            <tr><td class="label-col">Name of Organisation:</td><td class="value-col">${app.organization_name || "—"}</td></tr>
            <tr><td class="label-col">Organisation Type:</td><td class="value-col">${app.organization_type || "—"}</td></tr>
            ${app.yoga_experience_years ? `<tr><td class="label-col">Years of Experience in Yoga Field:</td><td class="value-col">${app.yoga_experience_years} years</td></tr>` : ""}
            <tr><td class="label-col">Documentary Proof:</td><td class="value-col">${app.doc_proof_path ? `<a href="${apiBaseUrl}${app.doc_proof_path}" target="_blank" class="doc-link">View Uploaded Document</a>` : "—"}</td></tr>
            <tr><td class="label-col">Application Cycle Window:</td><td class="value-col">${app.application_window === 'APR_MAY' ? 'April - May' : 'October - November'} ${app.application_year || ""}</td></tr>
            <tr><td class="label-col">Received Grant Under Yoga Policy 2025:</td><td class="value-col">${app.received_prior_grant ? 'Yes' : 'No'}</td></tr>
            ${app.received_prior_grant ? `
              <tr><td class="label-col">Prior Application Number:</td><td class="value-col">${app.prior_grant_app_number || "—"}</td></tr>
              <tr><td class="label-col">Prior Approval Document:</td><td class="value-col">${app.prior_grant_approval_doc_path ? `<a href="${apiBaseUrl}${app.prior_grant_approval_doc_path}" target="_blank" class="doc-link">View Document</a>` : "—"}</td></tr>
            ` : ""}
            <tr><td class="label-col">Submission Affidavit:</td><td class="value-col">${app.behalf_affidavit_path ? `<a href="${apiBaseUrl}${app.behalf_affidavit_path}" target="_blank" class="doc-link">View Affidavit</a>` : "—"}</td></tr>
            <tr><td class="label-col">Completed Research Works (min 6 months):</td><td class="value-col">${app.completed_research_count || "0"}</td></tr>
            <tr><td class="label-col">Maximum Funding for Single Project:</td><td class="value-col">${app.max_funding_amount ? `₹${parseFloat(app.max_funding_amount).toLocaleString('en-IN')}` : "—"}</td></tr>
            <tr><td class="label-col">Proof of Completed Research:</td><td class="value-col">${app.research_proof_doc_path ? `<a href="${apiBaseUrl}${app.research_proof_doc_path}" target="_blank" class="doc-link">View Proof Document</a>` : "—"}</td></tr>
            <tr><td class="label-col">Name of Applicant:</td><td class="value-col">${app.applicant_name || "—"}</td></tr>
            <tr><td class="label-col">Designation of Applicant:</td><td class="value-col">${app.applicant_designation || "—"}</td></tr>
            <tr><td class="label-col">Authorized By:</td><td class="value-col">${app.authorized_by || "—"}</td></tr>
            <tr><td class="label-col">Authorization Letter:</td><td class="value-col">${app.authorization_letter_path ? `<a href="${apiBaseUrl}${app.authorization_letter_path}" target="_blank" class="doc-link">View Authorization Letter</a>` : "—"}</td></tr>
            <tr><td class="label-col">No Prior Grant Affidavit:</td><td class="value-col">${app.no_prior_grant_affidavit_path ? `<a href="${apiBaseUrl}${app.no_prior_grant_affidavit_path}" target="_blank" class="doc-link">View Affidavit</a>` : "—"}</td></tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">2. Research Investigators</div>
          <h3 style="font-size: 14px; margin: 0 0 10px 0; color: #111827; border-bottom: 1px dashed #e5e7eb; padding-bottom: 4px;">Principal Investigator (PI)</h3>
          <table>
            <tr><td class="label-col">Name:</td><td class="value-col">${app.pi_name || "—"}</td></tr>
            <tr><td class="label-col">Date of Birth:</td><td class="value-col">${app.pi_dob ? new Date(app.pi_dob).toLocaleDateString('en-IN') : "—"}</td></tr>
            <tr><td class="label-col">DOB Proof:</td><td class="value-col">${app.pi_dob_proof_path ? `<a href="${apiBaseUrl}${app.pi_dob_proof_path}" target="_blank" class="doc-link">View DOB Proof</a>` : "—"}</td></tr>
            <tr><td class="label-col">ID Proof:</td><td class="value-col">${app.pi_id_proof_path ? `<a href="${apiBaseUrl}${app.pi_id_proof_path}" target="_blank" class="doc-link">View ID Proof</a>` : "—"}</td></tr>
            <tr><td class="label-col">Qualifications:</td><td class="value-col">${(typeof app.pi_qualifications === 'string' ? JSON.parse(app.pi_qualifications) : (app.pi_qualifications || [])).filter(q => q.trim()).join(', ') || "—"}</td></tr>
            <tr><td class="label-col">Qualification Proof:</td><td class="value-col">${app.pi_qualifications_doc_path ? `<a href="${apiBaseUrl}${app.pi_qualifications_doc_path}" target="_blank" class="doc-link">View Qualification Proof</a>` : "—"}</td></tr>
            <tr><td class="label-col">Position in Organization:</td><td class="value-col">${app.pi_position === 'Other' ? app.pi_position_other : app.pi_position || "—"}</td></tr>
            <tr><td class="label-col">Proof of Position:</td><td class="value-col">${app.pi_position_proof_path ? `<a href="${apiBaseUrl}${app.pi_position_proof_path}" target="_blank" class="doc-link">View Proof Document</a>` : "—"}</td></tr>
          </table>

          <h3 style="font-size: 14px; margin: 15px 0 10px 0; color: #111827; border-bottom: 1px dashed #e5e7eb; padding-bottom: 4px;">Co-Principal Investigators (Co-PIs)</h3>
          ${coPisHtml || "<p style='font-size: 13px; color: #6b7280; margin: 0;'>No Co-Principal Investigators added.</p>"}
        </div>

        <div class="section" style="page-break-before: always;">
          <div class="section-title">3. Project Overview</div>
          <table>
            <tr><td class="label-col">Title of Project:</td><td class="value-col" style="font-weight: 600;">${app.title || "—"}</td></tr>
            <tr><td class="label-col">Abstract / Summary:</td><td class="value-col">${app.abstract || "—"}</td></tr>
            <tr><td class="label-col">Project Synopsis:</td><td class="value-col">${app.synopsis_path ? `<a href="${apiBaseUrl}${app.synopsis_path}" target="_blank" class="doc-link">View Synopsis Document</a>` : "—"}</td></tr>
            <tr><td class="label-col">Duration of Research:</td><td class="value-col">${app.research_duration_months || "—"} Months</td></tr>
            <tr><td class="label-col">Expected Outcome:</td><td class="value-col">${app.expected_outcomes || "—"}</td></tr>
            <tr><td class="label-col">Literature Review:</td><td class="value-col">${app.literature_review || "—"}</td></tr>
            <tr><td class="label-col">Methodology & Data Plan:</td><td class="value-col">${app.methodology || "—"}</td></tr>
            <tr><td class="label-col">Timeline / Gantt Chart:</td><td class="value-col">${app.timeline || "—"}</td></tr>
            <tr><td class="label-col">Milestone Chart with Outcome:</td><td class="value-col">${app.milestone_chart_path ? `<a href="${apiBaseUrl}${app.milestone_chart_path}" target="_blank" class="doc-link">View Milestone Chart</a>` : "—"}</td></tr>
            <tr><td class="label-col">Other Proposal Document:</td><td class="value-col">${app.other_doc_path ? `<a href="${apiBaseUrl}${app.other_doc_path}" target="_blank" class="doc-link">View Document</a>` : "—"}</td></tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">4. Budget Details</div>
          <table>
            <tr><td class="label-col">Requested Grant Amount:</td><td class="value-col" style="font-weight: 700; color: #111827; font-size: 14px;">₹${(parseFloat(app.requested_amount) || 0).toLocaleString('en-IN')}</td></tr>
            <tr>
              <td class="label-col">Budget Heads Breakup:</td>
              <td class="value-col" style="padding: 0;">
                <table style="width: 100%; margin: 0;">
                  <tr><td style="border: none; padding: 4px 0;">a. Equipment and research materials (Max 40%):</td><td style="border: none; padding: 4px 0; font-weight: 600;">₹${(parseFloat(app.budget_equipment) || 0).toLocaleString('en-IN')}</td></tr>
                  <tr><td style="border: none; padding: 4px 0;">b. Manpower (Max 20%):</td><td style="border: none; padding: 4px 0; font-weight: 600;">₹${(parseFloat(app.budget_manpower) || 0).toLocaleString('en-IN')}</td></tr>
                  <tr><td style="border: none; padding: 4px 0;">c. Documentation (Max 15%):</td><td style="border: none; padding: 4px 0; font-weight: 600;">₹${(parseFloat(app.budget_documentation) || 0).toLocaleString('en-IN')}</td></tr>
                  <tr><td style="border: none; padding: 4px 0;">d. Travel & Fieldwork (Max 20%):</td><td style="border: none; padding: 4px 0; font-weight: 600;">₹${(parseFloat(app.budget_travel) || 0).toLocaleString('en-IN')}</td></tr>
                  <tr><td style="border: none; padding: 4px 0;">e. Contingency (Max 5%):</td><td style="border: none; padding: 4px 0; font-weight: 600;">₹${(parseFloat(app.budget_contingency) || 0).toLocaleString('en-IN')}</td></tr>
                  <tr style="border-top: 1px solid #d1d5db;"><td style="border: none; padding: 6px 0; font-weight: 700;">Total Allocated Budget:</td><td style="border: none; padding: 6px 0; font-weight: 700; color: #1e3a8a;">₹${budgetTotal.toLocaleString('en-IN')}</td></tr>
                </table>
              </td>
            </tr>
            <tr><td class="label-col">Budget Details with Demand:</td><td class="value-col">${app.budget_details_doc_path ? `<a href="${apiBaseUrl}${app.budget_details_doc_path}" target="_blank" class="doc-link">View Budget Document</a>` : "—"}</td></tr>
            <tr><td class="label-col">Ethical Clearance Document:</td><td class="value-col">${app.ethical_clearance_doc_path ? `<a href="${apiBaseUrl}${app.ethical_clearance_doc_path}" target="_blank" class="doc-link">View Document</a>` : "—"}</td></tr>
            <tr><td class="label-col">CVs of the Research Team:</td><td class="value-col">${app.team_cvs_path ? `<a href="${apiBaseUrl}${app.team_cvs_path}" target="_blank" class="doc-link">View Team CVs</a>` : "—"}</td></tr>
            ${app.other_relevant_doc_path ? `
              <tr><td class="label-col">Other Relevant Document:</td><td class="value-col"><a href="${apiBaseUrl}${app.other_relevant_doc_path}" target="_blank" class="doc-link">View Document</a><br/><span style="font-size: 11px; color: #6b7280;">(${app.other_relevant_doc_desc || "No description"})</span></td></tr>
            ` : ""}
            <tr><td class="label-col">Originality Affidavit:</td><td class="value-col">${app.originality_affidavit_path ? `<a href="${apiBaseUrl}${app.originality_affidavit_path}" target="_blank" class="doc-link">View Affidavit</a>` : "—"}</td></tr>
          </table>
        </div>

        <div style="margin-top: 40px; text-align: right;" class="no-print">
          <button onclick="window.print()" style="background-color: #059669; color: white; border: none; padding: 10px 24px; font-size: 14px; font-weight: 600; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            Print / Save as PDF
          </button>
        </div>
      </body>
    </html>
  `;
  
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

function BankDetailsForm({ appId, existing, onSaved }) {
  const [form, setForm] = useState({
    bank_account_number: existing?.bank_account_number || "",
    ifsc_code: existing?.ifsc_code || "",
    branch_name: existing?.branch_name || "",
    beneficiary_name: existing?.beneficiary_name || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(existing?.bank_details_submitted || false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.bank_account_number || !form.ifsc_code || !form.branch_name || !form.beneficiary_name)
      return alert("Please fill all required bank details.");
    setSaving(true);
    try {
      await axiosInstance.put(`${API}/api/research-grants/${appId}/bank-details`, form, { headers });
      setSaved(true);
      onSaved();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save bank details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-teal-100 rounded-xl p-4 bg-teal-50/30 space-y-4">
      <h4 className="font-semibold text-teal-800 flex items-center gap-1.5 text-xs">
        <Landmark size={15} /> Bank Details Setup (Required for Grant Disbursal)
      </h4>
      {saved ? (
        <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
          ✓ Bank details submitted successfully.
        </p>
      ) : (
        <form onSubmit={submit} className="grid md:grid-cols-2 gap-3">
          {[
            ["beneficiary_name", "Beneficiary Name *"],
            ["bank_account_number", "Bank Account Number *"],
            ["ifsc_code", "IFSC Code *"],
            ["branch_name", "Branch Name *"]
          ].map(([f, lbl]) => (
            <div key={f}>
              <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">{lbl}</label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white" 
                value={form[f]} 
                onChange={(e) => setForm(p => ({ ...p, [f]: e.target.value }))} 
              />
            </div>
          ))}
          <div className="md:col-span-2 pt-2 text-right">
            <button 
              type="submit" 
              disabled={saving} 
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs px-4 py-1.5 rounded-lg font-semibold shadow-sm transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Bank Details"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ResearchGrant() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [step, setStep]                 = useState(1);
  const [form, setForm]                 = useState({ ...BLANK_FORM });
  const [submitting, setSubmitting]     = useState(false);
  const [successMsg, setSuccessMsg]     = useState("");
  const [expandedId, setExpandedId]     = useState(null);
  const [acceptingApplications, setAcceptingApplications] = useState(true);
  const [settingsMode, setSettingsMode] = useState("AUTO");

  const activeWindow = getActiveWindow();
  const appYear = new Date().getFullYear();

  const load = async () => {
    setLoading(true);
    try {
      const r = await axiosInstance.get(`${API}/api/research-grants`, { headers });
      setApplications(r.data.data || []);
    } catch (e) {
      console.error("Failed to load applications:", e);
    }
    try {
      const settingsRes = await axiosInstance.get(`${API}/api/research-grants/settings`, { headers });
      if (settingsRes.data.success) {
        setAcceptingApplications(settingsRes.data.isCurrentlyAccepting);
        setSettingsMode(settingsRes.data.setting);
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const addCoPi   = () => setForm((p) => ({ ...p, co_pis: [...p.co_pis, { ...BLANK_COPI }] }));
  const removeCoPi = (i) => setForm((p) => ({ ...p, co_pis: p.co_pis.filter((_, idx) => idx !== i) }));
  
  const setCoPi   = (i, k, v) =>
    setForm((p) => ({
      ...p,
      co_pis: p.co_pis.map((c, idx) => idx === i ? { ...c, [k]: v } : c),
    }));

  const addPiQualification = () => setForm(p => ({ ...p, pi_qualifications: [...p.pi_qualifications, ""] }));
  const removePiQualification = (idx) => setForm(p => ({ ...p, pi_qualifications: p.pi_qualifications.filter((_, i) => i !== idx) }));
  const setPiQualification = (idx, val) => setForm(p => ({
    ...p,
    pi_qualifications: p.pi_qualifications.map((q, i) => i === idx ? val : q)
  }));

  const addCoPiQualification = (copiIdx) => setForm(p => ({
    ...p,
    co_pis: p.co_pis.map((c, i) => i === copiIdx ? { ...c, qualifications: [...(c.qualifications || []), ""] } : c)
  }));
  const removeCoPiQualification = (copiIdx, qualIdx) => setForm(p => ({
    ...p,
    co_pis: p.co_pis.map((c, i) => i === copiIdx ? { ...c, qualifications: (c.qualifications || []).filter((_, q) => q !== qualIdx) } : c)
  }));
  const setCoPiQualification = (copiIdx, qualIdx, val) => setForm(p => ({
    ...p,
    co_pis: p.co_pis.map((c, i) => i === copiIdx ? { ...c, qualifications: (c.qualifications || []).map((q, qIdx) => qIdx === qualIdx ? val : q) } : c)
  }));

  const validateStep = (stepId) => {
    if (stepId === 1) {
      if (!form.organization_name) return "Name of Organisation is required.";
      if (!form.organization_type) return "Organisation Type is required.";
      
      if (form.organization_type === "Research Institution" || form.organization_type === "Yoga Research Institution" || form.organization_type === "Health Organization") {
        const exp = parseInt(form.yoga_experience_years);
        if (isNaN(exp) || exp < 0) return "Year of Experience in Yoga Field is required.";
        if ((form.organization_type === "Yoga Research Institution" || form.organization_type === "Research Institution") && exp < 3) {
          return "Minimum 3 years of experience in Yoga Field is required for Research Institute.";
        }
        if (form.organization_type === "Health Organization" && exp < 5) {
          return "Minimum 5 years of experience in Yoga Field is required for Health Organisation.";
        }
      }
      
      if (!form.doc_proof_path) return "Please upload Documentary Proof for the Organisation.";
      if (!form.behalf_affidavit_path) return "Please upload the Behalf Affidavit.";
      
      const count = parseInt(form.completed_research_count);
      if (isNaN(count) || count < 1) return "Number of completed research works of min 6 months duration must be at least 1.";
      
      const funding = parseFloat(form.max_funding_amount);
      if (isNaN(funding) || funding < 500000) return "Maximum funding received for a single research work must be at least ₹5 Lakh.";
      
      if (!form.research_proof_doc_path) return "Please upload Proof Document regarding claimed research work.";
      if (!form.applicant_name) return "Name of Applicant is required.";
      if (!form.applicant_designation) return "Designation of Applicant is required.";
      if (!form.authorized_by) return "Authorized By selection is required.";
      if (!form.authorization_letter_path) return "Please upload the Authorization Letter.";
      if (!form.no_prior_grant_affidavit_path) return "Please upload the Affidavit that Organization has not taken any research grant previously.";
      
      if (form.received_prior_grant) {
        if (!form.prior_grant_app_number) return "Prior grant Application Number is required.";
        if (!form.prior_grant_approval_doc_path) return "Please upload the Prior Grant Approval Document.";
      }
    }
    
    if (stepId === 2) {
      if (!form.pi_name) return "Principal Investigator Name is required.";
      if (!form.pi_dob) return "Principal Investigator Date of Birth is required.";
      if (!form.pi_dob_proof_path) return "Please upload DOB Proof for Principal Investigator.";
      if (!form.pi_id_proof_path) return "Please upload ID Proof for Principal Investigator.";
      if (!form.pi_qualifications || form.pi_qualifications.filter(q => q.trim()).length === 0) return "Please add at least one Educational Qualification for PI.";
      if (!form.pi_qualifications_doc_path) return "Please upload Education Qualification document for PI.";
      if (!form.pi_position) return "PI Position in Organization is required.";
      if (form.pi_position === "Other" && !form.pi_position_other) return "Please specify the other Position.";
      if (!form.pi_position_proof_path) return "Please upload Proof of Position in Organization.";
      
      for (let i = 0; i < form.co_pis.length; i++) {
        const c = form.co_pis[i];
        if (c.name || c.dob || c.dob_proof_path || c.id_proof_path || c.qualifications?.length > 0 || c.qualifications_doc_path || c.position || c.position_proof_path) {
          const num = i + 1;
          if (!c.name) return `Co-PI #${num} Name is required.`;
          if (!c.dob) return `Co-PI #${num} Date of Birth is required.`;
          if (!c.dob_proof_path) return `Please upload DOB Proof for Co-PI #${num}.`;
          if (!c.id_proof_path) return `Please upload ID Proof for Co-PI #${num}.`;
          if (!c.qualifications || c.qualifications.filter(q => q.trim()).length === 0) return `Please add at least one Educational Qualification for Co-PI #${num}.`;
          if (!c.qualifications_doc_path) return `Please upload Education Qualification document for Co-PI #${num}.`;
          if (!c.position) return `Co-PI #${num} Position in Organization is required.`;
          if (c.position === "Other" && !c.position_other) return `Please specify the other Position for Co-PI #${num}.`;
          if (!c.position_proof_path) return `Please upload Proof of Position in Organization for Co-PI #${num}.`;
        }
      }
    }
    
    if (stepId === 3) {
      if (!form.title) return "Title of Project is required.";
      if (!form.abstract) return "Abstract / Summary is required.";
      if (!form.synopsis_path) return "Please upload the Project Synopsis.";
      const dur = parseInt(form.research_duration_months);
      if (isNaN(dur) || dur <= 0) return "Duration of Research in Months is required.";
      if (!form.expected_outcomes) return "Expected Outcome is required.";
      if (!form.literature_review) return "Literature Review is required.";
      if (!form.methodology) return "Methodology & Data Plan is required.";
      if (!form.timeline) return "Timeline / Gantt Chart is required.";
      if (!form.milestone_chart_path) return "Please upload Detailed Objective Milestone Chart.";
    }
    
    if (stepId === 4) {
      const reqAmt = parseFloat(form.requested_amount);
      if (isNaN(reqAmt) || reqAmt <= 0) return "Requested Grant Amount is required.";
      if (reqAmt > 1000000) return "Maximum requested grant amount is ₹10 Lakh.";
      
      const equip = parseFloat(form.budget_equipment) || 0;
      const power = parseFloat(form.budget_manpower) || 0;
      const docum = parseFloat(form.budget_documentation) || 0;
      const trav = parseFloat(form.budget_travel) || 0;
      const cont = parseFloat(form.budget_contingency) || 0;
      
      if (equip > reqAmt * 0.40) return "Equipment budget cannot exceed 40% of requested grant.";
      if (power > reqAmt * 0.20) return "Manpower budget cannot exceed 20% of requested grant.";
      if (docum > reqAmt * 0.15) return "Documentation budget cannot exceed 15% of requested grant.";
      if (trav > reqAmt * 0.20) return "Travel & Fieldwork budget cannot exceed 20% of requested grant.";
      if (cont > reqAmt * 0.05) return "Contingency budget cannot exceed 5% of requested grant.";
      
      const totalBudget = equip + power + docum + trav + cont;
      if (totalBudget > reqAmt) return "Total of budget heads exceeds the Requested Grant amount.";
      if (totalBudget !== reqAmt) return `Total of budget heads must equal the Requested Grant amount (${fmt(reqAmt)}).`;
      
      if (!form.budget_details_doc_path) return "Please upload Budget Details document.";
      if (!form.ethical_clearance_doc_path) return "Please upload Ethical Clearance Document.";
      if (!form.team_cvs_path) return "Please upload CVs of the Research Team.";
      if (!form.originality_affidavit_path) return "Please upload the Originality Affidavit.";
    }
    
    return null;
  };

  const handleNext = () => {
    const err = validateStep(step);
    if (err) {
      alert(err);
      return;
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!acceptingApplications) {
      return alert("Submissions for research grants are currently closed.");
    }
    const err = validateStep(4);
    if (err) return alert(err);

    setSubmitting(true);
    try {
      await axiosInstance.post(`${API}/api/research-grants`, form, { headers });
      setSuccessMsg("Research grant application submitted successfully! The Directorate will review it in the upcoming review period.");
      setShowForm(false);
      setStep(1);
      setForm({ ...BLANK_FORM });
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  function FileUploadField({ label, fieldPath, required, accept = ".pdf,.jpg,.jpeg,.png" }) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        return alert("Maximum file size is 10 MB.");
      }
      setUploading(true);
      setProgress(0);
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await axiosInstance.post(`${API}/api/register/upload-temp-file`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgress(pct);
            }
          }
        });
        if (res.data.success) {
          if (fieldPath.startsWith("co_pis.")) {
            const [_, indexStr, subField] = fieldPath.split('.');
            const idx = parseInt(indexStr);
            setForm(prev => ({
              ...prev,
              co_pis: prev.co_pis.map((c, i) => i === idx ? { ...c, [subField]: res.data.path } : c)
            }));
          } else {
            setField(fieldPath, res.data.path);
          }
        }
      } catch (err) {
        console.error("File upload failed:", err);
        alert("File upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    };

    const currentPath = fieldPath.startsWith("co_pis.")
      ? (() => {
          const [_, indexStr, subField] = fieldPath.split('.');
          return form.co_pis[parseInt(indexStr)]?.[subField];
        })()
      : form[fieldPath];

    return (
      <div className="space-y-1">
        <label className="label">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 cursor-pointer shadow-sm">
            <Upload size={14} /> Select File
            <input type="file" className="hidden" accept={accept} onChange={handleFileChange} disabled={uploading} />
          </label>
          {uploading && (
            <div className="flex items-center gap-2 text-xs text-blue-600">
              <div className="w-16 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full" style={{ width: `${progress}%` }}></div>
              </div>
              <span>{progress}%</span>
            </div>
          )}
          {currentPath && !uploading && (
            <a href={`${API}${currentPath}`} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline flex items-center gap-1 font-medium">
              <CheckCircle size={13} /> View File
            </a>
          )}
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-5">
            <h3 className="font-semibold text-gray-700 text-sm border-b pb-1">Organisation Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Name of Organisation <span className="text-red-500">*</span></label>
                <input className="inp" value={form.organization_name}
                  onChange={(e) => setField("organization_name", e.target.value)} placeholder="e.g. National Institute of Yoga Research" />
              </div>
              
              <div>
                <label className="label">Organisation Type <span className="text-red-500">*</span></label>
                <select className="inp" value={form.organization_type}
                  onChange={(e) => setField("organization_type", e.target.value)}>
                  <option value="">-- Select type --</option>
                  {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {(form.organization_type === "Research Institution" || form.organization_type === "Yoga Research Institution" || form.organization_type === "Health Organization") && (
                <div>
                  <label className="label">Years of Experience in Yoga Field <span className="text-red-500">*</span></label>
                  <input type="number" min="0" className="inp" value={form.yoga_experience_years}
                    onChange={(e) => setField("yoga_experience_years", e.target.value)} placeholder="e.g. 5" />
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {form.organization_type === "Health Organization" ? "Minimum 5 years required" : "Minimum 3 years required"}
                  </p>
                </div>
              )}

              <div className="md:col-span-2">
                <FileUploadField label="Upload Documentary Proof of Organisation" fieldPath="doc_proof_path" required={true} />
              </div>
            </div>

            <hr />
            <h3 className="font-semibold text-gray-700 text-sm border-b pb-1">Application Cycle</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Application Window <span className="text-red-500">*</span></label>
                <select className="inp" value={form.application_window} onChange={(e) => setField("application_window", e.target.value)}>
                  <option value="APR_MAY">April - May</option>
                  <option value="OCT_NOV">October - November</option>
                </select>
              </div>
              <div>
                <label className="label">Financial Year</label>
                <input className="inp bg-gray-50" value={`${appYear}-${(appYear+1).toString().slice(-2)}`} disabled />
              </div>
            </div>

            <hr />
            <h3 className="font-semibold text-gray-700 text-sm border-b pb-1">Prior Grants &amp; Qualifications</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Ever Received Grant Under Yoga policy 2025? <span className="text-red-500">*</span></label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-1.5 text-sm text-gray-700">
                    <input type="radio" name="received_prior_grant" checked={form.received_prior_grant === true} onChange={() => setField("received_prior_grant", true)} className="accent-emerald-600" /> Yes
                  </label>
                  <label className="flex items-center gap-1.5 text-sm text-gray-700">
                    <input type="radio" name="received_prior_grant" checked={form.received_prior_grant === false} onChange={() => setField("received_prior_grant", false)} className="accent-emerald-600" /> No
                  </label>
                </div>
              </div>

              {form.received_prior_grant && (
                <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border">
                  <div>
                    <label className="label">Application Number <span className="text-red-500">*</span></label>
                    <input className="inp bg-white" value={form.prior_grant_app_number} onChange={(e) => setField("prior_grant_app_number", e.target.value)} placeholder="e.g. UK-RG-2025-0042" />
                  </div>
                  <div>
                    <FileUploadField label="Upload Approval Document" fieldPath="prior_grant_approval_doc_path" required={true} />
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <FileUploadField label="Upload Affidavit (on behalf of Organisation, not as individual)" fieldPath="behalf_affidavit_path" required={true} />
                </div>
                <div>
                  <label className="label">No. of Completed Research Works (min 6 months duration) <span className="text-red-500">*</span></label>
                  <input type="number" min="0" className="inp" value={form.completed_research_count} onChange={(e) => setField("completed_research_count", e.target.value)} placeholder="Minimum 1 required" />
                </div>
                <div>
                  <label className="label">Maximum Funding Received for Single Research Work (₹) <span className="text-red-500">*</span></label>
                  <input type="number" min="0" className="inp" value={form.max_funding_amount} onChange={(e) => setField("max_funding_amount", e.target.value)} placeholder="Minimum 500,000 required" />
                </div>
                <div className="md:col-span-2">
                  <FileUploadField label="Upload Proof Document regarding claimed research work" fieldPath="research_proof_doc_path" required={true} />
                </div>
              </div>
            </div>

            <hr />
            <h3 className="font-semibold text-gray-700 text-sm border-b pb-1">Applicant Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Name of Applicant <span className="text-red-500">*</span></label>
                <input className="inp" value={form.applicant_name} onChange={(e) => setField("applicant_name", e.target.value)} placeholder="e.g. Dr. Ramesh Negi" />
              </div>
              <div>
                <label className="label">Designation in Organisation <span className="text-red-500">*</span></label>
                <input className="inp" value={form.applicant_designation} onChange={(e) => setField("applicant_designation", e.target.value)} placeholder="e.g. Professor &amp; Head" />
              </div>
              <div>
                <label className="label">Authorized By <span className="text-red-500">*</span></label>
                <select className="inp" value={form.authorized_by} onChange={(e) => setField("authorized_by", e.target.value)}>
                  <option value="">-- Select authority --</option>
                  <option value="Registrar">Registrar</option>
                  <option value="Vice Chancellor">Vice Chancellor</option>
                  <option value="Pro Vice-Chancellor">Pro Vice-Chancellor</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <FileUploadField label="Upload Authorization Letter for the applicant" fieldPath="authorization_letter_path" required={true} />
              </div>
              <div className="md:col-span-2">
                <FileUploadField label="Upload Affidavit (Organisation has not taken research grant previously under Yoga Policy)" fieldPath="no_prior_grant_affidavit_path" required={true} />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-800 text-sm border-b pb-1">Principal Investigator (PI) Details</h3>
              <div className="grid md:grid-cols-2 gap-4 mt-3">
                <div className="md:col-span-2">
                  <label className="label">PI Name <span className="text-red-500">*</span></label>
                  <input className="inp" value={form.pi_name} onChange={(e) => setField("pi_name", e.target.value)} placeholder="e.g. Dr. Sarita Rawat" />
                </div>
                <div>
                  <label className="label">Date of Birth <span className="text-red-500">*</span></label>
                  <input type="date" className="inp" value={form.pi_dob} onChange={(e) => setField("pi_dob", e.target.value)} />
                </div>
                <div>
                  <FileUploadField label="Upload DOB Proof" fieldPath="pi_dob_proof_path" required={true} />
                </div>
                <div className="md:col-span-2">
                  <FileUploadField label="Upload ID Proof" fieldPath="pi_id_proof_path" required={true} />
                </div>

                <div className="md:col-span-2 space-y-2 border p-4 rounded-xl bg-gray-50">
                  <div className="flex items-center justify-between">
                    <label className="label font-bold text-gray-700">Educational Qualifications <span className="text-red-500">*</span></label>
                    <button type="button" onClick={addPiQualification} className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1">
                      <PlusCircle size={14} /> Add Qualification
                    </button>
                  </div>
                  {form.pi_qualifications.map((q, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input className="inp bg-white" value={q} onChange={(e) => setPiQualification(idx, e.target.value)} placeholder="e.g. Ph.D. in Yoga Science" />
                      {form.pi_qualifications.length > 1 && (
                        <button type="button" onClick={() => removePiQualification(idx)} className="text-red-500 hover:text-red-700 shrink-0">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <div className="pt-2">
                    <FileUploadField label="Upload Education Qualification Certificate/Degree" fieldPath="pi_qualifications_doc_path" required={true} />
                  </div>
                </div>

                <div>
                  <label className="label">Position in Organization <span className="text-red-500">*</span></label>
                  <select className="inp" value={form.pi_position} onChange={(e) => setField("pi_position", e.target.value)}>
                    <option value="">-- Select position --</option>
                    <option value="Researcher">Researcher</option>
                    <option value="Academic Staff">Academic Staff</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {form.pi_position === "Other" && (
                  <div>
                    <label className="label">Please Specify Position <span className="text-red-500">*</span></label>
                    <input className="inp" value={form.pi_position_other} onChange={(e) => setField("pi_position_other", e.target.value)} placeholder="e.g. Lab Director" />
                  </div>
                )}
                <div className="md:col-span-2">
                  <FileUploadField label="Upload Proof of Position in Organization" fieldPath="pi_position_proof_path" required={true} />
                </div>
              </div>
            </div>

            <hr />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 text-sm">Co-Principal Investigators (Co-PIs) Details</h3>
                <button type="button" onClick={addCoPi} className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1">
                  <PlusCircle size={14} /> Add Co-PI
                </button>
              </div>

              {form.co_pis.map((co, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-4 bg-white relative">
                  <div className="flex items-center justify-between border-b pb-1.5">
                    <span className="text-xs font-bold text-gray-700">Co-Principal Investigator (Co-PI) #{i + 1}</span>
                    <button type="button" onClick={() => removeCoPi(i)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="label">Co-PI Name <span className="text-red-500">*</span></label>
                      <input className="inp" value={co.name} onChange={(e) => setCoPi(i, "name", e.target.value)} placeholder="e.g. Dr. Sunil Dutt" />
                    </div>
                    <div>
                      <label className="label">Date of Birth <span className="text-red-500">*</span></label>
                      <input type="date" className="inp" value={co.dob} onChange={(e) => setCoPi(i, "dob", e.target.value)} />
                    </div>
                    <div>
                      <FileUploadField label="Upload DOB Proof" fieldPath={`co_pis.${i}.dob_proof_path`} required={true} />
                    </div>
                    <div className="md:col-span-2">
                      <FileUploadField label="Upload ID Proof" fieldPath={`co_pis.${i}.id_proof_path`} required={true} />
                    </div>

                    <div className="md:col-span-2 space-y-2 border p-4 rounded-xl bg-gray-50">
                      <div className="flex items-center justify-between">
                        <label className="label font-bold text-gray-700">Educational Qualifications <span className="text-red-500">*</span></label>
                        <button type="button" onClick={() => addCoPiQualification(i)} className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1">
                          <PlusCircle size={14} /> Add Qualification
                        </button>
                      </div>
                      {(co.qualifications || []).map((q, qualIdx) => (
                        <div key={qualIdx} className="flex items-center gap-2">
                          <input className="inp bg-white" value={q} onChange={(e) => setCoPiQualification(i, qualIdx, e.target.value)} placeholder="e.g. M.Sc. in Yoga Science" />
                          {(co.qualifications || []).length > 1 && (
                            <button type="button" onClick={() => removeCoPiQualification(i, qualIdx)} className="text-red-500 hover:text-red-700 shrink-0">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      <div className="pt-2">
                        <FileUploadField label="Upload Education Qualification Certificate/Degree" fieldPath={`co_pis.${i}.qualifications_doc_path`} required={true} />
                      </div>
                    </div>

                    <div>
                      <label className="label">Position in Organization <span className="text-red-500">*</span></label>
                      <select className="inp" value={co.position} onChange={(e) => setCoPi(i, "position", e.target.value)}>
                        <option value="">-- Select position --</option>
                        <option value="Researcher">Researcher</option>
                        <option value="Academic Staff">Academic Staff</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    {co.position === "Other" && (
                      <div>
                        <label className="label">Please Specify Position <span className="text-red-500">*</span></label>
                        <input className="inp" value={co.position_other || ""} onChange={(e) => setCoPi(i, "position_other", e.target.value)} placeholder="e.g. Associate Professor" />
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <FileUploadField label="Upload Proof of Position in Organization" fieldPath={`co_pis.${i}.position_proof_path`} required={true} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <h3 className="font-semibold text-gray-800 text-sm border-b pb-1">Project Details</h3>
            <div>
              <label className="label">Title of Project <span className="text-red-500">*</span></label>
              <input className="inp" value={form.title} onChange={(e) => setField("title", e.target.value)} placeholder="Full project title" />
            </div>
            <div>
              <label className="label">Abstract / Summary <span className="text-red-500">*</span></label>
              <textarea rows={5} className="inp" value={form.abstract} onChange={(e) => setField("abstract", e.target.value)} placeholder="Provide a summary of the project proposal..." />
            </div>
            <div>
              <FileUploadField label="Upload Project Synopsis" fieldPath="synopsis_path" required={true} />
            </div>
            <div>
              <label className="label">Duration of Research in Months <span className="text-red-500">*</span></label>
              <input type="number" min="1" className="inp" value={form.research_duration_months} onChange={(e) => setField("research_duration_months", e.target.value)} placeholder="e.g. 12" />
            </div>
            <div>
              <FileUploadField label="Upload other relevant Document (Optional)" fieldPath="other_doc_path" required={false} />
            </div>
            <div>
              <label className="label">Expected Outcome <span className="text-red-500">*</span></label>
              <textarea rows={3} className="inp" value={form.expected_outcomes} onChange={(e) => setField("expected_outcomes", e.target.value)} placeholder="Describe expected results &amp; deliverables" />
            </div>

            <hr />
            <h3 className="font-semibold text-gray-800 text-sm border-b pb-1">Technical Content</h3>
            <div>
              <label className="label">Literature Review <span className="text-red-500">*</span></label>
              <textarea rows={4} className="inp" value={form.literature_review} onChange={(e) => setField("literature_review", e.target.value)} />
            </div>
            <div>
              <label className="label">Methodology &amp; Data Plan <span className="text-red-500">*</span></label>
              <textarea rows={4} className="inp" value={form.methodology} onChange={(e) => setField("methodology", e.target.value)} />
            </div>
            <div>
              <label className="label">Timeline / Gantt Chart (describe phases &amp; milestones) <span className="text-red-500">*</span></label>
              <textarea rows={4} className="inp" value={form.timeline} onChange={(e) => setField("timeline", e.target.value)} />
            </div>
            <div>
              <FileUploadField label="Upload Detailed Objective Milestone Chart with phasewise Outcome" fieldPath="milestone_chart_path" required={true} />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <h3 className="font-semibold text-gray-800 text-sm border-b pb-1">Budget Setup</h3>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle size={18} className="text-amber-600 mt-0.5 shrink-0" />
              <div className="text-xs text-amber-800 space-y-1">
                <p>Maximum permissible grant amount is <strong>₹10,00,000 (10 Lakh)</strong>.</p>
                <p>Budget heads must comply with the following percentage limits of the total requested grant:</p>
                <ul className="list-disc pl-4 mt-1 space-y-0.5 font-semibold">
                  <li>Equipment and research materials (Max 40%)</li>
                  <li>Manpower (Max 20%)</li>
                  <li>Documentation (Max 15%)</li>
                  <li>Travel &amp; Fieldwork (Max 20%)</li>
                  <li>Contingency (Max 5%)</li>
                </ul>
              </div>
            </div>

            <div>
              <label className="label">Requested Grant Amount (₹) <span className="text-red-500">*</span></label>
              <div className="relative">
                <IndianRupee size={15} className="absolute left-3 top-3 text-gray-400" />
                <input type="number" min="0" max={1000000} className="inp pl-8" value={form.requested_amount}
                  onChange={(e) => setField("requested_amount", e.target.value)} placeholder="Max 1,000,000" />
              </div>
              {form.requested_amount && (
                <p className="text-xs text-emerald-600 mt-0.5 font-medium">
                  Allocated Grant: {fmt(parseFloat(form.requested_amount))}
                </p>
              )}
            </div>

            <div className="bg-gray-50 border rounded-xl p-4 space-y-4">
              <h4 className="font-semibold text-gray-700 text-xs uppercase tracking-wider">Details of Budget Heads</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  ["budget_equipment", "a. Equipment & research materials (Max 40%)", 0.40],
                  ["budget_manpower", "b. Manpower (Max 20%)", 0.20],
                  ["budget_documentation", "c. Documentation (Max 15%)", 0.15],
                  ["budget_travel", "d. Travel & Fieldwork (Max 20%)", 0.20],
                  ["budget_contingency", "e. Contingency (Max 5%)", 0.05]
                ].map(([f, lbl, limit]) => {
                  const reqAmt = parseFloat(form.requested_amount) || 0;
                  const val = parseFloat(form[f]) || 0;
                  const maxVal = reqAmt * limit;
                  const isExceeded = val > maxVal;
                  return (
                    <div key={f} className="space-y-1">
                      <label className="label font-medium">{lbl}</label>
                      <div className="relative">
                        <IndianRupee size={13} className="absolute left-3.5 top-3 text-gray-400" />
                        <input type="number" min="0" className="inp pl-8" value={form[f]} onChange={(e) => setField(f, e.target.value)} placeholder={`Max ${fmt(maxVal)}`} />
                      </div>
                      {isExceeded && (
                        <p className="text-[10px] text-red-500 font-semibold flex items-center gap-1 mt-0.5">
                          ⚠ Exceeds limit of {fmt(maxVal)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {(() => {
                const reqAmt = parseFloat(form.requested_amount) || 0;
                const total = (parseFloat(form.budget_equipment) || 0) +
                              (parseFloat(form.budget_manpower) || 0) +
                              (parseFloat(form.budget_documentation) || 0) +
                              (parseFloat(form.budget_travel) || 0) +
                              (parseFloat(form.budget_contingency) || 0);
                const isNotEqual = reqAmt !== total;
                return (
                  <div className="pt-3 border-t flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-600">Total of Budget Heads:</span>
                    <span className={`font-bold text-sm ${isNotEqual ? "text-red-600" : "text-emerald-600"}`}>
                      {fmt(total)} / {fmt(reqAmt)}
                    </span>
                  </div>
                );
              })()}
            </div>

            <div className="space-y-4">
              <div>
                <FileUploadField label="Upload Budget Details with phasewise demand" fieldPath="budget_details_doc_path" required={true} />
              </div>
              <div>
                <FileUploadField label="Upload Ethical Clearance Document" fieldPath="ethical_clearance_doc_path" required={true} />
              </div>
              <div>
                <FileUploadField label="Upload CVs of the Research Team" fieldPath="team_cvs_path" required={true} />
              </div>
              <div className="border p-4 rounded-xl space-y-3 bg-gray-50">
                <FileUploadField label="Other Relevant Document (Optional)" fieldPath="other_relevant_doc_path" required={false} />
                <div>
                  <label className="label">Description of Other Document</label>
                  <input className="inp bg-white" value={form.other_relevant_doc_desc} onChange={(e) => setField("other_relevant_doc_desc", e.target.value)} placeholder="Describe the uploaded document" />
                </div>
              </div>
              <div>
                <FileUploadField label="Upload Affidavit (Proposal is original in ideation and content, aware of plagiarism rejection)" fieldPath="originality_affidavit_path" required={true} />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle size={16} /> All validation checks passed! Please review the application summary below.
            </div>

            <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-5 space-y-4 text-xs">
              <h4 className="font-bold text-blue-800 text-sm border-b pb-1">Application Summary</h4>
              <p><span className="text-gray-500 font-semibold">Organisation Name:</span> {form.organization_name}</p>
              <p><span className="text-gray-500 font-semibold">Organisation Type:</span> {form.organization_type}</p>
              <p><span className="text-gray-500 font-semibold">Project Title:</span> {form.title}</p>
              <p><span className="text-gray-500 font-semibold">Principal Investigator:</span> {form.pi_name}</p>
              <p><span className="text-gray-500 font-semibold">Requested Amount:</span> <strong className="text-blue-700">{fmt(parseFloat(form.requested_amount) || 0)}</strong></p>
              
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => printResearchApplication(form, API)}
                  className="flex items-center gap-2 bg-white text-gray-700 border hover:bg-gray-50 px-4 py-2 rounded-lg font-semibold shadow-sm transition"
                >
                  <FileText size={15} /> Preview Printable Form
                </button>
              </div>
            </div>
          </div>
        );

      default: return null;
    }
  };


  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Research Grant</h1>
          <p className="text-sm text-gray-500 mt-1">
            Apply for research funding (max ₹10 lakh) — open to NGOs, Research Institutes, Medical Organisations, Universities &amp; Colleges
          </p>
        </div>
        <button
          onClick={() => {
            if (!acceptingApplications) return;
            setShowForm(!showForm); 
            setSuccessMsg(""); 
            setStep(1);
          }}
          disabled={!acceptingApplications}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
            acceptingApplications
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <PlusCircle size={16} /> New Application
        </button>
      </div>

      <div className={`border rounded-xl p-4 flex items-start gap-3 ${
        acceptingApplications ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"
      }`}>
        <AlertCircle size={18} className={acceptingApplications ? "text-green-600" : "text-red-600"} />
        <div className="text-sm">
          {acceptingApplications ? (
            <>
              <span className="font-semibold text-green-800">Application submissions are currently open!</span>
            </>
          ) : (
            <>
              <span className="font-semibold text-red-800">Application submissions are currently closed.</span>
            </>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex overflow-x-auto border-b">
            {STEPS.map((s) => (
              <button key={s.id} type="button"
                onClick={() => {
                  const err = validateStep(s.id - 1);
                  if (s.id > step && err) return alert(err);
                  setStep(s.id);
                }}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  step === s.id
                    ? "border-emerald-500 text-emerald-700 bg-emerald-50"
                    : s.id < step
                    ? "border-emerald-200 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}>
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs mr-2 ${
                  step === s.id ? "bg-emerald-600 text-white" : s.id < step ? "bg-emerald-200 text-emerald-700" : "bg-gray-200 text-gray-500"
                }`}>{s.id}</span>
                {s.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            <style>{`.label { display: block; font-size: 0.75rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem; }
            .inp { width: 100%; border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; outline: none; }
            .inp:focus { ring: 2px; ring-color: #10b981; border-color: #10b981; box-shadow: 0 0 0 2px rgba(16,185,129,0.2); }`}</style>
            {renderStep()}
          </div>

          <div className="px-6 py-4 border-t flex items-center justify-between">
            <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700">
              Cancel
            </button>
            <div className="flex gap-3">
              {step > 1 && (
                <button onClick={() => setStep(s => s - 1)}
                  className="px-4 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50">
                  ← Previous
                </button>
              )}
              {step < STEPS.length ? (
                <button onClick={handleNext}
                  className="px-5 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                  Next →
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting}
                  className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2">
                  {submitting ? "Submitting…" : <><FileText size={15} /> Submit Application</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── My Applications ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-5 border-b">
          <h2 className="font-semibold text-gray-800">My Applications</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : applications.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
            <p>No applications yet. Click <strong>New Application</strong> to get started.</p>
          </div>
        ) : (
          <div className="divide-y">
            {applications.map((app) => {
              const meta  = STATUS_META[app.status] || STATUS_META.SUBMITTED;
              const Icon  = meta.icon;
              const open  = expandedId === app.id;
              const winInfo = WINDOW_INFO[app.application_window];
              return (
                <div key={app.id} className="p-4">
                  <button className="w-full flex items-center justify-between text-left"
                    onClick={() => setExpandedId(open ? null : app.id)}>
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 rounded-full p-2">
                        <BookOpen size={18} className="text-blue-700" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{app.title}</p>
                        <p className="text-xs text-gray-500">
                          {app.organization_name} · {winInfo?.label} {app.application_year} ·{" "}
                          {new Date(app.created_at).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${meta.color}`}>
                        <Icon size={12} /> {meta.label}
                      </span>
                      {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {open && (
                    <div className="mt-4 ml-12 space-y-4 text-sm">
                      <div className="grid md:grid-cols-3 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-400">Requested Amount</p>
                          <p className="font-bold text-gray-800">{fmt(app.requested_amount)}</p>
                        </div>
                        {app.approved_amount && (
                          <div className="bg-emerald-50 rounded-lg p-3">
                            <p className="text-xs text-emerald-500">Approved Amount</p>
                            <p className="font-bold text-emerald-700">{fmt(app.approved_amount)}</p>
                          </div>
                        )}
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-400">Review Period</p>
                          <p className="font-bold text-gray-800">{winInfo?.review} {app.application_year}</p>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => printResearchApplication(app, API)}
                          className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition"
                        >
                          <FileText size={14} /> Download / Print Application PDF
                        </button>
                      </div>

                      {app.directorate_remarks && (
                        <div className={`border rounded-lg p-3 ${app.status === "APPROVED" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                          <p className={`text-xs font-semibold ${app.status === "APPROVED" ? "text-green-700" : "text-red-700"}`}>
                            Directorate — Research Project Approval Committee Remarks
                          </p>
                          <p className="text-xs mt-1 text-gray-700">{app.directorate_remarks}</p>
                        </div>
                      )}

                      {/* Bank details section — only after approval */}
                      {app.status === "APPROVED" && (
                        <BankDetailsForm
                          appId={app.id}
                          existing={app}
                          onSaved={load}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
