// src/pages/Register/forms/TrainingCentreForm.jsx
import React from "react";
import { FileText, Upload, CheckCircle2, AlertCircle, X } from "lucide-react";

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

const ENTITY_TYPES = [
  "Proprietorship",
  "Trust",
  "Society",
  "NGO",
  "Company",
  "LLP"
];

const OPERATING_TYPES = [
  "None",
  "Existing Operational Yoga Centre",
  "Wellness Centre",
  "Homestay",
  "School",
  "Hotel",
  "Resort",
  "Other"
];

const ID_PROOFS = [
  "Aadhaar",
  "PAN",
  "Other Document"
];

const TrainingCentreForm = ({ formData, setFormData, handleFileChange }) => {

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileInput = (field, e) => {
    if (handleFileChange) {
      handleFileChange(field, e.target.files);
    }
  };

  const removeFile = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: null
    }));
  };

  const FileUploadField = ({ label, field, accept = "image/*,.pdf" }) => {
    const fileVal = formData[field];
    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">{label} <span className="text-red-500">*</span></label>
        {!fileVal ? (
          <label className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-teal-500 transition-colors group cursor-pointer relative bg-gray-50/50">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-10 w-10 text-gray-400 group-hover:text-teal-500 transition-colors" />
              <div className="flex text-sm text-gray-600 justify-center">
                <span className="font-semibold text-teal-600 hover:text-teal-700">Upload a file</span>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-400">PDF, PNG, JPG up to 10MB</p>
              <input
                type="file"
                className="sr-only"
                accept={accept}
                onChange={(e) => handleFileInput(field, e)}
              />
            </div>
          </label>
        ) : (
          <div className="flex items-center justify-between p-4 bg-teal-50/60 border border-teal-100 rounded-xl">
            <div className="flex items-center space-x-3 min-w-0">
              {fileVal.uploading ? (
                <div className="relative flex items-center justify-center h-10 w-10 shrink-0">
                  {(() => {
                    const radius = 14;
                    const circumference = 2 * Math.PI * radius;
                    const strokeDashoffset = circumference - ((fileVal.progress || 0) / 100) * circumference;
                    return (
                      <>
                        <svg className="w-10 h-10 transform -rotate-90">
                          <circle
                            cx="20"
                            cy="20"
                            r={radius}
                            className="text-gray-200"
                            strokeWidth="3"
                            stroke="currentColor"
                            fill="transparent"
                          />
                          <circle
                            cx="20"
                            cy="20"
                            r={radius}
                            className="text-teal-600 transition-all duration-300"
                            strokeWidth="3"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                          />
                        </svg>
                        <span className="absolute text-[10px] font-bold text-teal-700">{fileVal.progress || 0}%</span>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <FileText className="h-6 w-6 text-teal-600 shrink-0" />
              )}
              <div className="truncate">
                <p className="text-sm font-semibold text-gray-800 truncate">{fileVal.name}</p>
                {fileVal.uploading ? (
                  <p className="text-xs text-teal-600 font-medium">Uploading...</p>
                ) : (
                  <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 size={12} /> Uploaded & verified
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeFile(field)}
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 bg-white p-2 rounded-2xl">
      <div className="border-b border-gray-100 pb-4">
        <h3 className="text-2xl font-bold text-gray-800">Yoga Centre Details</h3>
        <p className="text-sm text-gray-500 mt-1">Please provide verified applicant and entity credentials below.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 1. Applicant Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Applicant Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={formData.applicantName || ""}
            onChange={(e) => handleInputChange("applicantName", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
            placeholder="Enter applicant full name"
            required
          />
        </div>

        {/* 2. Designation */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Designation <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={formData.designation || ""}
            onChange={(e) => handleInputChange("designation", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
            placeholder="e.g. Director, Manager, Owner"
            required
          />
        </div>

        {/* 3. Entity Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Entity Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={formData.centreName || ""}
            onChange={(e) => handleInputChange("centreName", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
            placeholder="Enter Entity / Centre name"
            required
          />
        </div>

        {/* 4. Entity Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Entity Type <span className="text-red-500">*</span></label>
          <select
            value={formData.entityType || ""}
            onChange={(e) => handleInputChange("entityType", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition bg-white"
            required
          >
            <option value="">Select Entity Type</option>
            {ENTITY_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* 5. Upload Entity Registration Certificate */}
        <div className="md:col-span-2">
          <FileUploadField
            label="Upload Entity's Registration Certificate"
            field="entityCertificate"
          />
        </div>

        {/* 6. Existing Operational Business */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Existing Operational Business <span className="text-red-500">*</span></label>
          <select
            value={formData.alreadyOperating || ""}
            onChange={(e) => handleInputChange("alreadyOperating", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition bg-white"
            required
          >
            <option value="">Select Operational Status</option>
            {OPERATING_TYPES.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        {/* 7. Other Business (Dynamic) */}
        {formData.alreadyOperating === "Other" && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Other Business <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.otherBusiness || ""}
              onChange={(e) => handleInputChange("otherBusiness", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              placeholder="Specify other business type"
              required
            />
          </div>
        )}

        {/* Operational Business Section (Dynamic if Already Operating !== "None") */}
        {formData.alreadyOperating && formData.alreadyOperating !== "None" && (
          <div className="md:col-span-2 grid md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h4 className="md:col-span-2 text-sm font-bold text-slate-700 uppercase tracking-wide">Operational Business details</h4>
            
            {/* 8. Name of Operational Business */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Name of Operational Business <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.operationalBusinessName || ""}
                onChange={(e) => handleInputChange("operationalBusinessName", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition bg-white"
                placeholder="Enter operational business name"
                required
              />
            </div>

            {/* 9. Registration Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Registration Number <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.operationalBusinessRegNumber || ""}
                onChange={(e) => handleInputChange("operationalBusinessRegNumber", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition bg-white"
                placeholder="Registration Number"
                required
              />
            </div>

            {/* 10. Upload Registration Certificate */}
            <div className="md:col-span-2">
              <FileUploadField
                label="Upload Registration Certificate of Operational Business"
                field="operationalBusinessCertificate"
              />
            </div>
          </div>
        )}

        {/* 11. Website */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Website <span className="text-gray-400 font-normal">(if any)</span></label>
          <input
            type="url"
            value={formData.website || ""}
            onChange={(e) => handleInputChange("website", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
            placeholder="e.g. https://www.yourdomain.com"
          />
        </div>

        {/* 12. Email Address */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address <span className="text-gray-400 font-normal">(for login)</span> <span className="text-red-500">*</span></label>
          <input
            type="email"
            value={formData.email || ""}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
            placeholder="example@domain.com"
            required
          />
        </div>

        {/* 13. Mobile Number */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number <span className="text-red-500">*</span></label>
          <input
            type="text"
            maxLength={10}
            value={formData.phone || ""}
            onChange={(e) => handleInputChange("phone", e.target.value.replace(/\D/g, ""))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
            placeholder="10-digit mobile number"
            required
          />
        </div>

        {/* 14. ID Proof Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">ID Proof Type <span className="text-red-500">*</span></label>
          <select
            value={formData.idProofType || ""}
            onChange={(e) => handleInputChange("idProofType", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition bg-white"
            required
          >
            <option value="">Select ID Proof</option>
            {ID_PROOFS.map(p => (
              <option key={p} value={p.toLowerCase()}>{p}</option>
            ))}
          </select>
        </div>

        {/* 15. ID Number */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">ID Number <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={formData.idNumber || ""}
            onChange={(e) => handleInputChange("idNumber", e.target.value.toUpperCase())}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
            placeholder="Enter ID Number"
            required
          />
        </div>

        {/* 16. Upload ID Proof file */}
        <div className="md:col-span-2">
          <FileUploadField
            label="Upload Selected ID Proof"
            field="idProofFile"
          />
        </div>

        {/* 17. Address of Business */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Address of Business <span className="text-red-500">*</span></label>
          <textarea
            value={formData.address || ""}
            onChange={(e) => handleInputChange("address", e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
            placeholder="Enter business address details..."
            required
          />
        </div>

        {/* 18. District */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">District <span className="text-red-500">*</span></label>
          <select
            value={formData.district || ""}
            onChange={(e) => handleInputChange("district", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition bg-white"
            required
          >
            <option value="">Select District</option>
            {DISTRICT_OPTIONS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* 19. GPS Coordinates */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">GPS Coordinates <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={formData.gpsCoordinates || ""}
            onChange={(e) => handleInputChange("gpsCoordinates", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
            placeholder="e.g. 30.3165, 78.0322"
            required
          />
        </div>

        {/* 20. Declaration box */}
        <div className="md:col-span-2 mt-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.tcDeclaration || false}
              onChange={(e) => handleInputChange("tcDeclaration", e.target.checked)}
              className="mt-1 h-5 w-5 text-teal-600 border-gray-300 rounded-lg focus:ring-teal-500 transition-colors"
              required
            />
            <span className="text-sm font-semibold text-gray-700 select-none">
              I hereby declare that all the information provided in this registration form is true, correct and complete to the best of my knowledge and belief.
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default TrainingCentreForm;
