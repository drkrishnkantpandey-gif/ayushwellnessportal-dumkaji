import React, { useState, useEffect } from "react";
import axiosInstance from "../../../config/axiosInstance";
import API from "../../../config/api";
import { User, Phone, Lock, Save, ShieldCheck, Mail } from "lucide-react";
import { toast } from "react-toastify";

const UserProfileManagement = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get(`${API}/api/auth/profile`);
      if (res.data.success) {
        setFormData({
          fullName: res.data.data.full_name || "",
          phone: res.data.data.phone || "",
          email: res.data.data.email || "",
          role: res.data.data.role || "",
          password: "",
          confirmPassword: ""
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      toast.error("Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.phone.trim()) {
      toast.error("Name and mobile number are required.");
      return;
    }

    if (formData.password) {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
      if (formData.password.length < 8) {
        toast.error("Password must be at least 8 characters long.");
        return;
      }
      const hasUpper = /[A-Z]/.test(formData.password);
      const hasLower = /[a-z]/.test(formData.password);
      const hasNumber = /[0-9]/.test(formData.password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
      if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
        toast.error("Password must contain uppercase, lowercase, number, and special character.");
        return;
      }
    }

    setSaving(true);
    try {
      const res = await axiosInstance.post(`${API}/api/auth/update-profile`, {
        fullName: formData.fullName,
        phone: formData.phone,
        password: formData.password
      });

      if (res.data.success) {
        toast.success("Profile updated successfully!");
        setFormData(prev => ({
          ...prev,
          password: "",
          confirmPassword: ""
        }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-teal-600">Loading your profile settings...</div>;
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <ShieldCheck className="text-teal-600" size={32} />
          Account Settings
        </h1>
        <p className="text-gray-500 mt-1">Manage your personal profile details and security credentials</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Email (Read only) */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Email Address (Cannot be changed)
            </label>
            <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 font-medium">
              <Mail className="text-gray-400" size={20} />
              {formData.email}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Full Name / Nodal Officer Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <User size={20} />
              </span>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 focus:border-teal-500 rounded-xl outline-none transition-all font-semibold text-slate-700 focus:bg-white"
                placeholder="Enter full name"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Mobile Contact Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <Phone size={20} />
              </span>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                maxLength={10}
                className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 focus:border-teal-500 rounded-xl outline-none transition-all font-semibold text-slate-700 focus:bg-white"
                placeholder="Enter 10-digit mobile number"
                required
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <h3 className="text-lg font-bold text-gray-800">Change Password</h3>
            <p className="text-xs text-gray-400 mt-1">Leave password fields blank if you do not wish to change it</p>
          </div>

          {/* New Password */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
              New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <Lock size={20} />
              </span>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 focus:border-teal-500 rounded-xl outline-none transition-all font-semibold text-slate-700 focus:bg-white"
                placeholder="Min 8 chars, uppercase, number, symbol"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <Lock size={20} />
              </span>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 focus:border-teal-500 rounded-xl outline-none transition-all font-semibold text-slate-700 focus:bg-white"
                placeholder="Re-enter new password"
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full p-4 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfileManagement;
