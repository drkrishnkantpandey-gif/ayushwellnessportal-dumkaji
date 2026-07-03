import API from '../../../config/api';
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PlusCircle, FileText, CheckCircle, Clock, XCircle,
  ChevronDown, ChevronUp, Upload, IndianRupee, Award, AlertCircle, Star,
} from "lucide-react";



// Grade → reimbursement amount (must match backend)
const GRADE_CONFIG = [
  {
    grade: "B++",
    amount: 250000,
    label: "NAAC B++",
    description: "Above average — colleges with strong performance indicators",
    color: "border-amber-400 bg-amber-50",
    badge: "bg-amber-100 text-amber-700",
    stars: 2,
  },
  {
    grade: "A",
    amount: 500000,
    label: "NAAC A",
    description: "Good — colleges demonstrating quality excellence",
    color: "border-blue-400 bg-blue-50",
    badge: "bg-blue-100 text-blue-700",
    stars: 3,
  },
  {
    grade: "A+",
    amount: 1000000,
    label: "NAAC A+",
    description: "Very Good — colleges with outstanding quality standards",
    color: "border-purple-400 bg-purple-50",
    badge: "bg-purple-100 text-purple-700",
    stars: 4,
  },
  {
    grade: "A++",
    amount: 1500000,
    label: "NAAC A++",
    description: "Outstanding — highest level of accreditation excellence",
    color: "border-emerald-400 bg-emerald-50",
    badge: "bg-emerald-100 text-emerald-700",
    stars: 5,
  },
];

const DOCS = [
  { field: "doc_naac_certificate", label: "NAAC Accreditation Certificate",      required: true  },
  { field: "doc_grade_sheet",      label: "NAAC Grade Sheet / Score Card",        required: true  },
  { field: "doc_fee_receipt",      label: "Accreditation Fee Payment Receipt",    required: true  },
  { field: "doc_bank_details",     label: "Bank Passbook / Cancelled Cheque",     required: true  },
  { field: "doc_others",           label: "Any Other Supporting Document",        required: false },
];

