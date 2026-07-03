// src/pages/Register/forms/AyushCollegeForm.jsx
import React from "react";

const AyushCollegeForm = ({ formData, setFormData }) => {
  return (
    <div className="space-y-10">

      {/* ============================
          1. BASIC COLLEGE INFORMATION
      ============================ */}
      <h2 className="text-lg font-bold text-gray-800">Basic College Information</h2>
      <div className="grid md:grid-cols-2 gap-6">

        {/* College Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            College Name
          </label>
          <input
            type="text"
            value={formData.collegeName || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, collegeName: e.target.value }))
            }
            placeholder="Enter official college name"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Type of College */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Type of College
          </label>
          <select
            value={formData.collegeType || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, collegeType: e.target.value }))
            }
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Select Type</option>
            <option>Ayurveda</option>
            <option>Unani</option>
            <option>Siddha</option>
            <option>Homeopathy</option>
            <option>Yoga & Naturopathy</option>
          </select>
        </div>

        {/* University Affiliation */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            University Affiliation
          </label>
          <select
            value={formData.affiliation || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, affiliation: e.target.value }))
            }
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Select Affiliation</option>
            <option>Uttarakhand Ayurved University</option>
            <option>Other</option>
          </select>
        </div>

        {/* College Code */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            College Code / Institution Code
          </label>
          <input
            type="text"
            value={formData.collegeCode || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, collegeCode: e.target.value }))
            }
            placeholder="Enter UAU-registered college code"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Year of Establishment */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Year of Establishment
          </label>
          <input
            type="number"
            min="1800"
            max="2099"
            value={formData.estYear || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, estYear: e.target.value }))
            }
            placeholder="e.g., 1998"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* College Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Official Email
          </label>
          <input
            type="email"
            value={formData.collegeEmail || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, collegeEmail: e.target.value }))
            }
            placeholder="official@college.edu"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* College Phone */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            College Phone Number
          </label>
          <input
            type="tel"
            value={formData.collegePhone || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, collegePhone: e.target.value }))
            }
            placeholder="Enter phone number"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Website (Optional)
          </label>
          <input
            type="url"
            value={formData.website || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, website: e.target.value }))
            }
            placeholder="https://www.college.edu"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* ============================
          2. ADDRESS & LOCATION
      ============================ */}
      <h2 className="text-lg font-bold text-gray-800">Address & Location Details</h2>
      <div className="grid md:grid-cols-2 gap-6">

        {/* State */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            State
          </label>
          <input
            type="text"
            value="Uttarakhand"
            disabled
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
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
              setFormData((prev) => ({ ...prev, district: e.target.value }))
            }
            placeholder="Enter district"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Tehsil/Block */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tehsil / Block
          </label>
          <input
            type="text"
            value={formData.block || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, block: e.target.value }))
            }
            placeholder="Enter tehsil/block"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Full Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Full Address
          </label>
          <textarea
            value={formData.fullAddress || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, fullAddress: e.target.value }))
            }
            placeholder="Enter full college address"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          ></textarea>
        </div>

        {/* Pin Code */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Pin Code
          </label>
          <input
            type="number"
            value={formData.pin || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, pin: e.target.value }))
            }
            placeholder="e.g., 248001"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Latitude */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Latitude (Optional)
          </label>
          <input
            type="text"
            value={formData.latitude || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, latitude: e.target.value }))
            }
            placeholder="e.g., 30.3165"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Longitude */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Longitude (Optional)
          </label>
          <input
            type="text"
            value={formData.longitude || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, longitude: e.target.value }))
            }
            placeholder="e.g., 78.0322"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* ============================
          3. PRINCIPAL / AUTHORIZED
      ============================ */}
      <h2 className="text-lg font-bold text-gray-800">Principal / Authorized Person Details</h2>
      <div className="grid md:grid-cols-2 gap-6">

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Name
          </label>
          <input
            type="text"
            value={formData.principalName || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, principalName: e.target.value }))
            }
            required
            placeholder="Enter principal's full name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Designation
          </label>
          <input
            type="text"
            value={formData.designation || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, designation: e.target.value }))
            }
            required
            placeholder="e.g., Principal, Director"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Official Email
          </label>
          <input
            type="email"
            value={formData.principalEmail || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                principalEmail: e.target.value,
              }))
            }
            required
            placeholder="principal@college.edu"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Mobile Number
          </label>
          <input
            type="tel"
            value={formData.principalPhone || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                principalPhone: e.target.value,
              }))
            }
            required
            placeholder="Enter contact number"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ID Proof Upload (Aadhaar / PAN)
          </label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                idProof: e.target.files[0],
              }))
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* ============================
          4. NAAC DETAILS
      ============================ */}
      <h2 className="text-lg font-bold text-gray-800">NAAC Accreditation Details</h2>
      <div className="grid md:grid-cols-2 gap-6">

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            NAAC Accreditation Status
          </label>
          <select
            value={formData.naacStatus || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, naacStatus: e.target.value }))
            }
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Select Status</option>
            <option>A</option>
            <option>B</option>
            <option>C</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Latest NAAC Grade
          </label>
          <input
            type="text"
            value={formData.naacGrade || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, naacGrade: e.target.value }))
            }
            placeholder="e.g., A+, B++, C"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            CGPA
          </label>
          <input
            type="number"
            step="0.01"
            min="1"
            max="4"
            value={formData.cgpa || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, cgpa: e.target.value }))
            }
            placeholder="e.g., 3.41"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Date of Accreditation */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Date of Accreditation
          </label>
          <input
            type="date"
            value={formData.accDate || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, accDate: e.target.value }))
            }
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Validity Expiry Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Validity Expiry Date
          </label>
          <input
            type="date"
            value={formData.expiryDate || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))
            }
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* NAAC Cycle */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            NAAC Accreditation Cycle
          </label>
          <select
            value={formData.cycle || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, cycle: e.target.value }))
            }
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Select Cycle</option>
            <option>Cycle 1</option>
            <option>Cycle 2</option>
            <option>Cycle 3</option>
            <option>Cycle 4</option>
          </select>
        </div>

        {/* Certificate Upload */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            NAAC Certificate (PDF)
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                naacCertificate: e.target.files[0],
              }))
            }
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Audit Report Upload */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Audit Report / Peer Team Report (PDF)
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                auditReport: e.target.files[0],
              }))
            }
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* ============================
          5. UNIVERSITY INTEGRATION
      ============================ */}
      <h2 className="text-lg font-bold text-gray-800">
        Integration with UAU Database
      </h2>
      <div className="grid md:grid-cols-2 gap-6">

        {/* University Registration Number */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            University Registration Number
          </label>
          <input
            type="text"
            value={formData.univReg || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, univReg: e.target.value }))
            }
            placeholder="Enter registration number"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* AISHE Code */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            AISHE Code (if applicable)
          </label>
          <input
            type="text"
            value={formData.aishe || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, aishe: e.target.value }))
            }
            placeholder="Enter AISHE code"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* College MIS ID */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            College MIS ID
          </label>
          <input
            type="text"
            value={formData.misId || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, misId: e.target.value }))
            }
            placeholder="Enter MIS ID"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>



      {/* ============================
          7. SUPPORTING DOCS
      ============================ */}
      <h2 className="text-lg font-bold text-gray-800">Supporting Documents</h2>
      <div className="grid md:grid-cols-2 gap-6">

        {/* Additional NAAC Certificate */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            NAAC Certificate (Second Copy)
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                extraNaac: e.target.files[0],
              }))
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Affiliation Letter */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Affiliation Letter (Optional)
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                affiliationLetter: e.target.files[0],
              }))
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Society/Trust Certificate */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Society / Trust Registration Certificate (Optional)
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                trustCertificate: e.target.files[0],
              }))
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* ============================
          8. DECLARATION & SIGN
      ============================ */}
      <h2 className="text-lg font-bold text-gray-800">Declaration & e-Sign</h2>

      <div className="space-y-4">
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={formData.declaration || false}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                declaration: e.target.checked,
              }))
            }
            required
            className="mt-1 h-5 w-5 text-teal-600"
          />
          <span className="text-gray-700 text-sm">
            I confirm that the information provided is accurate and the uploaded documents are authentic.
          </span>
        </label>

        {/* Digital Signature Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Digital Signature Upload (Optional)
          </label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                digitalSign: e.target.files[0],
              }))
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>


    </div>
  );
};

export default AyushCollegeForm;