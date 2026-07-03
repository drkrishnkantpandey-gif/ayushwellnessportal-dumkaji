import API from '../../config/api';
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PlusCircle, FileText, CheckCircle, Clock, XCircle,
  ChevronDown, ChevronUp, Upload, IndianRupee, AlertCircle,
  User, Users, Building2, Trash2, Landmark, BookOpen,
} from "lucide-react";


const MAX_AMOUNT = 1000000;

const ORG_TYPES = [
  { value: "NGO",                label: "NGO / Non-Governmental Organisation" },
  { value: "RESEARCH_INSTITUTE", label: "Research Institute" },
  { value: "MEDICAL_HEALTH_ORG", label: "Medical / Health Organisation" },
  { value: "UNIVERSITY",         label: "University" },
  { value: "COLLEGE",            label: "College (with full-time PG course in Yoga)" },
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

// ── Multi-step form steps ────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Organisation & Team" },
  { id: 2, label: "Project Overview"    },
  { id: 3, label: "Technical Content"   },
  { id: 4, label: "Budget & Impact"     },
  { id: 5, label: "Documents"           },
];

const BLANK_COPI = { name: "", designation: "", qualification: "", email: "", isYogaBackground: false };

const BLANK_FORM = {
  organization_name: "", organization_type: "",
  yoga_background_member: "",
  pi_name: "", pi_designation: "", pi_qualification: "", pi_email: "", pi_phone: "",
  pi_is_yoga_background: false,
  co_pis: [{ ...BLANK_COPI }],
  title: "", abstract: "", keywords: "", problem_statement: "",
  objectives_hypotheses: "", literature_review: "", methodology: "",
  feasibility: "", timeline: "", budget_justification: "",
  institutional_capabilities: "", biographical_sketches: "",
  ethical_considerations: "", endorsement_letters: "", expected_outcomes: "",
  requested_amount: "",
  application_window: getActiveWindow() || "APR_MAY",
};

