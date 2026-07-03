// src/pages/Register/forms/TrainingCentreForm.jsx
import React from "react";

const TrainingCentreForm = ({ formData, setFormData, step }) => {
  // ------------------ DELETE PHOTO HANDLER ------------------
  const removeCentrePhoto = (index) => {
    const updated = [...formData.centrePhotos];
    updated.splice(index, 1);
    setFormData({ ...formData, centrePhotos: updated });
  };

  return (
    <div className="space-y-6">
      {/* ------------------- Step 2 ------------------- */}
      {step === 2 && formData.userType === "yoga_centre" && (
        <>
          <h3 className="text-xl font-semibold text-gray-800">
            Centre Details
          </h3>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Centre Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Centre’s Official Name
              </label>
              <input
                type="text"
                value={formData.centreName}
                onChange={(e) =>
                  setFormData({ ...formData, centreName: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Enter your Centre's Official name"
                required
              />
            </div>

            {/* Centre Establishment Year */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Year of Establishment
              </label>
              <input
                type="number"
                value={formData.establishmentYear || ""}
                onChange={(e) =>
                  setFormData({ ...formData, establishmentYear: e.target.value })
                }
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="e.g. 2005"
                required
              />
            </div>


            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Centre Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Enter centre email"
                required
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Centre Contact Number <span className="text-red-500">*</span>
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
                placeholder="10-digit centre contact"
                required
              />
              {formData.phone && formData.phone.length !== 10 && (
                <p className="text-xs text-red-500 mt-1">
                  Phone number must be exactly 10 digits.
                </p>
              )}
            </div>


            {/* Institution Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Type of Institution
              </label>
              <select
                value={formData.institutionType}
                onChange={(e) =>
                  setFormData({ ...formData, institutionType: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="">Select type</option>
                <option value="private">Private</option>
                <option value="trust">Trust</option>
                <option value="society">Society</option>
                <option value="government">Government Recognized</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Choose Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="">Select Category</option>
                <option value="Basic">Basic</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* -------------------- OWNER DETAILS -------------------- */}

            {/* Owner Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Owner Name
              </label>
              <input
                type="text"
                value={formData.ownerName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, ownerName: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Owner full name"
                required
              />
            </div>

            {/* Owner Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Owner Email
              </label>
              <input
                type="email"
                value={formData.ownerEmail || ""}
                onChange={(e) =>
                  setFormData({ ...formData, ownerEmail: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Owner email address"
                required
              />
            </div>

            {/* Owner Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Owner Contact Number <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                value={formData.ownerPhone || ""}
                maxLength={10}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setFormData({ ...formData, ownerPhone: val });
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${formData.ownerPhone && formData.ownerPhone.length !== 10
                    ? "border-red-500"
                    : "border-gray-300"
                  }`}
                placeholder="10-digit owner contact"
                required
              />

              {formData.ownerPhone && formData.ownerPhone.length !== 10 && (
                <p className="text-xs text-red-500 mt-1">
                  Phone number must be exactly 10 digits.
                </p>
              )}
            </div>

            {/* -------------------- ID PROOF -------------------- */}

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
              </select>
            </div>
            {/* ------------------ ID Proof Section ------------------ */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload ID Proof (Aadhaar / PAN) – PDF or Image
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

              {/* Preview Section */}
              {formData.idProofFile && (
                <div className="mt-3">
                  {formData.idProofFile.type === "application/pdf" ? (
                    <p className="text-sm text-gray-700">
                      📄 Uploaded PDF: <span className="font-medium">{formData.idProofFile.name}</span>
                    </p>
                  ) : (
                    <img
                      src={URL.createObjectURL(formData.idProofFile)}
                      alt="ID Preview"
                      className="w-40 h-40 object-cover border rounded-md shadow-sm"
                    />
                  )}

                  {/* Remove Button */}
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


            {/* ID Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ID Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.idNumber || ""}
                onChange={(e) =>
                  setFormData({ ...formData, idNumber: e.target.value.toUpperCase() })
                }
                placeholder="Enter Aadhaar or PAN number"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${formData.idNumber &&
                    (formData.idProofType === 'aadhar' ? formData.idNumber.length !== 12 : !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.idNumber))
                    ? "border-red-500"
                    : "border-gray-300"
                  }`}
                required
              />
              {formData.idNumber && formData.idProofType === 'aadhar' && formData.idNumber.length !== 12 && (
                <p className="text-xs text-red-500 mt-1">Aadhaar must be 12 digits.</p>
              )}
              {formData.idNumber && formData.idProofType === 'pan' && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.idNumber) && (
                <p className="text-xs text-red-500 mt-1">Invalid PAN format.</p>
              )}
            </div>

            {/* ----------------- WEBSITE ----------------- */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Centre Website (Optional)
              </label>
              <input
                type="text"
                value={formData.website || ""}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                placeholder="https://yourcentrewebsite.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Physical Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Enter complete address"
                required
              />
            </div>

            {/* Map Placeholder */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location Pin (Map Autofill)
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600">
                📍 Map Autocomplete & Pin Drop (Coming Soon)
              </div>
            </div>
          </div>
        </>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* Rest of your code remains SAME (About, Amenities, Photos, Accreditation) */}
      {/* ---------------------------------------------------------------------- */}

      {/* About Centre */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          About Centre & Facilities
        </label>
        <textarea
          value={formData.aboutCentre}
          onChange={(e) =>
            setFormData({ ...formData, aboutCentre: e.target.value })
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          placeholder="Describe your centre's mission, facilities, specialization…"
          required
        />
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Available Amenities
        </label>

        <div className="grid grid-cols-2 gap-2 text-sm">
          {["Yoga Mats", "Meditation Room", "Locker Facility", "Drinking Water"].map(
            (item) => (
              <label key={item} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData?.amenities?.includes(item)}
                  onChange={(e) => {
                    const updated = formData.amenities || [];
                    if (e.target.checked) updated.push(item);
                    else updated.splice(updated.indexOf(item), 1);
                    setFormData({ ...formData, amenities: [...updated] });
                  }}
                />
                <span>{item}</span>
              </label>
            )
          )}

          {/* Other Amenity */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData?.otherAmenityChecked || false}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  otherAmenityChecked: e.target.checked,
                  otherAmenity: e.target.checked ? formData.otherAmenity : "",
                })
              }
            />
            <span>Any Other (specify)</span>
          </label>

          {formData?.otherAmenityChecked && (
            <input
              type="text"
              placeholder="Enter additional amenity"
              value={formData.otherAmenity || ""}
              onChange={(e) =>
                setFormData({ ...formData, otherAmenity: e.target.value })
              }
              className="col-span-2 mt-1 p-2 border rounded text-sm"
            />
          )}
        </div>
      </div>

      {/* -------------------- PHOTO UPLOAD SECTION (unchanged) -------------------- */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Upload Centre Photos (Min 3, Max 6)
        </label>

        <div
          className="w-full border border-dashed border-teal-400 p-5 rounded-lg text-center text-gray-600 bg-teal-50 cursor-pointer"
          onClick={() => document.getElementById("centrePhotoInput").click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files);

            if ((formData.centrePhotos?.length || 0) + files.length > 6) {
              alert("Maximum 6 photos allowed.");
              return;
            }

            setFormData({
              ...formData,
              centrePhotos: [...(formData.centrePhotos || []), ...files].slice(
                0,
                6
              ),
            });
          }}
        >
          <p className="font-medium">Drag & Drop or Click to Upload</p>
          <p className="text-xs text-gray-500 mt-1">
            Recommended: JPG, PNG — Max 5MB each
          </p>

          {formData.centrePhotos && formData.centrePhotos.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.centrePhotos.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="w-full h-24 object-cover rounded-lg border"
                  />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCentrePhoto(index);
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
            {formData.centrePhotos?.length || 0} / 6 photos uploaded
          </p>
        </div>

        <input
          id="centrePhotoInput"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files);

            if ((formData.centrePhotos?.length || 0) + files.length > 6) {
              alert("Maximum 6 photos allowed.");
              return;
            }

            setFormData({
              ...formData,
              centrePhotos: [...(formData.centrePhotos || []), ...files].slice(
                0,
                6
              ),
            });
          }}
        />
      </div>

      {/* Accreditation */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Centre Accreditation / Affiliations
        </label>
        <input
          type="text"
          placeholder="Enter affiliations (ex: Govt Approved, Yoga Alliance…) "
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          value={formData.accreditation}
          onChange={(e) =>
            setFormData({ ...formData, accreditation: e.target.value })
          }
        />
      </div>

      {/* Upload Accreditation Proof */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Upload Accreditation Proof (PDF / Images)
        </label>
        <input type="file" className="w-full" accept="image/*,.pdf" multiple />
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
            I certify that all information provided is true and accurate.
          </span>
        </label>
      </div>
    </div>
  );
};

export default TrainingCentreForm;
