import React, { useState, useEffect } from "react";
import { Upload, FileText, CheckCircle2, X, ChevronRight, ChevronLeft, Save } from "lucide-react";
import axios from "axios";
import API from "../../../config/api";
import wellnessService from "../../../services/wellnessService";
import { toast } from "react-toastify";

const DISTRICTS = [
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

const QUALIFICATIONS = [
  "BAMS with PG Diploma / Degree in Yoga",
  "BAMS With diploma / PG Degree in Panchkarma",
  "BAMS",
  "BNYS",
  "BAMS with MD or MS"
];

export default function RegisterCentreForm({ loginProfile, onCancel, onSuccess }) {
  const [activeSection, setActiveSection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Section 1
    already_registered: "No",
    prev_reg_reason: "",
    prev_reg_number: "",
    prev_reg_certificate: null,
    
    centre_name: "",
    district: loginProfile?.district || "",
    address: loginProfile?.address || "",
    latitude: "",
    longitude: "",
    map_link: "",
    owner_name: loginProfile?.contact_person || loginProfile?.applicant_name || "",
    phone: loginProfile?.contact_phone || "",
    is_residential: "No",
    offers_clinical: "No",
    category: "AYUSH Wellness Therapy Centre",
    services_offered: [],

    // Section 2
    doctor_appointed: "No",
    doctor_name: "",
    doctor_qualification: "",
    doctor_qualification_doc: null,
    doctor_bcp_reg_number: "",
    doctor_bcp_reg_doc: null,
    declaration_a: false,
    declaration_b: false,
    cea_reg_number: "",
    cea_valid_till: "",
    cea_reg_doc: null,
    cea_registered: "No",

    // Section 3
    rooms_count: "",
    therapy_beds_count: "",
    covered_area: "",
    equipment_details: "",

    // Section 4
    pharmacist_name: "",
    pharmacist_reg_number: "",
    pharmacist_bcp_doc: null,
    male_therapists_count: "",
    female_therapists_count: ""
  });

  // Auto calculate Category based on Residential and Clinical type
  useEffect(() => {
    let calculatedCategory = "AYUSH Wellness Therapy Centre";
    if (formData.offers_clinical === "Yes") {
      calculatedCategory = "AYUSH Wellness Centre & Hospital";
    } else if (formData.is_residential === "Yes" && formData.offers_clinical === "No") {
      calculatedCategory = "AYUSH Gram or AYUSH Resort";
    } else {
      calculatedCategory = "AYUSH Wellness Therapy Centre";
    }
    
    setFormData(prev => {
      // If category changes, filter services_offered to remove Marma Chikitsa if not hospital
      let updatedServices = [...prev.services_offered];
      if (calculatedCategory !== "AYUSH Wellness Centre & Hospital") {
        updatedServices = updatedServices.filter(s => s !== "Marma Chikitsa");
      }
      return {
        ...prev,
        category: calculatedCategory,
        services_offered: updatedServices
      };
    });
  }, [formData.is_residential, formData.offers_clinical]);

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleServiceToggle = (serviceName) => {
    setFormData(prev => {
      const exists = prev.services_offered.includes(serviceName);
      const updated = exists 
        ? prev.services_offered.filter(s => s !== serviceName)
        : [...prev.services_offered, serviceName];
      return { ...prev, services_offered: updated };
    });
  };

  const handleFileUpload = async (field, fileList) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];

    setFormData(prev => ({
      ...prev,
      [field]: {
        name: file.name,
        uploading: true,
        progress: 0
      }
    }));

    const dataToSend = new FormData();
    dataToSend.append("file", file);

    try {
      const res = await axios.post(`${API}/api/register/upload-temp-file`, dataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setFormData(prev => ({
              ...prev,
              [field]: { ...prev[field], progress: percentCompleted }
            }));
          }
        }
      });

      setFormData(prev => ({
        ...prev,
        [field]: {
          name: file.name,
          filename: res.data.filename,
          uploading: false,
          progress: 100
        }
      }));
      toast.success(`${file.name} uploaded successfully!`);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to upload ${file.name}`);
      setFormData(prev => ({ ...prev, [field]: null }));
    }
  };

  const removeFile = (field) => {
    setFormData(prev => ({ ...prev, [field]: null }));
  };

  const FileUploadField = ({ label, field, required = false }) => {
    const fileVal = formData[field];
    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {!fileVal ? (
          <label className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-teal-500 transition-colors group cursor-pointer relative bg-gray-50/50">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400 group-hover:text-teal-500 transition-colors" />
              <div className="flex text-xs text-gray-600 justify-center">
                <span className="font-semibold text-teal-600 hover:text-teal-700">Upload document</span>
              </div>
              <p className="text-[10px] text-gray-400">PDF, PNG, JPG up to 10MB</p>
              <input
                type="file"
                className="sr-only"
                accept=".pdf,image/*"
                onChange={(e) => handleFileUpload(field, e.target.files)}
              />
            </div>
          </label>
        ) : (
          <div className="flex items-center justify-between p-3 bg-teal-50/60 border border-teal-100 rounded-xl">
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
                          <circle cx="16" cy="16" r={radius} className="text-gray-200" strokeWidth="2.5" stroke="currentColor" fill="transparent" />
                          <circle cx="16" cy="16" r={radius} className="text-teal-600" strokeWidth="2.5" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" stroke="currentColor" fill="transparent" />
                        </svg>
                        <span className="absolute text-[8px] font-bold text-teal-700">{fileVal.progress || 0}%</span>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <FileText className="h-5 w-5 text-teal-600 shrink-0" />
              )}
              <div className="truncate text-xs">
                <p className="font-semibold text-gray-800 truncate">{fileVal.name}</p>
                {fileVal.uploading ? (
                  <p className="text-[10px] text-teal-600 font-medium">Uploading...</p>
                ) : (
                  <p className="text-[10px] text-emerald-600 font-medium">Uploaded & verified</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeFile(field)}
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    );
  };

  const handleNextSection = () => {
    // Basic validation per section
    if (activeSection === 1) {
      if (formData.already_registered === "Yes") {
        if (!formData.prev_reg_reason || !formData.prev_reg_number || !formData.prev_reg_certificate) {
          toast.error("Please fill in previous registration details and upload certificate.");
          return;
        }
      }
      if (!formData.centre_name || !formData.district || !formData.address || !formData.latitude || !formData.longitude) {
        toast.error("Please fill in all mandatory general information fields.");
        return;
      }
      if (formData.services_offered.length === 0) {
        toast.error("Please select at least one Service Offered.");
        return;
      }
    } else if (activeSection === 2) {
      if (formData.category === "AYUSH Wellness Therapy Centre") {
        if (formData.doctor_appointed === "Yes") {
          if (!formData.doctor_name || !formData.doctor_qualification || !formData.doctor_qualification_doc || !formData.doctor_bcp_reg_number || !formData.doctor_bcp_reg_doc) {
            toast.error("Please fill in all doctor details and upload required qualification & registration documents.");
            return;
          }
        }
        if (!formData.declaration_a || !formData.declaration_b) {
          toast.error("Please accept both declarations to proceed.");
          return;
        }
      } else if (formData.category === "AYUSH Wellness Centre & Hospital") {
        if (!formData.doctor_name || !formData.doctor_qualification || !formData.doctor_qualification_doc || !formData.doctor_bcp_reg_number || !formData.doctor_bcp_reg_doc || !formData.cea_reg_number || !formData.cea_valid_till || !formData.cea_reg_doc) {
          toast.error("Please fill in all doctor and Clinical Establishment Act details.");
          return;
        }
      } else if (formData.category === "AYUSH Gram or AYUSH Resort") {
        if (!formData.doctor_name || !formData.doctor_qualification || !formData.doctor_qualification_doc || !formData.doctor_bcp_reg_number || !formData.doctor_bcp_reg_doc || !formData.cea_registered) {
          toast.error("Please fill in all doctor details and answer Clinical Establishment Act registration question.");
          return;
        }
      }
    } else if (activeSection === 3) {
      if (!formData.rooms_count || !formData.therapy_beds_count || !formData.covered_area) {
        toast.error("Please fill in infrastructure details.");
        return;
      }
    }

    setActiveSection(prev => prev + 1);
  };

  const handlePrevSection = () => {
    setActiveSection(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Section 4 check
    if (formData.services_offered.includes("Ayurveda")) {
      if (!formData.pharmacist_name || !formData.pharmacist_reg_number || !formData.pharmacist_bcp_doc) {
        toast.error("Please fill in Pharmacist details and upload BCP registration document.");
        return;
      }
    }
    if (formData.services_offered.includes("Panchakarma")) {
      if (!formData.male_therapists_count || !formData.female_therapists_count) {
        toast.error("Please fill in Panchakarma therapist details.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        prev_reg_certificate: formData.prev_reg_certificate?.filename || null,
        doctor_qualification_doc: formData.doctor_qualification_doc?.filename || null,
        doctor_bcp_reg_doc: formData.doctor_bcp_reg_doc?.filename || null,
        cea_reg_doc: formData.cea_reg_doc?.filename || null,
        pharmacist_bcp_doc: formData.pharmacist_bcp_doc?.filename || null
      };

      const res = await wellnessService.saveCentreRegistration(payload);
      if (res.success) {
        toast.success("Wellness Centre registered successfully!");
        onSuccess();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit registration.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
      {/* Tab headers */}
      <div className="bg-slate-50 border-b border-slate-100 p-6 flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Wellness Centre Registration</h2>
          <p className="text-xs text-gray-500 mt-1">Submit your details section wise for state registry approval</p>
        </div>
        <button 
          onClick={onCancel}
          className="text-xs font-semibold text-slate-500 hover:text-slate-700 bg-white border px-3 py-1.5 rounded-lg transition"
        >
          Cancel
        </button>
      </div>

      {/* Progress Indicators */}
      <div className="grid grid-cols-4 border-b text-center text-xs font-bold text-gray-400">
        {[
          { num: 1, label: "General Info" },
          { num: 2, label: "Clinical Details" },
          { num: 3, label: "Infrastructure" },
          { num: 4, label: "Additional Staff" }
        ].map((s) => (
          <div 
            key={s.num} 
            className={`py-3 border-b-2 transition-all ${
              activeSection === s.num 
                ? "border-teal-600 text-teal-600 bg-teal-50/20" 
                : "border-transparent text-gray-400"
            }`}
          >
            {s.num}. {s.label}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">

        {/* ── Section 1: General Info ── */}
        {activeSection === 1 && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-teal-600 uppercase tracking-wider border-b pb-1">1. General Information</h3>
            
            {/* Apuni Sarkar Check */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Is your Centre Already Registered on Apuni Sarkar or AYUSH Setu Portal? <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  {["Yes", "No"].map(opt => (
                    <label key={opt} className="inline-flex items-center gap-2 cursor-pointer font-medium text-sm text-gray-700">
                      <input 
                        type="radio" 
                        name="already_registered" 
                        value={opt} 
                        checked={formData.already_registered === opt}
                        onChange={(e) => handleInputChange("already_registered", e.target.value)}
                        className="text-teal-600 focus:ring-teal-500 h-4 w-4"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              {formData.already_registered === "Yes" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reason for Registration <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.prev_reg_reason}
                    onChange={(e) => handleInputChange("prev_reg_reason", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="">Select Reason</option>
                    <option value="Renewal">Renewal</option>
                    <option value="Migration">Migration</option>
                  </select>
                </div>
              )}
            </div>

            {formData.already_registered === "Yes" && (
              <div className="grid md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Previous Registration Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.prev_reg_number}
                    onChange={(e) => handleInputChange("prev_reg_number", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    placeholder="Previous Registration No."
                  />
                </div>
                <FileUploadField 
                  label="Upload Previous Registration Certificate"
                  field="prev_reg_certificate"
                  required
                />
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name of Centre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.centre_name}
                  onChange={(e) => handleInputChange("centre_name", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  placeholder="e.g. Anand Wellness Centre"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.district}
                  onChange={(e) => handleInputChange("district", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  required
                >
                  <option value="">Select District</option>
                  {DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  placeholder="Complete physical address of the wellness center"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  GPS Coordinates (Latitude) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange("latitude", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  placeholder="e.g. 30.3165"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  GPS Coordinates (Longitude) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange("longitude", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  placeholder="e.g. 78.0322"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Google Map Link (Optional)
                </label>
                <input
                  type="text"
                  value={formData.map_link}
                  onChange={(e) => handleInputChange("map_link", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  placeholder="e.g. https://maps.google.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name of Owner (Auto-fetched)
                </label>
                <input
                  type="text"
                  disabled
                  value={formData.owner_name}
                  className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-lg px-3 py-2 text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mobile Number (Editable) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value.replace(/\D/g, ""))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  placeholder="10 digit mobile number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Is the Centre Residential Type? <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  {["Yes", "No"].map(opt => (
                    <label key={opt} className="inline-flex items-center gap-2 cursor-pointer font-medium text-sm text-gray-700">
                      <input 
                        type="radio" 
                        name="is_residential" 
                        value={opt} 
                        checked={formData.is_residential === opt}
                        onChange={(e) => handleInputChange("is_residential", e.target.value)}
                        className="text-teal-600 focus:ring-teal-500 h-4 w-4"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Does Centre Offer Clinical Services? <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  {["Yes", "No"].map(opt => (
                    <label key={opt} className="inline-flex items-center gap-2 cursor-pointer font-medium text-sm text-gray-700">
                      <input 
                        type="radio" 
                        name="offers_clinical" 
                        value={opt} 
                        checked={formData.offers_clinical === opt}
                        onChange={(e) => handleInputChange("offers_clinical", e.target.value)}
                        className="text-teal-600 focus:ring-teal-500 h-4 w-4"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Category tabs */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Centre Category (Auto-calculated & Locked)
              </label>
              <div className="flex bg-slate-100 p-1.5 rounded-lg border gap-2">
                {[
                  "AYUSH Wellness Therapy Centre",
                  "AYUSH Wellness Centre & Hospital",
                  "AYUSH Gram or AYUSH Resort"
                ].map(cat => (
                  <div 
                    key={cat}
                    className={`flex-1 py-2 px-3 text-center text-xs font-bold rounded-md transition ${
                      formData.category === cat 
                        ? "bg-teal-600 text-white shadow-sm" 
                        : "text-gray-400"
                    }`}
                  >
                    {cat}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-teal-600 font-medium mt-1">
                * Note: Category is determined automatically by your Residential & Clinical choices.
              </p>
            </div>

            {/* Services offered checkboxes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Services Offered <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  "Ayurveda",
                  "Panchakarma",
                  "Yoga",
                  "Naturopathy",
                  "Marma Chikitsa"
                ].map(svc => {
                  const isAvailable = svc !== "Marma Chikitsa" || formData.category === "AYUSH Wellness Centre & Hospital";
                  const isChecked = formData.services_offered.includes(svc);
                  return (
                    <button
                      key={svc}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => handleServiceToggle(svc)}
                      className={`px-4 py-2 border rounded-xl font-bold text-xs transition-all ${
                        !isAvailable 
                          ? "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed"
                          : isChecked 
                            ? "bg-teal-50 border-teal-600 text-teal-700 shadow-sm"
                            : "bg-white border-gray-300 text-gray-700 hover:border-teal-400"
                      }`}
                    >
                      {svc}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Section 2: Clinical Details ── */}
        {activeSection === 2 && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-teal-600 uppercase tracking-wider border-b pb-1">2. Clinical Information</h3>
            
            {/* Category Banner */}
            <div className="bg-slate-50 p-4 rounded-xl border text-xs font-semibold text-slate-700">
              Selected Category: <span className="text-teal-700 font-bold uppercase tracking-wider">{formData.category}</span>
            </div>

            {/* 1. If AYUSH Wellness Therapy Centre */}
            {formData.category === "AYUSH Wellness Therapy Centre" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Is Doctor Appointed? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    {["Yes", "No"].map(opt => (
                      <label key={opt} className="inline-flex items-center gap-2 cursor-pointer font-medium text-sm text-gray-700">
                        <input 
                          type="radio" 
                          name="doctor_appointed" 
                          value={opt} 
                          checked={formData.doctor_appointed === opt}
                          onChange={(e) => handleInputChange("doctor_appointed", e.target.value)}
                          className="text-teal-600 focus:ring-teal-500 h-4 w-4"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                {formData.doctor_appointed === "Yes" && (
                  <div className="grid md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4 md:space-y-0">
                    <div className="col-span-2 text-xs font-bold text-slate-700 uppercase tracking-wider">Doctor Details</div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Name of Doctor <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={formData.doctor_name}
                        onChange={(e) => handleInputChange("doctor_name", e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                        placeholder="e.g. Dr. Amit Sharma"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Qualification <span className="text-red-500">*</span></label>
                      <select
                        value={formData.doctor_qualification}
                        onChange={(e) => handleInputChange("doctor_qualification", e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      >
                        <option value="">Select Qualification</option>
                        {QUALIFICATIONS.map(q => (
                          <option key={q} value={q}>{q}</option>
                        ))}
                      </select>
                    </div>

                    <FileUploadField 
                      label="Upload Qualification Documents"
                      field="doctor_qualification_doc"
                      required
                    />

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Bhartiya Chikitsa Parishad Registration Number <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={formData.doctor_bcp_reg_number}
                        onChange={(e) => handleInputChange("doctor_bcp_reg_number", e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                        placeholder="Registration Number"
                      />
                    </div>

                    <FileUploadField 
                      label="Upload Registration Document"
                      field="doctor_bcp_reg_doc"
                      required
                    />
                  </div>
                )}

                {/* Declarations */}
                <div className="space-y-3 bg-red-50/40 p-4 rounded-xl border border-red-100">
                  <div className="text-xs font-bold text-red-800 uppercase tracking-wider mb-1">Wellness Centre Declarations</div>
                  
                  <label className="flex items-start gap-3 cursor-pointer text-xs text-gray-700 font-medium">
                    <input 
                      type="checkbox"
                      checked={formData.declaration_a}
                      onChange={(e) => handleInputChange("declaration_a", e.target.checked)}
                      className="text-teal-600 focus:ring-teal-500 h-4 w-4 rounded mt-0.5"
                    />
                    <span>I have installed a board in reception stating: <strong>"We Don't Provide any Treatment, Only Wellness Services are being Provided"</strong>. <span className="text-red-500">*</span></span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer text-xs text-gray-700 font-medium">
                    <input 
                      type="checkbox"
                      checked={formData.declaration_b}
                      onChange={(e) => handleInputChange("declaration_b", e.target.checked)}
                      className="text-teal-600 focus:ring-teal-500 h-4 w-4 rounded mt-0.5"
                    />
                    <span>I have clearly mentioned in FRONT Signboard in bold text with font size at least half the size of Centre's Name that: <strong>"WELLNESS SERVICES ONLY, NO TREATMENT OFFERED"</strong>. <span className="text-red-500">*</span></span>
                  </label>
                </div>
              </div>
            )}

            {/* 2. If Category is AYUSH Wellness Centre & Hospital */}
            {formData.category === "AYUSH Wellness Centre & Hospital" && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4 md:space-y-0">
                  <div className="col-span-2 text-xs font-bold text-slate-700 uppercase tracking-wider">Doctor Details</div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name of Doctor <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.doctor_name}
                      onChange={(e) => handleInputChange("doctor_name", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      placeholder="e.g. Dr. Amit Sharma"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Qualification <span className="text-red-500">*</span></label>
                    <select
                      value={formData.doctor_qualification}
                      onChange={(e) => handleInputChange("doctor_qualification", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                      <option value="">Select Qualification</option>
                      {QUALIFICATIONS.map(q => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                  </div>

                  <FileUploadField 
                    label="Upload Qualification Documents"
                    field="doctor_qualification_doc"
                    required
                  />

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bhartiya Chikitsa Parishad Registration Number <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.doctor_bcp_reg_number}
                      onChange={(e) => handleInputChange("doctor_bcp_reg_number", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      placeholder="Registration Number"
                    />
                  </div>

                  <FileUploadField 
                    label="Upload Registration Document"
                    field="doctor_bcp_reg_doc"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="col-span-2 text-xs font-bold text-slate-700 uppercase tracking-wider">Clinical Establishment Act (CEA) Details</div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Clinical Establishment Act (CEA) Registration Number <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.cea_reg_number}
                      onChange={(e) => handleInputChange("cea_reg_number", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      placeholder="CEA Registration No."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Valid Till Date <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={formData.cea_valid_till}
                      onChange={(e) => handleInputChange("cea_valid_till", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    />
                  </div>

                  <FileUploadField 
                    label="Upload CEA Registration Certificate"
                    field="cea_reg_doc"
                    required
                  />
                </div>
              </div>
            )}

            {/* 3. If Category is AYUSH Gram or AYUSH Resort */}
            {formData.category === "AYUSH Gram or AYUSH Resort" && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4 md:space-y-0">
                  <div className="col-span-2 text-xs font-bold text-slate-700 uppercase tracking-wider">Doctor Details</div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name of Doctor <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.doctor_name}
                      onChange={(e) => handleInputChange("doctor_name", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      placeholder="e.g. Dr. Amit Sharma"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Qualification <span className="text-red-500">*</span></label>
                    <select
                      value={formData.doctor_qualification}
                      onChange={(e) => handleInputChange("doctor_qualification", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                      <option value="">Select Qualification</option>
                      {QUALIFICATIONS.map(q => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                  </div>

                  <FileUploadField 
                    label="Upload Qualification Documents"
                    field="doctor_qualification_doc"
                    required
                  />

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bhartiya Chikitsa Parishad Registration Number <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.doctor_bcp_reg_number}
                      onChange={(e) => handleInputChange("doctor_bcp_reg_number", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      placeholder="Registration Number"
                    />
                  </div>

                  <FileUploadField 
                    label="Upload Registration Document"
                    field="doctor_bcp_reg_doc"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Have you registered under Clinical Establishment Act? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    {["Yes", "No"].map(opt => (
                      <label key={opt} className="inline-flex items-center gap-2 cursor-pointer font-medium text-sm text-gray-700">
                        <input 
                          type="radio" 
                          name="cea_registered" 
                          value={opt} 
                          checked={formData.cea_registered === opt}
                          onChange={(e) => handleInputChange("cea_registered", e.target.value)}
                          className="text-teal-600 focus:ring-teal-500 h-4 w-4"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Section 3: Details of Infrastructure ── */}
        {activeSection === 3 && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-teal-600 uppercase tracking-wider border-b pb-1">3. Details of Infrastructure</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Rooms <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={formData.rooms_count}
                  onChange={(e) => handleInputChange("rooms_count", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  placeholder="e.g. 5"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Therapy Beds <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={formData.therapy_beds_count}
                  onChange={(e) => handleInputChange("therapy_beds_count", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  placeholder="e.g. 2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Total Covered Area (sq. ft.) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.covered_area}
                  onChange={(e) => handleInputChange("covered_area", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  placeholder="e.g. 1500"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Details of Equipment available</label>
                <textarea
                  rows={3}
                  value={formData.equipment_details}
                  onChange={(e) => handleInputChange("equipment_details", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  placeholder="Describe your therapy/wellness equipment..."
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Section 4: Details of Additional Staff ── */}
        {activeSection === 4 && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-teal-600 uppercase tracking-wider border-b pb-1">4. Details of Additional Staff</h3>
            
            {/* Condition 1: If Ayurveda is selected */}
            {formData.services_offered.includes("Ayurveda") ? (
              <div className="grid md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4 md:space-y-0">
                <div className="col-span-2 text-xs font-bold text-teal-700 uppercase tracking-wider">Ayurveda Pharmacist details</div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pharmacist Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.pharmacist_name}
                    onChange={(e) => handleInputChange("pharmacist_name", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    placeholder="Pharmacist Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">BCP Registration Number <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.pharmacist_reg_number}
                    onChange={(e) => handleInputChange("pharmacist_reg_number", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    placeholder="Registration Number"
                  />
                </div>

                <FileUploadField 
                  label="Upload BCP Registration Document"
                  field="pharmacist_bcp_doc"
                  required
                />
              </div>
            ) : null}

            {/* Condition 2: If Panchakarma is selected */}
            {formData.services_offered.includes("Panchakarma") ? (
              <div className="grid md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="col-span-2 text-xs font-bold text-teal-700 uppercase tracking-wider">Panchakarma Therapist details</div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Male Panchakarma Therapists <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={formData.male_therapists_count}
                    onChange={(e) => handleInputChange("male_therapists_count", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    placeholder="e.g. 2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Female Panchakarma Therapists <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={formData.female_therapists_count}
                    onChange={(e) => handleInputChange("female_therapists_count", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    placeholder="e.g. 2"
                  />
                </div>
              </div>
            ) : null}

            {!formData.services_offered.includes("Ayurveda") && !formData.services_offered.includes("Panchakarma") && (
              <div className="p-8 text-center text-gray-400 bg-gray-50 border border-dashed rounded-2xl font-medium">
                No additional staff requirements for the selected services. You can proceed to submit.
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center border-t border-gray-100 pt-6">
          {activeSection > 1 ? (
            <button
              type="button"
              onClick={handlePrevSection}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-800 border font-semibold px-4 py-2 rounded-lg text-sm transition"
            >
              <ChevronLeft size={16} /> Previous
            </button>
          ) : <div />}

          {activeSection < 4 ? (
            <button
              type="button"
              onClick={handleNextSection}
              className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition"
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-lg text-sm shadow-md transition disabled:opacity-50"
            >
              <Save size={16} />
              {submitting ? "Submitting..." : "Submit Registration"}
            </button>
          )}
        </div>

      </form>
    </div>
  );
}
