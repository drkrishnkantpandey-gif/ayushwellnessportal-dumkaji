// src/pages/Register/forms/YogaProfessionalForm.jsx
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

const YogaProfessionalForm = ({ formData, setFormData, step }) => {
  // Photo removal handler
  const removeProfilePhoto = () => {
    setFormData({ ...formData, profilePhoto: null });
  };

  const removeCertificateFile = (index) => {
    const updated = [...(formData.certificateFiles || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, certificateFiles: updated });
  };

  return (
    <div className="space-y-6">
      {/* ------------------- Step 2: Personal Details ------------------- */}
      {step === 2 && formData.userType === "yoga_professional" && (
        <>
          <h3 className="text-xl font-semibold text-gray-800">
            Personal Details
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dob || ""}
                onChange={(e) =>
                  setFormData({ ...formData, dob: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gender
              </label>
              <select
                value={formData.gender || ""}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.phone}
                maxLength={10}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setFormData({ ...formData, phone: val });
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${formData.phone && formData.phone.length !== 10
                  ? "border-red-500"
                  : "border-gray-300"
                  }`}
                placeholder="10-digit mobile number"
                required
              />
              {formData.phone && formData.phone.length !== 10 && (
                <p className="text-xs text-red-500 mt-1">
                  Phone number must be exactly 10 digits.
                </p>
              )}
            </div>

            {/* Aadhaar Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Aadhaar Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.aadhaar || ""}
                maxLength={12}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setFormData({ ...formData, aadhaar: val });
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${formData.aadhaar && formData.aadhaar.length !== 12
                  ? "border-red-500"
                  : "border-gray-300"
                  }`}
                placeholder="12-digit Aadhaar number"
                required
              />
              {formData.aadhaar && formData.aadhaar.length !== 12 && (
                <p className="text-xs text-red-500 mt-1">
                  Aadhaar must be exactly 12 digits.
                </p>
              )}
            </div>

            {/* PAN Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                PAN Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.pan || ""}
                maxLength={10}
                onChange={(e) =>
                  setFormData({ ...formData, pan: e.target.value.toUpperCase() })
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)
                  ? "border-red-500"
                  : "border-gray-300"
                  }`}
                placeholder="ABCDE1234F"
                required
              />
              {formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan) && (
                <p className="text-xs text-red-500 mt-1">
                  Invalid PAN format (e.g., ABCDE1234F).
                </p>
              )}
            </div>

            {/* Address - Structured */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address Line 1
              </label>
              <textarea
                value={formData.address || ""}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="House No., Street, Locality"
                rows={2}
                required
              />
            </div>

            {/* Village & Block */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Village
              </label>
              <input
                type="text"
                value={formData.village || ""}
                onChange={(e) =>
                  setFormData({ ...formData, village: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Village name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Block
              </label>
              <input
                type="text"
                value={formData.block || ""}
                onChange={(e) =>
                  setFormData({ ...formData, block: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Block name"
              />
            </div>

            {/* District */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                District <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.district || ""}
                onChange={(e) =>
                  setFormData({ ...formData, district: e.target.value })
                }
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select District</option>
                {DISTRICT_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* PIN Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                PIN Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.pincode || ""}
                maxLength={6}
                onChange={(e) =>
                  setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${formData.pincode && formData.pincode.length !== 6 ? "border-red-500" : "border-gray-300"}`}
                placeholder="6-digit PIN Code"
                required
              />
              {formData.pincode && formData.pincode.length !== 6 && (
                <p className="text-xs text-red-500 mt-1">PIN Code must be exactly 6 digits.</p>
              )}
            </div>
          </div>

          {/* Professional Details Section */}
          <h3 className="text-xl font-semibold text-gray-800 mt-8">
            Professional Details
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Qualification */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Qualification <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.qualification || ""}
                onChange={(e) =>
                  setFormData({ ...formData, qualification: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-medium text-gray-700"
                required
              >
                <option value="">Select Qualification</option>
                <option value="Yoga Protocol Instructor">Yoga Protocol Instructor</option>
                <option value="Yoga Wellness Instructor">Yoga Wellness Instructor</option>
                <option value="Yoga Teacher & Evaluator">Yoga Teacher & Evaluator</option>
                <option value="Therapeutic Yoga Consultant">Therapeutic Yoga Consultant</option>
                <option value="Yoga Therapist">Yoga Therapist</option>
                <option value="Assistant Yoga Therapist">Assistant Yoga Therapist</option>
                <option value="Yoga Master">Yoga Master</option>
                <option value="Yoga Volunteer">Yoga Volunteer</option>
                <option value="Level 1- Yoga Instructor">Level 1- Yoga Instructor</option>
                <option value="Level 2 Yoga Teacher">Level 2 Yoga Teacher</option>
                <option value="Skill Certificate">Skill Certificate</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* YCB Certificate Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                YCB Certificate Number
              </label>
              <input
                type="text"
                value={formData.ycbCertificateNumber || ""}
                onChange={(e) =>
                  setFormData({ ...formData, ycbCertificateNumber: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Enter YCB Certificate Number"
              />
            </div>

            {/* Other Qualification Name (Conditional) */}
            {formData.qualification === "Other" && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Specify Qualification Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.otherQualificationName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, otherQualificationName: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter name of other certificate"
                  required
                />
              </div>
            )}

            {/* Experience Years */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                value={formData.experienceYears || ""}
                min="0"
                max="50"
                onChange={(e) =>
                  setFormData({ ...formData, experienceYears: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., 5"
                required
              />
            </div>

            {/* Specialization */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Specialization Areas
              </label>
              <input
                type="text"
                value={formData.specialization || ""}
                onChange={(e) =>
                  setFormData({ ...formData, specialization: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., Hatha Yoga, Pranayama, Therapeutic Yoga"
              />
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Brief Bio / About Yourself
              </label>
              <textarea
                value={formData.bio || ""}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Describe your yoga journey, teaching philosophy, and expertise..."
                rows={4}
              />
            </div>
          </div>

          {/* Profile Photo Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload Profile Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                setFormData({ ...formData, profilePhoto: file });
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer"
            />

            {formData.profilePhoto && (
              <div className="mt-3">
                <img
                  src={URL.createObjectURL(formData.profilePhoto)}
                  alt="Profile Preview"
                  className="w-32 h-32 object-cover border rounded-full shadow-sm"
                />
                <button
                  type="button"
                  onClick={removeProfilePhoto}
                  className="mt-2 bg-red-500 text-white text-xs px-3 py-1 rounded-md"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Certificate Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload Certificates (PDF / Images) - Max 5
            </label>

            <div
              className="w-full border border-dashed border-teal-400 p-5 rounded-lg text-center text-gray-600 bg-teal-50 cursor-pointer"
              onClick={() => document.getElementById("certificateInput").click()}
            >
              <p className="font-medium">Click to Upload Certificates</p>
              <p className="text-xs text-gray-500 mt-1">
                Yoga Certification Board, QCI, or other certifications
              </p>

              {formData.certificateFiles && formData.certificateFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.certificateFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      {file.type === "application/pdf" ? (
                        <div className="w-full h-24 flex items-center justify-center bg-gray-100 rounded-lg border">
                          <span className="text-sm text-gray-600">📄 {file.name}</span>
                        </div>
                      ) : (
                        <img
                          src={URL.createObjectURL(file)}
                          alt="certificate"
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCertificateFile(index);
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full px-2 py-1 text-xs opacity-90 hover:opacity-100"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-500 mt-3">
                {formData.certificateFiles?.length || 0} / 5 files uploaded
              </p>
            </div>

            <input
              id="certificateInput"
              type="file"
              accept="image/*,.pdf"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files);

                if ((formData.certificateFiles?.length || 0) + files.length > 5) {
                  alert("Maximum 5 certificate files allowed.");
                  return;
                }

                setFormData({
                  ...formData,
                  certificateFiles: [...(formData.certificateFiles || []), ...files].slice(0, 5),
                });
              }}
            />
          </div>

          {/* Declaration */}
          <div className="bg-amber-50 border-2 border-amber-200 p-5 rounded-xl">
            <label className="flex items-start">
              <input
                type="checkbox"
                className="w-4 h-4 mt-1 text-teal-600 border-gray-300 rounded flex-shrink-0"
                required
              />
              <span className="ml-3 text-sm text-amber-900">
                <span className="font-bold">Declaration: </span>
                I certify that all information provided is true, accurate and complete. I consent to the use of this data by the Government of India / Ministry of AYUSH for official, administrative and public interest purposes in accordance with applicable laws.
              </span>
            </label>
          </div>
        </>
      )}
    </div>
  );
};

export default YogaProfessionalForm;
