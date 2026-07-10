import API from '../../../config/api';
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PlusCircle, FileText, CheckCircle, Clock,
  XCircle, ChevronDown, ChevronUp, Upload, IndianRupee, Mountain, Leaf,
} from "lucide-react";



const REGIONS = [
  {
    value: "PLAIN",
    label: "Plain Region",
    subsidy: 25,
    icon: Leaf,
    description:
      "Applicant's centre is located in a plain / non-hilly area. Subsidy is 25% of the approved claim amount.",
    bg: "bg-amber-50",
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
      "Applicant's centre is located in a hilly / mountainous area. Subsidy is 50% of the approved claim amount.",
    bg: "bg-blue-50",
    border: "border-blue-400",
    badge: "bg-blue-100 text-blue-700",
    iconColor: "text-blue-600",
  },
];

const DOCS = [
  { field: "doc_fire_safety",     label: "Fire & Safety Audit Certificate",        required: true  },
  { field: "doc_udyog_reg",       label: "Udyog / MSME Registration",              required: true  },
  { field: "doc_gst_reg",         label: "GST Registration Certificate",            required: true  },
  { field: "doc_pollution_cert",  label: "Pollution Clearance Certificate",         required: true  },
  { field: "doc_dpr",             label: "DPR — Certified by Planner / Architect", required: true  },
  { field: "doc_ca_project_cost", label: "CA Certified Project Cost Statement",     required: true  },
  { field: "doc_land_document",   label: "Copy of Land Document",                  required: true  },
  { field: "doc_constitution",    label: "Constitution of Firm / Society Deed",     required: true  },
  { field: "doc_others",          label: "Any Other Supporting Document",           required: false },
];

const STATUS_META = {
  SUBMITTED:                { label: "Submitted",             color: "bg-blue-100 text-blue-700",      icon: Clock        },
  DISTRICT_UNDER_REVIEW:    { label: "District Under Review", color: "bg-yellow-100 text-yellow-700",  icon: Clock        },
  DISTRICT_APPROVED:        { label: "District Approved",     color: "bg-green-100 text-green-700",    icon: CheckCircle  },
  DISTRICT_DISAPPROVED:     { label: "District Disapproved",  color: "bg-red-100 text-red-700",        icon: XCircle      },
  DIRECTORATE_UNDER_REVIEW: { label: "Directorate Review",    color: "bg-purple-100 text-purple-700",  icon: Clock        },
  DIRECTORATE_APPROVED:     { label: "Finally Approved ✓",   color: "bg-emerald-100 text-emerald-700", icon: CheckCircle  },
  DIRECTORATE_REJECTED:     { label: "Rejected",              color: "bg-red-100 text-red-700",        icon: XCircle      },
};

