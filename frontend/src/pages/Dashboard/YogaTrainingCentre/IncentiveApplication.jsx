import API from '../../../config/api';
import React, { useState, useEffect } from "react";
import axios from "axios";
import axiosInstance from '../../../config/axiosInstance';
import {
  PlusCircle, FileText, CheckCircle, Clock,
  XCircle, ChevronDown, ChevronUp, Upload, IndianRupee, Mountain, Leaf,
  CheckCircle2, X, Building
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
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Approved Subsidy</p>
                        <p className="font-bold text-emerald-700 text-sm mt-0.5">{fmt(app.subsidy_amount)}</p>
                        <p className="text-xs text-emerald-500 mt-1">Capped claim limit applied</p>
                      </div>

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

                      {/* Proposed Site details */}
                      <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3 rounded-lg border">
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
                              href={`${API}${app.proposed_site_photo}`}
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
                                href={`${API}${val}`}
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
