import React, { useState, useEffect } from "react";
import axiosInstance from "../../config/axiosInstance";
import API from "../../config/api";
import { User, Mail, Phone, Lock, Save, FileText, Award, Building2, MapPin, Briefcase } from "lucide-react";

const ORG_TYPES = [
  { value: "NGO",                label: "NGO / Non-Governmental Organisation" },
  { value: "RESEARCH_INSTITUTE", label: "Research Institute" },
  { value: "MEDICAL_HEALTH_ORG", label: "Medical / Health Organisation" },
  { value: "UNIVERSITY",         label: "University" },
  { value: "COLLEGE",            label: "College (with full-time PG course in Yoga)" },
];

export default function ResearchOrgProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ password: "", confirmPassword: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get(`${API}/api/research-grants/profile`);
      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axiosInstance.put(`${API}/api/research-grants/profile`, profile);
      alert("Profile updated successfully!");
      fetchProfile();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!passwordForm.password || !passwordForm.confirmPassword) {
      return alert("Please fill in both password fields.");
    }
    if (passwordForm.password !== passwordForm.confirmPassword) {
      return alert("Passwords do not match.");
    }
    if (passwordForm.password.length < 8) {
      return alert("Password must be at least 8 characters long.");
    }
    const hasUpper = /[A-Z]/.test(passwordForm.password);
    const hasLower = /[a-z]/.test(passwordForm.password);
    const hasNumber = /[0-9]/.test(passwordForm.password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.password);
    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      return alert("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
    }

    setPasswordSaving(true);
    try {
      await axiosInstance.post(`${API}/api/auth/update-profile`, {
        fullName: profile.applicant_name,
        phone: profile.contact_number,
        password: passwordForm.password
      });
      alert("Password changed successfully!");
      setPasswordForm({ password: "", confirmPassword: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to change password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-teal-600 font-semibold">Loading profile details...</div>;
  }

  if (!profile) {
    return <div className="p-8 text-center text-red-500 font-semibold">Profile details could not be loaded.</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Institution Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          View and update your registered Research Institution profile and credentials
        </p>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleProfileSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-8">
        <div className="border-b pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-teal-700">
            <Building2 size={20} />
            <h2 className="text-lg font-bold text-gray-800">Registration Details</h2>
          </div>
          <span className="text-xs bg-teal-50 text-teal-700 px-3 py-1 rounded-full font-semibold border border-teal-100 uppercase tracking-wide">
            Status: {profile.registration_status || "UNDER_REVIEW"}
          </span>
        </div>

        {/* Section 1: Non-Editable Institutional Info (Greyed out) */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Registry Fields (Non-Editable)</h3>
          <div className="grid md:grid-cols-2 gap-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Organization Name</label>
              <input 
                type="text" 
                className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-lg px-3 py-2 text-sm cursor-not-allowed" 
                value={profile.organization_name || ""} 
                disabled 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Organization Type</label>
              <input 
                type="text" 
                className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-lg px-3 py-2 text-sm cursor-not-allowed" 
                value={ORG_TYPES.find(t => t.value === profile.organization_type)?.label || profile.organization_type || ""} 
                disabled 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Assigned District</label>
              <input 
                type="text" 
                className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-lg px-3 py-2 text-sm cursor-not-allowed" 
                value={profile.district || ""} 
                disabled 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Registration Doc ID</label>
              <input 
                type="text" 
                className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-lg px-3 py-2 text-sm cursor-not-allowed" 
                value={profile.registration_doc_id || ""} 
                disabled 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Email Address</label>
              <input 
                type="text" 
                className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-lg px-3 py-2 text-sm cursor-not-allowed" 
                value={profile.email || ""} 
                disabled 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">GPS Coordinates</label>
              <input 
                type="text" 
                className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-lg px-3 py-2 text-sm cursor-not-allowed" 
                value={profile.latitude && profile.longitude ? `${profile.latitude}, ${profile.longitude}` : "N/A"} 
                disabled 
              />
            </div>
          </div>
        </div>

        {/* Section 2: Editable Applicant & General Info */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-teal-600 uppercase tracking-wider">General Information</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Name of Applicant <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                value={profile.applicant_name || ""} 
                onChange={(e) => setProfile(prev => ({ ...prev, applicant_name: e.target.value }))}
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Designation <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                value={profile.designation || ""} 
                onChange={(e) => setProfile(prev => ({ ...prev, designation: e.target.value }))}
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Number <span className="text-red-500">*</span></label>
              <input 
                type="tel" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                value={profile.contact_number || ""} 
                onChange={(e) => setProfile(prev => ({ ...prev, contact_number: e.target.value }))}
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Work Experience in Yoga (Years) <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                value={profile.work_experience_years || 0} 
                onChange={(e) => setProfile(prev => ({ ...prev, work_experience_years: parseInt(e.target.value) || 0 }))}
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Funding Received till Date (₹) <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                value={profile.funding_received || 0} 
                onChange={(e) => setProfile(prev => ({ ...prev, funding_received: parseFloat(e.target.value) || 0 }))}
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Organization Website</label>
              <input 
                type="url" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                value={profile.website || ""} 
                onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://example.org"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Physical Address <span className="text-red-500">*</span></label>
              <textarea 
                rows={3} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                value={profile.physical_address || ""} 
                onChange={(e) => setProfile(prev => ({ ...prev, physical_address: e.target.value }))}
                required 
              />
            </div>
          </div>
        </div>

        {/* Section 3: Yoga & Research Background */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-teal-600 uppercase tracking-wider">Research & Yoga Background</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Research Projects Previously Completed <span className="text-red-500">*</span></label>
              <textarea 
                rows={3} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                value={profile.projects_completed || ""} 
                onChange={(e) => setProfile(prev => ({ ...prev, projects_completed: e.target.value }))}
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Brief of Organization's Association with Yoga <span className="text-red-500">*</span></label>
              <textarea 
                rows={3} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                value={profile.association_with_yoga || ""} 
                onChange={(e) => setProfile(prev => ({ ...prev, association_with_yoga: e.target.value }))}
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Organization's Affiliations Details <span className="text-red-500">*</span></label>
              <textarea 
                rows={3} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                value={profile.affiliations || ""} 
                onChange={(e) => setProfile(prev => ({ ...prev, affiliations: e.target.value }))}
                required 
              />
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-slate-50 border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-slate-700 border-b pb-2">
            <FileText size={16} />
            <h4 className="font-bold text-sm uppercase tracking-wide">Registered Documents</h4>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <span className="font-semibold text-gray-700 block text-xs mb-1">Registration Document</span>
              {profile.registration_doc_path ? (
                <a 
                  href={`${API}/${profile.registration_doc_path}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-teal-600 font-semibold hover:underline inline-flex items-center gap-1.5 text-sm mt-1"
                >
                  <FileText size={14} /> View Document
                </a>
              ) : <span className="text-xs text-gray-400 italic">Not Uploaded</span>}
            </div>

            <div>
              <span className="font-semibold text-gray-700 block text-xs mb-1">Relevant Documents</span>
              {profile.relevant_docs_paths && profile.relevant_docs_paths.length > 0 ? (
                <div className="space-y-1.5 mt-1">
                  {profile.relevant_docs_paths.map((path, idx) => (
                    <a 
                      key={idx}
                      href={`${API}/${path}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-teal-600 font-semibold hover:underline flex items-center gap-1.5 text-sm"
                    >
                      <FileText size={14} /> Document #{idx + 1}
                    </a>
                  ))}
                </div>
              ) : <span className="text-xs text-gray-400 italic">Not Uploaded</span>}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-emerald-700 disabled:opacity-60 transition text-sm inline-flex items-center gap-2 shadow-sm"
          >
            <Save size={16} /> {saving ? "Saving..." : "Save Profile Details"}
          </button>
        </div>
      </form>

      {/* Change Password Card */}
      <form onSubmit={handlePasswordSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="border-b pb-4 flex items-center gap-2 text-blue-700">
          <Lock size={18} />
          <h2 className="text-lg font-bold text-gray-800">Change Password</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">New Password <span className="text-red-500">*</span></label>
            <input 
              type="password" 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
              value={passwordForm.password}
              onChange={(e) => setPasswordForm(p => ({ ...p, password: e.target.value }))}
              placeholder="Minimum 8 chars with uppercase, lowercase, digits & symbols"
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm New Password <span className="text-red-500">*</span></label>
            <input 
              type="password" 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
              placeholder="Re-enter new password"
              required 
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={passwordSaving}
            className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition text-sm inline-flex items-center gap-2 shadow-sm"
          >
            <Lock size={16} /> {passwordSaving ? "Changing..." : "Change Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