const fmt = (n) =>
  n != null ? `₹${parseFloat(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—";

export default function IncentiveApplication() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [expandedId, setExpandedId]     = useState(null);
  const [submitting, setSubmitting]     = useState(false);
  const [successMsg, setSuccessMsg]     = useState("");

  const [form, setForm] = useState({
    region: "",
    centreName: "",
    district: "",
    investmentAmount: "",
    claimAmount: "",
  });
  const [files, setFiles] = useState({});


  const fetchApplications = async () => {
    try {
      const r = await axiosInstance.get(`${API}/api/training-centre/incentives`, { headers });
      setApplications(r.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, []);

  const selectedRegion = REGIONS.find((r) => r.value === form.region);
  const subsidyPct     = selectedRegion?.subsidy || 0;
  const claimNum       = parseFloat(form.claimAmount) || 0;
  const subsidyAmount  = (claimNum * subsidyPct) / 100;

  const handleFile = (field, fileList) =>
    setFiles((prev) => ({ ...prev, [field]: fileList[0] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.region) return alert("Please select your region (Plain or Hilly).");
    if (!form.centreName || !form.district || !form.investmentAmount || !form.claimAmount)
      return alert("Please fill all required fields.");

    const missingDocs = DOCS.filter((d) => d.required && !files[d.field]);
    if (missingDocs.length)
      return alert(`Please upload: ${missingDocs.map((d) => d.label).join(", ")}`);

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("region",           form.region);
      fd.append("centreName",       form.centreName);
      fd.append("district",         form.district);
      fd.append("investmentAmount", form.investmentAmount);
      fd.append("claimAmount",      form.claimAmount);
      Object.entries(files).forEach(([k, v]) => { if (v) fd.append(k, v); });

      await axiosInstance.post(`${API}/api/training-centre/incentives`, fd, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });

      setSuccessMsg("Application submitted successfully! It will be reviewed by the District Officer.");
      setShowForm(false);
      setForm({ region: "", centreName: "", district: "", investmentAmount: "", claimAmount: "" });
      setFiles({});
      fetchApplications();
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
          <h1 className="text-2xl font-bold text-gray-800">Incentive Applications</h1>
          <p className="text-sm text-gray-500 mt-1">
            Apply for government subsidy for your Yoga Centre
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setSuccessMsg(""); }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
        >
          <PlusCircle size={16} /> New Application
        </button>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {/* ── Application Form ─────────────────────────────────────────────── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-800">New Incentive Application</h2>

          {/* Step 1: Region Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Select Your Region <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">
              The subsidy percentage is determined by the geographical region of your centre.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {REGIONS.map((r) => {
                const Icon = r.icon;
                const selected = form.region === r.value;
                return (
                  <button
                    type="button"
                    key={r.value}
                    onClick={() => setForm((p) => ({ ...p, region: r.value }))}
                    className={`text-left p-5 rounded-xl border-2 transition-all ${
                      selected ? `${r.border} ${r.bg}` : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon size={20} className={selected ? r.iconColor : "text-gray-400"} />
                        <span className="font-semibold text-gray-800">{r.label}</span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${r.badge}`}>
                        {r.subsidy}% Subsidy
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-snug">{r.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Centre & Investment Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Name of Centre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.centreName}
                onChange={(e) => setForm((p) => ({ ...p, centreName: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Sunrise Yoga Centre"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                District <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.district}
                onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. Jaipur"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Total Investment Amount (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <IndianRupee size={15} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.investmentAmount}
                  onChange={(e) => setForm((p) => ({ ...p, investmentAmount: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Claim Amount (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <IndianRupee size={15} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.claimAmount}
                  onChange={(e) => setForm((p) => ({ ...p, claimAmount: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </div>

          {/* Auto-calculated subsidy */}
          {form.region && claimNum > 0 && (
            <div className={`border rounded-xl p-4 flex items-center gap-4 ${selectedRegion?.bg} border-${selectedRegion?.value === "PLAIN" ? "amber" : "blue"}-200`}>
              <div className={`rounded-full p-2 ${selectedRegion?.value === "PLAIN" ? "bg-amber-100" : "bg-blue-100"}`}>
                <IndianRupee size={20} className={selectedRegion?.iconColor} />
              </div>
              <div>
                <p className={`text-xs font-medium ${selectedRegion?.value === "PLAIN" ? "text-amber-600" : "text-blue-600"}`}>
                  Auto-calculated Subsidy — {selectedRegion?.label}
                </p>
                <p className={`text-2xl font-bold ${selectedRegion?.value === "PLAIN" ? "text-amber-700" : "text-blue-700"}`}>
                  {fmt(subsidyAmount)}
                </p>
                <p className={`text-xs mt-0.5 ${selectedRegion?.value === "PLAIN" ? "text-amber-600" : "text-blue-600"}`}>
                  {subsidyPct}% of claim amount {fmt(claimNum)}
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Mandatory Documents <span className="text-red-500">*</span>
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {DOCS.map((doc) => (
                <div key={doc.field}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {doc.label}
                    {doc.required && <span className="text-red-500 ml-1">*</span>}
                    {files[doc.field] && (
                      <span className="ml-2 text-emerald-600">✓ Selected</span>
                    )}
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer border border-dashed border-gray-300 rounded-lg px-3 py-2 hover:border-emerald-400 hover:bg-emerald-50 transition text-sm text-gray-500">
                    <Upload size={14} />
                    <span className="truncate">
                      {files[doc.field] ? files[doc.field].name : "Click to upload"}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFile(doc.field, e.target.files)}
                    />
                  </label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Accepted formats: PDF, JPG, PNG. Max 10MB per file.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t">
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
              className="px-6 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60 flex items-center gap-2"
            >
              {submitting ? "Submitting..." : <><FileText size={15} /> Submit Application</>}
            </button>
          </div>
        </form>
      )}

      {/* ── My Applications ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-5 border-b">
          <h2 className="font-semibold text-gray-800">My Applications</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : applications.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <FileText size={40} className="mx-auto mb-3 opacity-40" />
            <p>No applications yet. Click <strong>New Application</strong> to get started.</p>
          </div>
        ) : (
          <div className="divide-y">
            {applications.map((app) => {
              const meta   = STATUS_META[app.status] || STATUS_META.SUBMITTED;
              const Icon   = meta.icon;
              const open   = expandedId === app.id;
              const region = REGIONS.find((r) => r.value === app.region);
              return (
                <div key={app.id} className="p-4">
                  <button
                    className="w-full flex items-center justify-between text-left"
                    onClick={() => setExpandedId(open ? null : app.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-100 rounded-full p-2">
                        <FileText size={18} className="text-emerald-700" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{app.centre_name}</p>
                        <p className="text-xs text-gray-500">
                          {region?.label || app.region} · {app.district} ·{" "}
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
                    <div className="mt-4 ml-12 grid md:grid-cols-3 gap-4 text-sm">
                      <div className={`rounded-lg p-3 ${region?.bg || "bg-gray-50"}`}>
                        <p className="text-xs text-gray-500">Region</p>
                        <p className="font-bold text-gray-800">{region?.label || app.region}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{app.subsidy_percentage}% subsidy rate</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Claim Amount</p>
                        <p className="font-bold text-gray-800">{fmt(app.claim_amount)}</p>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-3">
                        <p className="text-xs text-emerald-600">Subsidy Amount</p>
                        <p className="font-bold text-emerald-700">{fmt(app.subsidy_amount)}</p>
                      </div>
                      {app.district_remarks && (
                        <div className="md:col-span-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-xs font-semibold text-yellow-700">District Officer Remarks</p>
                          <p className="text-xs text-yellow-800 mt-1">{app.district_remarks}</p>
                        </div>
                      )}
                      {app.directorate_remarks && (
                        <div className="md:col-span-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <p className="text-xs font-semibold text-purple-700">Directorate Remarks</p>
                          <p className="text-xs text-purple-800 mt-1">{app.directorate_remarks}</p>
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
