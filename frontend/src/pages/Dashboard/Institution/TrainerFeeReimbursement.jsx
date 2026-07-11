import API from '../../../config/api';
import axiosInstance from '../../../config/axiosInstance';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Building2, Hotel, Home, School, GraduationCap, Dumbbell, Leaf, MapPin,
  ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, Plus, Minus,
  IndianRupee, Users, Award, FileText, AlertCircle,
} from "lucide-react";



const INSTITUTE_TYPES = [
  { value: "INSTITUTION",   label: "Institution",    icon: Building2 },
  { value: "HOMESTAY",      label: "Home Stay",      icon: Home },
  { value: "RESORT",        label: "Resort",         icon: MapPin },
  { value: "HOTEL",         label: "Hotel",          icon: Hotel },
  { value: "SCHOOL",        label: "School",         icon: School },
  { value: "COLLEGE",       label: "College",        icon: GraduationCap },
  { value: "YOGA_CENTRE",   label: "Yoga Centre",    icon: Leaf },
  { value: "YOGA_INSTITUTE","label": "Yoga Institute", icon: Dumbbell },
];

const RATE   = 250;
const MAX_S  = 20;
const MAX_M  = 5000;
const MAX_T  = 15000;

function calcAmount(sessions) {
  const s = Math.min(Math.max(parseInt(sessions) || 0, 0), MAX_S);
  return Math.min(s * RATE, MAX_M);
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const currentYear = new Date().getFullYear();
const MONTH_OPTIONS = [];
for (let y = currentYear - 1; y <= currentYear; y++) {
  MONTHS.forEach((m) => MONTH_OPTIONS.push(`${m} ${y}`));
}

const STATUS_CONFIG = {
  SUBMITTED:    { color: "blue",   icon: Clock,        label: "Submitted" },
  UNDER_REVIEW: { color: "yellow", icon: Clock,        label: "Under Review" },
  APPROVED:     { color: "green",  icon: CheckCircle,  label: "Approved" },
  REJECTED:     { color: "red",    icon: XCircle,      label: "Rejected" },
};

export default function TrainerFeeReimbursement() {

  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [expandedId, setExpandedId]     = useState(null);
  const [isOperational, setIsOperational] = useState(true);
  const [checkingOperational, setCheckingOperational] = useState(false);
  const userRole = localStorage.getItem("userRole") || "";

  const [form, setForm] = useState({
    institute_type: "",
    institute_name: "",
    institute_address: "",
    contact_person: "",
    contact_phone: "",
    contact_email: "",
    trainer_name: "",
    trainer_qualification: "",
    trainer_cert_number: "",
    month_1_label: "",
    month_1_sessions: 0,
    month_2_label: "",
    month_2_sessions: 0,
    month_3_label: "",
    month_3_sessions: 0,
    bank_account_number: "",
    ifsc_code: "",
    branch_name: "",
    beneficiary_name: "",
  });
  const [docs, setDocs] = useState({
    doc_attendance_m1: null,
    doc_attendance_m2: null,
    doc_attendance_m3: null,
    doc_trainer_certificate: null,
    doc_others: null,
  });

  async function fetchApplications() {
    try {
      const res = await axiosInstance.get(`${API}/api/institution/trainer-fee`, {
      });
      if (res.data.success) setApplications(res.data.data);
    } catch { /* silent */ }
    setLoading(false);
  }

  useEffect(() => {
    fetchApplications();
    if (userRole === "yoga_centre") {
      setCheckingOperational(true);
      axiosInstance.get(`${API}/api/training-centre/profile`)
        .then((res) => {
          if (res.data && res.data.success) {
            setIsOperational(!!res.data.data.is_operational);
          }
        })
        .catch((err) => {
          console.error("Error checking operational status:", err);
        })
        .finally(() => {
          setCheckingOperational(false);
        });
    }
  }, [userRole]);

  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }

  function setDoc(key, file) { setDocs((d) => ({ ...d, [key]: file })); }

  const m1Amount = calcAmount(form.month_1_sessions);
  const m2Amount = calcAmount(form.month_2_sessions);
  const m3Amount = calcAmount(form.month_3_sessions);
  const totalAmount = Math.min(m1Amount + m2Amount + m3Amount, MAX_T);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.institute_type) return toast.error("Please select institute type.");
    if (!form.month_1_label || !form.month_2_label || !form.month_3_label)
      return toast.error("Please select all 3 claim months.");
    if (
      new Set([form.month_1_label, form.month_2_label, form.month_3_label]).size < 3
    )
      return toast.error("All 3 months must be different.");

    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      Object.entries(docs).forEach(([k, v]) => { if (v) fd.append(k, v); });

      const res = await axiosInstance.post(`${API}/api/institution/trainer-fee`, fd, {
      });
      if (res.data.success) {
        toast.success("Application submitted successfully!");
        setShowForm(false);
        fetchApplications();
      } else {
        toast.error(res.data.message || "Submission failed.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed. Please try again.");
    }
    setSubmitting(false);
  }

  function SessionCounter({ label, value, onChange }) {
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
        >
          <Minus size={14} />
        </button>
        <span className="w-8 text-center font-bold text-lg">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(MAX_S, value + 1))}
          className="w-8 h-8 rounded-full bg-teal-100 hover:bg-teal-200 flex items-center justify-center"
        >
          <Plus size={14} />
        </button>
        <span className="text-sm text-gray-500">sessions</span>
        <span className="ml-auto text-sm font-semibold text-teal-700">
          ₹{calcAmount(value).toLocaleString()}
        </span>
      </div>
    );
  }

  if (loading || checkingOperational) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (userRole === "yoga_centre" && !isOperational) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mx-auto animate-pulse">
            <AlertCircle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-800">Trainer Fee Reimbursement</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              This module is currently <strong className="text-amber-600">inactive</strong> because your Yoga Centre is not marked as <strong className="text-slate-700">operational</strong>.
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl text-xs font-semibold text-slate-600 border border-slate-100">
            Please contact the Directorate / District Officer to verify and mark your centre as operational.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Trainer Fee Reimbursement</h1>
          <p className="text-gray-500 text-sm mt-1">
            Max 20 sessions/month · ₹250/session · Cap ₹5,000/month · Total cap ₹15,000
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
          >
            <Plus size={16} />
            New Application
          </button>
        )}
      </div>

      {/* Rate info cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Per Session", value: "₹250", sub: "Fixed rate" },
          { label: "Monthly Cap", value: "₹5,000", sub: "20 sessions max" },
          { label: "3-Month Total", value: "₹15,000", sub: "Maximum claimable" },
        ].map((c) => (
          <div key={c.label} className="bg-teal-50 border border-teal-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-teal-700">{c.value}</div>
            <div className="text-sm font-medium text-teal-800">{c.label}</div>
            <div className="text-xs text-gray-500">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Application Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">New Application</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Institute Type */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Building2 size={15} /> Select Institute Type
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {INSTITUTE_TYPES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set("institute_type", value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition ${
                      form.institute_type === value
                        ? "border-teal-500 bg-teal-50 text-teal-700"
                        : "border-gray-200 hover:border-teal-300 text-gray-600"
                    }`}
                  >
                    <Icon size={22} />
                    <span className="text-xs font-medium text-center">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Institute Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Building2 size={15} /> Institute Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Institute Name *</label>
                  <input
                    required value={form.institute_name}
                    onChange={(e) => set("institute_name", e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    placeholder="Full name of institute"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                  <textarea
                    rows={2} value={form.institute_address}
                    onChange={(e) => set("institute_address", e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    placeholder="Full address"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Contact Person</label>
                  <input value={form.contact_person} onChange={(e) => set("contact_person", e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="Name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                  <input value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="Mobile number" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input type="email" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="contact@email.com" />
                </div>
              </div>
            </div>

            {/* Trainer Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Users size={15} /> Trainer Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Trainer Name</label>
                  <input value={form.trainer_name} onChange={(e) => set("trainer_name", e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="Full name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Qualification</label>
                  <input value={form.trainer_qualification} onChange={(e) => set("trainer_qualification", e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="e.g. M.Sc Yoga" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Certification Number</label>
                  <input value={form.trainer_cert_number} onChange={(e) => set("trainer_cert_number", e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="Certificate no." />
                </div>
              </div>
            </div>

            {/* 3-Month Sessions */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <IndianRupee size={15} /> Session Claim — 3 Months
              </h3>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-start gap-2 text-sm text-amber-800">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>Select 3 consecutive months. Max 20 sessions per month @ ₹250 each. Monthly cap: ₹5,000.</span>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="border rounded-xl p-4 bg-gray-50">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-7 h-7 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {n}
                      </span>
                      <select
                        required
                        value={form[`month_${n}_label`]}
                        onChange={(e) => set(`month_${n}_label`, e.target.value)}
                        className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      >
                        <option value="">Select month {n}</option>
                        {MONTH_OPTIONS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <SessionCounter
                      label={`Month ${n}`}
                      value={parseInt(form[`month_${n}_sessions`]) || 0}
                      onChange={(v) => set(`month_${n}_sessions`, v)}
                    />
                  </div>
                ))}
              </div>

              {/* Total Banner */}
              <div className="mt-4 bg-teal-600 text-white rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs opacity-80">Total Claim Amount</div>
                  <div className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</div>
                  <div className="text-xs opacity-70">
                    ({m1Amount.toLocaleString()} + {m2Amount.toLocaleString()} + {m3Amount.toLocaleString()})
                    {totalAmount < m1Amount + m2Amount + m3Amount && " — capped at ₹15,000"}
                  </div>
                </div>
                <IndianRupee size={36} className="opacity-30" />
              </div>
            </div>

            {/* Bank Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <IndianRupee size={15} /> Bank Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Account Number</label>
                  <input value={form.bank_account_number} onChange={(e) => set("bank_account_number", e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">IFSC Code</label>
                  <input value={form.ifsc_code} onChange={(e) => set("ifsc_code", e.target.value.toUpperCase())}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="e.g. SBIN0001234" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Branch Name</label>
                  <input value={form.branch_name} onChange={(e) => set("branch_name", e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Beneficiary Name</label>
                  <input value={form.beneficiary_name} onChange={(e) => set("beneficiary_name", e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
                </div>
              </div>
            </div>

            {/* Documents */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <FileText size={15} /> Supporting Documents
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: "doc_attendance_m1",      label: "Attendance Sheet — Month 1" },
                  { key: "doc_attendance_m2",      label: "Attendance Sheet — Month 2" },
                  { key: "doc_attendance_m3",      label: "Attendance Sheet — Month 3" },
                  { key: "doc_trainer_certificate","label": "Trainer Certificate" },
                  { key: "doc_others",             label: "Other Documents" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                    <input
                      type="file" accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setDoc(key, e.target.files[0])}
                      className="w-full text-sm border rounded-lg px-2 py-1.5 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-teal-50 file:text-teal-700"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit" disabled={submitting}
                className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 disabled:opacity-60 transition"
              >
                {submitting ? "Submitting…" : "Submit Application"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Applications List */}
      <div className="space-y-4">
        {applications.length === 0 && !showForm && (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
            <IndianRupee size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No applications yet</p>
            <p className="text-gray-400 text-sm mt-1">Click "New Application" to claim trainer fee reimbursement.</p>
          </div>
        )}
        {applications.map((app) => {
          const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.SUBMITTED;
          const Icon = cfg.icon;
          const expanded = expandedId === app.id;

          return (
            <div key={app.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Card header */}
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedId(expanded ? null : app.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg bg-${cfg.color}-100 flex items-center justify-center`}>
                    <Icon size={20} className={`text-${cfg.color}-600`} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{app.institute_name}</div>
                    <div className="text-xs text-gray-500">
                      {INSTITUTE_TYPES.find((t) => t.value === app.institute_type)?.label || app.institute_type}
                      {" · "}
                      {app.month_1_label} – {app.month_3_label}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-800">
                      ₹{parseFloat(app.total_claimed_amount).toLocaleString()}
                    </div>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-${cfg.color}-100 text-${cfg.color}-700`}>
                      {cfg.label}
                    </span>
                  </div>
                  {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </div>

              {/* Expanded details */}
              {expanded && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-4 bg-gray-50">
                  {/* Monthly breakdown */}
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="bg-white border rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-500 mb-1">{app[`month_${n}_label`]}</div>
                        <div className="text-sm font-bold text-gray-800">{app[`month_${n}_sessions`]} sessions</div>
                        <div className="text-sm text-teal-700 font-semibold">
                          ₹{parseFloat(app[`month_${n}_amount`]).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Trainer info */}
                  {app.trainer_name && (
                    <div className="bg-white border rounded-lg p-3">
                      <div className="text-xs font-semibold text-gray-500 mb-1">Trainer</div>
                      <div className="text-sm font-medium">{app.trainer_name}</div>
                      {app.trainer_qualification && <div className="text-xs text-gray-500">{app.trainer_qualification}</div>}
                      {app.trainer_cert_number && <div className="text-xs text-gray-400">Cert: {app.trainer_cert_number}</div>}
                    </div>
                  )}

                  {/* Directorate decision */}
                  {(app.status === "APPROVED" || app.status === "REJECTED") && (
                    <div className={`rounded-lg p-4 ${
                      app.status === "APPROVED" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                    }`}>
                      <div className={`font-semibold text-sm mb-1 ${
                        app.status === "APPROVED" ? "text-green-800" : "text-red-800"
                      }`}>
                        Directorate Decision: {app.status}
                      </div>
                      {app.approved_amount && (
                        <div className="text-sm text-green-700 font-medium mb-1">
                          Approved Amount: ₹{parseFloat(app.approved_amount).toLocaleString()}
                        </div>
                      )}
                      {app.directorate_remarks && (
                        <div className="text-sm text-gray-700">Remarks: {app.directorate_remarks}</div>
                      )}
                      {app.directorate_reviewed_at && (
                        <div className="text-xs text-gray-500 mt-1">
                          Reviewed: {new Date(app.directorate_reviewed_at).toLocaleDateString("en-IN")}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-gray-400">
                    Application ID: #{app.id} · Submitted: {new Date(app.created_at).toLocaleDateString("en-IN")}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