// ── Bank details form ────────────────────────────────────────────────────────
function BankDetailsForm({ appId, existing, onSaved }) {
  const [form, setForm] = useState({
    bank_account_number: existing?.bank_account_number || "",
    ifsc_code: existing?.ifsc_code || "",
    branch_name: existing?.branch_name || "",
    beneficiary_name: existing?.beneficiary_name || "",
    progress_report_url: existing?.progress_report_url || "",
    utilization_certificate_url: existing?.utilization_certificate_url || "",
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

  if (saved) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-700 flex items-center gap-2">
        <CheckCircle size={16} /> Bank details submitted successfully.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">
      <h4 className="font-semibold text-blue-800 flex items-center gap-2">
        <Landmark size={16} /> Submit Bank & Progress Details
      </h4>
      <div className="grid md:grid-cols-2 gap-4">
        {[
          ["bank_account_number", "Bank Account Number", true],
          ["ifsc_code",           "IFSC Code",           true],
          ["branch_name",         "Branch Name",         true],
          ["beneficiary_name",    "Name of Beneficiary", true],
          ["progress_report_url", "Progress Report Link (URL)", false],
          ["utilization_certificate_url", "Utilization Certificate Link (URL)", false],
        ].map(([field, label, required]) => (
          <div key={field}>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={form[field]}
              onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={required}
            />
          </div>
        ))}
      </div>
      <button
        type="submit"
        disabled={saving}
        className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save Bank Details"}
      </button>
    </form>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function ResearchGrant() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [step, setStep]                 = useState(1);
  const [form, setForm]                 = useState({ ...BLANK_FORM });
  const [docFile, setDocFile]           = useState(null);
  const [submitting, setSubmitting]     = useState(false);
  const [successMsg, setSuccessMsg]     = useState("");
  const [expandedId, setExpandedId]     = useState(null);

  const activeWindow = getActiveWindow();

  const load = async () => {
    setLoading(true);
    try {
      const r = await axiosInstance.get(`${API}/api/research-grants`, { headers });
      setApplications(r.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
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

  const handleSubmit = async () => {
    if (!form.title || !form.organization_name || !form.organization_type || !form.pi_name || !form.requested_amount)
      return alert("Please complete all required fields before submitting.");
    if (parseFloat(form.requested_amount) > MAX_AMOUNT)
      return alert("Maximum grant amount is ₹10,00,000 (10 lakh).");

    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "co_pis") fd.append(k, JSON.stringify(v));
        else fd.append(k, v);
      });
      if (docFile) fd.append("doc_proposal", docFile);

      await axiosInstance.post(`${API}/api/research-grants`, fd, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });
      setSuccessMsg("Research grant application submitted successfully! The Directorate will review it in the upcoming review period.");
      setShowForm(false);
      setStep(1);
      setForm({ ...BLANK_FORM });
      setDocFile(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render step content ──────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      // ── Step 1: Organisation & Team ────────────────────────────────────
      case 1: return (
        <div className="space-y-5">
          <h3 className="font-semibold text-gray-700">Organisation Details</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Name of Organisation <span className="text-red-500">*</span></label>
              <input className="inp" value={form.organization_name}
                onChange={(e) => setField("organization_name", e.target.value)} placeholder="e.g. National Institute of Yoga Research" required />
            </div>
            <div className="md:col-span-2">
              <label className="label">Organisation Type <span className="text-red-500">*</span></label>
              <select className="inp" value={form.organization_type}
                onChange={(e) => setField("organization_type", e.target.value)} required>
                <option value="">-- Select type --</option>
                {ORG_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              {(form.organization_type === "UNIVERSITY" || form.organization_type === "COLLEGE") && (
                <p className="text-xs text-amber-600 mt-1">
                  Full-time post-graduate course in Yoga must be offered by the institution.
                </p>
              )}
            </div>
          </div>

          <hr />
          <h3 className="font-semibold text-gray-700">Application Window</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(WINDOW_INFO).map(([w, info]) => (
              <button key={w} type="button"
                onClick={() => setField("application_window", w)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  form.application_window === w ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"
                }`}>
                <p className="font-semibold text-sm text-gray-800">{info.label}</p>
                <p className="text-xs text-gray-500 mt-1">Reviewed by Directorate in <strong>{info.review}</strong></p>
                {w === activeWindow && (
                  <span className="mt-2 inline-block text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Currently Open
                  </span>
                )}
              </button>
            ))}
          </div>

          <hr />
          <h3 className="font-semibold text-gray-700">Principal Investigator (PI)</h3>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
            At least one team member (PI or Co-PI) must have a background in Yoga.
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              ["pi_name",         "Full Name",      true],
              ["pi_designation",  "Designation",    false],
              ["pi_qualification","Qualification",  false],
              ["pi_email",        "Email",          false],
              ["pi_phone",        "Phone",          false],
            ].map(([f, lbl, req]) => (
              <div key={f}>
                <label className="label">{lbl} {req && <span className="text-red-500">*</span>}</label>
                <input className="inp" value={form[f]} onChange={(e) => setField(f, e.target.value)} required={req} />
              </div>
            ))}
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" id="pi_yoga"
                checked={form.pi_is_yoga_background}
                onChange={(e) => setField("pi_is_yoga_background", e.target.checked)}
                className="w-4 h-4 accent-emerald-600" />
              <label htmlFor="pi_yoga" className="text-sm text-gray-700">PI has Yoga background</label>
            </div>
          </div>

          <hr />
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Co-Investigators (Co-PIs)</h3>
            <button type="button" onClick={addCoPi}
              className="flex items-center gap-1 text-sm text-emerald-700 hover:text-emerald-900 font-medium">
              <PlusCircle size={15} /> Add Co-PI
            </button>
          </div>
          {form.co_pis.map((co, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-600">Co-PI #{i + 1}</span>
                {form.co_pis.length > 1 && (
                  <button type="button" onClick={() => removeCoPi(i)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {[["name","Name"],["designation","Designation"],["qualification","Qualification"],["email","Email"]].map(([f, lbl]) => (
                  <div key={f}>
                    <label className="label">{lbl}</label>
                    <input className="inp" value={co[f]} onChange={(e) => setCoPi(i, f, e.target.value)} />
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={co.isYogaBackground}
                    onChange={(e) => setCoPi(i, "isYogaBackground", e.target.checked)}
                    className="w-4 h-4 accent-emerald-600" />
                  <label className="text-sm text-gray-700">Has Yoga background</label>
                </div>
              </div>
            </div>
          ))}

          <div>
            <label className="label">Name of Yoga Background Member (if not PI/Co-PI)</label>
            <input className="inp" value={form.yoga_background_member}
              onChange={(e) => setField("yoga_background_member", e.target.value)}
              placeholder="Name of the member with yoga background" />
          </div>
        </div>
      );

      // ── Step 2: Project Overview ───────────────────────────────────────
      case 2: return (
        <div className="space-y-5">
          <div>
            <label className="label">Title of Project <span className="text-red-500">*</span></label>
            <input className="inp" value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="Full title of the research project" required />
          </div>
          <div>
            <label className="label">Abstract / Summary <span className="text-red-500">*</span></label>
            <textarea rows={5} className="inp" value={form.abstract}
              onChange={(e) => setField("abstract", e.target.value)}
              placeholder="Concise summary of the research (max 500 words)" />
          </div>
          <div>
            <label className="label">Keywords</label>
            <input className="inp" value={form.keywords}
              onChange={(e) => setField("keywords", e.target.value)}
              placeholder="e.g. yoga, pranayama, mental health, RCT" />
          </div>
          <div>
            <label className="label">Problem Statement &amp; Significance</label>
            <textarea rows={4} className="inp" value={form.problem_statement}
              onChange={(e) => setField("problem_statement", e.target.value)}
              placeholder="Describe the problem and why this research is significant" />
          </div>
          <div>
            <label className="label">Objectives &amp; Hypotheses</label>
            <textarea rows={4} className="inp" value={form.objectives_hypotheses}
              onChange={(e) => setField("objectives_hypotheses", e.target.value)}
              placeholder="List the specific objectives and research hypotheses" />
          </div>
        </div>
      );

      // ── Step 3: Technical Content ──────────────────────────────────────
      case 3: return (
        <div className="space-y-5">
          {[
            ["literature_review",  "Literature Review"],
            ["methodology",        "Methodology &amp; Data Plan"],
            ["feasibility",        "Feasibility &amp; Contingency Plan"],
            ["timeline",           "Timeline / Gantt Chart (describe phases &amp; milestones)"],
          ].map(([f, lbl]) => (
            <div key={f}>
              <label className="label" dangerouslySetInnerHTML={{ __html: lbl }} />
              <textarea rows={4} className="inp" value={form[f]}
                onChange={(e) => setField(f, e.target.value)}
                placeholder={`Enter ${lbl.replace(/&amp;/g, "&").replace(/<[^>]+>/g, "")}`} />
            </div>
          ))}
        </div>
      );

      // ── Step 4: Budget & Impact ────────────────────────────────────────
      case 4: return (
        <div className="space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800">
              Maximum permissible grant amount is <strong>₹10,00,000 (Ten Lakh only)</strong>. Applications exceeding this limit will not be considered.
            </p>
          </div>

          <div>
            <label className="label">Requested Grant Amount (₹) <span className="text-red-500">*</span></label>
            <div className="relative">
              <IndianRupee size={15} className="absolute left-3 top-3 text-gray-400" />
              <input type="number" min="0" max={MAX_AMOUNT} step="1000"
                className="inp pl-8" value={form.requested_amount}
                onChange={(e) => setField("requested_amount", e.target.value)} required />
            </div>
            {form.requested_amount && (
              <p className={`text-xs mt-1 ${parseFloat(form.requested_amount) > MAX_AMOUNT ? "text-red-600 font-semibold" : "text-emerald-600"}`}>
                {parseFloat(form.requested_amount) > MAX_AMOUNT
                  ? "⚠ Exceeds maximum limit of ₹10,00,000"
                  : `= ${fmt(parseFloat(form.requested_amount))}`}
              </p>
            )}
          </div>

          {[
            ["budget_justification",       "Budget &amp; Justification"],
            ["institutional_capabilities", "Institutional Capabilities"],
            ["biographical_sketches",      "Biographical Sketches / CVs of Team Members"],
            ["ethical_considerations",     "Ethical Considerations &amp; Approvals"],
            ["endorsement_letters",        "Endorsement Letters (describe / paste text)"],
            ["expected_outcomes",          "Expected Outcomes &amp; Impact"],
          ].map(([f, lbl]) => (
            <div key={f}>
              <label className="label" dangerouslySetInnerHTML={{ __html: lbl }} />
              <textarea rows={3} className="inp" value={form[f]}
                onChange={(e) => setField(f, e.target.value)} />
            </div>
          ))}
        </div>
      );

      // ── Step 5: Documents ──────────────────────────────────────────────
      case 5: return (
        <div className="space-y-5">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Upload size={16} /> Full Research Proposal
            </h4>
            <p className="text-xs text-gray-500 mb-4">
              Upload the complete research proposal document. Accepted formats: <strong>PDF or Word (.doc / .docx)</strong>. Max size: 20 MB.
            </p>
            <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-gray-300 rounded-xl px-5 py-6 hover:border-emerald-400 hover:bg-emerald-50 transition">
              <Upload size={22} className="text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {docFile ? docFile.name : "Click to upload proposal"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">PDF, DOC, or DOCX</p>
              </div>
              <input type="file" className="hidden" accept=".pdf,.doc,.docx"
                onChange={(e) => setDocFile(e.target.files[0] || null)} />
            </label>
            {docFile && (
              <p className="mt-2 text-xs text-emerald-600 flex items-center gap-1">
                <CheckCircle size={13} /> {docFile.name} selected ({(docFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Summary before submit */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-2 text-sm">
            <h4 className="font-semibold text-blue-800">Application Summary</h4>
            <p><span className="text-gray-500">Organisation:</span> {form.organization_name || "—"}</p>
            <p><span className="text-gray-500">Type:</span> {ORG_TYPES.find(t => t.value === form.organization_type)?.label || "—"}</p>
            <p><span className="text-gray-500">Window:</span> {WINDOW_INFO[form.application_window]?.label || "—"}</p>
            <p><span className="text-gray-500">Project Title:</span> {form.title || "—"}</p>
            <p><span className="text-gray-500">Principal Investigator:</span> {form.pi_name || "—"}</p>
            <p><span className="text-gray-500">Co-PIs:</span> {form.co_pis.filter(c => c.name).length}</p>
            <p><span className="text-gray-500">Requested Amount:</span> <strong className="text-blue-700">{fmt(parseFloat(form.requested_amount) || 0)}</strong></p>
          </div>
        </div>
      );

      default: return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Research Grant</h1>
          <p className="text-sm text-gray-500 mt-1">
            Apply for research funding (max ₹10 lakh) — open to NGOs, Research Institutes, Medical Organisations, Universities &amp; Colleges
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setSuccessMsg(""); setStep(1); }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
        >
          <PlusCircle size={16} /> New Application
        </button>
      </div>

      {/* ── Application window banner ── */}
      <div className={`border rounded-xl p-4 flex items-start gap-3 ${
        activeWindow ? "bg-green-50 border-green-300" : "bg-amber-50 border-amber-300"
      }`}>
        <AlertCircle size={18} className={activeWindow ? "text-green-600" : "text-amber-600"} />
        <div className="text-sm">
          {activeWindow ? (
            <>
              <span className="font-semibold text-green-800">Application window is currently open!</span>
              <span className="text-green-700"> {WINDOW_INFO[activeWindow].label} window — applications reviewed by Directorate in {WINDOW_INFO[activeWindow].review}.</span>
            </>
          ) : (
            <>
              <span className="font-semibold text-amber-800">Application window is currently closed.</span>
              <span className="text-amber-700"> Next window opens in <strong>{getNextWindowText()}</strong>. You may still prepare and submit your application.</span>
            </>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {/* ── Multi-step Application Form ── */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Step tabs */}
          <div className="flex overflow-x-auto border-b">
            {STEPS.map((s) => (
              <button key={s.id} type="button"
                onClick={() => setStep(s.id)}
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

          {/* Step content */}
          <div className="p-6">
            <style>{`.label { display: block; font-size: 0.75rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem; }
            .inp { width: 100%; border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; outline: none; }
            .inp:focus { ring: 2px; ring-color: #10b981; border-color: #10b981; box-shadow: 0 0 0 2px rgba(16,185,129,0.2); }`}</style>
            {renderStep()}
          </div>

          {/* Navigation */}
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
                <button onClick={() => setStep(s => s + 1)}
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