const STATUS_META = {
  SUBMITTED:    { label: "Submitted",    color: "bg-blue-100 text-blue-700",      icon: Clock       },
  UNDER_REVIEW: { label: "Under Review", color: "bg-yellow-100 text-yellow-700",  icon: Clock       },
  APPROVED:     { label: "Approved ✓",  color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  REJECTED:     { label: "Rejected",     color: "bg-red-100 text-red-700",        icon: XCircle     },
};

const fmt = (n) =>
  n != null ? `₹${parseFloat(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);

const BLANK = {
  college_name: "", naac_grade: "", accreditation_year: "",
  accreditation_valid_until: "", naac_certificate_number: "",
  bank_account_number: "", ifsc_code: "", branch_name: "", beneficiary_name: "",
};

export default function NAACReimbursement() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [form, setForm]                 = useState({ ...BLANK });
  const [files, setFiles]               = useState({});
  const [submitting, setSubmitting]     = useState(false);
  const [successMsg, setSuccessMsg]     = useState("");
  const [expandedId, setExpandedId]     = useState(null);


  const load = async () => {
    setLoading(true);
    try {
      const r = await axiosInstance.get(`${API}/api/ayush-college/naac-reimbursement`, { headers });
      setApplications(r.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const handleFile = (field, fileList) =>
    setFiles((p) => ({ ...p, [field]: fileList[0] }));

  const selectedGrade  = GRADE_CONFIG.find((g) => g.grade === form.naac_grade);
  const autoAmount     = selectedGrade?.amount || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.naac_grade) return alert("Please select the NAAC grade.");
    if (!form.accreditation_year) return alert("Please enter the accreditation year.");

    const missing = DOCS.filter((d) => d.required && !files[d.field]);
    if (missing.length)
      return alert(`Please upload: ${missing.map((d) => d.label).join(", ")}`);

    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      Object.entries(files).forEach(([k, v]) => { if (v) fd.append(k, v); });

      await axiosInstance.post(`${API}/api/ayush-college/naac-reimbursement`, fd, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });

      setSuccessMsg("NAAC reimbursement application submitted! The Directorate will review your claim.");
      setShowForm(false);
      setForm({ ...BLANK });
      setFiles({});
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">NAAC Accreditation Reimbursement</h1>
          <p className="text-sm text-gray-500 mt-1">
            Claim reimbursement for NAAC accreditation fees — maximum ₹15,00,000
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setSuccessMsg(""); }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
        >
          <PlusCircle size={16} /> New Claim
        </button>
      </div>

      {/* Grade reference card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {GRADE_CONFIG.map((g) => (
          <div key={g.grade} className={`rounded-xl border-2 p-4 ${g.color}`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${g.badge}`}>{g.label}</span>
              <div className="flex gap-0.5">
                {Array.from({ length: g.stars }).map((_, i) => (
                  <Star key={i} size={10} className="fill-current text-yellow-400" />
                ))}
              </div>
            </div>
            <p className="text-lg font-bold text-gray-800 mt-2">{fmt(g.amount)}</p>
            <p className="text-xs text-gray-500 mt-0.5">Reimbursement</p>
          </div>
        ))}
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3 text-sm">
        <AlertCircle size={17} className="text-blue-500 mt-0.5 shrink-0" />
        <p className="text-blue-800">
          The reimbursement amount is <strong>automatically determined</strong> by the NAAC grade entered.
          The college must provide the accreditation status and year. Maximum capping is <strong>₹15,00,000 (A++ grade)</strong>.
          All claims are approved by the <strong>Directorate</strong>.
        </p>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {/* ── Application Form ── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-7">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Award size={20} className="text-emerald-600" /> NAAC Reimbursement Application
          </h2>

          {/* Section 1: College & Accreditation Details */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
              College &amp; Accreditation Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  College Name <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.college_name} onChange={(e) => set("college_name", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Official name of the AYUSH college" required />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  NAAC Certificate Number
                </label>
                <input type="text" value={form.naac_certificate_number}
                  onChange={(e) => set("naac_certificate_number", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. NAAC/CERT/2024/12345" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Accreditation Year <span className="text-red-500">*</span>
                </label>
                <select value={form.accreditation_year} onChange={(e) => set("accreditation_year", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required>
                  <option value="">-- Select year --</option>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Valid Until (Year)
                </label>
                <select value={form.accreditation_valid_until}
                  onChange={(e) => set("accreditation_valid_until", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">-- Select year --</option>
                  {Array.from({ length: 10 }, (_, i) => CURRENT_YEAR + i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: NAAC Grade Selection */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
              NAAC Accreditation Grade <span className="text-red-500">*</span>
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {GRADE_CONFIG.map((g) => (
                <button key={g.grade} type="button"
                  onClick={() => set("naac_grade", g.grade)}
                  className={`text-left p-5 rounded-xl border-2 transition-all ${
                    form.naac_grade === g.grade
                      ? g.color + " shadow-sm"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${g.badge}`}>{g.label}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: g.stars }).map((_, i) => (
                          <Star key={i} size={11} className="fill-current text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    {form.naac_grade === g.grade && (
                      <CheckCircle size={18} className="text-emerald-600" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{g.description}</p>
                  <p className="text-xl font-bold text-gray-800">{fmt(g.amount)}</p>
                  <p className="text-xs text-gray-400">Fixed reimbursement</p>
                </button>
              ))}
            </div>
          </div>

          {/* Auto-calculated amount banner */}
          {form.naac_grade && (
            <div className={`rounded-xl border-2 p-5 flex items-center gap-5 ${selectedGrade?.color}`}>
              <div className="bg-white/60 rounded-full p-3">
                <IndianRupee size={22} className="text-gray-700" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Auto-calculated Reimbursement Amount
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{fmt(autoAmount)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Fixed for {selectedGrade?.label} · Maximum cap: ₹15,00,000
                </p>
              </div>
            </div>
          )}

          {/* Section 3: Bank Details */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
              Bank Details for Reimbursement
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                ["bank_account_number", "Bank Account Number"],
                ["ifsc_code",           "IFSC Code"],
                ["branch_name",         "Branch Name"],
                ["beneficiary_name",    "Name of Beneficiary"],
              ].map(([field, label]) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
                  <input type="text" value={form[field]} onChange={(e) => set(field, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Documents */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
              Supporting Documents
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {DOCS.map((doc) => (
                <div key={doc.field}>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {doc.label}
                    {doc.required && <span className="text-red-500 ml-1">*</span>}
                    {files[doc.field] && <span className="ml-2 text-emerald-600">✓ Selected</span>}
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer border border-dashed border-gray-300 rounded-lg px-3 py-2.5 hover:border-emerald-400 hover:bg-emerald-50 transition text-sm text-gray-500">
                    <Upload size={14} />
                    <span className="truncate">
                      {files[doc.field] ? files[doc.field].name : "Click to upload"}
                    </span>
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFile(doc.field, e.target.files)} />
                  </label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">Accepted: PDF, JPG, PNG. Max 5 MB per file.</p>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="px-6 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60 flex items-center gap-2">
              {submitting ? "Submitting…" : <><FileText size={15} /> Submit Claim</>}
            </button>
          </div>
        </form>
      )}

      {/* ── My Claims ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-5 border-b">
          <h2 className="font-semibold text-gray-800">My Reimbursement Claims</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : applications.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <Award size={40} className="mx-auto mb-3 opacity-40" />
            <p>No claims yet. Click <strong>New Claim</strong> to apply.</p>
          </div>
        ) : (
          <div className="divide-y">
            {applications.map((app) => {
              const meta  = STATUS_META[app.status] || STATUS_META.SUBMITTED;
              const Icon  = meta.icon;
              const open  = expandedId === app.id;
              const grade = GRADE_CONFIG.find((g) => g.grade === app.naac_grade);
              return (
                <div key={app.id} className="p-4">
                  <button className="w-full flex items-center justify-between text-left"
                    onClick={() => setExpandedId(open ? null : app.id)}>
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-100 rounded-full p-2">
                        <Award size={18} className="text-emerald-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-800">{app.college_name}</p>
                          {grade && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${grade.badge}`}>
                              {grade.label}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Accreditation Year: {app.accreditation_year} ·{" "}
                          Claimed: {fmt(app.reimbursement_amount)} ·{" "}
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
                    <div className="mt-4 ml-12 space-y-3 text-sm">
                      <div className="grid md:grid-cols-3 gap-3">
                        <div className={`rounded-xl border p-3 ${grade?.color || "bg-gray-50"}`}>
                          <p className="text-xs text-gray-400">NAAC Grade</p>
                          <p className="text-2xl font-bold text-gray-800">{app.naac_grade}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-400">Claimed Reimbursement</p>
                          <p className="font-bold text-gray-800">{fmt(app.reimbursement_amount)}</p>
                        </div>
                        {app.approved_amount && (
                          <div className="bg-emerald-50 rounded-lg p-3">
                            <p className="text-xs text-emerald-500">Approved Amount</p>
                            <p className="font-bold text-emerald-700">{fmt(app.approved_amount)}</p>
                          </div>
                        )}
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-400">Valid Until</p>
                          <p className="font-bold text-gray-800">{app.accreditation_valid_until || "—"}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-400">Certificate No.</p>
                          <p className="font-medium text-xs text-gray-700">{app.naac_certificate_number || "—"}</p>
                        </div>
                      </div>

                      {app.bank_account_number && (
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs">
                          <p className="font-semibold text-blue-700 mb-1">Bank Details</p>
                          <p>A/C: {app.bank_account_number} · IFSC: {app.ifsc_code} · Branch: {app.branch_name}</p>
                          <p>Beneficiary: {app.beneficiary_name}</p>
                        </div>
                      )}

                      {app.directorate_remarks && (
                        <div className={`border rounded-lg p-3 ${app.status === "APPROVED" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                          <p className={`text-xs font-semibold ${app.status === "APPROVED" ? "text-green-700" : "text-red-700"}`}>
                            Directorate Remarks
                          </p>
                          <p className="text-xs text-gray-700 mt-1">{app.directorate_remarks}</p>
                        </div>
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
