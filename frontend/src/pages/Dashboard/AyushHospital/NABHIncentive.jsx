import API from '../../../config/api';
import axiosInstance from '../../../config/axiosInstance';
import React, { useState, useEffect, useRef } from "react";
import {
  Award, CheckCircle, FileText, IndianRupee, Clock, Loader2,
  AlertCircle, Upload, File, Plus, ChevronDown, ChevronUp, XCircle,
} from "lucide-react";

const ACCREDITATION_TYPES = [
  "Entry Level",
  "Full Accreditation",
  "Provisional Accreditation",
  "Pre-Accreditation Entry Level (PAEL)",
  "Pre-Accreditation Progressive Level (PAPL)",
];

function FileDropzone({ label, fieldName, file, onChange, accept = ".pdf,.jpg,.jpeg,.png" }) {
  const ref = useRef(null);
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <input type="file" ref={ref} name={fieldName} onChange={onChange} accept={accept} className="hidden" />
      <div
        onClick={() => ref.current.click()}
        className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:bg-blue-50/50 hover:border-blue-400 group ${file ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
      >
        {file ? (
          <>
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
              <File size={20} />
            </div>
            <p className="text-xs font-semibold text-blue-700 truncate max-w-full px-2">{file.name}</p>
            <p className="text-[10px] text-gray-400">Click to change</p>
          </>
        ) : (
          <>
            <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-lg flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
              <Plus size={20} />
            </div>
            <p className="text-xs font-medium text-gray-500">
              Drop file or <span className="text-blue-600 font-semibold">Browse</span>
            </p>
            <p className="text-[10px] text-gray-400">PDF, JPG, PNG — max 10 MB</p>
          </>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    SUBMITTED:   "bg-blue-100 text-blue-700 border-blue-200",
    UNDER_REVIEW:"bg-amber-100 text-amber-700 border-amber-200",
    APPROVED:    "bg-green-100 text-green-700 border-green-200",
    REJECTED:    "bg-red-100 text-red-700 border-red-200",
  };
  const icons = {
    SUBMITTED:    <Clock size={13} />,
    UNDER_REVIEW: <Clock size={13} />,
    APPROVED:     <CheckCircle size={13} />,
    REJECTED:     <XCircle size={13} />,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${map[status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {icons[status]}
      {status?.replace(/_/g, " ")}
    </span>
  );
}

const NABHIncentive = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState(null);
  const [success, setSuccess]           = useState("");
  const [expandedId, setExpandedId]     = useState(null);

  const [form, setForm] = useState({
    hospital_name: "",
    nabh_certificate_number: "",
    nabh_accreditation_type: "",
    nabh_valid_from: "",
    nabh_valid_to: "",
    accreditation_year: new Date().getFullYear().toString(),
    fee_paid_amount: "",
    requested_amount: "",
    bank_account_number: "",
    ifsc_code: "",
    branch_name: "",
    beneficiary_name: "",
  });

  const [files, setFiles] = useState({
    doc_nabh_certificate: null,
    doc_fee_receipt: null,
    doc_bank_details: null,
    doc_others: null,
  });

  const fetchApplications = async () => {
    try {
      const r = await axiosInstance.get(`${API}/api/ayush-hospital/nabh-reimbursement`);
      if (r.data.success) setApplications(r.data.data || []);
    } catch (e) {
      console.error("Fetch NABH reimbursements:", e);
      // Don't block the page — user can still submit new applications
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, []);

  const handleField = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleFile = (e) => {
    const { name, files: sel } = e.target;
    if (sel?.[0]) setFiles(p => ({ ...p, [name]: sel[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess("");

    if (!form.hospital_name || !form.nabh_accreditation_type || !form.accreditation_year || !form.fee_paid_amount) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!files.doc_nabh_certificate) {
      setError("NABH Accreditation Certificate is required.");
      return;
    }
    if (!files.doc_fee_receipt) {
      setError("Fee receipt / payment proof is required.");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      Object.entries(files).forEach(([k, v]) => { if (v) fd.append(k, v); });

      const r = await axiosInstance.post(`${API}/api/ayush-hospital/nabh-reimbursement`, fd);
      if (r.data.success) {
        setSuccess("Application submitted successfully! It will be reviewed by the Directorate.");
        setShowForm(false);
        setForm({
          hospital_name: "", nabh_certificate_number: "", nabh_accreditation_type: "",
          nabh_valid_from: "", nabh_valid_to: "",
          accreditation_year: new Date().getFullYear().toString(),
          fee_paid_amount: "", requested_amount: "",
          bank_account_number: "", ifsc_code: "", branch_name: "", beneficiary_name: "",
        });
        setFiles({ doc_nabh_certificate: null, doc_fee_receipt: null, doc_bank_details: null, doc_others: null });
        fetchApplications();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={40} className="animate-spin text-emerald-600" />
        <p className="text-gray-500 font-medium">Loading NABH Reimbursement data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">NABH Accreditation Fee Reimbursement</h1>
          <p className="text-gray-500 text-sm mt-1">Apply for reimbursement of fees paid for obtaining NABH accreditation. Applications are reviewed and approved by the Directorate.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setError(null); setSuccess(""); }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold transition shadow-lg flex items-center gap-2 text-sm"
          >
            <Plus size={18} /> New Application
          </button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={18} className="shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center gap-3">
          <CheckCircle size={18} className="shrink-0" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      {/* Application Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Award size={20} className="text-emerald-600" />
              NABH Reimbursement Application
            </h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition">
              <XCircle size={22} />
            </button>
          </div>

          {/* Section: Hospital & NABH Details */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Hospital & NABH Details</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Hospital Name <span className="text-red-500">*</span></label>
                <input
                  type="text" name="hospital_name" value={form.hospital_name} onChange={handleField} required
                  placeholder="e.g. Shri Ram Ayurvedic Hospital"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">NABH Certificate Number</label>
                <input
                  type="text" name="nabh_certificate_number" value={form.nabh_certificate_number} onChange={handleField}
                  placeholder="e.g. NABH/H/12345/2023"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Accreditation Type <span className="text-red-500">*</span></label>
                <select
                  name="nabh_accreditation_type" value={form.nabh_accreditation_type} onChange={handleField} required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                >
                  <option value="">Select type...</option>
                  {ACCREDITATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Accreditation Year <span className="text-red-500">*</span></label>
                <input
                  type="number" name="accreditation_year" value={form.accreditation_year} onChange={handleField} required
                  min="2000" max="2099"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Accreditation Valid From</label>
                <input
                  type="date" name="nabh_valid_from" value={form.nabh_valid_from} onChange={handleField}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Accreditation Valid To</label>
                <input
                  type="date" name="nabh_valid_to" value={form.nabh_valid_to} onChange={handleField}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* Section: Fee Details */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Fee Details</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Total Fee Paid (₹) <span className="text-red-500">*</span></label>
                <input
                  type="number" name="fee_paid_amount" value={form.fee_paid_amount} onChange={handleField} required
                  placeholder="e.g. 50000" min="0" step="0.01"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Amount Requested for Reimbursement (₹)</label>
                <input
                  type="number" name="requested_amount" value={form.requested_amount} onChange={handleField}
                  placeholder="Leave blank to claim full amount" min="0" step="0.01"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* Section: Bank Details */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Bank Details (for disbursement)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Beneficiary Name</label>
                <input
                  type="text" name="beneficiary_name" value={form.beneficiary_name} onChange={handleField}
                  placeholder="Account holder name"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Bank Account Number</label>
                <input
                  type="text" name="bank_account_number" value={form.bank_account_number} onChange={handleField}
                  placeholder="e.g. 1234567890"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">IFSC Code</label>
                <input
                  type="text" name="ifsc_code" value={form.ifsc_code} onChange={handleField}
                  placeholder="e.g. SBIN0001234"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Branch Name</label>
                <input
                  type="text" name="branch_name" value={form.branch_name} onChange={handleField}
                  placeholder="e.g. Dehradun Main Branch"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* Section: Documents */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
              Supporting Documents <span className="text-red-500">*</span> = required
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FileDropzone
                label={<>NABH Accreditation Certificate <span className="text-red-500">*</span></>}
                fieldName="doc_nabh_certificate"
                file={files.doc_nabh_certificate}
                onChange={handleFile}
              />
              <FileDropzone
                label={<>Fee Receipt / Payment Proof <span className="text-red-500">*</span></>}
                fieldName="doc_fee_receipt"
                file={files.doc_fee_receipt}
                onChange={handleFile}
              />
              <FileDropzone
                label="Bank Details Document (Cancelled Cheque / Passbook)"
                fieldName="doc_bank_details"
                file={files.doc_bank_details}
                onChange={handleFile}
              />
              <FileDropzone
                label="Other Supporting Documents"
                fieldName="doc_others"
                file={files.doc_others}
                onChange={handleFile}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2 border-t">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-100 flex items-center gap-2 disabled:opacity-50 transition"
            >
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Upload size={16} /> Submit Application</>}
            </button>
          </div>
        </form>
      )}

      {/* Application List */}
      {applications.length === 0 && !showForm ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <Award size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium">No reimbursement applications yet.</p>
          <p className="text-xs text-gray-400 mt-1">Click "New Application" to apply for NABH fee reimbursement.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-gray-700">My Applications</h2>
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition text-left"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600 shrink-0">
                    <Award size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{app.hospital_name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {app.nabh_accreditation_type} · Year {app.accreditation_year} · ₹{parseFloat(app.fee_paid_amount).toLocaleString("en-IN")} paid
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <StatusBadge status={app.status} />
                  {expandedId === app.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </button>

              {expandedId === app.id && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-4 bg-gray-50/50">
                  {/* Details grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    {[
                      { label: "Certificate No.", value: app.nabh_certificate_number || "—" },
                      { label: "Valid From",       value: app.nabh_valid_from ? new Date(app.nabh_valid_from).toLocaleDateString("en-IN") : "—" },
                      { label: "Valid To",         value: app.nabh_valid_to   ? new Date(app.nabh_valid_to).toLocaleDateString("en-IN")   : "—" },
                      { label: "Fee Paid",         value: `₹${parseFloat(app.fee_paid_amount).toLocaleString("en-IN")}` },
                      { label: "Requested Amount", value: app.requested_amount ? `₹${parseFloat(app.requested_amount).toLocaleString("en-IN")}` : "Full amount" },
                      { label: "Submitted On",     value: app.created_at ? new Date(app.created_at).toLocaleDateString("en-IN") : "—" },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-white rounded-lg p-2.5 border border-gray-100">
                        <p className="text-gray-400 font-medium mb-0.5">{label}</p>
                        <p className="text-gray-800 font-semibold">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Bank info */}
                  {(app.beneficiary_name || app.bank_account_number) && (
                    <div className="bg-white rounded-lg border border-gray-100 p-3">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Bank Details</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        {[
                          { label: "Beneficiary", value: app.beneficiary_name },
                          { label: "Account No.", value: app.bank_account_number },
                          { label: "IFSC",        value: app.ifsc_code },
                          { label: "Branch",      value: app.branch_name },
                        ].map(({ label, value }) => value ? (
                          <div key={label}>
                            <p className="text-gray-400">{label}</p>
                            <p className="text-gray-800 font-medium">{value}</p>
                          </div>
                        ) : null)}
                      </div>
                    </div>
                  )}

                  {/* Documents */}
                  <div className="bg-white rounded-lg border border-gray-100 p-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Submitted Documents</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {[
                        { label: "NABH Certificate",  path: app.doc_nabh_certificate },
                        { label: "Fee Receipt",        path: app.doc_fee_receipt },
                        { label: "Bank Details Doc",   path: app.doc_bank_details },
                        { label: "Other Documents",    path: app.doc_others },
                      ].map(({ label, path }) => (
                        <div key={label} className="flex items-center gap-1.5 min-w-0">
                          {path ? (
                            <a
                              href={`${API}/${path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1 truncate"
                            >
                              <FileText size={11} className="shrink-0 text-blue-400" />
                              <span className="truncate">{label}</span>
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <FileText size={11} className="shrink-0 text-gray-300" />
                              {label} <em className="text-gray-300">— not uploaded</em>
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Directorate decision */}
                  {(app.status === "APPROVED" || app.status === "REJECTED") && (
                    <div className={`rounded-lg border p-3 text-xs ${app.status === "APPROVED" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                      <p className={`font-bold uppercase tracking-widest mb-1 ${app.status === "APPROVED" ? "text-green-700" : "text-red-700"}`}>
                        Directorate Decision: {app.status}
                      </p>
                      {app.approved_amount && (
                        <p className="text-green-800 font-semibold">
                          Approved Amount: ₹{parseFloat(app.approved_amount).toLocaleString("en-IN")}
                        </p>
                      )}
                      {app.directorate_remarks && (
                        <p className="text-gray-700 mt-1">Remarks: {app.directorate_remarks}</p>
                      )}
                      {app.directorate_reviewed_at && (
                        <p className="text-gray-500 mt-1">Reviewed on: {new Date(app.directorate_reviewed_at).toLocaleDateString("en-IN")}</p>
                      )}
                    </div>
                  )}

                  {/* Workflow tracker */}
                  <div className="bg-white rounded-lg border border-gray-100 p-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Application Workflow</p>
                    <div className="flex items-center gap-0">
                      {[
                        { label: "Submitted",           done: true },
                        { label: "Directorate Review",  done: ["UNDER_REVIEW","APPROVED","REJECTED"].includes(app.status) },
                        { label: "Decision",            done: ["APPROVED","REJECTED"].includes(app.status), decision: app.status },
                      ].map((step, i, arr) => (
                        <React.Fragment key={step.label}>
                          <div className="flex flex-col items-center text-center flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step.done ? "bg-emerald-100 border-emerald-400 text-emerald-600" : "bg-gray-100 border-gray-200 text-gray-300"}`}>
                              {step.done
                                ? step.decision === "REJECTED"
                                  ? <XCircle size={16} className="text-red-500" />
                                  : <CheckCircle size={16} />
                                : <Clock size={14} />}
                            </div>
                            <p className="text-[10px] text-gray-600 mt-1 font-medium leading-tight">{step.label}</p>
                          </div>
                          {i < arr.length - 1 && (
                            <div className={`flex-1 h-0.5 mb-4 ${step.done ? "bg-emerald-200" : "bg-gray-100"}`} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info box */}
      <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-start gap-4">
        <div className="bg-amber-100 p-2.5 rounded-xl text-amber-600 shrink-0">
          <IndianRupee size={22} />
        </div>
        <div>
          <h4 className="font-semibold text-amber-900 mb-1 text-sm">Reimbursement Guidelines</h4>
          <ul className="text-xs text-amber-800 space-y-1 list-disc ml-4">
            <li>Applications are reviewed and approved directly by the Directorate.</li>
            <li>NABH Accreditation Certificate and Fee Receipt are mandatory documents.</li>
            <li>Reimbursement will be disbursed to the registered bank account.</li>
            <li>One reimbursement application is permitted per accreditation year.</li>
            <li>Incomplete applications or missing documents may result in rejection.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NABHIncentive;
