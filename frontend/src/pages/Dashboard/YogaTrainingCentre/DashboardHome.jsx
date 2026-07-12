import API from '../../../config/api';
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import axiosInstance from '../../../config/axiosInstance';
import {
  Users,
  BookOpen,
  CheckCircle,
  Edit3,
  Camera,
  ImagePlus,
  Eye,
  User,
  Phone,
  Mail,
} from "lucide-react";
import { motion } from "framer-motion";



const YogaTrainingCentre = () => {
  const token = localStorage.getItem("token");
  const [centre, setCentre] = useState({
    name: "",
    type: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    category: "",
    verified: false,
    trainers: 0,
    courses: 0,
    students: 0,
    about: "",
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
    avatarUrl: "",
    coverUrl: "",
    is_operational: false,
  });

  const avatarRef = useRef(null);
  const coverRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [aboutEditing, setAboutEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [dashboardCourses, setDashboardCourses] = useState([]);
  const [dashboardTrainers, setDashboardTrainers] = useState([]);

  const completenessScore = (() => {
    let score = 0;
    if (centre.name) score += 10;
    if (centre.type) score += 10;
    if (centre.category) score += 10;
    if (centre.phone) score += 20;
    if (centre.email) score += 10;
    if (centre.address) score += 20;
    if (centre.avatarUrl) score += 10;
    if (centre.coverUrl) score += 10;
    return Math.min(score, 100);
  })();

  const fetchCentreData = async () => {
    try {
      const config = {
        headers: {
        },
      };

      const [profileRes, statsRes, coursesRes, trainersRes] = await Promise.all([
        axiosInstance.get(`${API}/api/training-centre/profile`, config),
        axiosInstance.get(`${API}/api/training-centre/stats`, config),
        axiosInstance.get(`${API}/api/training-centre/courses`, config),
        axiosInstance.get(`${API}/api/training-centre/trainers`, config),
      ]);

      const profile = profileRes.data?.data || {};
      const stats = statsRes.data?.data || {};
      const coursesData = Array.isArray(coursesRes.data?.data) ? coursesRes.data.data : [];
      const trainersData = Array.isArray(trainersRes.data?.data) ? trainersRes.data.data : [];

      setCentre((prev) => ({
        ...prev,
        name: profile.centre_name || prev.name,
        type: profile.institution_type || prev.type,
        category: profile.category || prev.category,
        phone: profile.phone || prev.phone,
        email: profile.email || prev.email,
        address: profile.address || prev.address,
        city: profile.city || prev.city,
        state: profile.state || prev.state,
        pincode: profile.pincode || prev.pincode,
        about: profile.description || prev.about,
        ownerName: profile.owner_name || prev.ownerName,
        ownerPhone: profile.owner_phone || prev.ownerPhone,
        ownerEmail: profile.owner_email || prev.ownerEmail,
        avatarUrl: profile.avatar_url ? `${API}${profile.avatar_url}` : prev.avatarUrl,
        coverUrl: profile.cover_url ? `${API}${profile.cover_url}` : prev.coverUrl,
        verified:
          profile.accreditation_status === "APPROVED"
            ? true
            : profile.accreditation_status === "PENDING"
              ? false
              : prev.verified,
        is_operational: !!profile.is_operational,
        trainers: typeof stats.trainers === "number" ? stats.trainers : prev.trainers,
        courses: typeof stats.courses === "number" ? stats.courses : prev.courses,
        students: typeof stats.students === "number" ? stats.students : prev.students,
      }));
      setDashboardCourses(coursesData);
      setDashboardTrainers(trainersData);
    } catch (err) {
      console.error("Failed to load training centre data", err);
      const message =
        err.response?.data?.message ||
        "Unable to load training centre details. Please try again later.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    if (!token) {
      setError("Authentication required. Please log in again.");
      setLoading(false);
      return;
    }

    fetchCentreData();
  }, []);

  const handleAvatarUpload = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const formData = new FormData();
    formData.append('avatar', f);

    try {
      const headers = {
        "Content-Type": "multipart/form-data",
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      await axiosInstance.put(`${API}/api/training-centre/profile`, formData, { headers });

      // Refresh profile data
      fetchCentreData();
    } catch (err) {
      console.error("Failed to upload avatar:", err);
    }

    avatarRef.current.value = "";
  };

  const handleCoverUpload = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const formData = new FormData();
    formData.append('cover', f);

    try {
      const headers = {
        "Content-Type": "multipart/form-data",
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      await axiosInstance.put(`${API}/api/training-centre/profile`, formData, { headers });

      // Refresh profile data
      fetchCentreData();
    } catch (err) {
      console.error("Failed to upload cover:", err);
    }
  };

  const formattedAddress = [centre.address, centre.city, centre.state, centre.pincode]
    .filter(Boolean)
    .join(", ");

  const openEdit = () => {
    setDraft({
      name: centre.name,
      type: centre.type,
      category: centre.category,
      phone: centre.phone,
      email: centre.email,
      address: centre.address,
      ownerName: centre.ownerName,
      ownerPhone: centre.ownerPhone,
      ownerEmail: centre.ownerEmail,
    });
    setEditing(true);
  };

  const updateBackend = async (updatedData) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      // Map frontend keys to backend snake_case keys
      const payload = {
        centre_name: updatedData.name,
        institution_type: updatedData.type,
        category: updatedData.category,
        phone: updatedData.phone,
        email: updatedData.email,
        address: updatedData.address,
        owner_name: updatedData.ownerName,
        owner_phone: updatedData.ownerPhone,
        owner_email: updatedData.ownerEmail,
        description: updatedData.about,
        // Preserve other fields if needed, but these are the ones editable here
      };

      await axiosInstance.put(`${API}/api/training-centre/profile`, payload, config);

      // Update local state on success
      setCentre((prev) => ({ ...prev, ...updatedData }));
      return true;
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to save changes. Please try again.");
      return false;
    }
  };

  const saveEdit = async () => {
    const success = await updateBackend({ ...centre, ...draft });
    if (success) {
      setEditing(false);
    }
  };

  const saveAbout = async () => {
    const success = await updateBackend({ ...centre, about: draft.about });
    if (success) {
      setAboutEditing(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-6">Loading centre data...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* COVER SECTION */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg">
        <div
          className="h-72 flex items-end bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-600"
          style={{
            backgroundImage: centre.coverUrl ? `url(${centre.coverUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="w-full bg-black/40 p-4 md:p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-5">
              {/* AVATAR */}
              <div className="relative -mt-10 md:-mt-12">
                {centre.avatarUrl ? (
                  <img
                    src={centre.avatarUrl}
                    alt="avatar"
                    className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white object-cover shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white/20 flex items-center justify-center border-4 border-white shadow-md">
                    <Users size={36} className="text-white/80" />
                  </div>
                )}

                {/* AVATAR UPLOAD */}
                <button
                  onClick={() => avatarRef.current?.click()}
                  className="absolute -right-2 -bottom-2 bg-white p-2 rounded-full shadow-md hover:scale-105 transition"
                >
                  <Camera size={18} className="text-gray-700" />
                </button>

                <input
                  ref={avatarRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>

              {/* BASIC INFO */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{centre.name}</h1>

                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm bg-white/20 px-2 py-1 rounded-md">
                    {centre.type}
                  </span>
                  <span className="text-sm bg-white/20 px-2 py-1 rounded-md">
                    {centre.category}
                  </span>
                  <span className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-md">
                    <CheckCircle className="text-green-200" size={14} />
                    {centre.verified ? "Verified" : "Unverified"}
                  </span>
                  <span className={`flex items-center gap-1 text-sm px-2.5 py-1 rounded-md font-semibold ${centre.is_operational ? "bg-emerald-500/30 text-emerald-100" : "bg-amber-500/30 text-amber-100"}`}>
                    ⚡ {centre.is_operational ? "Operational" : "Not Operational"}
                  </span>
                </div>

                <div className="text-sm text-white/90 mt-2 max-w-xl">
                  <div className="flex gap-4 items-center">
                    <span>{centre.phone}</span>
                    <span className="opacity-80">•</span>
                    <span>{centre.email}</span>
                  </div>
                  <div className="mt-1 text-xs opacity-90">{formattedAddress}</div>
                </div>
              </div>
            </div>

            {/* Cover Upload Buttons */}
            <div className="flex items-center gap-3">
              <input
                ref={coverRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverUpload}
              />

              <button
                onClick={() => coverRef.current?.click()}
                className="bg-white/90 text-emerald-700 px-3 py-2 rounded-md text-sm font-medium shadow"
              >
                <ImagePlus size={16} className="inline-block mr-2" /> Upload Cover
              </button>

              <button
                onClick={() => alert("Public profile preview")}
                className="bg-transparent border border-white/40 text-white px-3 py-2 rounded-md text-sm"
              >
                <Eye size={14} className="inline-block mr-2" /> View Public
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 gap-6 mt-6">
        {/* LEFT CONTENT */}
        <div className="space-y-6 col-span-1">
          {/* PROFILE CARD */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between border-b pb-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Centre Profile Details</h2>
                <p className="text-sm text-gray-500">Declared details for Incentive & Grants verification</p>
              </div>

              <button
                onClick={openEdit}
                className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center hover:bg-emerald-700 transition"
              >
                <Edit3 size={14} className="mr-2" /> Edit Details
              </button>
            </div>

            {/* KEY DATA POINTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Entity Name</span>
                  <span className="text-base font-bold text-gray-800">{centre.name || "N/A"}</span>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Entity Type</span>
                  <span className="text-base font-semibold text-gray-700">{centre.type || "N/A"}</span>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">District</span>
                  <span className="text-base font-semibold text-gray-700">{centre.district || "N/A"}</span>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Business Address</span>
                  <span className="text-base font-medium text-gray-600 block leading-relaxed">{centre.address || "N/A"}</span>
                </div>
              </div>

              <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Existing Operational Business Category</span>
                  <span className="text-base font-bold text-teal-800 block mt-1">
                    {centre.alreadyOperating || "None"}
                  </span>
                </div>

                {/* OPERATIONAL STATUS TOGGLE */}
                <div className="border-t border-slate-200/60 pt-4">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Yoga Centre Operational Status</span>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${centre.is_operational ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        <span className={`w-2 h-2 rounded-full ${centre.is_operational ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
                        {centre.is_operational ? "Currently Operational as Yoga Centre" : "Not Operational (Greenfield/Expansion)"}
                      </span>
                    </div>

                    <button
                      onClick={toggleOperationalStatus}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${centre.is_operational ? "bg-emerald-600" : "bg-gray-300"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${centre.is_operational ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* INCENTIVES & GRANTS SUMMARY INFO */}
            <div className="mt-6 p-4 bg-teal-50 border border-teal-100 rounded-xl">
              <h4 className="text-sm font-bold text-teal-900 mb-1">Applicable Incentive Schemes</h4>
              <ul className="text-xs text-teal-800 space-y-1.5 list-disc pl-4 mt-2">
                <li>
                  <strong>Trainer Fee Reimbursement:</strong> Only eligible and accessible if status is set to <strong>"Currently Operational as Yoga Centre"</strong>.
                </li>
                <li>
                  <strong>New Yoga Centre Incentive:</strong> Tailored for <strong>Greenfield</strong> or <strong>Expansion</strong> projects (status set to "Not Operational").
                </li>
              </ul>
            </div>

            {/* ABOUT */}
            <div className="mt-6 border-t pt-4">
              <div className="flex justify-between">
                <h3 className="text-sm font-semibold text-gray-800">About Centre</h3>

                <button
                  onClick={() => {
                    setDraft({ about: centre.about });
                    setAboutEditing(true);
                  }}
                  className="text-sm text-emerald-600 hover:underline"
                >
                  Update About
                </button>
              </div>

              <p className="mt-3 text-sm text-gray-700 leading-relaxed">{centre.about}</p>
            </div>
          </div>

          {/* TRAINERS & COURSES OVERVIEW */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Centre Overview</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* TRAINERS LIST */}
              <div className="p-4 rounded-xl border bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-semibold text-gray-700">Trainers ({centre.trainers})</h4>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="text-emerald-700 text-sm font-medium"
                  >
                    View All
                  </motion.button>
                </div>

                {centre.trainers > 0 ? (
                  <div className="space-y-3">
                    {dashboardTrainers.slice(0, 3).map((trainer, index) => (
                      <div key={trainer.id || index} className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                        <img
                          src={trainer.photo_url ? `${API}${trainer.photo_url}` : "/images/yoga-placeholder.png"}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 text-sm">{trainer.name}</p>
                          <p className="text-xs text-gray-600">{trainer.specialization || "N/A"} — {trainer.experience || 0} yrs</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 bg-white rounded-xl p-4 shadow-inner">
                    No trainers have been added yet. Visit the Trainer Management tab to add your first trainer.
                  </div>
                )}
              </div>

              {/* COURSES LIST */}
              <div className="p-4 rounded-xl border bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-semibold text-gray-700">Active Courses ({centre.courses})</h4>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="text-emerald-700 text-sm font-medium"
                  >
                    View All
                  </motion.button>
                </div>

                {centre.courses === 0 ? (
                  <div className="text-sm text-gray-500 bg-white rounded-xl p-4 shadow-inner">
                    No courses are active right now. Use the Courses tab to create your first program.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Array.isArray(dashboardCourses) && dashboardCourses.length > 0 ? (
                      dashboardCourses.slice(0, 3).map((course) => (
                        <div key={course.id} className="bg-white rounded-lg p-3 border">
                          <h5 className="font-medium text-gray-800 text-sm">{course.name}</h5>
                          <p className="text-xs text-gray-600 mt-1">
                            {course.duration ? `${course.duration} ${course.duration_type}` : ''}
                            {course.price ? ` • ₹${course.price}` : ''}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-600">
                        Course listing will appear here once course data entry is available.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* EDIT MODAL */}
          {editing && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
              <div className="bg-white p-6 rounded-xl w-full max-w-2xl shadow-lg">
                <h3 className="text-lg font-semibold mb-3">Edit Centre Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Existing Fields */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Centre Name</label>
                    <input
                      className="border p-2 rounded-md w-full mt-1"
                      value={draft.name}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, name: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Type of Institution
                    </label>
                    <select
                      className="border p-2 rounded-md w-full mt-1"
                      value={draft.type}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, type: e.target.value }))
                      }
                    >
                      <option value="">Select Type</option>
                      <option value="Private">Private</option>
                      <option value="Trust">Trust</option>
                      <option value="Society">Society</option>
                      <option value="Government Recognized">
                        Government Recognized
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <select
                      className="border p-2 rounded-md w-full mt-1"
                      value={draft.category}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, category: e.target.value }))
                      }
                    >
                      <option value="">Select Category</option>
                      <option value="Exclusive Yoga Centre (Yet to be Established)">Exclusive Yoga Centre (Yet to be Established)</option>
                      <option value="Exclusive Yoga Centre (Existing)">Exclusive Yoga Centre (Existing)</option>
                      <option value="Homestay">Homestay</option>
                      <option value="School">School</option>
                      <option value="College">College</option>
                      <option value="Hotel">Hotel</option>
                      <option value="Resort">Resort</option>
                      <option value="Other Institution">Other Institution</option>
                    </select>
                  </div>

                  {/* NEW OWNER FIELDS */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Owner Name</label>
                    <input
                      className="border p-2 rounded-md w-full mt-1"
                      value={draft.ownerName}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, ownerName: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Owner Phone
                    </label>
                    <input
                      className="border p-2 rounded-md w-full mt-1"
                      value={draft.ownerPhone}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, ownerPhone: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Owner Email
                    </label>
                    <input
                      className="border p-2 rounded-md w-full mt-1"
                      value={draft.ownerEmail}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, ownerEmail: e.target.value }))
                      }
                    />
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Address</label>
                    <input
                      className="border p-2 rounded-md w-full mt-1"
                      value={draft.address}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, address: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={saveEdit}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ABOUT MODAL */}
          {aboutEditing && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
              <div className="bg-white p-6 rounded-xl w-full max-w-xl shadow-lg">
                <h3 className="text-lg font-semibold mb-3">Update About Centre</h3>

                <textarea
                  className="w-full border p-3 rounded-md h-40"
                  value={draft.about}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, about: e.target.value }))
                  }
                />

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={() => setAboutEditing(false)}
                    className="px-4 py-2 bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={saveAbout}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YogaTrainingCentre; 