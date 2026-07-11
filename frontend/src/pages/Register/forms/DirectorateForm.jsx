// src/pages/Register/forms/DirectorateForm.jsx
import React from "react";

const DESIGNATION_OPTIONS = ["Director", "Joint Director", "Nodal Officer", "Assistant Director"];
const ID_TYPES = ["Aadhaar Card", "PAN Card"];

const DirectorateForm = ({ formData, setFormData, handleFileChange }) => {
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
          Directorate Registration
        </h4>
        <p className="text-xs text-teal-700">
          Please enter the details of the designated Nodal Officer. Directorate accounts have state-level access to all portal modules.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Name of Nodal Officer */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Name of Nodal Officer <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.fullName || ""}
            onChange={(e) => handleChange("fullName", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            placeholder="Enter officer's full name"
            required
          />
        </div>

        {/* Designation */}
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

        {/* Email id */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email ID <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            placeholder="Enter official email"
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
            placeholder="10-digit mobile number"
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

        {/* ID Number */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ID Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.idNumber || ""}
            onChange={(e) => handleChange("idNumber", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            placeholder="Enter ID card number"
            required
          />
        </div>

        {/* Upload ID (PDF / PNG / JPG) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Upload ID Document <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept="image/png,image/jpeg,.pdf"
            onChange={(e) => handleFileChange("idUpload", e.target.files)}
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            required={!formData.idUpload?.filename}
          />
          {formData.idUpload && (
            formData.idUpload.uploading ? (
              <div className="flex items-center gap-2 mt-1 text-xs text-teal-600">
                <div className="w-4 h-4 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
                <span>Uploading ID: {formData.idUpload.progress}%</span>
              </div>
            ) : (
              <p className="text-xs text-green-600 mt-1 font-semibold">
                ✓ Attached: {formData.idUpload.name}
              </p>
            )
          )}
        </div>

        {/* Upload Authority Order */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Upload Authority Order <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept="image/png,image/jpeg,.pdf"
            onChange={(e) => handleFileChange("authorityOrder", e.target.files)}
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            required={!formData.authorityOrder?.filename}
          />
          {formData.authorityOrder && (
            formData.authorityOrder.uploading ? (
              <div className="flex items-center gap-2 mt-1 text-xs text-teal-600">
                <div className="w-4 h-4 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
                <span>Uploading Order: {formData.authorityOrder.progress}%</span>
              </div>
            ) : (
              <p className="text-xs text-green-600 mt-1 font-semibold">
                ✓ Attached: {formData.authorityOrder.name}
              </p>
            )
          )}
        </div>
      </div>

      {/* Verification Declaration */}
      <div className="pt-4">
        <label className="flex items-start">
          <input
            type="checkbox"
            className="w-4 h-4 mt-1 text-teal-600 border-gray-300 rounded focus:ring-teal-500 flex-shrink-0"
            required
          />
          <span className="ml-2 text-sm text-gray-700">
            I certify that the details provided for this Directorate account are true and that this Nodal Officer is authorized to operate on behalf of the Directorate.
          </span>
        </label>
      </div>
    </div>
  );
};

export default DirectorateForm;
