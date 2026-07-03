import API from '../../../config/api';
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PlusCircle, FileText, CheckCircle, Clock, XCircle,
  ChevronDown, ChevronUp, Upload, IndianRupee, GraduationCap, AlertCircle,
} from "lucide-react";



const STATUS_META = {
  SUBMITTED:    { label: "Submitted",    color: "bg-blue-100 text-blue-700",     icon: Clock        },
  UNDER_REVIEW: { label: "Under Review", color: "bg-yellow-100 text-yellow-700", icon: Clock        },
  APPROVED:     { label: "Approved ✓",  color: "bg-emerald-100 text-emerald-700",icon: CheckCircle  },
  REJECTED:     { label: "Rejected",     color: "bg-red-100 text-red-700",       icon: XCircle      },
};

const DOCS = [
  { field: "doc_certificate",    label: "Course Completion Certificate",            required: true  },
  { field: "doc_fee_receipt",    label: "Exam Fee Payment Receipt",                 required: true  },
  { field: "doc_marksheet",      label: "Marksheet / Grade Card",                   required: true  },
  { field: "doc_id_proof",       label: "Identity Proof (Aadhaar / PAN / Passport)",required: true  },
  { field: "doc_board_approval", label: "Board Certification / Approval Letter",    required: true  },
];

