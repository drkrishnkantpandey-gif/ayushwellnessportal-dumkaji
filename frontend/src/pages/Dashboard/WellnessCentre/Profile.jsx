import React, { useState, useEffect } from "react";
import axiosInstance from "../../../config/axiosInstance";
import API from "../../../config/api";
import { User, Mail, Phone, Lock, Save, FileText, Award, Building2, MapPin, Briefcase } from "lucide-react";
import { toast } from "react-toastify";

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

const ENTITY_TYPES = [
  "Proprietership",
  "Trust",
  "Society",
  "Other NGO",
  "Government",
  "Private Limited",
  "LLP",
  "Other"
];

export default function WellnessCentreProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get(`${API}/api/wellness-centre/profile`);
      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile details.");
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
      await axiosInstance.put(`${API}/api/wellness-centre/profile`, profile);
      toast.success("Profile updated successfully!");
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
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
        <h1 className="text-2xl font-bold text-gray-800">Centre Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          View and update your registered Wellness Centre details
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

        {/* Applicant Details */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-teal-600 uppercase tracking-wider">Applicant Info</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Name of Applicant <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                value={profile.applicant_name || ""} 
                onChange={(e) => setProfile({ ...profile, applicant_name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Designation <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                value={profile.designation || ""} 
                onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        {/* Entity Info */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-xs font-bold text-teal-600 uppercase tracking-wider">Entity Information</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Name of Entity <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                value={profile.name || ""} 
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Entity Type <span className="text-red-500">*</span></label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" 
                value={profile.entity_type || ""} 
                onChange={(e) => setProfile({ ...profile, entity_type: e.target.value })}
                required
              >
                <option value="">Select Entity Type</option>
                {ENTITY_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email ID (Cannot be changed)</label>
              <input 
                type="email" 
                disabled
                className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-lg px-3 py-2 text-sm cursor-not-allowed" 
                value={profile.contact_email || ""} 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Number <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                maxLength={10}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                value={profile.contact_phone || ""} 
                onChange={(e) => setProfile({ ...profile, contact_phone: e.target.value.replace(/\D/g, "") })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">District <span className="text-red-500">*</span></label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" 
                value={profile.district || ""} 
                onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                required
              >
                <option value="">Select District</option>
                {DISTRICT_OPTIONS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Address <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                value={profile.address || ""} 
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        {/* Uploaded Documents */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-xs font-bold text-teal-600 uppercase tracking-wider">Uploaded Documents</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <span className="font-semibold text-gray-700 block">Entity Registration Document</span>
              {profile.entity_certificate ? (
                <a 
                  href={`${API}${profile.entity_certificate}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-teal-600 font-bold hover:underline inline-flex items-center gap-1 mt-1"
                >
                  <FileText size={16} /> View Uploaded Document
                </a>
              ) : (
                <span className="text-gray-400 italic mt-1 block">Not uploaded</span>
              )}
            </div>

            <div>
              <span className="font-semibold text-gray-700 block">Applicant's ID Proof</span>
              {profile.id_proof_file ? (
                <a 
                  href={`${API}${profile.id_proof_file}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-teal-600 font-bold hover:underline inline-flex items-center gap-1 mt-1"
                >
                  <FileText size={16} /> View Uploaded Document
                </a>
              ) : (
                <span className="text-gray-400 italic mt-1 block">Not uploaded</span>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={16} />
            {saving ? "Saving Details..." : "Save Profile Details"}
          </button>
        </div>
      </form>
    </div>
  );
}
