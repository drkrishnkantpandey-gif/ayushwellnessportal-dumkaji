import API from '../../../config/api';
import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  Users,
} from "lucide-react";
import axios from "axios";



const initialForm = {
  name: "",
  description: "",
  duration: "",
  duration_type: "weeks",
  price: "",
  level: "",
  max_students: "",
  is_active: true,
  is_visible: true,
};

const toPayload = (data) => ({
  name: data.name,
  description: data.description,
  duration: data.duration ? Number(data.duration) : null,
  duration_type: data.duration_type,
  price: data.price ? Number(data.price) : null,
  level: data.level,
  max_students: data.max_students ? Number(data.max_students) : null,
  is_active: data.is_active,
  is_visible: data.is_visible,
});

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const safeCourses = Array.isArray(courses) ? courses : [];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(
        `${API}/api/training-centre/courses`);
      const data = response?.data?.data;
      setCourses(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("Failed to fetch courses", err);
      setError("Failed to fetch courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleFormFlag = (field) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingCourseId(null);
  };

  const submitCourse = async () => {
    if (!formData.name || !formData.description || !formData.duration) {
      alert("Please fill all required fields (name, description, duration).");
      return;
    }

    try {
      setLoading(true);
      const payload = toPayload(formData);

      if (editingCourseId) {
        await axiosInstance.put(
          `${API}/api/training-centre/courses/${editingCourseId}`,
          payload);
      } else {
        await axiosInstance.post(
          `${API}/api/training-centre/courses`,
          payload);
      }

      await fetchCourses();
      setShowForm(false);
      resetForm();
    } catch (err) {
      console.error("Failed to save course", err);
      setError("Failed to save course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const editCourse = (course) => {
    setFormData({
      name: course.name || "",
      description: course.description || "",
      duration: course.duration?.toString() || "",
      duration_type: course.duration_type || "weeks",
      price: course.price?.toString() || "",
      level: course.level || "",
      max_students: course.max_students?.toString() || "",
      is_active: course.is_active,
      is_visible: course.is_visible,
    });
    setEditingCourseId(course.id);
    setShowForm(true);
  };

  const deleteCourse = async (courseId) => {
    if (!window.confirm("Delete this course?")) return;
    try {
      setLoading(true);

      await axiosInstance.delete(
        `${API}/api/training-centre/courses/${courseId}`);
      await fetchCourses();
    } catch (err) {
      console.error("Failed to delete course", err);
      setError("Failed to delete course.");
    } finally {
      setLoading(false);
    }
  };

  const updateCourseField = async (course, fieldName, value) => {
    try {
      const payload = toPayload({
        ...course,
        duration: course.duration?.toString() || "",
        price: course.price?.toString() || "",
        max_students: course.max_students?.toString() || "",
        is_active: fieldName === "is_active" ? value : course.is_active,
        is_visible: fieldName === "is_visible" ? value : course.is_visible,
      });

      await axiosInstance.put(
        `${API}/api/training-centre/courses/${course.id}`,
        payload);
      await fetchCourses();
    } catch (err) {
      console.error("Failed to update course status", err);
      setError("Failed to update course status.");
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-emerald-700 flex items-center gap-2">
            🧘 Yoga Courses
          </h2>
          <p className="text-sm text-gray-600">
            Manage all the training programs offered by your centre.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-md transition"
          disabled={loading}
        >
          <Plus size={18} /> Add Course
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {loading && safeCourses.length === 0 ? (
        <div className="text-center text-emerald-600 py-10 font-medium">
          Loading courses...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeCourses.length === 0 ? (
            <p className="text-gray-500 italic col-span-full">
              No courses added yet.
            </p>
          ) : (
            safeCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white border rounded-xl shadow hover:shadow-lg transition p-5 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-emerald-800 mb-1">
                    {course.name}
                  </h3>
                  <p className="text-gray-700 text-sm mb-2 line-clamp-3">
                    {course.description}
                  </p>
                  <p className="text-gray-700 text-sm">
                    <strong>Duration:</strong>{" "}
                    {course.duration
                      ? `${course.duration} ${course.duration_type}`
                      : "N/A"}
                  </p>
                  <p className="text-gray-700 text-sm">
                    <strong>Fee:</strong>{" "}
                    {course.price ? `₹${course.price}` : "Contact for details"}
                  </p>
                  <p className="text-gray-700 text-sm">
                    <strong>Level:</strong> {course.level || "General"}
                  </p>
                  <p className="text-gray-700 text-sm flex items-center gap-1">
                    <Users size={14} />{" "}
                    {course.max_students
                      ? `${course.max_students} seats`
                      : "Unlimited seats"}
                  </p>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex gap-3 items-center flex-wrap">
                    {course.is_active ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <ToggleRight size={18} /> Active
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold flex items-center gap-1">
                        <ToggleLeft size={18} /> Inactive
                      </span>
                    )}

                    {course.is_visible ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <Eye size={18} /> Public
                      </span>
                    ) : (
                      <span className="text-gray-500 font-semibold flex items-center gap-1">
                        <EyeOff size={18} /> Hidden
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 justify-between mt-2">
                    <button
                      onClick={() => editCourse(course)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <Edit3 size={16} /> Edit
                    </button>

                    <button
                      onClick={() =>
                        updateCourseField(course, "is_active", !course.is_active)
                      }
                      className="text-emerald-600 hover:text-emerald-800"
                      disabled={loading}
                    >
                      {course.is_active ? "Deactivate" : "Activate"}
                    </button>

                    <button
                      onClick={() =>
                        updateCourseField(
                          course,
                          "is_visible",
                          !course.is_visible
                        )
                      }
                      className="text-teal-600 hover:text-teal-800"
                      disabled={loading}
                    >
                      {course.is_visible ? "Hide" : "Show"}
                    </button>

                    <button
                      onClick={() => deleteCourse(course.id)}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1"
                      disabled={loading}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add/Edit Course Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-xl relative overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-semibold text-emerald-700 mb-4">
              {editingCourseId ? "Edit Course" : "Add New Course"}
            </h3>

            {/* Course Name */}
            <div className="mb-4">
              <label className="font-medium">Course Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInput}
                className="w-full border px-3 py-2 rounded-lg mt-1"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="font-medium">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInput}
                rows={3}
                className="w-full border px-3 py-2 rounded-lg mt-1"
              />
            </div>

            {/* Duration */}
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="font-medium">Duration *</label>
                <input
                  type="number"
                  min="1"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInput}
                  placeholder="e.g., 12"
                  className="w-full border px-3 py-2 rounded-lg mt-1"
                />
              </div>
              <div>
                <label className="font-medium">Duration Unit</label>
                <select
                  name="duration_type"
                  value={formData.duration_type}
                  onChange={handleInput}
                  className="w-full border px-3 py-2 rounded-lg mt-1"
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                </select>
              </div>
            </div>

            {/* Pricing */}
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="font-medium">Course Fee (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInput}
                  placeholder="e.g., 5000"
                  className="w-full border px-3 py-2 rounded-lg mt-1"
                />
              </div>
              <div>
                <label className="font-medium">Max Students</label>
                <input
                  type="number"
                  name="max_students"
                  value={formData.max_students}
                  onChange={handleInput}
                  placeholder="e.g., 25"
                  className="w-full border px-3 py-2 rounded-lg mt-1"
                />
              </div>
            </div>

            {/* Level */}
            <div className="mb-4">
              <label className="font-medium">Level</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInput}
                className="w-full border px-3 py-2 rounded-lg mt-1"
              >
                <option value="">Select Level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* Visibility */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={() => toggleFormFlag("is_active")}
                />
                Active
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_visible}
                  onChange={() => toggleFormFlag("is_visible")}
                />
                Visible to public
              </label>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-emerald-700 text-white rounded-lg disabled:opacity-50"
                onClick={submitCourse}
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : editingCourseId
                    ? "Save Changes"
                    : "Add Course"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
