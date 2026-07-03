// src/pages/Register/forms/WellnessCentreForm.jsx
import React from "react";

// Three entity types with their descriptions and allowed services
const ENTITY_TYPES = [
  {
    value: "WELLNESS_CENTRE",
    label: "Wellness Centre",
    description:
      "Standalone wellness centre offering therapeutic and holistic services.",
    allowedServices: ["PANCHKARMA", "YOGA", "NATUROPATHY"],
  },
  {
    value: "WELLNESS_CENTRE_HOSPITAL",
    label: "Wellness Centre & Hospital",
    description:
      "Combined facility providing both hospital services and integrated wellness programmes.",
    allowedServices: ["PANCHKARMA", "YOGA", "NATUROPATHY"],
  },
  {
    value: "WELLNESS_RESORT",
    label: "Wellness Resort / Ayush Gram",
    description:
      "Resort or Ayush Gram offering residential wellness programmes and retreat services.",
    allowedServices: ["PANCHKARMA", "YOGA", "NATUROPATHY"],
  },
];

const SERVICE_OPTIONS = [
  {
    value: "PANCHKARMA",
    label: "Panchkarma",
    icon: "🌿",
    desc: "Traditional Ayurvedic detox & rejuvenation therapies",
  },
  {
    value: "YOGA",
    label: "Yoga",
    icon: "🧘",
    desc: "Yoga, meditation & pranayama sessions",
  },
  {
    value: "NATUROPATHY",
    label: "Naturopathy",
    icon: "🌱",
    desc: "Natural healing, hydrotherapy & diet-based treatments",
  },
];

const WellnessCentreForm = ({ formData, setFormData, handleFileChange }) => {
  const selectedEntity = ENTITY_TYPES.find(
    (e) => e.value === formData.entityType
  );

  const toggleService = (value) => {
    const current = formData.services || [];
    const updated = current.includes(value)
      ? current.filter((s) => s !== value)
      : [...current, value];
    setFormData((prev) => ({ ...prev, services: updated }));
  };

  return (
    <>
      <p className="text-sm text-gray-600">
        Please select the type of wellness facility and provide your
        registration details.
      </p>

      {/* ── Step 1: Entity Type ─────────────────────────────────── */}
      <div className="mt-4">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Type of Wellness Facility <span className="text-red-500">*</span>
        </label>
        <div className="grid md:grid-cols-3 gap-4">
          {ENTITY_TYPES.map((entity) => (
            <button
              key={entity.value}
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  entityType: entity.value,
                  services: [],
                }))
              }
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                formData.entityType === entity.value
                  ? "border-teal-500 bg-teal-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-teal-300"
              }`}
            >
              <p
                className={`font-semibold text-sm ${
                  formData.entityType === entity.value
                    ? "text-teal-700"
                    : "text-gray-800"
                }`}
              >
                {entity.label}
              </p>
              <p className="text-xs text-gray-500 mt-1 leading-snug">
                {entity.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Step 2: Services offered ────────────────────────────── */}
      {formData.entityType && (
        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Services Offered <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Select all services your {selectedEntity?.label} will provide.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {SERVICE_OPTIONS.map((svc) => {
              const checked = (formData.services || []).includes(svc.value);
              return (
                <button
                  key={svc.value}
                  type="button"
                  onClick={() => toggleService(svc.value)}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    checked
                      ? "border-teal-500 bg-teal-50"
                      : "border-gray-200 bg-white hover:border-teal-300"
                  }`}
                >
                  <span className="text-2xl">{svc.icon}</span>
                  <div>
                    <p
                      className={`font-semibold text-sm ${
                        checked ? "text-teal-700" : "text-gray-800"
                      }`}
                    >
                      {svc.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                      {svc.desc}
                    </p>
                  </div>
                  <div className="ml-auto mt-0.5">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        checked
                          ? "bg-teal-500 border-teal-500"
                          : "border-gray-300"
                      }`}
                    >
                      {checked && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {(formData.services || []).length === 0 && (
            <p className="text-xs text-red-500 mt-2">
              Please select at least one service.
            </p>
          )}
        </div>
      )}

      {/* ── Step 3: Centre details ──────────────────────────────── */}
      {formData.entityType && (formData.services || []).length > 0 && (
        <>
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Facility Details
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {selectedEntity?.label} Name{" "}
                  <span className="text-red-500">*</span>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g. Harmony Wellness Centre"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ownership Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.ownershipType || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ownershipType: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value="">Select ownership</option>
                  <option value="PRIVATE">Private</option>
                  <option value="TRUST">Trust / Society</option>
                  <option value="GOVT_APPROVED">Govt. Approved</option>
                  <option value="PPP">Public-Private Partnership</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Registration / License Number{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.registrationNumber || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      registrationNumber: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="AY/2025/0001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Person Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.contactPerson || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contactPerson: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Dr. Ananya Sharma"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.contactEmail || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contactEmail: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="info@harmonywellness.in"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.contactPhone || ""}
                  maxLength={10}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setFormData((prev) => ({ ...prev, contactPhone: val }));
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    formData.contactPhone &&
                    formData.contactPhone.length !== 10
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="10-digit mobile number"
                  required
                />
                {formData.contactPhone &&
                  formData.contactPhone.length !== 10 && (
                    <p className="text-xs text-red-500 mt-1">
                      Phone number must be exactly 10 digits.
                    </p>
                  )}
              </div>
            </div>
          </div>

          {/* ── Document uploads ──────────────────────────────────── */}
          <div className="space-y-4 mt-6 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">
              Upload Required Documents
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ownership Proof
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    handleFileChange("ownershipProof", e.target.files)
                  }
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Therapy / Services Menu
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    handleFileChange("therapyMenu", e.target.files)
                  }
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facility Images
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    handleFileChange("facilityImages", e.target.files)
                  }
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Staff Certifications / List
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    handleFileChange("staffCerts", e.target.files)
                  }
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                />
              </div>

              {/* Extra doc for hospital type */}
              {formData.entityType === "WELLNESS_CENTRE_HOSPITAL" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hospital Registration Certificate
                  </label>
                  <input
                    type="file"
                    onChange={(e) =>
                      handleFileChange("hospitalCert", e.target.files)
                    }
                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                  />
                </div>
              )}

              {/* Extra doc for resort type */}
              {formData.entityType === "WELLNESS_RESORT" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tourism / Resort License
                  </label>
                  <input
                    type="file"
                    onChange={(e) =>
                      handleFileChange("resortLicense", e.target.files)
                    }
                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                  />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Documents can be re-uploaded or updated later from your dashboard.
            </p>
          </div>

          {/* ── Summary badge ────────────────────────────────────── */}
          <div className="mt-4 p-4 bg-teal-50 border border-teal-200 rounded-xl">
            <p className="text-sm font-semibold text-teal-800 mb-1">
              Registration Summary
            </p>
            <p className="text-xs text-teal-700">
              <span className="font-medium">Facility type:</span>{" "}
              {selectedEntity?.label}
            </p>
            <p className="text-xs text-teal-700 mt-1">
              <span className="font-medium">Services:</span>{" "}
              {(formData.services || [])
                .map(
                  (s) =>
                    SERVICE_OPTIONS.find((o) => o.value === s)?.label || s
                )
                .join(", ")}
            </p>
          </div>
        </>
      )}
    </>
  );
};

export default WellnessCentreForm;
