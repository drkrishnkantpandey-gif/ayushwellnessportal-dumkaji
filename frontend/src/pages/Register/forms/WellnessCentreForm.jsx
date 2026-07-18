// src/pages/Register/forms/WellnessCentreForm.jsx
import React from "react";
import { Upload, FileText, CheckCircle2, X } from "lucide-react";

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

const ENTITY_TYPES = [
  "Proprietership",
  "Trust",
  "Society",
  "Other NGO",
  "Government",
  "Private Limited",
  "LLP",
  "Other"
];

const WellnessCentreForm = ({ formData, setFormData, handleFileChange }) => {
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
                onChange={(e) => handleFileChange(field, e.target.files)}
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
    <div className="space-y-6">
      <div className="border-b pb-2">
        <h3 className="text-lg font-bold text-gray-800">Existing Centre Profile Details</h3>
        <p className="text-xs text-gray-500 mt-1">Please provide the legal details of the applicant and the centre.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Name of Applicant */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Name of Applicant <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.applicantName || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                applicantName: e.target.value,
              }))
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            placeholder="e.g. Dr. Rajesh Kumar"
            required
          />
        </div>

        {/* Designation */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Designation <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.designation || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                designation: e.target.value,
              }))
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            placeholder="e.g. Owner / Chief Medical Officer"
            required
          />
        </div>

        {/* Name of Entity */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Name of Entity <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.centreName || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                centreName: e.target.value,
              }))
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            placeholder="e.g. AyurCare Wellness Centre"
            required
          />
        </div>

        {/* Entity Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Entity Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.entityType || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                entityType: e.target.value,
              }))
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            required
          >
            <option value="">Select Entity Type</option>
            {ENTITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Email Id */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email ID <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                email: e.target.value,
              }))
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            placeholder="e.g. contact@ayushwellness.in"
            required
          />
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.phone || ""}
            maxLength={10}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setFormData((prev) => ({ ...prev, phone: val }));
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white ${
              formData.phone && formData.phone.length !== 10
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="10-digit mobile number"
            required
          />
          {formData.phone && formData.phone.length !== 10 && (
            <p className="text-xs text-red-500 mt-1">
              Mobile number must be exactly 10 digits.
            </p>
          )}
        </div>

        {/* District */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            District <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.district || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                district: e.target.value,
              }))
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            required
          >
            <option value="">Select District</option>
            {DISTRICTS.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.address || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                address: e.target.value,
              }))
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            placeholder="Street address, building, suite"
            required
          />
        </div>
      </div>

      {/* Document uploads */}
      <div className="space-y-6 pt-4 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">Upload Required Documents</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <FileUploadField
            label="Upload Entity Registration Document"
            field="entityCertificate"
            accept=".pdf,image/*"
          />
          <FileUploadField
            label="Upload Applicant's ID Proof"
            field="idProofFile"
            accept=".pdf,image/*"
          />
        </div>
      </div>
    </div>
  );
};

export default WellnessCentreForm;
