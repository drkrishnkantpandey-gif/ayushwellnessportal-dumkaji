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

import ResearchInstitutionForm from "./forms/ResearchInstitutionForm";
import AdminForm from "./forms/AdminForm";

const Register = ({ setCurrentPage, language }) => {
  const [step, setStep] = useState(1);

  // 🔹 OTP state
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [verificationEmail, setVerificationEmail] = useState("");

  const [submitting, setSubmitting] = useState(false);

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

    // 🔹 Training Centre extra fields (Revised)
    applicantName: "",
    designation: "",
    entityType: "",
    entityCertificate: null,
    alreadyOperating: "",
    otherBusiness: "",
    operationalBusinessName: "",
    operationalBusinessRegNumber: "",
    operationalBusinessCertificate: null,
    website: "",
    idProofType: "",
    idProofFile: null,
    idNumber: "",
    gpsCoordinates: "",
    tcDeclaration: false,

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

  const handleFileChange = async (field, fileList) => {
    if (!fileList || fileList.length === 0) return;

    // Check if it's a multiple-file field
    const isMultiple = ["centrePhotos", "certificateFiles", "facilityImages", "staffCerts", "relevantDocs"].includes(field);

    if (isMultiple) {
      const filesArray = Array.from(fileList);
      const initialFiles = filesArray.map(file => ({
        name: file.name,
        uploading: true,
        progress: 0
      }));
      setFormData(prev => ({
        ...prev,
        [field]: initialFiles
      }));

      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        const formDataToSend = new FormData();
        formDataToSend.append("file", file);

        try {
          const res = await axios.post(`${API}/api/register/upload-temp-file`, formDataToSend, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setFormData(prev => {
                  const currentList = [...(prev[field] || [])];
                  if (currentList[i]) {
                    currentList[i] = { ...currentList[i], progress: percentCompleted };
                  }
                  return { ...prev, [field]: currentList };
                });
              }
            }
          });

          const fileInfo = {
            name: file.name,
            filename: res.data.filename,
            uploading: false,
            progress: 100
          };
          setFormData(prev => {
            const currentList = [...(prev[field] || [])];
            currentList[i] = fileInfo;
            return { ...prev, [field]: currentList };
          });
        } catch (err) {
          console.error("File upload error:", err);
          alert(`Failed to upload ${file.name}`);
        }
      }
    } else {
      const file = fileList[0];
      setFormData(prev => ({
        ...prev,
        [field]: {
          name: file.name,
          uploading: true,
          progress: 0
        }
      }));

      const formDataToSend = new FormData();
      formDataToSend.append("file", file);

      try {
        const res = await axios.post(`${API}/api/register/upload-temp-file`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setFormData(prev => ({
                ...prev,
                [field]: { ...prev[field], progress: percentCompleted }
              }));
            }
          }
        });

        setFormData(prev => ({
          ...prev,
          [field]: {
            name: file.name,
            filename: res.data.filename,
            uploading: false,
            progress: 100
          }
        }));
      } catch (err) {
        console.error("File upload error:", err);
        alert(`Failed to upload ${file.name}`);
        setFormData(prev => ({
          ...prev,
          [field]: null
        }));
      }
    }
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
            handleFileChange={handleFileChange}
          />
        );
      case "yoga_centre":
        return (
          <TrainingCentreForm
            formData={formData}
            setFormData={setFormData}
            step={step}
            handleFileChange={handleFileChange}
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
        return (
          <ResearchInstitutionForm
            formData={formData}
            setFormData={setFormData}
            handleFileChange={handleFileChange}
          />
        );
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

      if (formData.userType === "ayush_hospital") {
        // Exclude file fields for now (Issue 2)
        const hospitalData = { ...formData };
        [
          "idProofFile",
          "profilePhoto",
          "certificateFiles",
          "centrePhotos",
          "facilityImages",
          "staffCerts",
          "therapyMenu",
          "ownershipProof"
        ].forEach((k) => delete hospitalData[k]);
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
        const requiredFields = ["applicantName", "designation", "centreName", "entityType", "entityCertificate", "alreadyOperating", "email", "phone", "idProofType", "idNumber", "idProofFile", "address", "district", "gpsCoordinates"];
        const missing = requiredFields.filter(f => !formData[f]);

        // If operational business is selected, operational business details are also required
        if (formData.alreadyOperating && formData.alreadyOperating !== "None") {
          if (!formData.operationalBusinessName || !formData.operationalBusinessRegNumber || !formData.operationalBusinessCertificate) {
            alert("Please fill in operational business details and upload registration certificate.");
            return false;
          }
        }

        if (missing.length > 0) {
          alert(`Please fill in all required fields and upload all requested certificates/documents.`);
          return false;
        }
        if (formData.phone.length !== 10) {
          alert("Mobile number must be exactly 10 digits.");
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
        if (!formData.tcDeclaration) {
          alert("Please check the declaration box to proceed.");
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
        const requiredFields = ["applicantName", "designation", "centreName", "entityType", "entityCertificate", "idProofFile", "email", "phone", "district", "address"];
        const missing = requiredFields.filter(f => !formData[f]);
        if (missing.length > 0) {
          alert("Please fill in all required fields and upload all requested documents.");
          return false;
        }
        if (formData.phone.length !== 10) {
          alert("Mobile number must be exactly 10 digits.");
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
        const missing = requiredFields.filter(f => {
          const val = formData[f];
          if (!val) return true;
          if (["orgRegDoc", "relevantDocs"].includes(f)) {
            if (Array.isArray(val)) {
              if (val.length === 0) return true;
              return val.some(item => item.uploading || !item.filename);
            }
            return val.uploading || !val.filename;
          }
          return false;
        });
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
        const missing = requiredFields.filter(f => {
          const val = formData[f];
          if (!val) return true;
          if (["idUpload", "authorityOrder"].includes(f)) {
            if (Array.isArray(val)) {
              if (val.length === 0) return true;
              return val.some(item => item.uploading || !item.filename);
            }
            return val.uploading || !val.filename;
          }
          return false;
        });
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
        const missing = requiredFields.filter(f => {
          const val = formData[f];
          if (!val) return true;
          if (["idUpload", "authorityOrder"].includes(f)) {
            if (Array.isArray(val)) {
              if (val.length === 0) return true;
              return val.some(item => item.uploading || !item.filename);
            }
            return val.uploading || !val.filename;
          }
          return false;
        });
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

      const fileKeys = [
        "idProofFile",
        "profilePhoto",
        "ownershipProof",
        "therapyMenu",
        "hospitalCert",
        "resortLicense",
        "orgRegDoc",
        "idUpload",
        "authorityOrder",
        "centrePhotos",
        "certificateFiles",
        "facilityImages",
        "staffCerts",
        "relevantDocs",
        "entityCertificate",
        "operationalBusinessCertificate"
      ];

      const buildPayload = () => {
        const payload = {};
        Object.keys(formData).forEach((key) => {
          if (fileKeys.includes(key)) {
            const value = formData[key];
            if (!value) return;

            const isMultiple = ["centrePhotos", "certificateFiles", "facilityImages", "staffCerts", "relevantDocs"].includes(key);

            if (isMultiple && Array.isArray(value)) {
              payload[key] = value.map(f => f.filename).filter(Boolean);
            } else if (value.filename) {
              payload[key] = value.filename;
            }
          } else {
            // Text or list field
            if (formData[key] === null || formData[key] === undefined) return;
            
            if (["facilities", "coursesOffered", "amenities"].includes(key) && Array.isArray(formData[key])) {
              payload[key] = formData[key];
            } else if (typeof formData[key] !== "object") {
              payload[key] = formData[key];
            }
          }
        });
        return payload;
      };

      setSubmitting(true);

      try {
        if (isTrainingCentre) {
          const payload = buildPayload();
          await axios.post(`${API}/api/register/training-centre`, payload);
        } else if (isYogaProfessional) {
          const payload = buildPayload();
          await axios.post(`${API}/api/register/yoga-professional`, payload);
        } else if (isWellnessCentre) {
          const payload = buildPayload();
          await axios.post(`${API}/api/register/wellness-centre`, payload);
        } else if (formData.userType === "research_org") {
          const payload = buildPayload();
          await axios.post(`${API}/api/register/research-org`, payload);
        } else if (formData.userType === "district_officer") {
          const payload = buildPayload();
          await axios.post(`${API}/api/register/district-officer`, payload);
        } else if (formData.userType === "directorate") {
          const payload = buildPayload();
          await axios.post(`${API}/api/register/directorate`, payload);
        } else {
          // Handle other user types (no files)
          const payload = { ...formData };
          [
            "ownershipProof",
            "therapyMenu",
            "facilityImages",
            "staffCerts",
            "centrePhotos",
            "idProofFile",
            "profilePhoto",
            "certificateFiles"
          ].forEach((k) => delete payload[k]);

          if (payload.userType === 'ayush_hospital') {
            payload.fullName = payload.hospitalName || payload.fullName;
            payload.email = payload.contactEmail || payload.email;
            payload.phone = payload.contactMobile || payload.phone;
          }

          await axios.post(`${API}/api/auth/register`, payload);
        }

        alert(
          language === "EN"
            ? "Registration successful! Your account is under admin review. Please wait for approval before logging in."
            : "पंजीकरण सफल! आपका खाता व्यवस्थापक समीक्षा के अधीन है। कृपया लॉग इन करने से पहले स्वीकृति की प्रतीक्षा करें।"
        );
        setCurrentPage("home");
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
      } finally {
        setSubmitting(false);
      }
    }
  };

  // 🔹 OTP SCREEN (full-screen overlay)
  if (showOTP) {
    return (
      <div className="min-h-screen py-24 px-4 flex items-center justify-center relative z-10 bg-transparent animate-fade-in">
        <div className="max-w-md w-full">
          <div className="bg-[#f5f0eb] border border-[#262626]/10 rounded-3xl shadow-2xl p-8 animate-fade-up">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-[#e4a4bd] to-[#d493ab] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#262626]/5 shadow-md">
                <svg
                  className="w-10 h-10 text-[#262626]"
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
              <h2 className="text-2xl font-black text-[#262626] font-spartan uppercase mb-2">
                Verify with OTP
              </h2>
              <p className="text-xs text-[#262626]/60 font-light leading-relaxed">
                To ensure your security, please enter the One Time Password
                (OTP) sent to your registered mobile number / email below.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex justify-center gap-4">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-12 h-12 text-center text-xl font-bold bg-[#fdf8f3] border border-[#262626]/10 rounded-xl text-[#262626] focus:outline-none focus:border-[#e4a4bd] focus:ring-2 focus:ring-[#e4a4bd]/10"
                  />
                ))}
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#e4a4bd] hover:bg-[#d88fa9] text-[#262626] py-3.5 rounded-xl font-black uppercase tracking-widest text-xs transition"
                >
                  Verify & Register
                </button>
                <button
                  type="button"
                  onClick={() => setShowOTP(false)}
                  className="w-full bg-transparent border border-[#262626]/15 text-[#262626]/70 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#262626]/5 transition"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-center text-[#262626]/60 mt-4">
                Having difficulties with OTP?{" "}
                <a href="#" className="text-[#e4a4bd] hover:underline font-bold">
                  Get help
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 🔹 Normal registration 3-step flow
  return (
    <div className="min-h-screen py-24 px-4 relative z-10 bg-transparent flex items-center justify-center animate-fade-in">
      <div className="max-w-3xl w-full mx-auto">
        <div className="bg-[#f5f0eb] border border-[#262626]/10 rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#e4a4bd] to-[#d493ab] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#262626]/5 shadow-md">
              <Users className="text-[#262626]" size={36} />
            </div>
            <h2 className="text-3xl font-black text-[#262626] font-spartan uppercase leading-none">
              Register on AYUSH Portal
            </h2>
            <p className="text-[#262626]/60 mt-2 text-xs font-bold uppercase tracking-widest">Step {step} of 3</p>
          </div>

          {/* Progress bar */}
          <div className="flex items-center justify-between mb-10 max-w-md mx-auto">
            <div className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm transition-colors duration-300 ${step >= 1
                  ? "bg-[#e4a4bd] text-[#262626] shadow-sm"
                  : "bg-[#fdf8f3] text-[#262626]/30 border border-[#262626]/10"
                  }`}
              >
                1
              </div>
              <div
                className={`flex-1 h-[2px] transition-colors duration-300 ${step >= 2 ? "bg-[#e4a4bd]" : "bg-[#262626]/10"}`}
              ></div>
            </div>

            <div className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm transition-colors duration-300 ${step >= 2
                  ? "bg-[#e4a4bd] text-[#262626] shadow-sm"
                  : "bg-[#fdf8f3] text-[#262626]/30 border border-[#262626]/10"
                  }`}
              >
                2
              </div>
              <div
                className={`flex-1 h-[2px] transition-colors duration-300 ${step >= 3 ? "bg-[#e4a4bd]" : "bg-[#262626]/10"}`}
              ></div>
            </div>

            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm transition-colors duration-300 ${step >= 3
                ? "bg-[#e4a4bd] text-[#262626] shadow-sm"
                : "bg-[#fdf8f3] text-[#262626]/30 border border-[#262626]/10"
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
                <h3 className="text-lg font-black text-[#262626] font-spartan uppercase leading-none">
                  Account Details
                </h3>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#262626] mb-2">
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
                    className="w-full px-4 py-3.5 bg-[#fdf8f3] border border-[#262626]/10 rounded-xl text-[#262626] placeholder-[#262626]/30 focus:outline-none focus:border-[#e4a4bd] focus:ring-2 focus:ring-[#e4a4bd]/10 text-sm font-medium"
                    placeholder="Minimum 8 characters"
                    required
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#262626] mb-2">
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
                    className="w-full px-4 py-3.5 bg-[#fdf8f3] border border-[#262626]/10 rounded-xl text-[#262626] placeholder-[#262626]/30 focus:outline-none focus:border-[#e4a4bd] focus:ring-2 focus:ring-[#e4a4bd]/10 text-sm font-medium"
                    placeholder="Re-enter password"
                    required
                  />
                </div>

                {/* Document info box */}
                <div className="bg-[#fdf8f3] border border-[#262626]/5 p-6 rounded-2xl">
                  <h4 className="font-extrabold text-[#262626] mb-4 font-spartan uppercase text-xs tracking-wider">
                    Document Upload Required
                  </h4>
                  <ul className="space-y-2.5 text-xs text-[#262626]/70 uppercase tracking-wide">
                    <li className="flex items-center font-bold">
                      <FileText
                        className="mr-2 text-[#e4a4bd] flex-shrink-0"
                        size={16}
                      />
                      Aadhaar Card (Front & Back)
                    </li>
                    <li className="flex items-center font-bold">
                      <FileText
                        className="mr-2 text-[#e4a4bd] flex-shrink-0"
                        size={16}
                      />
                      PAN Card
                    </li>
                    <li className="flex items-center font-bold">
                      <FileText
                        className="mr-2 text-[#e4a4bd] flex-shrink-0"
                        size={16}
                      />
                      Qualification Certificates
                    </li>
                    <li className="flex items-center font-bold">
                      <FileText
                        className="mr-2 text-[#e4a4bd] flex-shrink-0"
                        size={16}
                      />
                      Experience Letters (if applicable)
                    </li>
                  </ul>
                  <p className="mt-4 text-[10px] text-[#262626]/40 font-light">
                    * Documents can be uploaded after registration from your
                    dashboard
                  </p>
                </div>

                {/* Terms */}
                <label className="flex items-start select-none cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 mt-1 text-[#262626] accent-[#e4a4bd] bg-[#fdf8f3] border-[#262626]/10 focus:ring-0 rounded flex-shrink-0"
                    required
                  />
                  <span className="ml-2 text-xs text-[#262626]/60 font-bold uppercase tracking-wider">
                    I agree to the Terms & Conditions and Privacy Policy of
                    AYUSH Portal
                  </span>
                </label>

                <div className="space-y-2 text-xs text-[#262626]/60 pt-4 border-t border-[#262626]/10">
                  <h3 className="text-sm font-extrabold text-[#262626] font-spartan uppercase">
                    Review & Next Steps
                  </h3>
                  <p className="font-light leading-relaxed">
                    Your registration details will be saved. After submitting,
                    an OTP will be sent to your registered contact for
                    verification.
                  </p>
                  <p className="font-light leading-relaxed">
                    Click <span className="font-semibold text-[#262626]">Finish</span> to
                    submit this registration request and proceed to OTP
                    verification.
                  </p>
                </div>
              </div>
            )}

            {/* Buttons – only show from step 2 onwards (step 1 uses role card click) */}
            <div className="flex gap-4 pt-4">
              {step > 1 && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setStep((s) => s - 1)}
                  className="flex-1 bg-transparent border border-[#262626]/15 text-[#262626]/70 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#262626]/5 disabled:opacity-50 transition duration-300"
                >
                  Previous
                </button>
              )}
              {step > 1 && (
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#e4a4bd] hover:bg-[#d88fa9] text-[#262626] py-3.5 rounded-xl font-black uppercase tracking-widest text-xs hover:shadow-md disabled:opacity-50 transition duration-300"
                >
                  {submitting ? "Submitting..." : step === 3 ? "Finish" : "Next"}
                </button>
              )}
            </div>
          </form>

          {/* footer */}
          <div className="mt-8 text-center border-t border-[#262626]/10 pt-6">
            <p className="text-[#262626]/60 font-light text-sm">
              Already have an account?{" "}
              <button
                disabled={submitting}
                onClick={() => setCurrentPage("login")}
                className="text-[#e4a4bd] hover:text-[#d493ab] font-bold disabled:opacity-50 transition-colors duration-300"
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