const fmt = (n) =>
  n != null ? `₹${parseFloat(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—";

const BLANK = {
  course_name: "", course_code: "", certifying_board: "", course_duration: "",
  completion_date: "", applicant_name: "", registration_number: "",
  exam_center: "", exam_fee_paid: "", claimed_amount: "",
  bank_account_number: "", ifsc_code: "", branch_name: "", beneficiary_name: "",
};

export default function ExamFeeReimbursement() {
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
      const r = await axiosInstance.get(`${API}/api/yoga-professional/exam-fee`, { headers });
      setApplications(r.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const handleFile = (field, fileList) =>
    setFiles((p) => ({ ...p, [field]: fileList[0] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const missing = DOCS.filter((d) => d.required && !files[d.field]);
    if (missing.length)
      return alert(`Please upload: ${missing.map((d) => d.label).join(", ")}`);

    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      Object.entries(files).forEach(([k, v]) => { if (v) fd.append(k, v); });

      await axiosInstance.post(`${API}/api/yoga-professional/exam-fee`, fd, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });

      setSuccessMsg("Reimbursement application submitted! The Directorate will review and process your claim.");
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
          <h1 className="text-2xl font-bold text-gray-800">Exam Fee Reimbursement</h1>
          <p className="text-sm text-gray-500 mt-1">
            Claim reimbursement for courses certified by the Yoga Professional Board
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setSuccessMsg(""); }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
        >
          <PlusCircle size={16} /> New Claim
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3 text-sm">
        <AlertCircle size={17} className="text-blue-500 mt-0.5 shrink-0" />
        <p className="text-blue-800">
          Only courses <strong>certified by the Yoga Professional Board</strong> are eligible for exam fee reimbursement.
          Upload the board certification/approval letter along with your course certificate and fee receipt.
          Applications are reviewed and approved by the <strong>Directorate</strong>.
        </p>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {/* ── Application Form ── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <GraduationCap size={20} className="text-emerald-600" /> New Reimbursement Claim
          </h2>

          {/* Course Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Course Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Course Name <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.course_name} onChange={(e) => set("course_name", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Certified Yoga Instructor Level II" required />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Course Code</label>
                <input type="text" value={form.course_code} onChange={(e) => set("course_code", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. YPB-L2-2024" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Certifying Board <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.certifying_board} onChange={(e) => set("certifying_board", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Yoga Professional Board of India" required />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Course Duration</label>
                <input type="text" value={form.course_duration} onChange={(e) => set("course_duration", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. 6 months / 200 hours" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Course Completion Date <span className="text-red-500">*</span>
                </label>
                <input type="date" value={form.completion_date} onChange={(e) => set("completion_date", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required />
              </div>
            </div>
          </div>

          {/* Applicant Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Applicant Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.applicant_name} onChange={(e) => set("applicant_name", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="As per certificate" required />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Registration / Roll Number</label>
                <input type="text" value={form.registration_number} onChange={(e) => set("registration_number", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. YPB/2024/1234" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Exam Centre</label>
                <input type="text" value={form.exam_center} onChange={(e) => set("exam_center", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="City / Institution name" />
              </div>
            </div>
          </div>

          {/* Fee Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Fee Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Total Exam Fee Paid (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <IndianRupee size={14} className="absolute left-3 top-3 text-gray-400" />
                  <input type="number" min="0" step="0.01" value={form.exam_fee_paid}
                    onChange={(e) => set("exam_fee_paid", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="0.00" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Claimed Reimbursement Amount (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <IndianRupee size={14} className="absolute left-3 top-3 text-gray-400" />
                  <input type="number" min="0" step="0.01" value={form.claimed_amount}
                    onChange={(e) => set("claimed_amount", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="0.00" required />
                </div>
                {form.exam_fee_paid && form.claimed_amount &&
                  parseFloat(form.claimed_amount) > parseFloat(form.exam_fee_paid) && (
                  <p className="text-xs text-red-500 mt-1">Claimed amount cannot exceed fee paid.</p>
                )}
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Bank Details for Reimbursement</h3>
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

          {/* Documents */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
              Documents <span className="text-red-500">*</span>
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {DOCS.map((doc) => (
                <div key={doc.field}>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {doc.label}
                    {doc.required && <span className="text-red-500 ml-1">*</span>}
                    {files[doc.field] && <span className="ml-2 text-emerald-600">✓</span>}
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
            <GraduationCap size={40} className="mx-auto mb-3 opacity-40" />
            <p>No claims yet. Click <strong>New Claim</strong> to apply.</p>
          </div>
        ) : (
          <div className="divide-y">
            {applications.map((app) => {
              const meta = STATUS_META[app.status] || STATUS_META.SUBMITTED;
              const Icon = meta.icon;
              const open = expandedId === app.id;
              return (
                <div key={app.id} className="p-4">
                  <button className="w-full flex items-center justify-between text-left"
                    onClick={() => setExpandedId(open ? null : app.id)}>
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-100 rounded-full p-2">
                        <GraduationCap size={18} className="text-emerald-700" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{app.course_name}</p>
                        <p className="text-xs text-gray-500">
                          {app.certifying_board} · {new Date(app.completion_date).toLocaleDateString("en-IN")} ·{" "}
                          Claimed: {fmt(app.claimed_amount)}
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
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-400">Exam Fee Paid</p>
                          <p className="font-bold text-gray-800">{fmt(app.exam_fee_paid)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-400">Claimed Amount</p>
                          <p className="font-bold text-gray-800">{fmt(app.claimed_amount)}</p>
                        </div>
                        {app.approved_amount && (
                          <div className="bg-emerald-50 rounded-lg p-3">
                            <p className="text-xs text-emerald-500">Approved Amount</p>
                            <p className="font-bold text-emerald-700">{fmt(app.approved_amount)}</p>
                          </div>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        {[
                          ["Course Code",       app.course_code || "—"],
                          ["Certifying Board",  app.certifying_board],
                          ["Reg. Number",       app.registration_number || "—"],
                          ["Exam Centre",       app.exam_center || "—"],
                        ].map(([lbl, val]) => (
                          <div key={lbl} className="bg-gray-50 rounded-lg p-2.5">
                            <p className="text-xs text-gray-400">{lbl}</p>
                            <p className="text-xs font-medium text-gray-700 mt-0.5">{val}</p>
                          </div>
                        ))}
                      </div>
                      {app.bank_account_number && (
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs">
                          <p className="font-semibold text-blue-700 mb-1">Bank Details</p>
                          <p className="text-gray-700">A/C: {app.bank_account_number} · IFSC: {app.ifsc_code}</p>
                          <p className="text-gray-700">Branch: {app.branch_name} · Beneficiary: {app.beneficiary_name}</p>
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
