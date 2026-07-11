import API from '../../config/api';
// src/pages/Register/Register.jsx 
import React, { useState } from "react";
import axios from "axios";
import { Users, FileText } from "lucide-react";

import RoleSelect from "./RoleSelect";
import WellnessCentreForm from "./forms/WellnessCentreForm";

// role-wise dummy forms (all same fields as PersonKYC)
import YogaProfessionalForm from "./forms/YogaProfessionalForm";
import TrainingCentreForm from "./forms/TrainingCentreForm";
import AyushHospitalForm from "./forms/AyushHospitalForm";
import AyushCollegeForm from "./forms/AyushCollegeForm";
import DistrictOfficerForm from "./forms/DistrictOfficerForm";
import DirectorateForm from "./forms/DirectorateForm";
import AdminForm from "./forms/AdminForm";
import ResearchInstitutionForm from "./forms/ResearchInstitutionForm";

const Register = ({ setCurrentPage }) => {
  const [step, setStep] = useState(1);

  // 🔹 OTP state
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [verificationEmail, setVerificationEmail] = useState("");

  const [formData, setFormData] = useState({
    userType: "",

    // person KYC fields (for non-wellness roles)
    fullName: "",
    email: "",
    phone: "",
    aadhaar: "",
    pan: "",
    qualification: "",

    // auth fields (Step 3)
    password: "",
    confirmPassword: "",

    // wellness-centre fields
    centreName: "",
    centreType: "",
    ownershipType: "",
    registrationNumber: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",

    // shared / address
    address: "",
    village: "",
    block: "",
    city: "",
    state: "",
    district: "",
    pincode: "",

    // 🔹 Training Centre extra fields
    establishmentYear: "",
    institutionType: "",
    category: "",
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    idProofType: "",
    idProofFile: null,
    idNumber: "",
    website: "",
    aboutCentre: "",
    amenities: [],
    otherAmenityChecked: false,
    otherAmenity: "",
    centrePhotos: [],
    accreditation: "",

    // 🔹 Yoga Professional extra fields
    dob: "",
    gender: "",
    experienceYears: "",
    specialization: "",
    bio: "",
    profilePhoto: null,
    certificateFiles: [],

    // 🔹 Directorate specific fields
    directorateName: "",
    department: "",
    nodalOfficerName: "",
    designation: "",
    landline: "",
    managedModules: [],
    receiveEmailAlerts: false,
    receiveSmsAlerts: false,
    remarks: "",
    moduleContactName: "",
    moduleContactEmail: "",

    // file fields – UI only for now (wellness)
    ownershipProof: null,
    therapyMenu: null,
    facilityImages: null,
    staffCerts: null,
    // 🔹 AYUSH Hospital extra fields
    hospitalName: "",
    ayushSystem: "Ayurveda",
    hospitalType: "Government",
    contactPersonName: "",
    contactMobile: "",
    nabhStatus: "No",
  });

  const isWellnessCentre = formData.userType === "wellness_centre";
  const isTrainingCentre = formData.userType === "yoga_centre";
  const isYogaProfessional = formData.userType === "yoga_professional";

  const handleFileChange = (field, fileList) => {
    setFormData((prev) => ({
      ...prev,
      [field]: fileList,
    }));
  };

  // 🔹 role-wise form renderer (for non-wellness roles)
  const renderRoleForm = () => {
    switch (formData.userType) {
      case "yoga_professional":
        return (
          <YogaProfessionalForm
            formData={formData}
            setFormData={setFormData}
            step={step}
          />
        );
      case "yoga_centre":
        return (
          <TrainingCentreForm
            formData={formData}
            setFormData={setFormData}
            step={step}
          />
        );
      case "ayush_hospital":
        return (
          <AyushHospitalForm formData={formData} setFormData={setFormData} />
        );
      case "ayush_college":
        return (
          <AyushCollegeForm formData={formData} setFormData={setFormData} />
        );
      case "district_officer":
        return (
          <DistrictOfficerForm
            formData={formData}
            setFormData={setFormData}
            handleFileChange={handleFileChange}
          />
        );
      case "directorate":
        return (
          <DirectorateForm
            formData={formData}
            setFormData={setFormData}
            handleFileChange={handleFileChange}
          />
        );
      case "admin":
        return <AdminForm formData={formData} setFormData={setFormData} />;
      case "research_org":
        return <ResearchInstitutionForm formData={formData} setFormData={setFormData} />;
      default:
        return (
          <p className="text-sm text-gray-600">
            Please select a valid role to continue.
          </p>
        );
    }
  };

  // 🔹 OTP handlers
  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 3) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 4) {
      alert("Please enter a valid 4-digit OTP");
      return;
    }

    if (!verificationEmail) {
      alert("Missing verification email. Please restart the registration process.");
      return;
    }

    try {
      await axios.post(`${API}/api/auth/verify-otp`, {
        email: verificationEmail,
        otp: otpValue,
      });

      // If AYUSH Hospital, save extra details after verification
      if (formData.userType === "ayush_hospital") {
        // Exclude file fields for now (Issue 2)
        const { idProofFile, profilePhoto, certificateFiles, centrePhotos, facilityImages, staffCerts, therapyMenu, ownershipProof, ...hospitalData } = formData;
        await axios.post(`${API}/api/ayush-hospital/register-after-otp`, hospitalData);
      }

      alert("Registration Successful! Your account has been verified.");
      setShowOTP(false);
      setOtp(["", "", "", ""]);
      setVerificationEmail("");
      setCurrentPage("login");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Invalid or expired OTP. Please try again.";
      alert(message);
    }
  };

  const handleResendOtp = async () => {
    if (!verificationEmail) {
      alert("Missing verification email. Please restart the registration process.");
      return;
    }

    try {
      await axios.post(`${API}/api/auth/resend-otp`, {
        email: verificationEmail,
      });
      alert("OTP has been resent to your email.");
      setOtp(["", "", "", ""]);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to resend OTP. Please try again later.";
      alert(message);
    }
  };

  // 🔹 Validation logic
  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!formData.userType) {
        alert("Please select your role to continue.");
        return false;
      }
      return true;
    }

    if (currentStep === 2) {
      if (isTrainingCentre) {
        const requiredFields = ["centreName", "establishmentYear", "email", "phone", "institutionType", "address", "district", "ownerName", "ownerEmail", "ownerPhone", "idProofType", "idNumber"];
        const missing = requiredFields.filter(f => !formData[f]);
        if (missing.length > 0) {
          alert(`Please fill in all required fields: ${missing.join(", ")}`);
          return false;
        }
        if (formData.phone.length !== 10 || formData.ownerPhone.length !== 10) {
          alert("Phone numbers must be exactly 10 digits.");
          return false;
        }
        if (formData.idProofType === 'aadhar' && formData.idNumber.length !== 12) {
          alert("Aadhaar must be 12 digits.");
          return false;
        }
        if (formData.idProofType === 'pan' && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.idNumber)) {
          alert("Invalid PAN format.");
          return false;
        }
      }

      if (isYogaProfessional) {
        const requiredFields = ["fullName", "dob", "gender", "email", "phone", "aadhaar", "pan", "address", "district", "pincode", "qualification", "experienceYears"];
        const missing = requiredFields.filter(f => !formData[f]);
        if (missing.length > 0) {
          alert(`Please fill in all required fields.`);
          return false;
        }
        if (formData.phone.length !== 10) {
          alert("Phone number must be exactly 10 digits.");
          return false;
        }
        if (formData.aadhaar.length !== 12) {
          alert("Aadhaar must be 12 digits.");
          return false;
        }
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) {
          alert("Invalid PAN format.");
          return false;
        }
        if (formData.pincode.length !== 6) {
          alert("Pincode must be 6 digits.");
          return false;
        }
      }

      if (isWellnessCentre) {
        const requiredFields = ["centreName", "centreType", "ownershipType", "registrationNumber", "contactPerson", "contactEmail", "contactPhone"];
        const missing = requiredFields.filter(f => !formData[f]);
        if (missing.length > 0) {
          alert(`Please fill in all required fields.`);
          return false;
        }
        if (formData.contactPhone.length !== 10) {
          alert("Contact phone must be exactly 10 digits.");
          return false;
        }
      }
      if (formData.userType === "research_org") {
        const requiredFields = [
          "applicantName",
          "designation",
          "organizationType",
          "organizationName",
          "district",
          "workExperienceYears",
          "email",
          "contactNumber",
          "registrationDocId",
          "physicalAddress",
          "latitude",
          "longitude",
          "projectsCompleted",
          "fundingReceived",
          "associationWithYoga",
          "affiliations",
          "orgRegDoc",
          "relevantDocs",
          "isDeclarationTrue"
        ];
        const missing = requiredFields.filter(f => !formData[f]);
        if (missing.length > 0) {
          alert("Please fill in all required fields and upload files.");
          return false;
        }
        if (formData.contactNumber.length !== 10) {
          alert("Contact number must be exactly 10 digits.");
          return false;
        }
        if (!formData.isDeclarationTrue) {
          alert("Please check the declaration box to proceed.");
          return false;
        }
      }
      if (formData.userType === "district_officer") {
        const requiredFields = [
          "district",
          "fullName",
          "designation",
          "email",
          "contactNumber",
          "employeeId",
          "idType",
          "idNumber",
          "idUpload",
          "authorityOrder"
        ];
        const missing = requiredFields.filter(f => !formData[f]);
        if (missing.length > 0) {
          alert(`Please fill in all required fields and upload files.`);
          return false;
        }
        if (formData.contactNumber.length !== 10) {
          alert("Contact number must be exactly 10 digits.");
          return false;
        }
      }
      if (formData.userType === "directorate") {
        const requiredFields = [
          "fullName",
          "designation",
          "email",
          "contactNumber",
          "idType",
          "idNumber",
          "idUpload",
          "authorityOrder"
        ];
        const missing = requiredFields.filter(f => !formData[f]);
        if (missing.length > 0) {
          alert(`Please fill in all required fields and upload files.`);
          return false;
        }
        if (formData.contactNumber.length !== 10) {
          alert("Contact number must be exactly 10 digits.");
          return false;
        }
      }
      return true;
    }

    if (currentStep === 3) {
      if (!formData.password || !formData.confirmPassword) {
        alert("Please enter and confirm your password.");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match.");
        return false;
      }
      if (formData.password.length < 8) {
        alert("Password must be at least 8 characters long.");
        return false;
      }
      const hasUpper = /[A-Z]/.test(formData.password);
      const hasLower = /[a-z]/.test(formData.password);
      const hasNumber = /[0-9]/.test(formData.password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);

      if (!(hasUpper && hasLower && hasNumber && hasSpecial)) {
        alert("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
        return false;
      }
      return true;
    }
    return true;
  };

  // 🔹 Main submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Step 1 → 2
    if (step === 1) {
      if (validateStep(1)) setStep(2);
      return;
    }

    // Step 2 → 3
    if (step === 2) {
      if (validateStep(2)) setStep(3);
      return;
    }

    // Step 3 → call backend, then show OTP modal
    if (step === 3) {
      if (!validateStep(3)) return;

      try {
        if (isTrainingCentre) {
          // Handle training centre registration with file uploads
          const formDataToSend = new FormData();

          Object.keys(formData).forEach((key) => {
            if (key === "centrePhotos" && formData[key]) {
              formData.centrePhotos.forEach((file) => {
                formDataToSend.append("centrePhotos", file);
              });
            } else if (
              key === "facilities" ||
              key === "coursesOffered" ||
              key === "amenities"
            ) {
              if (Array.isArray(formData[key])) {
                formDataToSend.append(key, formData[key].join(","));
              }
            } else if (
              formData[key] !== null &&
              formData[key] !== undefined
            ) {
              formDataToSend.append(key, formData[key]);
            }
          });

          const res = await axios.post(
            `${API}/api/register/training-centre`,
            formDataToSend,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          // use training centre email or fallback
          setVerificationEmail(
            res.data?.email || formData.email || formData.contactEmail
          );
          setOtp(["", "", "", ""]);
          setShowOTP(true);
        } else if (isYogaProfessional) {
          // Handle yoga professional registration with file uploads
          const formDataToSend = new FormData();

          Object.keys(formData).forEach((key) => {
            if (key === "profilePhoto" && formData[key]) {
              formDataToSend.append("profilePhoto", formData[key]);
            } else if (key === "certificateFiles" && formData[key]) {
              formData.certificateFiles.forEach((file) => {
                formDataToSend.append("certificateFiles", file);
              });
            } else if (
              formData[key] !== null &&
              formData[key] !== undefined &&
              typeof formData[key] !== "object"
            ) {
              formDataToSend.append(key, formData[key]);
            }
          });

          const res = await axios.post(
            `${API}/api/register/yoga-professional`,
            formDataToSend,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          setVerificationEmail(res.data?.email || formData.email);
          setOtp(["", "", "", ""]);
          setShowOTP(true);
        } else if (isWellnessCentre) {
          // Handle wellness centre registration with file uploads
          const formDataToSend = new FormData();

          Object.keys(formData).forEach((key) => {
            if (["ownershipProof", "therapyMenu", "staffCerts"].includes(key) && formData[key]) {
              formDataToSend.append(key, formData[key]);
            } else if (key === "facilityImages" && formData[key]) {
              // Assuming facilityImages is a FileList or Array
              Array.from(formData[key]).forEach((file) => {
                formDataToSend.append("facilityImages", file);
              });
            } else if (
              formData[key] !== null &&
              formData[key] !== undefined &&
              typeof formData[key] !== "object"
            ) {
              formDataToSend.append(key, formData[key]);
            }
          });

          const res = await axios.post(
            `${API}/api/register/wellness-centre`,
            formDataToSend,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          setVerificationEmail(res.data?.contactEmail || formData.contactEmail);
          setOtp(["", "", "", ""]);
          setShowOTP(true);
        } else if (formData.userType === "research_org") {
          const formDataToSend = new FormData();

          Object.keys(formData).forEach((key) => {
            if (key === "orgRegDoc" && formData[key]) {
              formDataToSend.append("orgRegDoc", formData[key]);
            } else if (key === "relevantDocs" && formData[key]) {
              Array.from(formData[key]).forEach((file) => {
                formDataToSend.append("relevantDocs", file);
              });
            } else if (
              formData[key] !== null &&
              formData[key] !== undefined &&
              typeof formData[key] !== "object"
            ) {
              formDataToSend.append(key, formData[key]);
            }
          });

          const res = await axios.post(
            `${API}/api/register/research-org`,
            formDataToSend,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          setVerificationEmail(res.data?.email || formData.email);
          setOtp(["", "", "", ""]);
          setShowOTP(true);
        } else if (formData.userType === "district_officer") {
          const formDataToSend = new FormData();

          Object.keys(formData).forEach((key) => {
            if ((key === "idUpload" || key === "authorityOrder") && formData[key]) {
              formDataToSend.append(key, formData[key]);
            } else if (
              formData[key] !== null &&
              formData[key] !== undefined &&
              typeof formData[key] !== "object"
            ) {
              formDataToSend.append(key, formData[key]);
            }
          });

          const res = await axios.post(
            `${API}/api/register/district-officer`,
            formDataToSend,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          setVerificationEmail(res.data?.email || formData.email);
          setOtp(["", "", "", ""]);
          setShowOTP(true);
        } else if (formData.userType === "directorate") {
          const formDataToSend = new FormData();

          Object.keys(formData).forEach((key) => {
            if ((key === "idUpload" || key === "authorityOrder") && formData[key]) {
              formDataToSend.append(key, formData[key]);
            } else if (
              formData[key] !== null &&
              formData[key] !== undefined &&
              typeof formData[key] !== "object"
            ) {
              formDataToSend.append(key, formData[key]);
            }
          });

          const res = await axios.post(
            `${API}/api/register/directorate`,
            formDataToSend,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          setVerificationEmail(res.data?.email || formData.email);
          setOtp(["", "", "", ""]);
          setShowOTP(true);
        } else {
          // Handle other user types
          const {
            ownershipProof,
            therapyMenu,
            facilityImages,
            staffCerts,
            centrePhotos,
            idProofFile,
            profilePhoto,
            certificateFiles,
            ...payload
          } = formData;

          // Map AYUSH Hospital fields to common auth fields
          if (payload.userType === 'ayush_hospital') {
            payload.fullName = payload.hospitalName || payload.fullName;
            payload.email = payload.contactEmail || payload.email;
            payload.phone = payload.contactMobile || payload.phone;
          }

          const res = await axios.post(
            `${API}/api/auth/register`,
            payload
          );

          console.log("Register response:", res.data);
          setVerificationEmail(
            res.data?.user?.email || payload.email || formData.email
          );
          setOtp(["", "", "", ""]);
          setShowOTP(true);
        }
      } catch (err) {
        console.error("Registration error:", err.response?.data || err.message);
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Registration failed. Please check details and try again.";
        alert(errorMessage);
        setShowOTP(false);
        setVerificationEmail("");
        setOtp(["", "", "", ""]);
      }
    }
  };

  // 🔹 OTP SCREEN (full-screen overlay)
  if (showOTP) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-green-50 py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Verify with OTP
              </h2>
              <p className="text-gray-600">
                To ensure your security, please enter the One Time Password
                (OTP) sent to your registered mobile number / email below.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-center gap-3 mb-6">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-14 h-14 sm:w-16 sm:h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  ))}
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Didn&apos;t receive the OTP?{" "}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-teal-600 hover:text-teal-700 font-semibold"
                    >
                      Resend
                    </button>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleOtpSubmit}
                  className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowOTP(false)}
                  className="w-full bg-white text-teal-600 py-3 rounded-lg font-semibold border-2 border-teal-600 hover:bg-teal-50 transition"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-center text-gray-500 mt-4">
                Having difficulties with OTP?{" "}
                <a href="#" className="text-teal-600 hover:underline">
                  Get help
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 🔹 Normal registration 3-step flow
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-green-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-white" size={40} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">
              Register on AYUSH Portal
            </h2>
            <p className="text-gray-600 mt-2">Step {step} of 3</p>
          </div>

          {/* Progress bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1
                  ? "bg-teal-600 text-white"
                  : "bg-gray-300 text-gray-600"
                  }`}
              >
                1
              </div>
              <div
                className={`flex-1 h-1 ${step >= 2 ? "bg-teal-600" : "bg-gray-300"
                  }`}
              ></div>
            </div>

            <div className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2
                  ? "bg-teal-600 text-white"
                  : "bg-gray-300 text-gray-600"
                  }`}
              >
                2
              </div>
              <div
                className={`flex-1 h-1 ${step >= 3 ? "bg-teal-600" : "bg-gray-300"
                  }`}
              ></div>
            </div>

            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3
                ? "bg-teal-600 text-white"
                : "bg-gray-300 text-gray-600"
                }`}
            >
              3
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1 – role select */}
            {step === 1 && (
              <RoleSelect
                formData={formData}
                setFormData={setFormData}
                onRoleSelect={() => setStep(2)}
              />
            )}

            {/* STEP 2 – role-wise forms */}
            {step === 2 && (
              <div className="space-y-8">
                {isWellnessCentre ? (
                  <WellnessCentreForm
                    formData={formData}
                    setFormData={setFormData}
                    handleFileChange={handleFileChange}
                  />
                ) : (
                  renderRoleForm()
                )}
              </div>
            )}

            {/* STEP 3 – account details */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Account Details
                </h3>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Create Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Minimum 8 characters"
                    required
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Re-enter password"
                    required
                  />
                </div>

                {/* Document info box */}
                <div className="bg-teal-50 p-6 rounded-lg">
                  <h4 className="font-bold text-gray-800 mb-4">
                    Document Upload Required
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center">
                      <FileText
                        className="mr-2 text-teal-600 flex-shrink-0"
                        size={16}
                      />
                      Aadhaar Card (Front & Back)
                    </li>
                    <li className="flex items-center">
                      <FileText
                        className="mr-2 text-teal-600 flex-shrink-0"
                        size={16}
                      />
                      PAN Card
                    </li>
                    <li className="flex items-center">
                      <FileText
                        className="mr-2 text-teal-600 flex-shrink-0"
                        size={16}
                      />
                      Qualification Certificates
                    </li>
                    <li className="flex items-center">
                      <FileText
                        className="mr-2 text-teal-600 flex-shrink-0"
                        size={16}
                      />
                      Experience Letters (if applicable)
                    </li>
                  </ul>
                  <p className="mt-4 text-xs text-gray-600">
                    * Documents can be uploaded after registration from your
                    dashboard
                  </p>
                </div>

                {/* Terms */}
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    className="w-4 h-4 mt-1 text-teal-600 border-gray-300 rounded focus:ring-teal-500 flex-shrink-0"
                    required
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    I agree to the Terms & Conditions and Privacy Policy of
                    AYUSH Portal
                  </span>
                </label>

                <div className="space-y-2 text-sm text-gray-700">
                  <h3 className="text-base font-semibold text-gray-800">
                    Review & Next Steps
                  </h3>
                  <p>
                    Your registration details will be saved. After submitting,
                    an OTP will be sent to your registered contact for
                    verification.
                  </p>
                  <p>
                    Click <span className="font-semibold">Finish</span> to
                    submit this registration request and proceed to OTP
                    verification.
                  </p>
                </div>
              </div>
            )}

            {/* Buttons – only show from step 2 onwards (step 1 uses role card click) */}
            <div className="flex gap-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Previous
                </button>
              )}
              {step > 1 && (
                <button
                  type="submit"
                  className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition"
                >
                  {step === 3 ? "Finish" : "Next"}
                </button>
              )}
            </div>
          </form>

          {/* footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => setCurrentPage("login")}
                className="text-teal-600 hover:text-teal-700 font-semibold"
              >
                Login Here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Register;
