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

const ORG_TYPES = [
  "University",
  "College",
  "AYUSH Organization",
  "AYUSH Related NGO",
  "Yoga Research Institution",
  "Health Organization"
];

const ResearchInstitutionForm = ({ formData, setFormData, handleFileChange }) => {
  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  return (
    <div className="space-y-8">
      {/* 1. Applicant Details */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">
          Applicant Details
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Name of Applicant <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.applicantName || ""}
              onChange={(e) => handleChange("applicantName", e.target.value)}
              placeholder="Enter applicant's name"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Designation <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.designation || ""}
              onChange={(e) => handleChange("designation", e.target.value)}
              placeholder="e.g., Director, Principal Investigator"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. Organization Information */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">
          Organization Information
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Organization Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.organizationName || ""}
              onChange={(e) => handleChange("organizationName", e.target.value)}
              placeholder="Enter official organization name"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Organization Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.organizationType || ""}
              onChange={(e) => handleChange("organizationType", e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="">Select Organization Type</option>
              {ORG_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              District <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.district || ""}
              onChange={(e) => handleChange("district", e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="">Select District</option>
              {DISTRICT_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Work Experience in Yoga (in years) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.workExperienceYears || ""}
              onChange={(e) => handleChange("workExperienceYears", e.target.value)}
              placeholder="e.g., 5"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="info@org.com"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.contactNumber || ""}
              onChange={(e) => handleChange("contactNumber", e.target.value)}
              placeholder="Enter contact number"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Organization Website (Optional)
            </label>
            <input
              type="url"
              value={formData.website || ""}
              onChange={(e) => handleChange("website", e.target.value)}
              placeholder="https://www.website.org"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Registration Document ID Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.registrationDocId || ""}
              onChange={(e) => handleChange("registrationDocId", e.target.value)}
              placeholder="Enter Registration/NGO ID"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Physical Address <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.physicalAddress || ""}
              onChange={(e) => handleChange("physicalAddress", e.target.value)}
              placeholder="Enter full physical address"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              GPS Latitude <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              value={formData.latitude || ""}
              onChange={(e) => handleChange("latitude", e.target.value)}
              placeholder="e.g., 30.0668"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              GPS Longitude <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              value={formData.longitude || ""}
              onChange={(e) => handleChange("longitude", e.target.value)}
              placeholder="e.g., 79.0193"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. Research Details */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">
          Research & Yoga Background
        </h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Research Projects Previously Completed <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.projectsCompleted || ""}
              onChange={(e) => handleChange("projectsCompleted", e.target.value)}
              placeholder="Provide a list or details of previous research projects"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Funding Received till Date for All Research Projects (in ₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.fundingReceived || ""}
              onChange={(e) => handleChange("fundingReceived", e.target.value)}
              placeholder="e.g., 500000"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Brief of Organization's Association with Yoga <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.associationWithYoga || ""}
              onChange={(e) => handleChange("associationWithYoga", e.target.value)}
              placeholder="Explain how the organization is connected to or active in the field of Yoga"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Organization's Affiliations Details <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.affiliations || ""}
              onChange={(e) => handleChange("affiliations", e.target.value)}
              placeholder="List affiliations with universities, research councils, or other bodies"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* 4. Document Uploads */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">
          Documents Upload
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Organization's Registration Document <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange("orgRegDoc", e.target.files)}
              required={!formData.orgRegDoc?.filename}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
            />
            {formData.orgRegDoc && (
              formData.orgRegDoc.uploading ? (
                <div className="flex items-center gap-2 mt-1 text-xs text-teal-600">
                  <div className="w-4 h-4 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
                  <span>Uploading Doc: {formData.orgRegDoc.progress}%</span>
                </div>
              ) : (
                <p className="text-xs text-green-600 mt-1 font-semibold">
                  ✓ Attached: {formData.orgRegDoc.name}
                </p>
              )
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload Relevant Documents (PDF up to 5) <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={(e) => handleFileChange("relevantDocs", e.target.files)}
              required={!formData.relevantDocs || formData.relevantDocs.length === 0}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
            />
            {formData.relevantDocs && formData.relevantDocs.length > 0 && (
              <div className="mt-2 space-y-1">
                {Array.from(formData.relevantDocs).map((f, i) => (
                  f.uploading ? (
                    <div key={i} className="flex items-center gap-2 text-xs text-teal-600">
                      <div className="w-4 h-4 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
                      <span>Uploading {f.name}: {f.progress}%</span>
                    </div>
                  ) : (
                    <p key={i} className="text-xs text-green-600 font-semibold">
                      ✓ Attached: {f.name}
                    </p>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Declaration Checkbox */}
      <div className="pt-4 border-t border-gray-100">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isDeclarationTrue || false}
            onChange={(e) => handleChange("isDeclarationTrue", e.target.checked)}
            required
            className="w-5 h-5 rounded text-teal-600 border-gray-300 focus:ring-teal-500 cursor-pointer mt-0.5"
          />
          <span className="text-sm text-gray-600 select-none">
            I hereby declare that all the information provided above is true and accurate to the best of my knowledge. <span className="text-red-500">*</span>
          </span>
        </label>
      </div>
    </div>
  );
};

export default ResearchInstitutionForm;
