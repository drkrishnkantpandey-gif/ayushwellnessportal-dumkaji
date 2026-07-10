// src/pages/Register/forms/DirectorateForm.jsx
import React from "react";

const DIRECTORATE_MODULES = [
  "Yoga Professionals Registration",
  "Yoga Centres Registration",
  "Wellness Centre Registration",
  "AYUSH Hospital NABH Incentive",
  "AYUSH College NAAC Incentive",
  "Yoga & AYUSH Research Proposals",
  "Incentive, Subsidy & Reimbursement",
  "Monitoring & Yoga Session Tracker",
  "Star Rating & Certification System",
  "Dashboards, Reports & Analytics",
];

const DirectorateForm = ({ formData, setFormData, step }) => {
  const managedModules = formData.managedModules || [];

  const toggleModule = (module) => {
    const exists = managedModules.includes(module);
    const updated = exists
      ? managedModules.filter((m) => m !== module)
      : [...managedModules, module];

    setFormData({ ...formData, managedModules: updated });
  };

  return (
    <div className="space-y-6">
      {/* --------------- STEP 2: DIRECTORATE DETAILS --------------- */}
      {step === 2 && formData.userType === "directorate" && (
        <>
          <h3 className="text-xl font-semibold text-gray-800">
            Directorate Details
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Directorate Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Directorate Name
              </label>
              <input
                type="text"
                value={formData.directorateName || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    directorateName: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="e.g. Directorate of Ayurveda & Unani Services"
                required
              />
            </div>

            {/* Department (optional, prefilled / editable) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Department
              </label>
              <input
                type="text"
                value={
                  formData.department ||
                  "Department of AYUSH, Govt. of Uttarakhand"
                }
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            {/* Nodal Officer Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nodal Officer Name
              </label>
              <input
                type="text"
                value={formData.nodalOfficerName || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nodalOfficerName: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Enter officer's full name"
                required
              />
            </div>

            {/* Designation */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Designation
              </label>
              <input
                type="text"
                value={formData.designation || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    designation: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="e.g. Director, Joint Director, Nodal Officer"
                required
              />
            </div>

            {/* Official Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Official Email
              </label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Enter official email"
                required
              />
            </div>

            {/* Official Contact Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Official Mobile Number
              </label>
              <input
                type="text"
                value={formData.phone || ""}
                maxLength={10}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="10-digit mobile number"
                required
              />
              {formData.phone && !/^\d*$/.test(formData.phone) && (
                <p className="text-xs text-red-500 mt-1">
                  Phone number must contain digits only.
                </p>
              )}
            </div>

            {/* Landline (optional) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Office Landline (Optional)
              </label>
              <input
                type="text"
                value={formData.landline || ""}
                onChange={(e) =>
                  setFormData({ ...formData, landline: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Office landline with STD code"
              />
            </div>

            {/* Office Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Office Address
              </label>
              <textarea
                value={formData.address || ""}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Enter complete office address"
                required
              />
            </div>

            {/* District */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                District
              </label>
              <input
                type="text"
                value={formData.district || ""}
                onChange={(e) =>
                  setFormData({ ...formData, district: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="e.g. Dehradun"
                required
              />
            </div>

            {/* PIN Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                PIN Code
              </label>
              <input
                type="text"
                value={formData.pincode || ""}
                maxLength={6}
                onChange={(e) =>
                  setFormData({ ...formData, pincode: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="6-digit PIN code"
                required
              />
              {formData.pincode && !/^\d*$/.test(formData.pincode) && (
                <p className="text-xs text-red-500 mt-1">
                  PIN code must contain digits only.
                </p>
              )}
            </div>

            {/* --------------- ID PROOF SECTION --------------- */}

            {/* ID Proof Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ID Proof Type
              </label>
              <select
                value={formData.idProofType || ""}
                onChange={(e) =>
                  setFormData({ ...formData, idProofType: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="">Select ID</option>
                <option value="aadhar">Aadhaar</option>
                <option value="pan">PAN</option>
                <option value="govt_id">Government ID / Service ID</option>
              </select>
            </div>

            {/* ID Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ID Number
              </label>
              <input
                type="text"
                value={formData.idNumber || ""}
                onChange={(e) =>
                  setFormData({ ...formData, idNumber: e.target.value })
                }
                placeholder="Enter ID number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            {/* Upload ID Proof */}
            <div className="md:col-span-2 mt-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload ID Proof / Authorization Letter (PDF or Image)
              </label>

              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setFormData({ ...formData, idProofFile: file });
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer"
              />

              {formData.idProofFile && (
                <div className="mt-3">
                  {formData.idProofFile.type === "application/pdf" ? (
                    <p className="text-sm text-gray-700">
                      📄 Uploaded PDF:{" "}
                      <span className="font-medium">
                        {formData.idProofFile.name}
                      </span>
                    </p>
                  ) : (
                    <img
                      src={URL.createObjectURL(formData.idProofFile)}
                      alt="ID Preview"
                      className="w-40 h-40 object-cover border rounded-md shadow-sm"
                    />
                  )}

                  <button
                    onClick={() =>
                      setFormData({ ...formData, idProofFile: null })
                    }
                    className="mt-2 bg-red-500 text-white text-xs px-3 py-1 rounded-md"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* --------------- MODULE ACCESS & NOTIFICATIONS --------------- */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Modules to be Managed by this Directorate User
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Select the modules this account should have access to (registrations,
          incentives, monitoring, dashboards, etc.).
        </p>

        {/* 🔹 Name & Email along with Modules */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Name (for module communication)
            </label>
            <input
              type="text"
              value={formData.moduleContactName || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  moduleContactName: e.target.value,
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="Enter contact person name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email (for module communication)
            </label>
            <input
              type="email"
              value={formData.moduleContactEmail || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  moduleContactEmail: e.target.value,
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="Enter email for module alerts"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-2 text-sm">
          {DIRECTORATE_MODULES.map((module) => (
            <label key={module} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={managedModules.includes(module)}
                onChange={() => toggleModule(module)}
              />
              <span>{module}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Notification Preferences */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Notification Preferences
        </label>
        <div className="space-y-2 text-sm">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!formData.receiveEmailAlerts}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  receiveEmailAlerts: e.target.checked,
                })
              }
            />
            <span>Receive email alerts for new applications & approvals</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!formData.receiveSmsAlerts}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  receiveSmsAlerts: e.target.checked,
                })
              }
            />
            <span>Receive SMS alerts for critical actions</span>
          </label>
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Additional Remarks (Optional)
        </label>
        <textarea
          value={formData.remarks || ""}
          onChange={(e) =>
            setFormData({ ...formData, remarks: e.target.value })
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          placeholder="Any special instructions or notes for this directorate account..."
        />
      </div>

      {/* Declaration */}
      <div>
        <label className="flex items-start">
          <input
            type="checkbox"
            className="w-4 h-4 mt-1 text-teal-600 border-gray-300 rounded"
            required
          />
          <span className="ml-2 text-sm text-gray-700">
            I certify that the details provided for this Directorate user are
            true and that this user is authorized to operate on behalf of the
            Directorate in the AYUSH & Yoga Policy Implementation Portal.
          </span>
        </label>
      </div>
    </div>
  );
};

export default DirectorateForm;
