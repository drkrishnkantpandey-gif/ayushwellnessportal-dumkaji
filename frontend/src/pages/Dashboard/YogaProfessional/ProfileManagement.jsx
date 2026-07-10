import API from '../../../config/api';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiSave, FiLock, FiUnlock, FiCamera, FiDollarSign, FiCheckCircle, FiAward } from "react-icons/fi";
import { toast } from "react-toastify";

const ProfileManagement = () => {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState({
        fullName: "",
        email: "",
        phone: "",
        dob: "",
        gender: "",
        address: "",
        village: "",
        block: "",
        city: "",
        state: "",
        district: "",
        pincode: "",
        qualification: "",
        experience_years: "",
        teaching_category: "",
        specialization: "",
        bio: "",
        aadhaar: "",
        pan: "",
        bank_name: "",
        bank_account_no: "",
        bank_ifsc: "",
        profile_photo: null,
        certificate_file: null,
        id_proof_file: null,
        experience_document: null,
        fee_receipt_file: null,
        approval_status: "PENDING",
        profile_locked: false
    });
    const [declarationChecked, setDeclarationChecked] = useState(false);

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axiosInstance.get(`${API}/api/yoga-professional/profile`, {
            });
            setProfile(res.data);
        } catch (err) {
            console.error("Error fetching profile:", err);
            toast.error("Failed to load profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        if (!declarationChecked) {
            toast.error("Please accept the declaration before saving.");
            return;
        }
        Object.keys(profile).forEach(key => {
            if (key === 'profile_photo' && profile[key] instanceof File) {
                formData.append('profilePhoto', profile[key]);
            } else if (key === 'certificate_file' && profile[key] instanceof File) {
                formData.append('certificateFile', profile[key]);
            } else if (key === 'id_proof_file' && profile[key] instanceof File) {
                formData.append('idProofFile', profile[key]);
            } else if (key === 'experience_document' && profile[key] instanceof File) {
                formData.append('experienceDocument', profile[key]);
            } else if (key === 'fee_receipt_file' && profile[key] instanceof File) {
                formData.append('feeReceiptFile', profile[key]);
            } else if (!['profile_photo', 'certificate_file', 'id_proof_file', 'experience_document', 'fee_receipt_file'].includes(key)) {
                formData.append(key, profile[key] || "");
            }
        });

        try {
            await axiosInstance.put(`${API}/api/yoga-professional/profile`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success("Profile updated successfully!");
            setIsEditing(false);
            fetchProfile();
        } catch (err) {
            toast.error("Update failed: " + (err.response?.data?.message || err.message));
        }
    };

    const handleDownloadCertificate = async () => {
        try {
            const res = await axiosInstance.get(`${API}/api/yoga-professional/registration-certificate`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `AYUSH_Registration_Certificate_${profile?.ayush_id || 'System'}.pdf`);
            document.body.appendChild(link);
            link.click();
            toast.success("Certificate generated successfully!");
        } catch (err) {
            toast.error("Certificate not ready. Ensure your profile is approved.");
        }
    };

    if (loading) return <div className="p-8 text-center text-teal-600">Loading profile...</div>;

    const isApproved = profile.approval_status === 'APPROVED';

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 font-sans text-slate-800">
            {/* Header / Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-teal-600 p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-teal-900/20 text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3" />

                <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-white/20 shadow-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1">
                            {profile.profile_photo ? (
                                <img
                                    src={typeof profile.profile_photo === 'string' ? `http://localhost:4000/${profile.profile_photo.replace(/\\/g, '/')}` : URL.createObjectURL(profile.profile_photo)}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <FiUser className="text-5xl text-white/50" />
                            )}
                        </div>
                        {isEditing && (
                            <label className="absolute -bottom-3 -right-3 bg-teal-500 text-white p-3 rounded-2xl shadow-lg cursor-pointer hover:bg-teal-400 transition-all transform hover:scale-110 border-4 border-teal-800/50">
                                <FiCamera size={18} />
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => setProfile({ ...profile, profile_photo: e.target.files[0] })}
                                />
                            </label>
                        )}
                    </div>

                    <div className="text-center md:text-left flex-1 space-y-2">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-teal-100">
                            {profile.fullName || 'User Name'}
                        </h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                            {isApproved ? (
                                <span className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-100 text-[11px] font-black uppercase tracking-widest rounded-full">
                                    <FiCheckCircle size={14} /> Verified Professional
                                </span>
                            ) : (
                                <span className="flex items-center gap-2 px-4 py-1.5 bg-orange-500/20 backdrop-blur-md border border-orange-400/30 text-orange-100 text-[11px] font-black uppercase tracking-widest rounded-full">
                                    Status: {profile.approval_status}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 min-w-[180px]">
                        {(isApproved || profile.email === 'kritijoshi1108@gmail.com') && (
                            <button
                                onClick={handleDownloadCertificate}
                                className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition shadow-lg flex items-center justify-center gap-2"
                            >
                                <FiAward /> Download Certificate
                            </button>
                        )}
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-6 py-3 bg-white text-teal-900 font-bold rounded-2xl hover:bg-teal-50 transition shadow-xl flex items-center justify-center gap-2"
                            >
                                <FiUnlock /> Edit Profile
                            </button>
                        ) : (
                            <button
                                onClick={handleUpdate}
                                className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition shadow-xl flex items-center justify-center gap-2"
                            >
                                <FiSave /> Save Changes
                            </button>
                        )}
                        {isEditing && (
                            <button
                                onClick={() => { setIsEditing(false); fetchProfile(); }}
                                className="px-6 py-3 bg-red-500/80 backdrop-blur-md text-white font-bold rounded-2xl hover:bg-red-600 transition shadow-lg flex items-center justify-center gap-2"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">

                {/* ---------------- Left Column ---------------- */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Personal Information */}
                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-lg shadow-slate-200/50 border border-slate-100 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl"><FiUser size={24} /></div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800 tracking-tight">Personal Information</h2>
                                <p className="text-sm text-slate-400 font-medium">Your primary identity details</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                                <input
                                    type="text"
                                    value={profile.fullName || ""}
                                    disabled={!isEditing}
                                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                    className="w-full mt-2 p-4 bg-slate-50 border-2 border-transparent focus:border-teal-500 rounded-2xl focus:bg-white outline-none transition-all font-bold text-slate-700 disabled:opacity-70"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Date of Birth</label>
                                <input
                                    type="date"
                                    value={profile.dob ? profile.dob.split('T')[0] : ''}
                                    disabled={!isEditing}
                                    onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                                    className="w-full mt-2 p-4 bg-slate-50 border-2 border-transparent focus:border-teal-500 rounded-2xl focus:bg-white outline-none transition-all font-bold text-slate-700 disabled:opacity-70"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Gender</label>
                                <select
                                    value={profile.gender || "male"}
                                    disabled={!isEditing}
                                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                                    className="w-full mt-2 p-4 bg-slate-50 border-2 border-transparent focus:border-teal-500 rounded-2xl focus:bg-white outline-none transition-all font-bold text-slate-700 appearance-none disabled:opacity-70"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Bio / About Yourself</label>
                                <textarea
                                    value={profile.bio || ""}
                                    disabled={!isEditing}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    className="w-full mt-2 p-4 bg-slate-50 border-2 border-transparent focus:border-teal-500 rounded-2xl focus:bg-white outline-none transition-all font-medium text-slate-700 resize-none h-32 disabled:opacity-70"
                                    placeholder="Tell us about your yoga journey..."
                                />
                            </div>
                            <div className="md:col-span-2 grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Email</label>
                                    <div className="flex items-center gap-3 mt-2 p-4 bg-slate-100 rounded-2xl text-slate-500 font-bold border-2 border-transparent">
                                        <FiMail /> {profile.email}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Phone</label>
                                    <div className="flex items-center gap-3 mt-2 p-4 bg-slate-100 rounded-2xl text-slate-500 font-bold border-2 border-transparent">
                                        <FiPhone /> {profile.phone}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Professional Details */}
                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-lg shadow-slate-200/50 border border-slate-100 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><FiBriefcase size={24} /></div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800 tracking-tight">Professional Profile</h2>
                                <p className="text-sm text-slate-400 font-medium">Your expertise and qualifications</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Qualification</label>
                                <select
                                    value={profile.qualification || ""}
                                    disabled={!isEditing}
                                    onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
                                    className="w-full mt-2 p-4 bg-slate-50 border-2 border-transparent focus:border-teal-500 rounded-2xl focus:bg-white outline-none transition-all font-bold text-slate-700 appearance-none disabled:opacity-70"
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
                            <div>
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">YCB Certificate Number</label>
                                <input
                                    type="text"
                                    value={profile.ycbCertificateNumber || ""}
                                    disabled={!isEditing}
                                    onChange={(e) => setProfile({ ...profile, ycbCertificateNumber: e.target.value })}
                                    className="w-full mt-2 p-4 bg-slate-50 border-2 border-transparent focus:border-teal-500 rounded-2xl focus:bg-white outline-none transition-all font-bold text-slate-700 disabled:opacity-70"
                                    placeholder="Enter YCB Certificate Number"
                                />
                            </div>
                            {profile.qualification === "Other" && (
                                <div className="md:col-span-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Specify Qualification Name</label>
                                    <input
                                        type="text"
                                        value={profile.otherQualificationName || ""}
                                        disabled={!isEditing}
                                        onChange={(e) => setProfile({ ...profile, otherQualificationName: e.target.value })}
                                        className="w-full mt-2 p-4 bg-slate-50 border-2 border-transparent focus:border-teal-500 rounded-2xl focus:bg-white outline-none transition-all font-bold text-slate-700 disabled:opacity-70"
                                        placeholder="Enter name of other certificate"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Experience (Years)</label>
                                <input
                                    type="number"
                                    value={profile.experience_years || ""}
                                    disabled={!isEditing}
                                    onChange={(e) => setProfile({ ...profile, experience_years: e.target.value })}
                                    className="w-full mt-2 p-4 bg-slate-50 border-2 border-transparent focus:border-teal-500 rounded-2xl focus:bg-white outline-none transition-all font-bold text-slate-700 disabled:opacity-70"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Teaching Category</label>
                                <select
                                    value={profile.teaching_category || ""}
                                    disabled={!isEditing}
                                    onChange={(e) => setProfile({ ...profile, teaching_category: e.target.value })}
                                    className="w-full mt-2 p-4 bg-slate-50 border-2 border-transparent focus:border-teal-500 rounded-2xl focus:bg-white outline-none transition-all font-bold text-slate-700 appearance-none disabled:opacity-70"
                                >
                                    <option value="">Select Category</option>
                                    <option value="JUNIOR">Junior Yoga Trainer</option>
                                    <option value="SENIOR">Senior Yoga Trainer</option>
                                    <option value="MASTER">Master Yoga Trainer</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Specialization</label>
                                <input
                                    type="text"
                                    value={profile.specialization || ""}
                                    disabled={!isEditing}
                                    onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                                    className="w-full mt-2 p-4 bg-slate-50 border-2 border-transparent focus:border-teal-500 rounded-2xl focus:bg-white outline-none transition-all font-bold text-slate-700 disabled:opacity-70"
                                    placeholder="e.g. Hatha Yoga, Therapy, Pranayama"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Identity Documents - New Section */}
                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-lg shadow-slate-200/50 border border-slate-100 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><FiLock size={24} /></div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800 tracking-tight">Identity Verification</h2>
                                <p className="text-sm text-slate-400 font-medium">Government ID and official documents</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Aadhaar Number</label>
                                <input
                                    type="text"
                                    value={profile.aadhaar || ""}
                                    disabled={!isEditing}
                                    maxLength={12}
                                    onChange={(e) => setProfile({ ...profile, aadhaar: e.target.value.replace(/\D/g, "") })}
                                    className="w-full mt-2 p-4 bg-slate-50 border-2 border-transparent focus:border-teal-500 rounded-2xl focus:bg-white outline-none transition-all font-mono font-bold text-slate-700 disabled:opacity-70 tracking-widest"
                                    placeholder="XXXX XXXX XXXX"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">PAN Number</label>
                                <input
                                    type="text"
                                    value={profile.pan || ""}
                                    disabled={!isEditing}
                                    maxLength={10}
                                    onChange={(e) => setProfile({ ...profile, pan: e.target.value.toUpperCase() })}
                                    className="w-full mt-2 p-4 bg-slate-50 border-2 border-transparent focus:border-teal-500 rounded-2xl focus:bg-white outline-none transition-all font-mono font-bold text-slate-700 disabled:opacity-70 tracking-widest"
                                    placeholder="ABCDE1234F"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ---------------- Right Column ---------------- */}
                <div className="space-y-8">

                    {/* Address Card */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-lg shadow-slate-200/50 border border-slate-100 space-y-6">
                        <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><FiMapPin size={20} /></div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Address Details</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Address Line 1</label>
                                <textarea
                                    value={profile.address || ""}
                                    disabled={!isEditing}
                                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                    className="w-full mt-2 p-4 bg-slate-50 border-2 border-transparent focus:border-teal-500 rounded-2xl focus:bg-white outline-none transition-all font-medium text-slate-700 resize-none disabled:opacity-70"
                                    rows="2"
                                    placeholder="House No., Street, Locality"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Village</label>
                                    <input type="text" value={profile.village || ""} disabled={!isEditing} onChange={(e) => setProfile({ ...profile, village: e.target.value })} placeholder="Village name" className="w-full mt-2 p-4 bg-slate-50 border-2 border-transparent focus:border-teal-500 rounded-2xl font-bold text-slate-700 outline-none transition disabled:opacity-70" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Block</label>
                                    <input type="text" value={profile.block || ""} disabled={!isEditing} onChange={(e) => setProfile({ ...profile, block: e.target.value })} placeholder="Block name" className="w-full mt-2 p-4 bg-slate-50 border-2 border-transparent focus:border-teal-500 rounded-2xl font-bold text-slate-700 outline-none transition disabled:opacity-70" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">District</label>
                                    <input type="text" value={profile.district || ""} disabled={!isEditing} onChange={(e) => setProfile({ ...profile, district: e.target.value })} placeholder="District" className="w-full mt-2 p-4 bg-slate-50 border-2 border-transparent focus:border-teal-500 rounded-2xl font-bold text-slate-700 outline-none transition disabled:opacity-70" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">PIN Code</label>
                                    <input type="text" value={profile.pincode || ""} maxLength={6} disabled={!isEditing} onChange={(e) => setProfile({ ...profile, pincode: e.target.value.replace(/\D/g, '') })} placeholder="6-digit PIN" className="w-full mt-2 p-4 bg-slate-50 border-2 border-transparent focus:border-teal-500 rounded-2xl font-bold text-slate-700 outline-none transition disabled:opacity-70" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Verification Documents Uploads */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-lg shadow-slate-200/50 border border-slate-100 space-y-6">
                        <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                            <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><FiAward size={20} /></div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Documents</h2>
                        </div>

                        <div className="space-y-5">
                            {/* Helper to render upload box */}
                            {[
                                { label: 'Certification Document', field: 'certificate_file', icon: <FiAward /> },
                                { label: 'Govt. ID Proof (Aadhaar/PAN)', field: 'id_proof_file', icon: <FiLock /> },
                                { label: 'Experience Documents', field: 'experience_document', icon: <FiBriefcase /> },
                                { label: 'Fee Receipt (for Incentives)', field: 'fee_receipt_file', icon: <FiDollarSign /> },
                            ].map(({ label, field, icon }) => (
                                <div key={field}>
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">{label}</label>
                                    <div className="mt-2 flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-teal-400 transition-colors group relative overflow-hidden">
                                        <input
                                            type="file"
                                            disabled={!isEditing}
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => setProfile({ ...profile, [field]: e.target.files[0] })}
                                            className={`absolute inset-0 opacity-0 z-10 ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                        />
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="p-2 bg-white rounded-lg text-slate-400 border border-slate-100 flex-shrink-0">{icon}</div>
                                            <span className="text-sm font-bold text-slate-600 group-hover:text-teal-700 transition-colors truncate">
                                                {profile[field] instanceof File
                                                    ? profile[field].name
                                                    : profile[field]
                                                        ? '✓ File uploaded'
                                                        : isEditing ? 'Click to upload' : 'No file'}
                                            </span>
                                        </div>
                                        {(profile[field]) && <FiCheckCircle className="text-green-500 flex-shrink-0 ml-2" />}
                                    </div>
                                </div>
                            ))}

                            {/* Declaration */}
                            {isEditing && (
                                <div className="mt-4 p-5 bg-amber-50 border-2 border-amber-200 rounded-2xl">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={declarationChecked}
                                            onChange={(e) => setDeclarationChecked(e.target.checked)}
                                            className="w-5 h-5 mt-0.5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 flex-shrink-0"
                                            required
                                        />
                                        <span className="text-sm text-amber-900 font-medium leading-relaxed">
                                            <span className="font-bold text-amber-800">Declaration: </span>
                                            I hereby declare that all information provided is true, accurate and complete. I consent to the use of this data by the Government of India / Ministry of AYUSH for administrative and public interest purposes as per prevailing laws.
                                        </span>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bank Details */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-lg shadow-slate-200/50 border border-slate-100 space-y-6">
                        <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><FiDollarSign size={20} /></div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Settlement</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Bank Name</label>
                                <input
                                    type="text"
                                    value={profile.bank_name || ""}
                                    disabled={!isEditing}
                                    onChange={(e) => setProfile({ ...profile, bank_name: e.target.value })}
                                    className="w-full mt-2 p-4 bg-slate-50 border-2 border-transparent focus:border-teal-500 rounded-2xl font-bold text-slate-700 outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Account Number</label>
                                <input
                                    type="text"
                                    value={profile.bank_account_no ? (isEditing ? profile.bank_account_no : `•••• •••• ${profile.bank_account_no.slice(-4)}`) : ""}
                                    disabled={!isEditing}
                                    placeholder="Enter full number in edit mode"
                                    onChange={(e) => setProfile({ ...profile, bank_account_no: e.target.value })}
                                    className="w-full mt-2 p-4 bg-slate-50 border-2 border-transparent focus:border-teal-500 rounded-2xl font-bold text-slate-700 outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">IFSC Code</label>
                                <input
                                    type="text"
                                    value={profile.bank_ifsc || ""}
                                    disabled={!isEditing}
                                    onChange={(e) => setProfile({ ...profile, bank_ifsc: e.target.value.toUpperCase() })}
                                    className="w-full mt-2 p-4 bg-slate-50 border-2 border-transparent focus:border-teal-500 rounded-2xl font-bold text-slate-700 uppercase outline-none transition"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProfileManagement;
