// src/pages/Register/forms/DistrictOfficerForm.jsx
import React from "react";

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

const DESIGNATION_OPTIONS = ["SMO", "ADAUO", "DAUO"];

const ID_TYPES = ["Aadhaar Card", "PAN Card"];

const DistrictOfficerForm = ({ formData, setFormData, handleFileChange }) => {
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 mb-6">
        <h4 className="text-teal-800 font-bold text-base mb-1">
          District Officer Information
        </h4>
        <p className="text-xs text-teal-700">
          Please provide your official deployment details. All registrations undergo verification by the State HQ.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.fullName || ""}
            onChange={(e) => handleChange("fullName", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            placeholder="Enter your full name"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email ID <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            placeholder="Enter official email id"
            required
          />
        </div>

        {/* Contact Number */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Contact Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            maxLength={10}
            value={formData.contactNumber || ""}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              handleChange("contactNumber", val);
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            placeholder="10-digit contact number"
            required
          />
        </div>

        {/* District (Dropdown) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Assigned District <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.district || ""}
            onChange={(e) => handleChange("district", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500"
            required
          >
            <option value="">Select District</option>
            {DISTRICT_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Designation (Dropdown) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Designation <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.designation || ""}
            onChange={(e) => handleChange("designation", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500"
            required
          >
            <option value="">Select Designation</option>
            {DESIGNATION_OPTIONS.map((designation) => (
              <option key={designation} value={designation}>
                {designation}
              </option>
            ))}
          </select>
        </div>

        {/* Employee ID */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Employee ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.employeeId || ""}
            onChange={(e) => handleChange("employeeId", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            placeholder="Enter official employee id"
            required
          />
        </div>

        {/* ID Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ID Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.idType || ""}
            onChange={(e) => handleChange("idType", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500"
            required
          >
            <option value="">Select ID Type</option>
            {ID_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Selected ID Number */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ID Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.idNumber || ""}
            onChange={(e) => handleChange("idNumber", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            placeholder="Enter Aadhaar or PAN number"
            required
          />
        </div>

        {/* Upload ID File */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Upload ID Document <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => handleFileChange("idUpload", e.target.files)}
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            required
          />
          {formData.idUpload && (
            <p className="text-xs text-green-600 mt-1">
              ✓ Attached: {formData.idUpload.name}
            </p>
          )}
        </div>

        {/* Upload Authority Order File */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Authority Order Upload (PDF) <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => handleFileChange("authorityOrder", e.target.files)}
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            required
          />
          {formData.authorityOrder && (
            <p className="text-xs text-green-600 mt-1">
              ✓ Attached: {formData.authorityOrder.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DistrictOfficerForm;
