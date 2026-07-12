import API from '../../../config/api';
import React, { useState, useRef, useEffect } from "react";
import {
  UserPlus,
  UserCircle,
  BadgeCheck,
  FileUp,
  Trash2,
  Edit3,
  ToggleLeft,
  ToggleRight,
  Users,
  Search,
  ExternalLink,
} from "lucide-react";
import axios from "axios";
import axiosInstance from '../../../config/axiosInstance';



export default function TrainerManagement() {
  const [trainers, setTrainers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showListModal, setShowListModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    experience: "",
    bio: "",
    certifications: "",
    phone: "",
    email: "",
    photo: null,
    certificateFile: null,
  });

  const photoRef = useRef(null);
  const certRef = useRef(null);

  const safeTrainers = Array.isArray(trainers) ? trainers : [];

  const filteredTrainers = safeTrainers.filter(trainer =>
    (trainer.name && trainer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (trainer.specialization && trainer.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Fetch trainers from API on component mount
  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(
        `${API}/api/training-centre/trainers`);
      const data = response?.data?.data;
      setTrainers(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError("Failed to fetch trainers");
      console.error("Error fetching trainers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Return all trainers
  const getAllTrainers = () => safeTrainers;

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const uploadPhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, photo: file });
    }
  };

  const uploadCertificates = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, certificateFile: file });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      specialization: "",
      experience: "",
      bio: "",
      certifications: "",
      phone: "",
      email: "",
      photo: null,
      certificateFile: null,
    });
    setEditingId(null);
  };

  const submitTrainer = async () => {
    if (!formData.name || !formData.specialization || !formData.experience) {
      return alert("Please fill all required fields!");
    }

    try {
      setLoading(true);
      const formDataToSend = new FormData();

      // Add all form fields
      Object.keys(formData).forEach(key => {
        // Send value even if empty string to allow clearing fields
        if (key !== 'photo' && key !== 'certificateFile') {
          if (formData[key] !== null && formData[key] !== undefined) {
            formDataToSend.append(key, formData[key]);
          }
        }
      });

      // Add files if they exist
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }
      if (formData.certificateFile) {
        formDataToSend.append('certification', formData.certificateFile);
      }

      let response;
      if (editingId) {
        // Update existing trainer
        const trainerId = editingId;
        const headers = {
          "Content-Type": "multipart/form-data",
        };
        if (token) headers.Authorization = `Bearer ${token}`;

        response = await axiosInstance.put(
          `${API}/api/training-centre/trainers/${trainerId}`,
          formDataToSend,
          { headers }
        );
      } else {
        // Add new trainer
        const headers = {
          "Content-Type": "multipart/form-data",
        };
        if (token) headers.Authorization = `Bearer ${token}`;

        response = await axiosInstance.post(
          `${API}/api/training-centre/trainers`,
          formDataToSend,
          { headers }
        );
      }

      // Refresh trainers list
      await fetchTrainers();

      setShowForm(false);
      resetForm();
      setError("");
    } catch (err) {
      setError(editingId ? "Failed to update trainer" : "Failed to add trainer");
      console.error("Error submitting trainer:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTrainer = async (id) => {
    if (window.confirm("Delete this trainer?")) {
      try {
        setLoading(true);

        const trainerId = id;
        await axiosInstance.delete(
          `${API}/api/training-centre/trainers/${trainerId}`);

        // Refresh trainers list
        await fetchTrainers();
        setError("");
      } catch (err) {
        setError("Failed to delete trainer");
        console.error("Error deleting trainer:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const editTrainer = (trainer) => {
    setFormData({
      name: trainer.name || "",
      specialization: trainer.specialization || "",
      experience: trainer.experience || "",
      bio: trainer.bio || "",
      certifications: trainer.certifications || "",
      phone: trainer.phone || "",
      email: trainer.email || "",
      photo: null, // Will be uploaded again if changed
      certificateFile: null, // Will be uploaded again if changed
    });
    setEditingId(trainer.id);
    setShowForm(true);
  };

  const toggleStatus = async (trainer) => {
    const newStatus = !trainer.is_active;

    try {
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      await axiosInstance.put(
        `${API}/api/training-centre/trainers/${trainer.id}`,
        { is_active: newStatus },
        { headers }
      );

      // Update local state
      setTrainers(prev => prev.map(t => t.id === trainer.id ? { ...t, is_active: newStatus } : t));
    } catch (err) {
      console.error("Error toggling status:", err);
      alert("Failed to update status");
    }
  };

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-emerald-700">👥 Trainer Management</h2>

        <div className="flex items-center gap-3">
          {/* View All Trainers */}
          <button
            onClick={() => setShowListModal(true)}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg shadow-md transition"
          >
            <Users size={18} /> View All ({safeTrainers.length})
          </button>

          {/* Add Trainer */}
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-md transition"
          >
            <UserPlus size={18} /> Add Trainer
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search trainers by name or specialization..."
          className="pl-10 w-full md:w-1/2 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Loading/Error States */}
      {loading && safeTrainers.length === 0 && (
        <div className="text-center py-10 text-emerald-600 font-medium">
          Loading trainers...
        </div>
      )}
      {error && safeTrainers.length === 0 && !loading && (
        <div className="text-center py-10 text-red-600 font-medium">
          {error}
        </div>
      )}

      {/* Trainer Cards */}
      {(!loading || safeTrainers.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrainers.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-8">
              {safeTrainers.length === 0
                ? 'No trainers added yet. Click "Add Trainer" to get started.'
                : 'No trainers match your search.'}
            </div>
          ) : (
            filteredTrainers.map((trainer, index) => (
              <div
                key={trainer.id || index}
                className="bg-white border rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col"
              >
                <img
                  src={trainer.photo_url ? `${API}${trainer.photo_url}` : "/images/yoga-placeholder.png"}
                  alt="trainer"
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />

                <h3 className="text-lg font-semibold text-emerald-800">
                  {trainer.name}
                </h3>

                <p className="text-gray-700 flex items-center gap-2">
                  <BadgeCheck className="text-emerald-600" size={18} />
                  {trainer.specialization || "N/A"}
                </p>

                <p className="text-gray-700 mt-1">
                  Experience:
                  <span className="text-emerald-700 font-medium">
                    {" "}
                    {trainer.experience || 0} years
                  </span>
                </p>

                <div className="mt-3 flex items-center gap-2">
                  {trainer.is_active ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <ToggleRight size={22} /> Active
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold flex items-center gap-1">
                      <ToggleLeft size={22} /> Inactive
                    </span>
                  )}
                </div>

                {/* View Certificate Link */}
                {trainer.certification_url && (
                  <a
                    href={`${API}${trainer.certification_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 w-fit"
                  >
                    <ExternalLink size={14} /> View Certificate
                  </a>
                )}

                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => editTrainer(trainer)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    <Edit3 size={18} /> Edit
                  </button>

                  <button
                    onClick={() => toggleStatus(trainer)}
                    className="text-emerald-600 hover:text-emerald-800"
                  >
                    {trainer.is_active ? "Deactivate" : "Activate"}
                  </button>

                  <button
                    onClick={() => deleteTrainer(trainer.id)}
                    className="text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <Trash2 size={18} /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-emerald-700 mb-4">
              {editingId ? "Edit Trainer" : "Add New Trainer"}
            </h3>

            {/* Name */}
            <div className="mb-4">
              <label className="font-medium">Trainer Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInput}
                className="w-full border px-3 py-2 rounded-lg mt-1"
              />
            </div>

            {/* Specialization */}
            <div className="mb-4">
              <label className="font-medium">Specialization *</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleInput}
                placeholder="e.g., Hatha Yoga, Ashtanga, Meditation"
                className="w-full border px-3 py-2 rounded-lg mt-1"
              />
            </div>

            {/* Bio */}
            <div className="mb-4">
              <label className="font-medium">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInput}
                placeholder="Brief description about trainer..."
                className="w-full border px-3 py-2 rounded-lg mt-1"
                rows="3"
              />
            </div>

            {/* Experience */}
            <div className="mb-4">
              <label className="font-medium">Experience (years) *</label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleInput}
                className="w-full border px-3 py-2 rounded-lg mt-1"
              />
            </div>

            {/* Certifications */}
            <div className="mb-4">
              <label className="font-medium">Certifications</label>
              <textarea
                name="certifications"
                value={formData.certifications}
                onChange={handleInput}
                placeholder="List certifications..."
                className="w-full border px-3 py-2 rounded-lg mt-1"
                rows="2"
              />
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="font-medium">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInput}
                  className="w-full border px-3 py-2 rounded-lg mt-1"
                />
              </div>
              <div>
                <label className="font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInput}
                  className="w-full border px-3 py-2 rounded-lg mt-1"
                />
              </div>
            </div>

            {/* Upload Trainer Photo */}
            <div className="mb-4">
              <label className="font-medium flex items-center gap-2">
                <UserCircle className="text-emerald-600" /> Trainer Photo
              </label>

              {/* Passport Size Preview */}
              {formData.photo && (
                <div className="mt-3 flex justify-center">
                  <img
                    src={URL.createObjectURL(formData.photo)}
                    className="w-32 h-40 object-cover rounded-md border-2 border-gray-300 shadow-sm"
                  />
                </div>
              )}

              <button
                className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center gap-2"
                onClick={() => photoRef.current.click()}
              >
                <FileUp size={18} /> Upload Photo
              </button>

              <input
                type="file"
                ref={photoRef}
                accept="image/*"
                className="hidden"
                onChange={uploadPhoto}
              />
            </div>

            {/* Certification File */}
            <div className="mb-4">
              <label className="font-medium flex items-center gap-2">
                <BadgeCheck className="text-emerald-600" /> Upload Certificate
              </label>

              {formData.certificateFile && (
                <div className="mt-2 text-sm text-gray-600">
                  Selected: {formData.certificateFile.name}
                </div>
              )}

              <button
                className="mt-2 px-4 py-2 bg-teal-600 text-white rounded-lg flex items-center gap-2"
                onClick={() => certRef.current.click()}
              >
                <FileUp size={18} /> Upload Certificates
              </button>

              <input
                type="file"
                ref={certRef}
                accept="image/*,.pdf"
                className="hidden"
                onChange={uploadCertificates}
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                  setError("");
                }}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-emerald-700 text-white rounded-lg disabled:opacity-50"
                onClick={submitTrainer}
                disabled={loading}
              >
                {loading ? "Processing..." : (editingId ? "Save Changes" : "Add Trainer")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Trainer List Modal */}
      {showListModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6 relative">

            <h2 className="text-xl font-bold mb-4">
              Total Trainers: {safeTrainers.length}
            </h2>

            <div className="max-h-80 overflow-y-auto space-y-3">
              {getAllTrainers().map((trainer, index) => (
                <div
                  key={trainer.id || index}
                  className="p-3 border rounded-lg flex items-center gap-4 bg-gray-50"
                >
                  <img
                    src={trainer.photo_url ? `${API}${trainer.photo_url}` : "/images/yoga-placeholder.png"}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                      {trainer.name}
                      {trainer.is_active ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active"></span>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-red-500" title="Inactive"></span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      {trainer.specialization || "N/A"} — {trainer.experience || 0} yrs
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowListModal(false)}
              className="mt-4 w-full py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
