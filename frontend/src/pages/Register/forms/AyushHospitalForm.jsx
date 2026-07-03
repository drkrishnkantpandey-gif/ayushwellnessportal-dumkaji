// src/pages/Register/forms/AyushHospitalForm.jsx
import React, { useRef } from "react";
import { Upload, Info, FileText, CheckCircle2 } from "lucide-react";

const stateDistrictMap = {
  "Uttarakhand": ["Dehradun", "Haridwar", "Nainital", "Almora"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi"],
  "Delhi": ["New Delhi"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur"]
};

const AyushHospitalForm = ({ formData, setFormData }) => {
  const supportDocInputRef = useRef(null);
  const nabhCertInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "state") {
      setFormData((prev) => ({ ...prev, [name]: value, district: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];

      // Frontend validation: Max 2MB
      if (file.size > 2 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum allowed size is 2MB.`);
        return;
      }

      setFormData((prev) => ({ ...prev, [name]: file }));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hospital Basic Details */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-gray-800 border-b pb-3 flex items-center gap-2">
          <div className="w-2 h-6 bg-teal-600 rounded-full"></div>
          Hospital Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Hospital Name</label>
            <input
              type="text"
              name="hospitalName"
              value={formData.hospitalName || ""}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              placeholder="Enter full hospital name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">AYUSH System</label>
            <select
              name="ayushSystem"
              value={formData.ayushSystem || "Ayurveda"}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              required
            >
              <option value="Ayurveda">Ayurveda</option>
              <option value="Yoga">Yoga</option>
              <option value="Unani">Unani</option>
              <option value="Siddha">Siddha</option>
              <option value="Homeopathy">Homeopathy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Hospital Type</label>
            <div className="flex gap-6 mt-3">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="hospitalType"
                  value="Government"
                  checked={formData.hospitalType === "Government"}
                  onChange={handleChange}
                  className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-teal-600 transition">Government</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="hospitalType"
                  value="Private"
                  checked={formData.hospitalType === "Private"}
                  onChange={handleChange}
                  className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-teal-600 transition">Private</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Hospital Registration Number</label>
            <input
              type="text"
              name="registrationNumber"
              value={formData.registrationNumber || ""}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              placeholder="e.g. REG/HOS/2024/123"
              required
            />
          </div>
        </div>
      </div>

      {/* NABH Accreditation Details */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-gray-800 border-b pb-3 flex items-center gap-2">
          <div className="w-2 h-6 bg-amber-500 rounded-full"></div>
          NABH Accreditation Status
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">NABH Accredited?</label>
            <select
              name="nabhStatus"
              value={formData.nabhStatus || "No"}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              required
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          {formData.nabhStatus === "Yes" && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">NABH Certificate Number</label>
                <input
                  type="text"
                  name="nabhCertificateNumber"
                  value={formData.nabhCertificateNumber || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  placeholder="Enter Certificate No."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">NABH Validity Start Date</label>
                <input
                  type="date"
                  name="nabhValidityStart"
                  value={formData.nabhValidityStart || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">NABH Validity End Date</label>
                <input
                  type="date"
                  name="nabhValidityEnd"
                  value={formData.nabhValidityEnd || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Location & Address */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-gray-800 border-b pb-3 flex items-center gap-2">
          <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
          Location & Contact Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
            <select
              name="state"
              value={formData.state || ""}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              required
            >
              <option value="">Select State</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Arunachal Pradesh">Arunachal Pradesh</option>
              <option value="Assam">Assam</option>
              <option value="Bihar">Bihar</option>
              <option value="Chhattisgarh">Chhattisgarh</option>
              <option value="Goa">Goa</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Haryana">Haryana</option>
              <option value="Himachal Pradesh">Himachal Pradesh</option>
              <option value="Jharkhand">Jharkhand</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Kerala">Kerala</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Manipur">Manipur</option>
              <option value="Meghalaya">Meghalaya</option>
              <option value="Mizoram">Mizoram</option>
              <option value="Nagaland">Nagaland</option>
              <option value="Odisha">Odisha</option>
              <option value="Punjab">Punjab</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Sikkim">Sikkim</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Telangana">Telangana</option>
              <option value="Tripura">Tripura</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Uttarakhand">Uttarakhand</option>
              <option value="West Bengal">West Bengal</option>
              <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
              <option value="Chandigarh">Chandigarh</option>
              <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
              <option value="Lakshadweep">Lakshadweep</option>
              <option value="Delhi">Delhi</option>
              <option value="Puducherry">Puducherry</option>
              <option value="Ladakh">Ladakh</option>
              <option value="Jammu and Kashmir">Jammu and Kashmir</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">District</label>
            <select
              name="district"
              value={formData.district || ""}
              onChange={handleChange}
              disabled={!formData.state}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition ${!formData.state ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              required
            >
              <option value="">Select District</option>
              {formData.state && stateDistrictMap[formData.state]?.map((dist) => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Complete Address</label>
            <textarea
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              placeholder="Enter complete building and street address"
              required
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Person Name</label>
            <input
              type="text"
              name="contactPersonName"
              value={formData.contactPersonName || ""}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              placeholder="Name of nodal person"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Email</label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail || ""}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              placeholder="official@hospital.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Mobile Number</label>
            <input
              type="tel"
              name="contactMobile"
              value={formData.contactMobile || ""}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              placeholder="+91 XXXXX XXXXX"
              required
            />
          </div>
        </div>
      </div>

      {/* Document Upload section */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-gray-800 border-b pb-3 flex items-center gap-2">
          <Upload size={20} className="text-teal-600" />
          Document Uploads
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Supporting Documents</label>
            <input
              type="file"
              ref={supportDocInputRef}
              name="supportingDocument"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg"
              className="hidden"
            />
            <div
              onClick={() => supportDocInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer group flex flex-col items-center justify-center min-h-[160px] ${formData.supportingDocument
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-teal-400 hover:bg-teal-50/30'
                }`}
            >
              {formData.supportingDocument ? (
                <>
                  <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle2 size={24} />
                  </div>
                  <p className="text-sm font-bold text-teal-700 truncate max-w-full px-4">
                    {formData.supportingDocument.name}
                  </p>
                  <p className="text-xs text-teal-500 mt-1">File selected successfully</p>
                </>
              ) : (
                <>
                  <Upload size={32} className="mx-auto text-gray-300 group-hover:text-teal-500 mb-3" />
                  <p className="text-sm font-bold text-gray-500 group-hover:text-teal-700 transition">Upload Supporting Docs</p>
                  <p className="text-xs text-gray-400 mt-1">PDF or JPG (Max 2MB)</p>
                </>
              )}
            </div>
          </div>

          {formData.nabhStatus === "Yes" && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">NABH Certificate</label>
              <input
                type="file"
                ref={nabhCertInputRef}
                name="nabhCertificate"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg"
                className="hidden"
              />
              <div
                onClick={() => nabhCertInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer group flex flex-col items-center justify-center min-h-[160px] ${formData.nabhCertificate
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 hover:border-amber-400 hover:bg-amber-50/30'
                  }`}
              >
                {formData.nabhCertificate ? (
                  <>
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-3">
                      <FileText size={24} />
                    </div>
                    <p className="text-sm font-bold text-amber-700 truncate max-w-full px-4">
                      {formData.nabhCertificate.name}
                    </p>
                    <p className="text-xs text-amber-500 mt-1">File selected successfully</p>
                  </>
                ) : (
                  <>
                    <Upload size={32} className="mx-auto text-gray-300 group-hover:text-amber-500 mb-3" />
                    <p className="text-sm font-bold text-gray-500 group-hover:text-amber-700 transition">Upload NABH Cert</p>
                    <p className="text-xs text-gray-400 mt-1">PDF or JPG (Max 2MB)</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-teal-50 border border-teal-100 p-4 rounded-lg flex gap-3 text-teal-800">
          <Info size={20} className="shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold">Guidelines for documents</p>
            <p className="opacity-80">Ensure all documents are self-attested and clearly legible to avoid rejection during verification.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AyushHospitalForm;
