// src/pages/Register/forms/WellnessCentreForm.jsx
import React from "react";

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
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">Upload Required Documents</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Upload Entity Registration Document */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Entity Registration Document <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              onChange={(e) => handleFileChange("entityCertificate", e.target.files)}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
              required={!formData.entityCertificate}
            />
            {formData.entityCertificate && (
              <p className="text-xs text-emerald-600 mt-1">✓ {formData.entityCertificate.name}</p>
            )}
          </div>

          {/* Upload Applicant's ID Proof */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Applicant's ID Proof <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              onChange={(e) => handleFileChange("idProofFile", e.target.files)}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
              required={!formData.idProofFile}
            />
            {formData.idProofFile && (
              <p className="text-xs text-emerald-600 mt-1">✓ {formData.idProofFile.name}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellnessCentreForm;
